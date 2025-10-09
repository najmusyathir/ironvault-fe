"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import GridShape from "@/components/common/GridShape";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated and redirect to dashboard if logged in
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      router.push('/dashboard');
      return;
    }

    // If not authenticated, set user state for the page
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  const handleGetStarted = () => {
    router.push("/dashboard");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <>
      {/* <PageBreadCrumb pageTitle="Home" /> */}
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <GridShape />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          {/* Main Content */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12 backdrop-blur-sm bg-opacity-95">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to
              <span className="text-blue-600 dark:text-blue-400"> Iron Vault</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Secure File System with Advanced Room Management
            </p>

            <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl p-8 mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                🏠 Room Management
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create secure rooms, invite team members, and manage access permissions
                with our advanced room management system.
              </p>

              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400 text-2xl mb-2">🔐</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Access</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Role-based permissions and invitation-only access
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400 text-2xl mb-2">👥</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Team Collaboration</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Invite members and manage room participation
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400 text-2xl mb-2">🔧</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Admin Control</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Superadmin override and comprehensive management
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
              >
                Get Started
              </Button>
              <Button
                onClick={handleLogin}
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
              >
                Sign In
              </Button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
              {user
                ? "Welcome back! You're ready to explore."
                : (
                  <>
                    No account required to get started.{" "}
                    <button
                      onClick={handleLogin}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Sign in here for full features
                    </button>
                  </>
                )
              }
            </p>
          </div>
        </div>
      </div>
    </>
  );
}