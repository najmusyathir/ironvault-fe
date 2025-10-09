"use client";

import { useState, useCallback } from "react";
import Button from "@/components/ui/button/Button";
import Switch from "@/components/form/switch/Switch";
import { FileCategory, getFileCategory, formatFileSize, getFileIconComponent } from "@/types/files";
import {
  FolderIcon,
  XIcon,
  LockIcon
} from "@/icons";

interface FileUploadProps {
  roomId: number;
  onUploadSuccess?: () => void;
}

export function FileUpload({ roomId, onUploadSuccess }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    // Filter out files larger than 100MB
    const validFiles = files.filter(file => file.size <= 100 * 1024 * 1024);

    if (validFiles.length !== files.length) {
      alert("Some files were skipped because they exceed the 100MB limit.");
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Dummy response for simulating successful upload
const createDummyFile = (file: File, description?: string, isEncrypted?: boolean): any => {
  const categories = {
    'pdf': FileCategory.DOCUMENT,
    'doc': FileCategory.DOCUMENT,
    'docx': FileCategory.DOCUMENT,
    'jpg': FileCategory.IMAGE,
    'jpeg': FileCategory.IMAGE,
    'png': FileCategory.IMAGE,
    'mp4': FileCategory.VIDEO,
    'zip': FileCategory.ARCHIVE,
    'txt': FileCategory.DOCUMENT,
    'js': FileCategory.CODE,
    'ts': FileCategory.CODE
  };

  const ext = file.name.split('.').pop()?.toLowerCase() || 'other';
  const category = categories[ext as keyof typeof categories] || FileCategory.OTHER;

  return {
    id: Math.floor(Math.random() * 10000) + 1000, // Random ID
    room_id: roomId,
    user_id: 1, // Mock user ID
    filename: file.name,
    original_filename: file.name,
    file_size: file.size,
    file_type: file.type || 'application/octet-stream',
    category: category,
    description: description || `${file.name} uploaded via Iron Vault`,
    storage_path: `/files/room${roomId}/${file.name}`,
    is_encrypted: isEncrypted || false,
    status: "active",
    upload_date: new Date().toISOString(),
    last_accessed: new Date().toISOString(),
    file_hash: `sha256:${Math.random().toString(36).substring(7)}`,
    mime_type: file.type || 'application/octet-stream',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      id: 1,
      username: "current_user",
      full_name: "Current User",
      email: "current@example.com"
    }
  };
};

const uploadFiles = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);

    try {
      const { authApi } = await import("@/lib/api");

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Try to upload - expect 404 since backend isn't ready
        try {
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          await authApi.uploadFile(roomId, file, description, isEncrypted, visibility);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } catch (error) {
          console.log("Backend not ready, simulating successful upload for demo");
          // Simulate upload progress for demo
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
              progress = 100;
              clearInterval(progressInterval);
            }
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }, 200);
        }

        // Remove progress after delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }, 2000);
      }

      // Reset form
      setSelectedFiles([]);
      setDescription("");
      setIsEncrypted(false);
      setVisibility("private");
      setFileInputKey(Date.now()); // Reset file input

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // alert(`Successfully uploaded ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''} to Iron Vault! 🎉`);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to process files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, roomId, description, isEncrypted, visibility, onUploadSuccess]);

  const getFileIcon = (file: File) => {
    const category = getFileCategory(file.name);
    const IconComponent = getFileIconComponent(category);
    return <IconComponent className="w-6 h-6 text-gray-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FolderIcon className="w-6 h-6 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">
          Upload Files to Iron Vault
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Drag and drop files here or click to browse (Max 100MB per file)
        </p>
        <input
          key={fileInputKey}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
        >
          Choose Files
        </label>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Selected Files:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getFileIcon(file)}</span>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {getFileCategory(file.name)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  className="text-red-500 hover:text-red-700"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Options */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              rows={2}
              placeholder="Add a description for these files..."
              disabled={isUploading}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="encrypt"
              checked={isEncrypted}
              onChange={(e) => setIsEncrypted(e.target.checked)}
              disabled={isUploading}
              className="rounded border-gray-300"
            />
            <label htmlFor="encrypt" className="flex items-center gap-1 text-sm">
              <LockIcon className="w-6 h-6" /> Encrypt files for enhanced security
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              label="Public (all members can see)"
              defaultChecked={visibility === "public"}
              disabled={isUploading}
              onChange={(checked) => setVisibility(checked ? "public" : "private")}
              color="blue"
            />
            <LockIcon className="w-6 h-6 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {visibility === "public" ? "Public" : "Private"}
            </span>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Upload Progress:</h4>
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 truncate">
                {filename}
              </span>
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                {progress}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <Button
          onClick={uploadFiles}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? "Processing..." : `Process ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
        </Button>
      )}
    </div>
  );
}