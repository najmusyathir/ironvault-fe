import { useState } from "react";
import { CreateRoomRequest } from "@/types/rooms";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { XIcon } from "@/icons";

interface CreateRoomModalProps {
  onClose: () => void;
  onSubmit: (data: CreateRoomRequest) => void;
  isLoading: boolean;
}

export default function CreateRoomModal({ onClose, onSubmit, isLoading }: CreateRoomModalProps) {
  const [formData, setFormData] = useState<CreateRoomRequest>({
    name: "",
    description: "",
    is_private: false,
    max_members: 50,
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateRoomRequest, string>>>({});

  const handleInputChange = (field: keyof CreateRoomRequest, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setFormErrors(prev => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateRoomRequest, string>> = {};

    if (!formData.name.trim()) {
      errors.name = "Room name is required";
    } else if (formData.name.length < 3) {
      errors.name = "Room name must be at least 3 characters";
    } else if (formData.name.length > 100) {
      errors.name = "Room name must be less than 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    if (!formData.max_members || formData.max_members < 1) {
      errors.max_members = "Max members must be at least 1";
    } else if (formData.max_members > 1000) {
      errors.max_members = "Max members must be less than 1000";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Room
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set up a new room for collaboration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name */}
          <div>
            <Label htmlFor="name">
              Room Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter room name"
              className={formErrors.name ? "border-red-500" : ""}
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="What's this room about?"
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                formErrors.description ? "border-red-500" : ""
              }`}
            />
            {formErrors.description && (
              <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
            )}
          </div>

          {/* Privacy */}
          <div>
            <Label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_private}
                onChange={(e) => handleInputChange("is_private", e.target.checked)}
                className="mr-2 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Make this room private
              </span>
            </Label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Private rooms require an invite code to join
            </p>
          </div>

          {/* Max Members */}
          <div>
            <Label htmlFor="max_members">
              Maximum Members <span className="text-red-500">*</span>
            </Label>
            <Input
              id="max_members"
              type="number"
              min="1"
              max="1000"
              value={formData.max_members.toString()}
              onChange={(e) => handleInputChange("max_members", parseInt(e.target.value) || 1)}
              className={formErrors.max_members ? "border-red-500" : ""}
            />
            {formErrors.max_members && (
              <p className="mt-1 text-sm text-red-500">{formErrors.max_members}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                "Create Room"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}