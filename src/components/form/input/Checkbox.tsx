"use client";
import React from "react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  checked,
  onChange,
  id,
  name,
  disabled = false,
  className = "",
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      id={id}
      name={name}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${className}`}
    />
  );
}