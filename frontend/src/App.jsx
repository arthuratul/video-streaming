import { useState } from 'react';
import UploadPage from './pages/UploadPage';
import VideosPage from './pages/VideosPage';
import './App.css';

const TABS = [
  {
    id: 'upload',
    label: 'Upload',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'videos',
    label: 'Videos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
      </svg>
    ),
  },
];

export default function App() {
  const [tab, setTab] = useState('upload');

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
          <span>VideoStream</span>
        </div>
        <nav className="app-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`app-nav__tab ${tab === t.id ? 'app-nav__tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {tab === 'upload' && <UploadPage />}
        {tab === 'videos' && <VideosPage />}
      </main>
    </div>
  );
}
