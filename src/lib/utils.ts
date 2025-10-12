import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function logError(context: string, error: unknown) {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
  // In production, errors are not logged to console to prevent information disclosure
}
