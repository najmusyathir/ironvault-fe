"use client";
import { useRouter } from "next/navigation";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { authApi, validationHelpers } from "@/lib/api";
import { RegisterRequest, RegisterFormState } from "@/types/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formState, setFormState] = useState<RegisterFormState>({
    isLoading: false,
    error: null,
    success: null,
    formData: {
      username: "",
      email: "",
      password: "",
      phone: "",
      full_name: "",
      nickname: "",
      nric: "",
      birth_date: "",
    },
    formErrors: {},
  });

  const { isLoading, error, success, formData, formErrors } = formState;

  // Handle input changes
  const handleInputChange = (field: keyof RegisterRequest, value: string) => {
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

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof RegisterRequest, string>> = {};

    // Required fields
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (!validationHelpers.isValidUsername(formData.username)) {
      errors.username = "Username must be 3-20 characters, letters, numbers, and underscores only";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validationHelpers.isValidEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.full_name.trim()) {
      errors.full_name = "Full name is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else {
      const passwordValidation = validationHelpers.isStrongPassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors.join(", ");
      }
    }

    // Optional fields validation
    if (formData.phone && !validationHelpers.isValidPhone(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (formData.nric && !validationHelpers.isValidNRIC(formData.nric)) {
      errors.nric = "Please enter a valid NRIC number";
    }

    setFormState(prev => ({
      ...prev,
      formErrors: errors,
    }));

    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check terms acceptance
    if (!isChecked) {
      setFormState(prev => ({
        ...prev,
        error: "You must accept the terms and conditions to register",
      }));
      return;
    }

    setFormState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      success: null,
    }));

    try {
      const response = await authApi.register(formData);

      setFormState(prev => ({
        ...prev,
        isLoading: false,
        success: response.message || "Registration successful! Redirecting to login...",
      }));

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  // Clear success/error messages when user starts typing
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setFormState(prev => ({
          ...prev,
          error: null,
          success: null,
        }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 pb-6 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Register
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to register!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* <!-- Username --> */}
                <div>
                  <Label>
                    Username<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className={formErrors.username ? "border-red-500" : ""}
                  />
                  {formErrors.username && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>
                  )}
                </div>

                {/* <!-- Full Name --> */}
                <div>
                  <Label>
                    Full Name<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="full_name"
                    name="full_name"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    className={formErrors.full_name ? "border-red-500" : ""}
                  />
                  {formErrors.full_name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.full_name}</p>
                  )}
                </div>

                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>

                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={formErrors.password ? "border-red-500 pr-12" : "pr-12"}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 3 characters long.
                  </p>
                </div>

                <div className="flex gap-5">
                  {/* <!-- Phone --> */}
                  <div>
                    <Label>
                      Phone<span className="text-gray-400">(Optional)</span>
                    </Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={formErrors.phone ? "border-red-500" : ""}
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* <!-- Nickname --> */}
                  <div>
                    <Label>
                      Nickname<span className="text-gray-400">(Optional)</span>
                    </Label>
                    <Input
                      type="text"
                      id="nickname"
                      name="nickname"
                      placeholder="Enter your nickname"
                      value={formData.nickname}
                      onChange={(e) => handleInputChange("nickname", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-5">
                  {/* <!-- NRIC --> */}
                  <div>
                    <Label>
                      NRIC<span className="text-gray-400">(Optional)</span>
                    </Label>
                    <Input
                      type="text"
                      id="nric"
                      name="nric"
                      placeholder="Enter your NRIC"
                      value={formData.nric}
                      onChange={(e) => handleInputChange("nric", e.target.value)}
                      className={formErrors.nric ? "border-red-500" : ""}
                    />
                    {formErrors.nric && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.nric}</p>
                    )}
                  </div>

                  {/* <!-- Birth Date --> */}
                  <div className="flex-1">
                    <Label>
                      Birth Date<span className="text-gray-400">(Optional)</span>
                    </Label>
                    <Input
                    className="flex"
                      type="date"
                      id="birth_date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={(e) => handleInputChange("birth_date", e.target.value)}
                    />
                  </div>
                </div>

                {/* <!-- Error/Success Messages --> */}
                {error && (
                  <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded-lg">
                    {success}
                  </div>
                )}

                {/* <!-- Checkbox --> */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    className="w-5 h-5 mt-0.5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account means you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>

                {/* <!-- Button --> */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      "Register"
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?
                <Link
                  href="/login"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
