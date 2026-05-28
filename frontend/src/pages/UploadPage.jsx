import { useRef, useState, useCallback } from 'react';
import { uploadVideos } from '../api/videos';
import './UploadPage.css';

const MAX_FILES = 5;

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | uploading | processing | done | error
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const addFiles = useCallback((incoming) => {
    const videos = [...incoming].filter((f) => f.type.startsWith('video/'));
    if (videos.length !== incoming.length) {
      setError('Only video files are allowed.');
    } else {
      setError('');
    }

    setFiles((prev) => {
      const combined = [...prev, ...videos];
      if (combined.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} videos at a time.`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  }, []);

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError('');
  };

  const onDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = () => setDragActive(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const onInputChange = (e) => addFiles(e.target.files);

  const handleUpload = async () => {
    if (!files.length) return;
    setStatus('uploading');
    setProgress(0);
    setError('');

    try {
      await uploadVideos(files, (pct) => {
        setProgress(pct);
        if (pct === 100) setStatus('processing');
      });
      setStatus('done');
      setFiles([]);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Upload failed. Please try again.');
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setFiles([]);
    setProgress(0);
    setError('');
  };

  const isUploading = status === 'uploading' || status === 'processing';

  return (
    <div className="upload-page">
      <h1>Upload Videos</h1>
      <p className="subtitle">Drag and drop up to {MAX_FILES} videos to upload</p>

      <div
        className={`dropzone ${dragActive ? 'dropzone--active' : ''} ${isUploading ? 'dropzone--disabled' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          hidden
          onChange={onInputChange}
        />
        <div className="dropzone__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="dropzone__text">
          {dragActive ? 'Drop videos here' : 'Drag & drop videos here, or click to select'}
        </p>
        <p className="dropzone__hint">MP4, MOV, AVI, MKV · Max 500 MB each · Up to {MAX_FILES} files</p>
      </div>

      {error && <p className="upload-error">{error}</p>}

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li key={i} className="file-item">
              <div className="file-item__info">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                </svg>
                <span className="file-item__name">{f.name}</span>
                <span className="file-item__size">{formatBytes(f.size)}</span>
              </div>
              <button className="file-item__remove" onClick={() => removeFile(i)} disabled={isUploading}>×</button>
            </li>
          ))}
        </ul>
      )}

      {(status === 'uploading' || status === 'processing') && (
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
          <span className="progress-bar__label">
            {status === 'processing' ? 'Uploading to S3…' : `${progress}%`}
          </span>
        </div>
      )}

      {status === 'done' && (
        <div className="upload-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Videos uploaded successfully!
          <button className="btn btn--ghost" onClick={reset}>Upload more</button>
        </div>
      )}

      {status !== 'done' && (
        <button
          className="btn btn--primary"
          onClick={handleUpload}
          disabled={!files.length || isUploading}
        >
          {isUploading ? 'Uploading…' : `Upload ${files.length || ''} Video${files.length !== 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
}
