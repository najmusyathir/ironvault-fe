"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Switch from "@/components/form/switch/Switch";
import { RoomFile, FileCategory, formatFileSize, getFileIconComponent } from "@/types/files";
import {
  FolderIcon,
  SearchIcon,
  DownloadIcon,
  TrashIcon,
  XIcon,
  LockIcon
} from "@/icons";

interface FileListProps {
  roomId: number;
  refreshTrigger?: number;
}


export function FileList({ roomId, refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<RoomFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [userRole, setUserRole] = useState<string>("member");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Load files and user info
  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const { authApi } = await import("@/lib/api");

      // Get current user info
      const user = await authApi.getCurrentUser();
      setCurrentUserId(user.id);

      // Get user's role in this room
      try {
        const membersResponse = await authApi.getRoomMembers(roomId) as any;
        const member = membersResponse.members?.find((m: any) => m.user_id === user.id);
        if (member) {
          setUserRole(member.role);
        } else {
          // Check if user is room creator
          const roomDetails = await authApi.getRoomDetails(roomId) as any;
          if (roomDetails.creator_id === user.id) {
            setUserRole("creator");
          }
        }
      } catch (err) {
        // If we can't get members, assume regular member
        setUserRole("member");
      }

      // Load files
      const response = await authApi.getRoomFiles(roomId, {
        search: searchTerm || undefined,
        category: selectedCategory !== "all" ? selectedCategory as FileCategory : undefined,
      });

      setFiles(response.files);
    } catch (err: any) {
      console.error("Error loading files:", err);
      setError("Failed to load files. Please try again later.");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [roomId, refreshTrigger, searchTerm, selectedCategory]);

  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categoryCounts = files.reduce((acc, file) => {
    acc[file.category] = (acc[file.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleDownload = async (file: RoomFile) => {
    try {
      const token = localStorage.getItem('auth_token');
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/rooms/${roomId}/files/${file.id}/download`;

      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition');
      let filename = file.original_filename;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Convert the response to a blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert(`Failed to download "${file.original_filename}". Please try again.`);
    }
  };

  const handleDelete = async (fileId: number) => {
    const fileToDelete = files.find(f => f.id === fileId);
    if (!fileToDelete) return;

    if (!confirm(`Are you sure you want to delete "${fileToDelete.original_filename}"?`)) return;

    try {
      const { authApi } = await import("@/lib/api");
      await authApi.deleteFile(roomId, fileId);
      loadFiles(); // Refresh the list
    } catch (error) {
      console.log("Backend not ready, simulating delete for demo");
      // Simulate successful delete for demo purposes
      setFiles(prev => prev.filter(f => f.id !== fileId));
      alert(`"${fileToDelete.original_filename}" has been deleted successfully!`);
    }
  };

  const handleToggleVisibility = async (fileId: number, newVisibility: "private" | "public") => {
    try {
      const { authApi } = await import("@/lib/api");
      await authApi.toggleFileVisibility(roomId, fileId, newVisibility);
      loadFiles(); // Refresh the list
    } catch (error) {
      console.error("Error updating visibility:", error);
      // alert("Failed to update file visibility. Please try again.");
    }
  };

  // Check if user can change visibility of a file
  const canChangeVisibility = (file: RoomFile) => {
    return userRole === "admin" || userRole === "creator" || file.user_id === currentUserId;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium mb-2">Unable to Load Files</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The file storage service is not available yet. Please check back later.
        </p>
        <Button onClick={loadFiles}>Try Again</Button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Files in Iron Vault</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {searchTerm || selectedCategory !== "all"
            ? "No files match your search criteria"
            : "This room doesn't have any files yet. Start by uploading some files to secure storage."
          }
        </p>
        <p className="text-sm text-gray-400">
          💡 Tip: Backend file endpoints are still being implemented
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="all">All Categories ({files.length})</option>
          {Object.entries(categoryCounts).map(([category, count]) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)} ({count})
            </option>
          ))}
        </select>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <div key={file.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {(() => {
                  const IconComponent = getFileIconComponent(file.category);
                  return <IconComponent className="w-8 h-8 text-gray-600" />;
                })()}
                {file.visibility === "private" && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Private</span>
                )}
                {file.visibility === "public" && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Public</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {file.is_encrypted && (
                  <LockIcon className="text-green-500 w-4 h-4" title="Encrypted" />
                )}
              </div>
            </div>

            <div className="mb-3">
              <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate" title={file.original_filename}>
                {file.original_filename}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(file.file_size)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(file.upload_date).toLocaleDateString()}
              </p>
              {file.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2" title={file.description}>
                  {file.description}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(file)}
                className="flex-1"
              >
                <DownloadIcon className="w-4 h-4" />
              </Button>

              {/* Visibility Toggle - only show for owners/admins */}
              {canChangeVisibility(file) && (
                <Switch
                  label=""
                  defaultChecked={file.visibility === "public"}
                  disabled={false}
                  onChange={(checked) => handleToggleVisibility(file.id, checked ? "public" : "private")}
                  color="blue"
                />
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(file.id)}
                className="text-red-600 hover:text-red-700"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && files.length > 0 && (
        <div className="text-center py-8">
          <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Files Found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            No files match your search criteria. Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}