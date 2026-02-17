import i18n from '@/src/i18n';

/**
 * Calculate the difference in time between two dates in milliseconds
 */
export const getDiffTime = (
  startDate: Date | string | null,
  endDate: Date | string | null,
): number => {
  if (!startDate || !endDate) return 0;

  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  return Math.abs(end.getTime() - start.getTime());
};

/**
 * Calculate the number of days between two dates (inclusive)
 */
export const getDaysCount = (
  startDate: Date | string | null,
  endDate: Date | string | null,
): number => {
  if (!startDate || !endDate) return 1;

  const diffTime = getDiffTime(startDate, endDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Calculate the status of an itinerary based on start and end dates
 */
export const calculateItineraryStatus = (
  startDate: Date | string,
  endDate: Date | string,
): 'ongoing' | 'upcoming' | 'past' => {
  const now = new Date();
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // Reset hours for pure date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);

  if (today < startDay) return 'upcoming';
  if (today > endDay) return 'past';
  return 'ongoing';
};

/**
 * Format a date to a time string in localized format (e.g., "09:00", "02:30 PM")
 */
export const formatToTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return d.toLocaleTimeString(i18n.language, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format a date to a short string (e.g., "Oct 24")
 */
export const formatToShortDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return d.toLocaleDateString(i18n.language, {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Combine a base date with a time string to produce an ISO string
 * Supports both 24-hour "HH:MM" and 12-hour "HH:MM AM/PM" formats
 */
export const combineDateAndTime = (baseDate: Date | string, timeStr: string): string => {
  const date = typeof baseDate === 'string' ? new Date(baseDate) : new Date(baseDate.getTime());
  if (isNaN(date.getTime())) return '';

  // Try 24-hour format first
  const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1]);
    const minutes = parseInt(match24[2]);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }

  // Try 12-hour format
  const match12 = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match12) {
    let hours = parseInt(match12[1]);
    const minutes = parseInt(match12[2]);
    const ampm = match12[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    date.setHours(hours, minutes, 0, 0);
  }
  return date.toISOString();
};

/**
 * Parse a time string to minutes from midnight for comparison
 * Supports both 24-hour "HH:MM" and 12-hour "HH:MM AM/PM" formats
 */
export const parseTimeToMinutes = (timeStr: string): number => {
  // Try 24-hour format first (e.g., "09:30", "14:00")
  const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1]);
    const minutes = parseInt(match24[2]);
    return hours * 60 + minutes;
  }

  // Try 12-hour format (e.g., "09:00 AM", "02:30 PM")
  const match12 = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match12) {
    let hours = parseInt(match12[1]);
    const minutes = parseInt(match12[2]);
    const period = match12[3].toUpperCase();

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  return 0;
};

/**
 * Format a time string (e.g., "09:30") to a localized display string
 */
export const formatTimeStr = (timeStr: string): string => {
  if (!timeStr) return '';
  const minutes = parseTimeToMinutes(timeStr);
  const d = new Date();
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return formatToTime(d);
};
