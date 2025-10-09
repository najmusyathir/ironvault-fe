"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authApi, getUser } from "@/lib/api";
import { checkAuth } from "@/lib/auth";
import { Room, RoomMember, RoomRole } from "@/types/rooms";
import { User } from "@/types/auth";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import {
  FolderIcon,
} from "@/icons";
import {
  UsersIcon,
  LockIcon,
  UnlockIcon,
  SettingsIcon,
  CopyIcon,
  SearchIcon,
  XIcon,
  CalendarIcon,
  PlusIcon
} from "@/icons";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import RoomSettingsModal from "@/components/rooms/RoomSettingsModal";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";

interface RoomDetails {
  room: Room;
  members: RoomMember[];
  inviteCodes: Array<{
    id: number;
    room_id: number;
    code: string;
    max_uses?: number;
    current_uses: number;
    created_at: string;
    expires_at?: string;
    is_active: boolean;
  }>;
  isCreator: boolean;
  canManage: boolean;
}

export default function RoomViewPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInviteCodesModal, setShowInviteCodesModal] = useState(false);
  const [inviteCodesLoading, setInviteCodesLoading] = useState(false);
  const [deletingCodeId, setDeletingCodeId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [expiresHours, setExpiresHours] = useState(24);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Tab state
  const [activeTab, setActiveTab] = useState<"files" | "users">("files");
  const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);

  useEffect(() => {
    checkAuth();
    const user = getUser();
    setCurrentUser(user);
    if (user) {
      loadRoomDetails(user); // Pass user directly
    } else {
      router.push('/login');
    }
  }, [roomId]);

  const loadRoomDetails = async (user: User) => {
    try {
      setLoading(true);
      setError(null);
      console.log("room details loaded")

      if (!user) {
        router.push('/login');
        return;
      }

      const response = await authApi.getRoomDetails(parseInt(roomId)) as {
        room?: Room;
        members?: RoomMember[];
        invite_codes?: Array<{
          id: number;
          room_id: number;
          code: string;
          max_uses?: number;
          current_uses: number;
          created_at: string;
          expires_at?: string;
          is_active: boolean;
        }>;
      };
      const roomData = response.room || response as Room;
      const members = response.members || [];
      const inviteCodes = response.invite_codes || [];

      const isCreator = Number(user.id) === Number(roomData.creator_id);
      const canManage = isCreator || members.some((m: RoomMember) =>
        Number(m.user_id) === Number(user.id) && (m.role === RoomRole.ADMIN || m.role === RoomRole.CREATOR || String(m.role) === 'creator' || String(m.role) === 'admin')
      );

      setRoomDetails({
        room: roomData,
        members,
        inviteCodes,
        isCreator,
        canManage
      });
      console.log("roomdetails set with isCreator:", isCreator, "canManage:", canManage)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load room details";
      setError(errorMessage);
      if (errorMessage.includes("not found") || errorMessage.includes("unauthorized")) {
        router.push('/rooms');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !roomDetails) return;

    try {
      await authApi.createRoomInvite(roomDetails.room.id, {
        invitee_email: inviteEmail,
        message: inviteMessage
      });

      setInviteEmail("");
      setInviteMessage("");
      setShowInviteModal(false);
      const user = getUser();
      if (user) loadRoomDetails(user);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send invitation";
      setError(errorMessage);
    }
  };

  const handleCreateInviteCode = async () => {
    if (!roomDetails) return;

    try {
      await authApi.createRoomInviteCode(roomDetails.room.id, {
        max_uses: maxUses > 0 ? maxUses : undefined,
        expires_hours: expiresHours > 0 ? expiresHours : undefined
      });

      setMaxUses(1);
      setExpiresHours(24);
      setShowInviteCodeModal(false);
      const user = getUser();
      if (user) loadRoomDetails(user);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create invite code";
      setError(errorMessage);
    }
  };

  const handleSaveSettings = async (data: { name?: string; description?: string; max_members?: number; is_private?: boolean }) => {
    if (!roomDetails) return;

    try {
      await authApi.updateRoom(roomDetails.room.id, data);
      const user = getUser();
      if (user) loadRoomDetails(user);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update room settings";
      setError(errorMessage);
      throw err; // Re-throw to let the modal handle the error
    }
  };

  const handleDeleteRoom = async () => {
    console.log("handleDeleteRoom called in room page");
    if (!roomDetails) {
      console.log("No room details available");
      return;
    }

    try {
      console.log("Calling authApi.deleteRoom for room:", roomDetails.room.id);
      await authApi.deleteRoom(roomDetails.room.id);
      console.log("Delete API call successful");
      // Modal will handle redirect to rooms page
    } catch (err: unknown) {
      console.error("Delete room error in page:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete room";
      setError(errorMessage);
      throw err; // Re-throw to let the modal handle the error
    }
  };

  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy invite code:", err);
    }
  };

  // New invite code functions for modal
  const loadInviteCodesForModal = async () => {
    if (!roomDetails) return;

    try {
      setInviteCodesLoading(true);
      const response = await authApi.getRoomInviteCodes(roomDetails.room.id) as { invite_codes: typeof roomDetails.inviteCodes };
      // Update the roomDetails with fresh invite codes
      setRoomDetails(prev => prev ? {
        ...prev,
        inviteCodes: response.invite_codes || []
      } : null);
    } catch (error) {
      console.error("Error loading invite codes:", error);
      setError("Failed to load invite codes");
    } finally {
      setInviteCodesLoading(false);
    }
  };

  const handleCreateInviteCodeInModal = async () => {
    if (!roomDetails) return;

    try {
      setInviteCodesLoading(true);
      await authApi.createRoomInviteCode(roomDetails.room.id, { max_uses: 10, expires_hours: 24 });
      await loadInviteCodesForModal();
    } catch (error) {
      console.error("Error creating invite code:", error);
      setError("Failed to create invite code");
    } finally {
      setInviteCodesLoading(false);
    }
  };

  const handleDeleteInviteCodeInModal = async (codeId: number) => {
    if (!roomDetails) return;

    try {
      await authApi.deleteInviteCode(roomDetails.room.id, codeId);
      await loadInviteCodesForModal();
    } catch (error) {
      console.error("Error deleting invite code:", error);
      setError("Failed to delete invite code");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getRoleColor = (role: RoomRole) => {
    switch (role) {
      case RoomRole.CREATOR:
        return "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20";
      case RoomRole.ADMIN:
        return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20";
      case RoomRole.MEMBER:
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  // Filter members based on search term and role
  const filteredMembers = roomDetails?.members.filter(member => {
    const matchesSearch = searchTerm === "" ||
      member.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || member.role === roleFilter;

    return matchesSearch && matchesRole;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error || !roomDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Error</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error || "Room not found"}</p>
          <Button onClick={() => router.push('/rooms')}>Back to Rooms</Button>
        </div>
      </div>
    );
  }

  const { room, members, inviteCodes, isCreator, canManage } = roomDetails;

  return (
    <div className="space-y-6">
      {/* Room Details Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/rooms" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              ← Back to Rooms
            </Link>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {room.name}
              </h1>
              {room.is_private ? (
                <LockIcon className="w-5 h-5 text-gray-500" title="Private room" />
              ) : (
                <UnlockIcon className="w-5 h-5 text-gray-500" title="Public room" />
              )}
            </div>
          </div>

          {canManage && (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  setShowInviteCodesModal(true);
                  loadInviteCodesForModal();
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Create Invite Code
              </Button>
              {isCreator && (
                <Button
                  onClick={() => setShowSettingsModal(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Room Info */}
          <div className="md:col-span-2">
            <div className="space-y-4">
              {room.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h3>
                  <p className="text-gray-900 dark:text-white">{room.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Privacy</h3>
                  <p className="text-gray-900 dark:text-white">
                    {room.is_private ? "Private room" : "Public room"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Member Limit</h3>
                  <p className="text-gray-900 dark:text-white">
                    {members.length}/{room.max_members} members
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Creator Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Created by</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                {room.creator ? getInitials(room.creator.full_name || room.creator.username) : "?"}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {room.creator?.full_name || room.creator?.username || "Unknown"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(room.created_at)}
                </p>
              </div>
              {room.creator?.id === currentUser?.id && (
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(RoomRole.CREATOR)}`}>
                  Creator
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("files")}
              className={`${activeTab === "files"
                ? "border-brand-500 text-brand-600 dark:text-brand-400 dark:border-brand-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <FolderIcon className="w-4 h-4 inline mr-1" />
              Files
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`${activeTab === "users"
                ? "border-brand-500 text-brand-600 dark:text-brand-400 dark:border-brand-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              👥 Users ({members.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "files" ? (
            <div className="space-y-6">
              <FileUpload
                roomId={room.id}
                onUploadSuccess={() => setFileRefreshTrigger(prev => prev + 1)}
              />
              <FileList
                roomId={room.id}
                refreshTrigger={fileRefreshTrigger}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Members Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Room Members ({filteredMembers.length})
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    All members with their roles and join dates
                  </p>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="creator">Creator</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMembers.length === 0 ? (
                  <div className="p-8 text-center">
                    <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No members found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm || roleFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "This room doesn't have any members yet"
                      }
                    </p>
                    {canManage && (
                      <Button
                        onClick={() => setShowInviteModal(true)}
                        className="mt-4"
                      >
                        Invite First Member
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div key={member.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                            {member.user ? getInitials(member.user.full_name || member.user.username) : "?"}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {member.user?.full_name || member.user?.username || "Unknown User"}
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                                {member.role}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                              <span>{member.user?.email || "No email"}</span>
                              <span>•</span>
                              <span>Joined {formatDate(member.joined_at)}</span>
                            </div>
                          </div>
                        </div>

                        {canManage && member.user_id !== currentUser?.id && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const memberName = member.user?.full_name || member.user?.username || 'this user';
                                if (confirm(`Are you sure you want to remove ${memberName} from the room?`)) {
                                  try {
                                    await authApi.removeMember(room.id, member.user_id);
                                    const user = getUser();
                                    if (user) loadRoomDetails(user); // Refresh the room details
                                  } catch (error: unknown) {
                                    const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
                                    setError(errorMessage);
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        )}

                        {/* Show "Leave Room" button for current user */}
                        {member.user_id === currentUser?.id && member.role !== RoomRole.CREATOR && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (confirm('Are you sure you want to leave this room?')) {
                                  try {
                                    await authApi.removeMember(room.id, member.user_id);
                                    router.push('/rooms'); // Redirect to rooms list after leaving
                                  } catch (error: unknown) {
                                    const errorMessage = error instanceof Error ? error.message : 'Failed to leave room';
                                    setError(errorMessage);
                                  }
                                }
                              }}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              Leave Room
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Codes Section (if any) */}
      {canManage && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6">
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}
            {error && error.includes('invite code') && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Active Invite Codes ({inviteCodes.length})
              </h3>
              <Button
                onClick={() => {
                  setShowInviteCodesModal(true);
                  loadInviteCodesForModal();
                }}
                className="flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Create New Code
              </Button>
            </div>

            {inviteCodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inviteCodes.map((code) => (
                  <div key={code.id} className="relative group bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow">
                    {/* Delete button at top right */}
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this invite code?')) {
                          try {
                            setDeletingCodeId(code.id);
                            await authApi.deleteInviteCode(room.id, code.id);
                            setSuccessMessage('Invite code deleted successfully');
                            setTimeout(() => setSuccessMessage(null), 3000);
                            const user = getUser();
                            if (user) loadRoomDetails(user);
                          } catch (error) {
                            console.error('Error deleting invite code:', error);
                            setError('Failed to delete invite code');
                          } finally {
                            setDeletingCodeId(null);
                          }
                        }
                      }}
                      disabled={deletingCodeId === code.id}
                      className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md ${
                        deletingCodeId === code.id
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                      title="Delete invite code"
                    >
                      {deletingCodeId === code.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      ) : (
                        <XIcon className="w-3 h-3" />
                      )}
                    </button>

                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <code className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-white">
                          {code.code}
                        </code>
                        <Button
                          onClick={() => copyInviteCode(code.code)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-xs"
                        >
                          <CopyIcon className="w-3 h-3" />
                          {copiedCode === code.code ? "Copied!" : "Copy"}
                        </Button>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <UsersIcon className="w-3 h-3" />
                          Uses: {code.current_uses}{code.max_uses ? `/${code.max_uses}` : '/∞'}
                        </span>
                        {code.expires_at && (
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            Expires: {new Date(code.expires_at).toLocaleDateString()}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          code.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {code.is_active ? 'Active' : 'Expired'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-lg font-medium mb-1">No invite codes yet</p>
                <p className="text-sm">Create your first invite code to share this room with others</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl dark:bg-gray-800 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Invite User to Room
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message (optional)
                  </label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Join our room..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={() => setShowInviteModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteUser}
                  disabled={!inviteEmail.trim()}
                >
                  Send Invitation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invite Code Modal */}
      {showInviteCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl dark:bg-gray-800 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create Invite Code
                </h3>
                <button
                  onClick={() => setShowInviteCodeModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Uses (0 = unlimited)
                  </label>
                  <Input
                    type="number"
                    value={maxUses.toString()}
                    onChange={(e) => setMaxUses(parseInt(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expires In Hours (0 = never)
                  </label>
                  <Input
                    type="number"
                    value={expiresHours.toString()}
                    onChange={(e) => setExpiresHours(parseInt(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={() => setShowInviteCodeModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateInviteCode}
                >
                  Create Code
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Settings Modal */}
      {showSettingsModal && roomDetails && (
        <RoomSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          onSave={handleSaveSettings}
          onDelete={handleDeleteRoom}
          room={roomDetails.room}
        />
      )}

      {/* Invite Codes Modal */}
      {showInviteCodesModal && roomDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Invite Codes for {roomDetails.room.name}
              </h2>
              <button
                onClick={() => setShowInviteCodesModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Create Invite Code Section */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Manage Invite Codes
              </h3>
              <Button
                onClick={handleCreateInviteCodeInModal}
                disabled={inviteCodesLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {inviteCodesLoading ? "Creating..." : "Create Invite Code"}
              </Button>
            </div>

            {/* Invite Codes List */}
            <div className="space-y-3">
              {roomDetails.inviteCodes.map((code) => (
                <div key={code.id} className="relative group bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-mono text-lg text-gray-900 dark:text-white mb-2">{code.code}</p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <UsersIcon className="w-6 h-6" />
                          Uses: {code.current_uses}{code.max_uses ? `/${code.max_uses}` : '/∞'}
                        </span>
                        {code.expires_at && (
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-6 h-6" />
                            Expires: {new Date(code.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteInviteCodeInModal(code.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete invite code"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {roomDetails.inviteCodes.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-lg font-medium mb-1">No invite codes yet</p>
                  <p className="text-sm">Create your first invite code to share this room with others</p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setShowInviteCodesModal(false)}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}