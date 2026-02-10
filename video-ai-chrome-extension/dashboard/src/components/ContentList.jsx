import React from 'react';
import './ContentList.css';

export default function ContentList({
  filter,
  onFilterChange,
  history,
  loading,
  error,
  onRetry,
  onViewContent,
}) {
  return (
    <div className="content-list">
      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          All Content
        </button>
        <button
          className={`filter-btn ${filter === 'quiz' ? 'active' : ''}`}
          onClick={() => onFilterChange('quiz')}
        >
          📝 Quizzes
        </button>
        <button
          className={`filter-btn ${filter === 'qa' ? 'active' : ''}`}
          onClick={() => onFilterChange('qa')}
        >
          💬 Q&A
        </button>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading content...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <h3>Error Loading Content</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <h3>No Content Found</h3>
          <p>Watch videos and generate content using the extension!</p>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="grid">
          {history.map((item) => (
            <div key={item.contentId} className="card">
              <div className="card-header">
                <span className={`badge ${item.contentType}`}>
                  {item.contentType === 'quiz' ? '📝 QUIZ' : '💬 Q&A'}
                </span>
                <span className="date">
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h3 className="card-title">{item.pageTitle}</h3>
              <p className="card-domain">{item.domain}</p>
              <button
                className="view-btn"
                onClick={() => onViewContent(item.contentId)}
              >
                View Content →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
