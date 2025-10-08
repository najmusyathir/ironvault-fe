"use client";

import { ReactNode } from "react";

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: ReactNode;
  count?: number;
}

export function Tab({ label, isActive, onClick, icon, count }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors
        ${isActive
          ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800"
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
        }
      `}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className={`
          px-2 py-1 text-xs rounded-full
          ${isActive
            ? "bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300"
            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          }
        `}>
          {count}
        </span>
      )}
    </button>
  );
}

interface TabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    count?: number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-gray-50 dark:bg-gray-900 rounded-lg">
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          label={tab.label}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          icon={tab.icon}
          count={tab.count}
        />
      ))}
    </div>
  );
}

interface TabPanelProps {
  children: ReactNode;
  isActive: boolean;
}

export function TabPanel({ children, isActive }: TabPanelProps) {
  if (!isActive) return null;
  return <div className="mt-4">{children}</div>;
}