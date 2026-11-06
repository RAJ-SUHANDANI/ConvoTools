"use client";

let pendingFiles: File[] = [];

export function setPendingFiles(files: File[]) {
  pendingFiles = files;
}

export function getPendingFiles() {
  return pendingFiles;
}

export function clearPendingFiles() {
  pendingFiles = [];
}
