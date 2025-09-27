"use client";
import React from "react";

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
}

export default function Label({ children, htmlFor }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
    >
      {children}
    </label>
  );
}