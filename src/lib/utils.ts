// Utility functions for the Iron Vault application

/**
 * Get initials from a name
 * @param name The full name to get initials from
 * @returns The initials (up to 2 characters)
 */
export const getInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return '';

  return name
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format a date string to a readable format
 * @param dateString The date string to format
 * @param format The format to use (default: 'short')
 * @returns The formatted date string
 */
export const formatDate = (dateString: string, format: 'short' | 'long' = 'short'): string => {
  const date = new Date(dateString);

  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Truncate text to a specified length
 * @param text The text to truncate
 * @param maxLength The maximum length
 * @returns The truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Generate a random color based on a string
 * @param str The string to generate color from
 * @returns The generated color class
 */
export const generateColorClass = (str: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Debounce a function
 * @param func The function to debounce
 * @param wait The wait time in milliseconds
 * @returns The debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Check if a string is empty or whitespace only
 * @param str The string to check
 * @returns True if the string is empty or whitespace only
 */
export const isEmptyOrWhitespace = (str: string): boolean => {
  return !str || str.trim().length === 0;
};

/**
 * Capitalize the first letter of a string
 * @param str The string to capitalize
 * @returns The capitalized string
 */
export const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};