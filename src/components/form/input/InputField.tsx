"use client";
import React from "react";

interface InputProps {
  type?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

export default function Input({
  type = "text",
  placeholder,
  className = "",
  id,
  name,
  required = false,
  onChange,
  value,
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      id={id}
      name={name}
      required={required}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${className}`}
    />
  );
}