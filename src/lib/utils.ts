import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RiskLevel } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return date;
  }
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'critical':
      return 'text-red-600 bg-red-50';
    case 'warning':
      return 'text-amber-600 bg-amber-50';
    case 'pass':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getScoreColor(score: number): string {
  if (score > 80) {
    return 'text-green-600';
  } else if (score >= 50) {
    return 'text-amber-600';
  } else {
    return 'text-red-600';
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) {
    return str;
  }
  return str.slice(0, length) + '...';
}
