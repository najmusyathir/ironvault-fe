"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { authApi, getUser } from "@/lib/api";
import { Room } from "@/types/auth";
import { PlusIcon, CopyIcon, UsersIcon, PencilIcon } from "@/icons/index";

// Create icons that aren't available
const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const RefreshButtonIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const LinkIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

interface RoomResponse {
  rooms: Room[];
  total: number;
}

interface CreateRoomRequest {
  name: string;
  description?: string;
  max_members: number;
}

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Create room modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Room invites modal state
  const [isInvitesModalOpen, setIsInvitesModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [invites, setInvites] = useState<any[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);

  useEffect(() => {
    checkUserRoleAndFetchRooms();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkUserRoleAndFetchRooms = async () => {
    try {
      const user = getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user has permission to view rooms
      if (user.role === "user") {
        setError("Access denied. Admin or superadmin role required.");
        setLoading(false);
        return;
      }

      await fetchRooms();
    } catch (err) {
      console.error("Error checking user role:", err);
      setError("Failed to verify permissions");
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await authApi.getRooms();
      const data: RoomResponse = response as RoomResponse;
      setRooms(data.rooms);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError((err as Error).message || "Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (roomData: CreateRoomRequest) => {
    try {
      setCreateLoading(true);
      setCreateError(null);

      await authApi.createRoom(roomData);
      await fetchRooms();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error("Error creating room:", err);
      setCreateError(err.message || "Failed to create room");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCopyShortId = (shortId: string) => {
    navigator.clipboard.writeText(shortId);
    // You could add a toast notification here
    console.log("Short ID copied to clipboard:", shortId);
  };

  const handleViewInvites = async (room: Room) => {
    setSelectedRoom(room);
    setIsInvitesModalOpen(true);
    setInvitesLoading(true);

    try {
      const response = await authApi.getRoomInvites(room.short_id);
      setInvites(response.invites);
    } catch (err) {
      console.error("Error fetching invites:", err);
    } finally {
      setInvitesLoading(false);
    }
  };

  const handleCreateInvite = async (roomId: string) => {
    try {
      await authApi.createRoomInvite(roomId, {
        max_uses: null,
        expires_hours: 24
      });

      // Refresh invites list
      if (selectedRoom) {
        handleViewInvites(selectedRoom);
      }
    } catch (err) {
      console.error("Error creating invite:", err);
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-red-50 dark:bg-gray-800 p-8 rounded-lg max-w-md">
          <h2 className="text-2xl font-semibold text-red-700 dark:text-red-400 mb-4">
            Access Denied
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Room Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage rooms and invites (Admin & Superadmin only)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
            <span className="text-sm text-blue-600 dark:text-blue-400">
              Total Rooms: {rooms.length}
            </span>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Room
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search rooms by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Rooms Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Room
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Short ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Members
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Created
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <td colSpan={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      {rooms.length === 0 ? "No rooms found" : "No rooms match your search criteria"}
                    </td>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="px-5 py-4 text-start">
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {room.name}
                          </span>
                          {room.description && (
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              {room.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">
                            {room.short_id}
                          </code>
                          <button
                            onClick={() => handleCopyShortId(room.short_id)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            title="Copy short ID"
                          >
                            <CopyIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <UsersIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {room.member_count} / {room.max_members}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color={room.is_active ? "success" : "error"}>
                          {room.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(room.created_at)}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewInvites(room)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:text-green-300 dark:bg-green-900/30 dark:hover:bg-green-800/50 transition-colors"
                            title="View invites"
                          >
                            <LinkIcon className="w-4 h-4 mr-1" />
                            Invites
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-99999 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/70 transition-opacity"
              onClick={() => setIsCreateModalOpen(false)}
            ></div>
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 dark:bg-gray-800 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                      Create New Room
                    </h3>
                    <form className="space-y-4">
                      {createError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                          {createError}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Room Name *
                        </label>
                        <input
                          type="text"
                          id="room-name"
                          required
                          disabled={createLoading}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          id="room-description"
                          rows={3}
                          disabled={createLoading}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Max Members
                        </label>
                        <input
                          type="number"
                          id="room-max-members"
                          min="1"
                          max="1000"
                          defaultValue="50"
                          disabled={createLoading}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 dark:bg-gray-700 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  disabled={createLoading}
                  onClick={() => {
                    const name = (document.getElementById('room-name') as HTMLInputElement)?.value;
                    const description = (document.getElementById('room-description') as HTMLTextAreaElement)?.value;
                    const maxMembers = parseInt((document.getElementById('room-max-members') as HTMLInputElement)?.value || '50');

                    if (name) {
                      handleCreateRoom({
                        name,
                        description: description || undefined,
                        max_members: maxMembers
                      });
                    }
                  }}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? "Creating..." : "Create Room"}
                </button>
                <button
                  type="button"
                  disabled={createLoading}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-600 dark:text-white dark:ring-gray-500 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Invites Modal */}
      {isInvitesModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-99999 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/70 transition-opacity"
              onClick={() => setIsInvitesModalOpen(false)}
            ></div>
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-white px-4 pb-4 pt-5 dark:bg-gray-800 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                      Invites for: {selectedRoom.name}
                    </h3>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Active Invites</h4>
                      <button
                        onClick={() => handleCreateInvite(selectedRoom.id.toString())}
                        className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Create Invite
                      </button>
                    </div>
                    {invitesLoading ? (
                      <div className="text-center py-4">
                        <div className="w-6 h-6 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Loading invites...</p>
                      </div>
                    ) : invites.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No active invites found
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {invites.map((invite) => (
                          <div key={invite.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <code className="bg-white dark:bg-gray-600 px-2 py-1 rounded text-sm font-mono">
                                {invite.invite_code}
                              </code>
                              <button
                                onClick={() => navigator.clipboard.writeText(invite.invite_code)}
                                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                <CopyIcon className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {invite.use_count} uses
                              {invite.max_uses && ` / ${invite.max_uses}`}
                              {invite.expires_at && ` • Expires ${formatDate(invite.expires_at)}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 dark:bg-gray-700 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={() => setIsInvitesModalOpen(false)}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:ml-3 sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}