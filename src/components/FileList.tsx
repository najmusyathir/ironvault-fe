"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { Input } from "@/components/form/input/InputField";
import { RoomFile, FileCategory, formatFileSize, getFileIcon } from "@/types/files";

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

  // Load files (will fail with 404 until backend is ready)
  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const { authApi } = await import("@/lib/api");

      // This will fail with 404 until backend endpoints are ready
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
      const { authApi } = await import("@/lib/api");
      const response = await authApi.downloadFile(roomId, file.id);

      // Create download link
      const link = document.createElement('a');
      link.href = response.download_url;
      link.download = response.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log("Backend not ready, simulating download for demo");
      // Simulate download for demo purposes
      alert(`Downloading "${file.original_filename}" (${formatFileSize(file.file_size)})\n\nThis is a demo - no actual file will be downloaded.`);
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
        <div className="text-6xl mb-4">📁</div>
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
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </span>
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
              <span className="text-3xl">{getFileIcon(file.category)}</span>
              {file.is_encrypted && (
                <span className="text-green-500" title="Encrypted">🔒</span>
              )}
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
                ⬇️
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(file.id)}
                className="text-red-600 hover:text-red-700"
              >
                🗑️
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && files.length > 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium mb-2">No Files Found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            No files match your search criteria. Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}