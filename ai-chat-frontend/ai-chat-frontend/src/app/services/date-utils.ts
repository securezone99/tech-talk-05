import { formatDistance } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export function formatRelativeTime(timestamp: Date | string | number): string {
  const now = new Date();
  const nowUtc = utcToZonedTime(now, 'Etc/UTC');
  const timeAgo = formatDistance(new Date(timestamp), nowUtc, { addSuffix: true });
  return timeAgo;
}
