import { useEffect, useRef, useState } from 'react';
import { fetchVideos } from '../api/videos';
import './VideosPage.css';

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState(null);
  const playerRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchVideos();
      setVideos(data);
      if (data.length) setActive(data[0]);
    } catch {
      setError('Failed to load videos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (playerRef.current && active) {
      playerRef.current.load();
    }
  }, [active]);

  if (loading) {
    return (
      <div className="videos-page videos-page--center">
        <div className="spinner" />
        <p>Loading videos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="videos-page videos-page--center">
        <p className="vp-error">{error}</p>
        <button className="vp-retry" onClick={load}>Retry</button>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="videos-page videos-page--center">
        <div className="vp-empty-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
        </div>
        <p className="vp-empty-text">No videos yet</p>
        <p className="vp-empty-hint">Upload some videos from the Upload tab</p>
      </div>
    );
  }

  return (
    <div className="videos-page">
      <div className="vp-layout">
        <div className="vp-player-pane">
          {active && (
            <>
              <video
                ref={playerRef}
                className="vp-player"
                controls
                key={active.id}
              >
                <source src={active.url} type={active.mimeType} />
                Your browser does not support the video tag.
              </video>
              <div className="vp-player-meta">
                <h2 className="vp-player-title">{active.originalName}</h2>
                <span className="vp-player-info">{formatBytes(active.size)} · {formatDate(active.createdAt)}</span>
              </div>
            </>
          )}
        </div>

        <aside className="vp-sidebar">
          <div className="vp-sidebar-header">
            <h3>All Videos</h3>
            <span className="vp-count">{videos.length}</span>
          </div>
          <ul className="vp-list">
            {videos.map((v) => (
              <li
                key={v.id}
                className={`vp-list-item ${active?.id === v.id ? 'vp-list-item--active' : ''}`}
                onClick={() => setActive(v)}
              >
                <div className="vp-thumb">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                  </svg>
                </div>
                <div className="vp-list-meta">
                  <span className="vp-list-name">{v.originalName}</span>
                  <span className="vp-list-detail">{formatBytes(v.size)} · {formatDate(v.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
