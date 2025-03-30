import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add this function to ensure the value is either 'x' or 'y'
export function ensureTableValueColumn(column: string): 'x' | 'y' {
  return column === 'x' ? 'x' : 'y';
}
