"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, getUser } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function JoinRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('code');

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  useEffect(() => {
    if (inviteCode) {
      checkInvite();
    } else {
      setError("No invite code provided");
      setLoading(false);
    }
  }, [inviteCode]);

  const checkInvite = async () => {
    try {
      const user = getUser();
      if (!user) {
        router.push(`/login?redirect=/join?code=${inviteCode}`);
        return;
      }

      if (user.role !== "user") {
        setError("Only regular users can join rooms using invites");
        setLoading(false);
        return;
      }

      // Check if invite is valid and get room info
      // For now, we'll just proceed to join since there's no specific endpoint to check invite validity
      setLoading(false);
    } catch (err) {
      console.error("Error checking invite:", err);
      setError("Invalid or expired invite");
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!inviteCode) return;

    try {
      setJoining(true);
      await authApi.joinRoom(inviteCode);
      setRoomInfo({ message: "Successfully joined the room!" });
      setAlreadyJoined(true);
    } catch (err: any) {
      console.error("Error joining room:", err);
      setError(err.message || "Failed to join room");
    } finally {
      setJoining(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 dark:bg-gray-800 p-8 rounded-lg max-w-md text-center">
          <h2 className="text-2xl font-semibold text-red-700 dark:text-red-400 mb-4">
            Invalid Invite
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md w-full">
        {alreadyJoined || roomInfo?.message ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Successfully Joined!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {roomInfo?.message || "You have successfully joined the room."}
            </p>
            <Button onClick={handleGoToDashboard} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Join Room
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You've been invited to join a room. Click the button below to join.
            </p>
            <div className="mb-6">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Invite Code:</p>
                <code className="text-lg font-mono text-gray-900 dark:text-white">{inviteCode}</code>
              </div>
            </div>
            <Button
              onClick={handleJoinRoom}
              disabled={joining}
              className="w-full"
            >
              {joining ? "Joining..." : "Join Room"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}