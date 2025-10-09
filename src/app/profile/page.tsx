"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authApi, getUser, setUser } from "@/lib/api";
import { checkAuth } from "@/lib/auth";
import { User } from "@/types/auth";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";

interface ProfileFormData {
  username: string;
  email: string;
  full_name: string;
  phone: string;
  nickname: string;
  nric: string;
  birth_date: string;
  role: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileFormState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  formData: ProfileFormData;
  formErrors: Partial<Record<keyof ProfileFormData, string>>;
  isEditing: boolean;
  showPassword: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [formState, setFormState] = useState<ProfileFormState>({
    isLoading: false,
    error: null,
    success: null,
    formData: {
      username: "",
      email: "",
      full_name: "",
      phone: "",
      nickname: "",
      nric: "",
      birth_date: "",
      role: "",
      newPassword: "",
      confirmPassword: "",
    },
    formErrors: {},
    isEditing: false,
    showPassword: false,
  });

  const {
    isLoading,
    error,
    success,
    formData,
    formErrors,
    isEditing,
    showPassword,
  } = formState;

  useEffect(() => {
    checkAuth();
    const currentUser = getUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    // Load user data into form
    setFormState(prev => ({
      ...prev,
      formData: {
        username: currentUser.username || "",
        email: currentUser.email || "",
        full_name: currentUser.full_name || "",
        phone: currentUser.phone || "",
        nickname: currentUser.nickname || "",
        nric: currentUser.nric || "",
        birth_date: currentUser.birth_date ? new Date(currentUser.birth_date).toISOString().split('T')[0] : "",
        role: currentUser.role || "",
        newPassword: "",
        confirmPassword: "",
      },
    }));
  }, [router]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
      formErrors: {
        ...prev.formErrors,
        [field]: undefined,
      },
      error: null,
      success: null,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    }

    if (!formData.full_name.trim()) {
      errors.full_name = "Full name is required";
    }

    // Password validation if changing password
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (formData.newPassword && formData.newPassword.length < 3) {
      errors.newPassword = "Password must be at least 3 characters long";
    }

    setFormState(prev => ({
      ...prev,
      formErrors: errors,
    }));

    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setFormState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      success: null,
    }));


    try {
      // Prepare update data (only include fields that have values)
      const updateData: Partial<User> & { password?: string } = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
      };

      // Only include optional fields if they have values
      if (formData.phone) {
        updateData.phone = formData.phone;
      }

      if (formData.nickname) {
        updateData.nickname = formData.nickname;
      }

      if (formData.nric) {
        updateData.nric = formData.nric;
      }

      if (formData.birth_date) {
        updateData.birth_date = formData.birth_date;
      }

      // Add password if provided
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      // Call API to update user (you'll need to add this endpoint)
      const response = await authApi.updateProfile(updateData);

      // setUser is now called automatically in the API function
      // Reload the updated user data into the form
      const updatedUser = response.user;
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        success: "Profile updated successfully!",
        isEditing: false,
        formData: {
          username: updatedUser.username || "",
          email: updatedUser.email || "",
          full_name: updatedUser.full_name || "",
          phone: updatedUser.phone || "",
          nickname: updatedUser.nickname || "",
          nric: updatedUser.nric || "",
          birth_date: updatedUser.birth_date ? new Date(updatedUser.birth_date).toISOString().split('T')[0] : "",
          role: updatedUser.role || "",
          newPassword: "",
          confirmPassword: "",
        },
      }));

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleCancel = () => {
    const currentUser = getUser();
    if (currentUser) {
      setFormState(prev => ({
        ...prev,
        isEditing: false,
        formData: {
          username: currentUser.username || "",
          email: currentUser.email || "",
          full_name: currentUser.full_name || "",
          phone: currentUser.phone || "",
          nickname: currentUser.nickname || "",
          nric: currentUser.nric || "",
          birth_date: currentUser.birth_date ? new Date(currentUser.birth_date).toISOString().split('T')[0] : "",
          role: currentUser.role || "",
          newPassword: "",
          confirmPassword: "",
        },
        formErrors: {},
      }));
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-3/4 w-full mx-auto max-w-4xl">
      <div className="w-full max-w-2xl mx-auto mb-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-2xl mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Profile Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-center space-x-6 p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {formData.full_name
                  ? formData.full_name
                    .split(" ")
                    .map((word) => word.charAt(0))
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                  : formData.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Profile Picture
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                JPG, GIF or PNG. 1MB max.
              </p>
              <Button
                variant="outline"
                className="mt-2"
                disabled
              >
                Change Photo
              </Button>
            </div>
          </div>

          {/* Account Information */}
          <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Account Information
              </h3>
              {!isEditing ? (
                <Button
                  onClick={() => setFormState(prev => ({ ...prev, isEditing: true }))}
                >
                  Edit
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 border border-green-400 rounded-lg">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label>Username</Label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  disabled={!isEditing}
                  className={formErrors.username ? "border-red-500" : ""}
                />
                {formErrors.username && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>
                )}
              </div>

              <div>
                <Label>Role</Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formData.role}
                    disabled={true}  // Always disabled - role is read-only
                    onChange={() => { }}  // Dummy handler to prevent warning
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${formData.role === 'superadmin' ? 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20' :
                        formData.role === 'admin' ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20' :
                          'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                      }`}>
                      {formData.role}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Role cannot be changed
                </p>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div>
                <Label>Full Name</Label>
                <Input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  disabled={!isEditing}
                  className={formErrors.full_name ? "border-red-500" : ""}
                />
                {formErrors.full_name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.full_name}</p>
                )}
              </div>

              <div>
                <Label>Phone (Optional)</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                  className={formErrors.phone ? "border-red-500" : ""}
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <Label>Nickname (Optional)</Label>
                <Input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange("nickname", e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label>Birth Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange("birth_date", e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label>NRIC (Optional)</Label>
                <Input
                  type="text"
                  value={formData.nric}
                  onChange={(e) => handleInputChange("nric", e.target.value)}
                  disabled={!isEditing}
                  className={formErrors.nric ? "border-red-500" : ""}
                />
                {formErrors.nric && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.nric}</p>
                )}
              </div>
            </div>

            {/* Password Change Section */}
            {isEditing && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Change Password
                </h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label>New Password (Optional)</Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => setFormState(prev => ({ ...prev, formData: { ...prev.formData, newPassword: e.target.value } }))}
                      className={formErrors.newPassword ? "border-red-500" : ""}
                    />
                    {formErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <Label>Confirm New Password</Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormState(prev => ({ ...prev, formData: { ...prev.formData, confirmPassword: e.target.value } }))}
                      className={formErrors.confirmPassword ? "border-red-500" : ""}
                    />
                    {formErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    onClick={() => setFormState(prev => ({ ...prev, showPassword: !showPassword }))}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeCloseIcon className="w-4 h-4 mr-1" /> : <EyeIcon className="w-4 h-4 mr-1" />}
                    {showPassword ? "Hide Password" : "Show Password"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}