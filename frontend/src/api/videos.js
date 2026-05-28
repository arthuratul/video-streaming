import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

export async function uploadVideos(files, onProgress) {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));

  const { data } = await api.post('/videos/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress(e) {
      if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total));
    },
  });

  return data;
}

export async function fetchVideos() {
  const { data } = await api.get('/videos');
  return data;
}
