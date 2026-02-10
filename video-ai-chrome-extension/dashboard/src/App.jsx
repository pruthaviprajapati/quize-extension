import React, { useState, useEffect } from 'react';
import { getHistory, getContentById } from './services/api.js';
import ContentList from './components/ContentList.jsx';
import ContentPreview from './components/ContentPreview.jsx';
import './App.css';

export default function App() {
  const [filter, setFilter] = useState('all');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [filter]);

  // Handle URL query parameters and browser history
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get('contentId');
    if (contentId) {
      loadContent(contentId);
    }

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const contentId = params.get('contentId');
      if (contentId) {
        loadContent(contentId);
      } else {
        setSelectedContent(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(filter);
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async (contentId) => {
    try {
      const content = await getContentById(contentId);
      setSelectedContent(content);
    } catch (err) {
      console.error('Failed to load content:', err);
      // If content not found, clear URL to return to list
      const url = new URL(window.location);
      url.searchParams.delete('contentId');
      window.history.replaceState({}, '', url);
      setSelectedContent(null);
    }
  };

  const handleViewContent = (contentId) => {
    const url = new URL(window.location);
    url.searchParams.set('contentId', contentId);
    window.history.pushState({}, '', url);
    loadContent(contentId);
  };

  const handleClosePreview = () => {
    setSelectedContent(null);
    const url = new URL(window.location);
    url.searchParams.delete('contentId');
    window.history.pushState({}, '', url);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">📺 Video AI Dashboard</h1>
          <p className="app-subtitle">Manage your generated content</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {selectedContent ? (
            <ContentPreview content={selectedContent} onClose={handleClosePreview} />
          ) : (
            <ContentList
              filter={filter}
              onFilterChange={setFilter}
              history={history}
              loading={loading}
              error={error}
              onRetry={loadHistory}
              onViewContent={handleViewContent}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2026 Video AI Extension. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
}
