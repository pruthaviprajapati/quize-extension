import React, { useState, useEffect } from 'react';
import { getHistory, getContentById } from './api.js';

export default function PopupApp() {
  const [filter, setFilter] = useState('all');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [stats, setStats] = useState({ total: 0, quiz: 0, qa: 0 });

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[Popup] Loading history, filter:', filter);
      const data = await getHistory(filter);
      console.log('[Popup] History loaded:', data);
      setHistory(data);
      
      // Calculate stats
      if (filter === 'all') {
        const quizCount = data.filter(item => item.contentType === 'quiz').length;
        const qaCount = data.filter(item => item.contentType === 'qa').length;
        setStats({ total: data.length, quiz: quizCount, qa: qaCount });
      }
    } catch (err) {
      console.error('[Popup] Load history error:', err);
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewContent = async (contentId) => {
    try {
      const content = await getContentById(contentId);
      setSelectedContent(content);
    } catch (err) {
      alert('Failed to load content: ' + err.message);
    }
  };

  const handleClosePreview = () => {
    setSelectedContent(null);
  };

  const openDashboard = () => {
    // Send message to background script to open/focus dashboard
    chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' }, (response) => {
      if (response && response.reused) {
        console.log('Switched to existing dashboard tab');
      } else {
        console.log('Opened new dashboard tab');
      }
    });
  };

  if (selectedContent) {
    return <ContentPreview content={selectedContent} onClose={handleClosePreview} />;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <div style={styles.logo}>🎓</div>
            <div>
              <h1 style={styles.title}>Video AI</h1>
              <p style={styles.subtitle}>Smart Learning Assistant</p>
            </div>
          </div>
          {filter === 'all' && !loading && (
            <div style={styles.statsContainer}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{stats.total}</span>
                <span style={styles.statLabel}>Total</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <div style={styles.filters}>
        <button 
          style={{...styles.filterButton, ...(filter === 'all' ? styles.activeFilter : {})}}
          onClick={() => setFilter('all')}
        >
          <span style={styles.filterIcon}>📚</span>
          <span>All</span>
          {filter === 'all' && <span style={styles.filterDot}></span>}
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'quiz' ? styles.activeFilter : {})}}
          onClick={() => setFilter('quiz')}
        >
          <span style={styles.filterIcon}>📝</span>
          <span>Quiz</span>
          {filter === 'quiz' && <span style={styles.filterDot}></span>}
        </button>
        <button 
          style={{...styles.filterButton, ...(filter === 'qa' ? styles.activeFilter : {})}}
          onClick={() => setFilter('qa')}
        >
          <span style={styles.filterIcon}>💬</span>
          <span>Q&A</span>
          {filter === 'qa' && <span style={styles.filterDot}></span>}
        </button>
      </div>

      {loading && <LoadingSkeleton />}

      {error && (
        <div style={styles.error}>
          <div style={styles.errorIcon}>⚠️</div>
          <p style={styles.errorText}>{error}</p>
          <button style={styles.retryButton} onClick={loadHistory}>
            🔄 Retry
          </button>
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🎬</div>
          <h3 style={styles.emptyTitle}>No Content Yet</h3>
          <p style={styles.emptyHint}>
            Watch a video and click the extension icon when it ends to generate quizzes or Q&A!
          </p>
          <div style={styles.emptySteps}>
            <div style={styles.step}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepText}>Watch a video</div>
            </div>
            <div style={styles.stepDivider}>→</div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepText}>Video ends</div>
            </div>
            <div style={styles.stepDivider}>→</div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepText}>Generate content</div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div style={styles.list}>
          {history.map((item, index) => (
            <div 
              key={item.contentId} 
              style={{
                ...styles.item,
                animationDelay: `${index * 0.05}s`
              }}
            >
              <div style={styles.itemHeader}>
                <span style={{
                  ...styles.badge,
                  ...(item.contentType === 'quiz' ? styles.quizBadge : styles.qaBadge)
                }}>
                  {item.contentType === 'quiz' ? '📝 QUIZ' : '💬 Q&A'}
                </span>
                <span style={styles.date}>
                  {formatDate(item.createdAt)}
                </span>
              </div>
              <h3 style={styles.itemTitle}>{item.pageTitle}</h3>
              <div style={styles.itemMeta}>
                <span style={styles.itemDomain}>🌐 {item.domain}</span>
              </div>
              <button 
                style={styles.viewButton}
                onClick={() => handleViewContent(item.contentId)}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <span>View Content</span>
                <span style={styles.viewButtonIcon}>→</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <footer style={styles.footer}>
        <button 
          style={styles.dashboardButton} 
          onClick={openDashboard}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <span style={styles.dashboardIcon}>📊</span>
          <span>Open Full Dashboard</span>
        </button>
      </footer>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={styles.loadingContainer}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={styles.skeletonItem}>
          <div style={{...styles.skeleton, width: '60px', height: '20px', marginBottom: '10px'}}></div>
          <div style={{...styles.skeleton, width: '100%', height: '16px', marginBottom: '8px'}}></div>
          <div style={{...styles.skeleton, width: '80%', height: '14px', marginBottom: '10px'}}></div>
          <div style={{...styles.skeleton, width: '100%', height: '36px'}}></div>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ContentPreview({ content, onClose }) {
  const isQuiz = content.contentType === 'quiz';
  const data = content.generatedData;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button style={styles.backButton} onClick={onClose}>← Back</button>
        <h2 style={styles.previewTitle}>{data.title}</h2>
      </header>

      <div style={styles.previewContent}>
        {isQuiz && (
          <div>
            {data.questions?.map((q, index) => (
              <div key={index} style={styles.quizQuestion}>
                <p style={styles.questionText}>
                  <strong>{index + 1}. {q.question}</strong>
                </p>
                {q.options?.map((opt, i) => (
                  <p 
                    key={i} 
                    style={{
                      ...styles.option,
                      ...(i === q.answerIndex ? styles.correctOption : {})
                    }}
                  >
                    {String.fromCharCode(65 + i)}. {opt}
                    {i === q.answerIndex && ' ✓'}
                  </p>
                ))}
                {q.explanation && (
                  <p style={styles.explanation}>
                    <em>{q.explanation}</em>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!isQuiz && (
          <div>
            {data.qa?.map((item, index) => (
              <div key={index} style={styles.qaItem}>
                <p style={styles.qaQuestion}>
                  <strong>Q{index + 1}: {item.question}</strong>
                </p>
                <p style={styles.qaAnswer}>
                  A: {item.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    backgroundColor: '#f5f7fa',
  },
  header: {
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    fontSize: '32px',
    animation: 'pulse 2s ease-in-out infinite',
  },
  title: {
    fontSize: '22px',
    margin: '0 0 2px 0',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '12px',
    margin: 0,
    opacity: 0.95,
    fontWeight: '400',
  },
  statsContainer: {
    display: 'flex',
    gap: '12px',
  },
  statItem: {
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '8px 12px',
    borderRadius: '8px',
    backdropFilter: 'blur(10px)',
  },
  statNumber: {
    display: 'block',
    fontSize: '18px',
    fontWeight: 'bold',
    lineHeight: '1',
  },
  statLabel: {
    display: 'block',
    fontSize: '10px',
    marginTop: '4px',
    opacity: 0.9,
  },
  filters: {
    display: 'flex',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e1e8ed',
  },
  filterButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 12px',
    backgroundColor: '#f5f7fa',
    border: '2px solid transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    position: 'relative',
    color: '#5f6368',
  },
  filterIcon: {
    fontSize: '16px',
  },
  filterDot: {
    position: 'absolute',
    bottom: '-2px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#667eea',
  },
  activeFilter: {
    backgroundColor: '#fff',
    color: '#667eea',
    border: '2px solid #667eea',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
  },
  loadingContainer: {
    padding: '16px',
  },
  skeletonItem: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
  },
  skeleton: {
    backgroundColor: '#e1e8ed',
    borderRadius: '4px',
    animation: 'shimmer 1.5s infinite',
  },
  error: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#e74c3c',
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  errorText: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: '#555',
  },
  retryButton: {
    padding: '10px 24px',
    backgroundColor: '#667eea',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
  },
  empty: {
    padding: '40px 20px',
    textAlign: 'center',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
    animation: 'float 3s ease-in-out infinite',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2c3e50',
    margin: '0 0 8px 0',
  },
  emptyHint: {
    fontSize: '13px',
    color: '#7f8c8d',
    margin: '0 0 24px 0',
    maxWidth: '320px',
    lineHeight: '1.5',
  },
  emptySteps: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '20px',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#667eea',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: '11px',
    color: '#7f8c8d',
    textAlign: 'center',
    maxWidth: '80px',
  },
  stepDivider: {
    fontSize: '16px',
    color: '#cbd5e0',
    marginBottom: '24px',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.2s ease',
    animation: 'slideIn 0.3s ease-out',
    border: '1px solid #e1e8ed',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  badge: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '0.5px',
  },
  quizBadge: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  qaBadge: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  date: {
    fontSize: '11px',
    color: '#9ca3af',
    fontWeight: '500',
  },
  itemTitle: {
    fontSize: '15px',
    margin: '0 0 8px 0',
    color: '#1e293b',
    fontWeight: '600',
    lineHeight: '1.4',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  itemMeta: {
    marginBottom: '12px',
  },
  itemDomain: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
  },
  viewButton: {
    width: '100%',
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
  },
  viewButtonIcon: {
    fontSize: '14px',
    transition: 'transform 0.2s ease',
  },
  footer: {
    padding: '16px',
    borderTop: '1px solid #e1e8ed',
    backgroundColor: '#fff',
  },
  dashboardButton: {
    width: '100%',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)',
  },
  dashboardIcon: {
    fontSize: '18px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '12px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
  },
  previewTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
  },
  previewContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
  },
  quizQuestion: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e1e8ed',
  },
  questionText: {
    marginBottom: '12px',
    color: '#1e293b',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  option: {
    margin: '6px 0',
    paddingLeft: '12px',
    fontSize: '13px',
    color: '#475569',
    lineHeight: '1.5',
  },
  correctOption: {
    color: '#10b981',
    fontWeight: '600',
    backgroundColor: '#d1fae5',
    padding: '4px 8px',
    borderRadius: '4px',
    marginLeft: '-8px',
  },
  explanation: {
    marginTop: '12px',
    fontSize: '12px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: '10px',
    borderRadius: '6px',
    borderLeft: '3px solid #667eea',
  },
  qaItem: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e1e8ed',
  },
  qaQuestion: {
    marginBottom: '10px',
    color: '#1e293b',
    fontSize: '14px',
    fontWeight: '600',
    lineHeight: '1.5',
  },
  qaAnswer: {
    margin: 0,
    color: '#475569',
    fontSize: '13px',
    lineHeight: '1.6',
  },
};
