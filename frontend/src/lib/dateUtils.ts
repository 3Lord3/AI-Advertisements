/**
 * Format date to Russian locale format
 * @param date - ISO date string
 * @returns Formatted date string (e.g., "23 марта 2026 г.")
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}