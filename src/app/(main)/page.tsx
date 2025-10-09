import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Iron Vault Dashboard | Secure File System",
  description: "Iron Vault - Secure File System Dashboard",
};

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to Iron Vault
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Secure File System Dashboard
      </p>
      <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-lg max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Ready for Implementation
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          This dashboard is ready for your secure file system implementation.
          Add your components and functionality as needed.
        </p>
      </div>
    </div>
  );
}
