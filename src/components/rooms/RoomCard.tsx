import { useState } from "react";
import { Room, RoomRole } from "@/types/rooms";
import Button from "@/components/ui/button/Button";
import { UsersIcon, LockIcon, UnlockIcon, UserIcon, CalendarIcon } from "@/icons";
import { getInitials } from "@/lib/utils";

interface RoomCardProps {
  room: Room;
  onJoin: (inviteCode: string) => void;
  onView: (roomId: number) => void;
}

export default function RoomCard({ room, onJoin, onView }: RoomCardProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const handleJoin = async () => {
    if (!room.is_member) {
      if (room.is_private) {
        setShowJoinInput(true);
      } else {
        // For public rooms, join directly (you might need to modify the backend)
        setShowJoinInput(true);
      }
    } else {
      onView(room.id);
    }
  };

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) return;

    setIsJoining(true);
    try {
      await onJoin(inviteCode);
      setShowJoinInput(false);
      setInviteCode("");
    } catch (error) {
      console.error("Failed to join room:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const getRoleColor = (role?: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {room.name}
              </h3>
              {room.is_private ? (
                <LockIcon className="w-4 h-4 text-gray-500" title="Private room" />
              ) : (
                <UnlockIcon className="w-4 h-4 text-gray-500" title="Public room" />
              )}
            </div>

            {room.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {room.description}
              </p>
            )}

            {/* Creator info */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                {room.creator ? getInitials(room.creator.full_name || room.creator.username) : "?"}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created by {room.creator?.full_name || room.creator?.username || "Unknown"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(room.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <UsersIcon className="w-4 h-4" />
            <span>{room.current_members}/{room.max_members}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            <span>{formatDate(room.created_at)}</span>
          </div>
        </div>

        {/* User role */}
        {room.is_member && room.user_role && (
          <div className="inline-flex items-center px-2 py-1 mt-3 text-xs font-medium rounded-full">
            {room.user_role}
          </div>
        )}
      </div>

      {/* Join Input */}
      {showJoinInput && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter invite code..."
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleJoinWithCode()}
            />
            <Button
              onClick={handleJoinWithCode}
              disabled={isJoining || !inviteCode.trim()}
              size="sm"
            >
              {isJoining ? "Joining..." : "Join"}
            </Button>
            <Button
              onClick={() => {
                setShowJoinInput(false);
                setInviteCode("");
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {room.is_member ? (
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(room.user_role)}`}>
              {room.user_role}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full dark:text-gray-400 dark:bg-gray-700">
              Not a member
            </span>
          )}
        </div>

        <Button
          onClick={handleJoin}
          variant={room.is_member ? "outline" : "primary"}
          size="sm"
          disabled={room.current_members >= room.max_members}
        >
          {room.is_member ? "View Room" :
           room.current_members >= room.max_members ? "Full" : "Join Room"}
        </Button>
      </div>
    </div>
  );
}