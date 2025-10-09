"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, getUser } from "@/lib/api";
import { checkAuth } from "@/lib/auth";
import { Room, CreateRoomRequest } from "@/types/rooms";
import { User } from "@/types/auth";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { PlusIcon, SearchIcon, UsersIcon, LockIcon, UnlockIcon } from "@/icons";
import RoomCard from "@/components/rooms/RoomCard";
import CreateRoomModal from "@/components/rooms/CreateRoomModal";
import Link from "next/link";

interface RoomFormState {
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  rooms: Room[];
  isCreateModalOpen: boolean;
}

export default function RoomsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [canCreateRoom, setCanCreateRoom] = useState(false);

  const [formState, setFormState] = useState<RoomFormState>({
    isLoading: false,
    error: null,
    searchQuery: "",
    rooms: [],
    isCreateModalOpen: false,
  });

  const { isLoading, error, searchQuery, rooms, isCreateModalOpen } = formState;

  useEffect(() => {
    checkAuth();
    // Initialize user data on client side only
    const user = getUser();
    setCurrentUser(user);
    setCanCreateRoom(user?.role === "admin" || user?.role === "superadmin");
  }, []);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async (search?: string) => {
    try {
      setFormState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await authApi.getRooms() as any;
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        rooms: response.rooms || [],
      }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load rooms";
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleSearch = (query: string) => {
    setFormState(prev => ({ ...prev, searchQuery: query }));
    // Debounce search
    const timer = setTimeout(() => {
      loadRooms(query);
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleCreateRoom = async (data: CreateRoomRequest) => {
    try {
      setFormState(prev => ({ ...prev, isLoading: true, error: null }));

      await authApi.createRoom(data);
      await loadRooms(); // Refresh the list

      setFormState(prev => ({
        ...prev,
        isLoading: false,
        isCreateModalOpen: false,
      }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create room";
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleJoinRoom = async (inviteCode: string) => {
    try {
      setFormState(prev => ({ ...prev, isLoading: true, error: null }));

      await authApi.joinRoom(inviteCode);
      await loadRooms(); // Refresh the list

      setFormState(prev => ({ ...prev, isLoading: false }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to join room";
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col flex-1 w-full gap-3">
      {/* Search and Filter */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{filteredRooms.length} rooms</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading rooms...</p>
            </div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <UsersIcon className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No rooms found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? "Try adjusting your search or" : "Get started by"} creating your first room
            </p>
            <Button
              onClick={() => setFormState(prev => ({ ...prev, isCreateModalOpen: true }))}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Room
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onJoin={handleJoinRoom}
                onView={(roomId) => router.push(`/rooms/${roomId}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <CreateRoomModal
          onClose={() => setFormState(prev => ({ ...prev, isCreateModalOpen: false }))}
          onSubmit={handleCreateRoom}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}