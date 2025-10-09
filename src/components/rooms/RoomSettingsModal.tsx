"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UpdateRoomRequest } from "@/types/rooms";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { LockIcon, UnlockIcon, XIcon, TrashIcon } from "@/icons";

interface RoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateRoomRequest) => Promise<void>;
  onDelete: () => Promise<void>;
  room: {
    id: number;
    name: string;
    description?: string;
    is_private: boolean;
    max_members: number;
  };
}

export default function RoomSettingsModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  room
}: RoomSettingsModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<UpdateRoomRequest>({
    name: room.name,
    description: room.description || "",
    is_private: room.is_private,
    max_members: room.max_members
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleInputChange = (field: keyof UpdateRoomRequest, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.name?.trim()) {
      return "Room name is required";
    }
    if (formData.name && (formData.name.length < 1 || formData.name.length > 100)) {
      return "Room name must be between 1 and 100 characters";
    }
    if (formData.max_members && (formData.max_members < 1 || formData.max_members > 1000)) {
      return "Maximum members must be between 1 and 1000";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Only include fields that have actually changed
      const changedData: UpdateRoomRequest = {};
      if (formData.name !== room.name) changedData.name = formData.name;
      if (formData.description !== room.description) changedData.description = formData.description;
      if (formData.is_private !== room.is_private) changedData.is_private = formData.is_private;
      if (formData.max_members !== room.max_members) changedData.max_members = formData.max_members;

      // Only call save if there are changes
      if (Object.keys(changedData).length === 0) {
        onClose();
        return;
      }

      await onSave(changedData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update room settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoom = async () => {
    console.log("handleDeleteRoom called");
    try {
      setIsDeleting(true);
      setError(null);
      console.log("Calling onDelete...");
      await onDelete();
      console.log("onDelete completed, redirecting...");
      router.push('/rooms');
    } catch (err: any) {
      console.error("Delete room error:", err);
      setError(err.message || "Failed to delete room");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl dark:bg-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Room Settings
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Name *
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter room name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isSaving}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.name?.length || 0}/100 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter room description (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                rows={3}
                disabled={isSaving}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description?.length || 0}/500 characters
              </p>
            </div>

            {/* Privacy Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Room Privacy
              </label>
              <div className="flex gap-4">
                <button
                                    onClick={() => handleInputChange("is_private", false)}
                  className={`flex-1 p-4 border rounded-lg text-center transition-colors ${
                    formData.is_private === false
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                  disabled={isSaving}
                >
                  <UnlockIcon className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <div className="font-medium text-gray-900 dark:text-white">Public</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Anyone with invite link can join
                  </div>
                </button>

                <button
                                    onClick={() => handleInputChange("is_private", true)}
                  className={`flex-1 p-4 border rounded-lg text-center transition-colors ${
                    formData.is_private === true
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                  disabled={isSaving}
                >
                  <LockIcon className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <div className="font-medium text-gray-900 dark:text-white">Private</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Only invited users can join
                  </div>
                </button>
              </div>
            </div>

            {/* Maximum Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Members
              </label>
              <input
                type="number"
                value={formData.max_members?.toString() || ""}
                onChange={(e) => handleInputChange("max_members", parseInt(e.target.value) || 1)}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isSaving}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be between 1 and 1000 members
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                                onClick={() => {
                  console.log("Delete button clicked");
                  setShowDeleteConfirm(true);
                }}
                disabled={isSaving || isDeleting}
                className="px-4 py-3 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 dark:text-red-400 dark:hover:text-red-300 dark:border-red-700 dark:hover:border-red-600 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:order-3 flex items-center"
              >
                <TrashIcon className="w-6 h-6 mr-2" />
                Delete Room
              </button>

              <div className="flex gap-3 sm:order-1 sm:mr-auto">
                <Button
                                    onClick={onClose}
                  variant="outline"
                  disabled={isSaving || isDeleting}
                >
                  Cancel
                </Button>
                <Button
                                    disabled={isSaving || isDeleting}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl dark:bg-gray-800 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <TrashIcon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Room
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Are you sure you want to delete the room <span className="font-semibold">"{room.name}"</span>?
                  This will permanently remove:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                  <li>All room settings and configurations</li>
                  <li>All member access and permissions</li>
                  <li>All uploaded files and documents</li>
                  <li>All invite codes and pending invitations</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>Warning:</strong> This action is irreversible. All room data will be permanently deleted.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteRoom}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? "Deleting..." : "Delete Room"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}