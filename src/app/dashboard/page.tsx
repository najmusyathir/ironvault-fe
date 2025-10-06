"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, publicApi, getUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import GridShape from "@/components/common/GridShape";

interface Room {
  id: number;
  name: string;
  description?: string;
  creator_name: string;
  member_count: number;
  is_private: boolean;
  created_at: string;
  is_member?: boolean;
  user_role?: string;
}

interface User {
  id: number;
  username: string;
  full_name?: string;
  email: string;
  role: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const currentUser = getUser();
      setUser(currentUser);

      // Load rooms - now accessible without authentication
      const response = await publicApi.getRooms() as any;
      const transformedRooms = (response.rooms || []).map((room: any) => ({
        id: room.id,
        name: room.name,
        description: room.description,
        creator_name: room.creator?.full_name || room.creator?.username || 'Unknown',
        member_count: room.current_members,
        is_private: room.is_private,
        created_at: room.created_at,
        is_member: room.is_member,
        user_role: room.user_role
      }));
      setRooms(transformedRooms);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (roomData: { name: string; description?: string; max_members: number }) => {
    try {
      await authApi.createRoom(roomData);
      setShowCreateModal(false);
      await loadDashboard(); // Refresh rooms
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  };

  const handleJoinRoom = () => {
    router.push("/join");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superadmin": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <GridShape />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Breadcrumb */}
        <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <PageBreadCrumb />
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to Iron Vault
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user
                  ? `Welcome back, ${user.full_name || user.username}. Manage your rooms and collaborate with your team`
                  : "Explore rooms and collaborate with others"
                }
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              {user && (
                <Badge className={getRoleBadgeColor(user.role || "user")}>
                  {user.role?.toUpperCase() || "USER"}
                </Badge>
              )}
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Room
              </Button>
              <Button
                onClick={handleJoinRoom}
                variant="outline"
                className="border-gray-300 dark:border-gray-600"
              >
                Join Room
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rooms</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{rooms.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {rooms.reduce((sum, room) => sum + room.member_count, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Private Rooms</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {rooms.filter(room => room.is_private).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleRoomClick(room)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {room.name}
                    </h3>
                    {room.is_private && (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Private
                      </Badge>
                    )}
                  </div>

                  {room.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {room.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Created by {room.creator_name}</span>
                    <span>{room.member_count} members</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created {new Date(room.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {rooms.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No rooms yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first room to get started collaborating
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create Your First Room
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoom}
        />
      )}

      {/* Room Details Modal */}
      {showRoomDetails && selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          onClose={() => setShowRoomDetails(false)}
          onUpdate={() => loadDashboard()}
        />
      )}
    </>
  );
}

// Create Room Modal Component
function CreateRoomModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    max_members: 50,
    is_private: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onCreate(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Room</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Room Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Members
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              required
              value={formData.max_members}
              onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_private"
              checked={formData.is_private}
              onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_private" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Private Room
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Room Details Modal Component
function RoomDetailsModal({ room, onClose, onUpdate }: {
  room: any;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [activeTab, setActiveTab] = useState("details");
  const [inviteCodes, setInviteCodes] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = getUser();

  useEffect(() => {
    if (activeTab === "invites") {
      loadInviteCodes();
    } else if (activeTab === "members") {
      loadMembers();
    }
  }, [activeTab]);

  const loadInviteCodes = async () => {
    try {
      const response = await authApi.getRoomInviteCodes(room.id) as any;
      setInviteCodes(response.invite_codes || []);
    } catch (error) {
      console.error("Error loading invite codes:", error);
      setInviteCodes([]);
    }
  };

  const loadMembers = async () => {
    try {
      const response = await authApi.getRoomMembers(room.id) as any;
      setMembers(response.members || []);
    } catch (error) {
      console.error("Error loading members:", error);
      setMembers([]);
    }
  };

  const createInviteCode = async () => {
    setLoading(true);
    try {
      await authApi.createRoomInviteCode(room.id, { max_uses: 10, expires_hours: 24 });
      await loadInviteCodes();
    } catch (error) {
      console.error("Error creating invite code:", error);
    } finally {
      setLoading(false);
    }
  };

  const canManage = user?.role === "superadmin" || room.creator_name === user?.full_name;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{room.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("details")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "details"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Details
            </button>
            {canManage && (
              <>
                <button
                  onClick={() => setActiveTab("invites")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "invites"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Invite Codes
                </button>
                <button
                  onClick={() => setActiveTab("members")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "members"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Members
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <p className="text-gray-900 dark:text-white">{room.description || "No description"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Creator
                </label>
                <p className="text-gray-900 dark:text-white">{room.creator_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Members
                </label>
                <p className="text-gray-900 dark:text-white">{room.member_count}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Privacy
                </label>
                <p className="text-gray-900 dark:text-white">
                  {room.is_private ? "Private" : "Public"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Created
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(room.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "invites" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Invite Codes</h3>
              <Button
                onClick={createInviteCode}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Creating..." : "Create Invite Code"}
              </Button>
            </div>
            <div className="space-y-3">
              {inviteCodes.map((code: any) => (
                <div key={code.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-lg text-gray-900 dark:text-white">{code.code}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Used: {code.current_uses}{code.max_uses && `/${code.max_uses}`}</span>
                        {code.expires_at && (
                          <span>Expires: {new Date(code.expires_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {inviteCodes.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No invite codes yet. Create one to invite people to this room.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Room Members</h3>
            <div className="space-y-3">
              {members.map((member: any) => (
                <div key={member.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{member.user?.full_name || member.user?.username}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Role: {member.role}</span>
                        <span>Email: {member.user?.email}</span>
                        <span>Joined: {new Date(member.joined_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No members found in this room.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}