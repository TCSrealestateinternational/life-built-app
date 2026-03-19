import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic',
  'video/mp4', 'video/quicktime', 'video/avi', 'video/webm',
];

// iOS sends blank MIME type for HEIC — detect by extension
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];
const VIDEO_EXTS = ['mp4', 'mov', 'avi', 'webm'];
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

function fileExt(name) {
  return name.split('.').pop().toLowerCase();
}

function resolveType(file) {
  if (file.type) return file.type;
  const ext = fileExt(file.name);
  if (IMAGE_EXTS.includes(ext)) return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  if (VIDEO_EXTS.includes(ext)) return `video/${ext === 'mov' ? 'quicktime' : ext}`;
  return '';
}

export function useUpload(uid) {
  const [progress, setProgress] = useState(null); // null = idle, 0-100 = uploading

  async function upload(file, category) {
    const type = resolveType(file);

    if (!ALLOWED_TYPES.includes(type)) {
      throw new Error('File type not supported. Please upload an image or video.');
    }
    if (file.size > MAX_BYTES) {
      throw new Error('File is too large. Maximum size is 50 MB.');
    }

    const fileId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const storagePath = `users/${uid}/documents/${fileId}-${file.name}`;
    const storageRef = ref(storage, storagePath);

    await new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file);
      task.on(
        'state_changed',
        (snap) => {
          setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
        },
        (err) => {
          setProgress(null);
          reject(err);
        },
        () => resolve(),
      );
    });

    setProgress(null);

    const url = await getDownloadURL(storageRef);
    const isMedia = type.startsWith('image/') || type.startsWith('video/');

    return {
      id: fileId,
      name: file.name,
      url,
      storagePath,
      category: category ?? (isMedia ? 'Photos' : 'Other'),
      size: file.size,
      type,
      addedAt: new Date().toISOString(),
      source: 'upload',
    };
  }

  return { upload, progress };
}
