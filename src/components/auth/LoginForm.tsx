"use client";
import { useRouter } from "next/navigation";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { authApi } from "@/lib/api";
import { LoginRequest, LoginFormState } from "@/types/auth";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formState, setFormState] = useState<LoginFormState>({
    isLoading: false,
    error: null,
    success: null,
    formData: {
      email: "",
      password: "",
      device: "",
    },
    formErrors: {},
  });

  const { isLoading, error, success, formData, formErrors } = formState;

  // Handle input changes
  const handleInputChange = (field: keyof LoginRequest, value: string) => {
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
    const errors: Partial<Record<keyof LoginRequest, string>> = {};

    // Username/Email field validation
    if (!formData.email.trim()) {
      errors.email = "Username or email is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
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

    setFormState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      success: null,
    }));

    try {
      const response = await authApi.login(formData);

      setFormState(prev => ({
        ...prev,
        isLoading: false,
        success: response.message || "Login successful! Redirecting...",
      }));

      // Redirect to dashboard after successful login
      setTimeout(() => {
        router.push("/");
      }, 1500);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please check your credentials.";
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
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Login
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your username or email and password to login!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Username or Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="Enter your username or email"
                    type="text"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
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
                </div>

                {/* Error/Success Messages */}
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  href="/register"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
