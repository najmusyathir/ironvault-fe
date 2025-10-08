export enum FileCategory {
  DOCUMENT = 'document',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  ARCHIVE = 'archive',
  CODE = 'code',
  OTHER = 'other'
}

export interface RoomFile {
  id: number;
  room_id: number;
  user_id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  category: FileCategory;
  description?: string;
  storage_path: string;
  public_url?: string;
  is_encrypted: boolean;
  status: string;
  upload_date: string;
  last_accessed?: string;
  file_hash?: string;
  mime_type?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    full_name?: string;
    email: string;
  };
}

export interface FileUploadRequest {
  file: File;
  description?: string;
  isEncrypted?: boolean;
}

export interface FileUploadResponse {
  file: RoomFile;
  message: string;
}

export interface FileListResponse {
  files: RoomFile[];
  total: number;
  page: number;
  per_page: number;
}

export interface FileSearchFilters {
  search?: string;
  category?: FileCategory;
  file_type?: string;
  min_size?: number;
  max_size?: number;
  uploaded_by?: number;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface FileDownloadResponse {
  download_url: string;
  filename: string;
  file_size: number;
  mime_type: string;
}

export interface FileDeleteRequest {
  file_ids: number[];
}

export interface FileDeleteResponse {
  message: string;
  deleted_count: number;
}

export interface FileStats {
  total_files: number;
  total_size: number;
  by_category: Record<FileCategory, {
    count: number;
    size: number;
  }>;
  recent_uploads: RoomFile[];
}

// Helper functions
export const getFileCategory = (filename: string): FileCategory => {
  if (!filename || !filename.includes('.')) {
    return FileCategory.OTHER;
  }

  const ext = filename.toLowerCase().split('.').pop();

  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'];
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
  const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'];
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
  const codeTypes = ['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css', 'php', 'rb', 'go', 'rs'];

  if (ext && documentTypes.includes(ext)) return FileCategory.DOCUMENT;
  if (ext && imageTypes.includes(ext)) return FileCategory.IMAGE;
  if (ext && videoTypes.includes(ext)) return FileCategory.VIDEO;
  if (ext && audioTypes.includes(ext)) return FileCategory.AUDIO;
  if (ext && archiveTypes.includes(ext)) return FileCategory.ARCHIVE;
  if (ext && codeTypes.includes(ext)) return FileCategory.CODE;

  return FileCategory.OTHER;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIconComponent = (category: FileCategory): React.ComponentType<{className?: string}> => {
  switch (category) {
    case FileCategory.IMAGE:
      return require('@/icons/file.svg').default;
    case FileCategory.VIDEO:
      return require('@/icons/videos.svg').default;
    case FileCategory.AUDIO:
      return require('@/icons/audio.svg').default;
    case FileCategory.ARCHIVE:
      return require('@/icons/box-cube.svg').default;
    case FileCategory.CODE:
      return require('@/icons/file.svg').default;
    case FileCategory.DOCUMENT:
      return require('@/icons/docs.svg').default;
    default:
      return require('@/icons/file.svg').default;
  }
};

// Keep the old function for backward compatibility
export const getFileIcon = (category: FileCategory): string => {
  switch (category) {
    case FileCategory.IMAGE:
      return '🖼️';
    case FileCategory.VIDEO:
      return '🎬';
    case FileCategory.AUDIO:
      return '🎵';
    case FileCategory.ARCHIVE:
      return '📦';
    case FileCategory.CODE:
      return '💻';
    case FileCategory.DOCUMENT:
      return '📄';
    default:
      return '📎';
  }
};