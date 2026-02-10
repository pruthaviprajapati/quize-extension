import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { generateContent } from '../utils/api.js';
import QuizOverlay from '../components/QuizOverlay.jsx';
import QAOverlay from '../components/QAOverlay.jsx';
import ChoiceOverlay from '../components/ChoiceOverlay.jsx';

function OverlayApp() {
  const [videoData, setVideoData] = useState(null);
  const [mode, setMode] = useState(null); // null, 'choice', 'quiz', 'qa'
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listen for video data from content script
    const handleMessage = (event) => {
      if (event.data.type === 'VIDEO_AI_INIT') {
        setVideoData(event.data.videoData);
        setMode('choice');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleChoice = async (contentType) => {
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        ...videoData,
        contentType,
      };
      
      const result = await generateContent(payload);
      setContent(result);
      setMode(contentType);
    } catch (err) {
      setError(err.message);
      setMode('choice');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Remove overlay from DOM
    const overlayRoot = document.getElementById('video-ai-overlay-root');
    if (overlayRoot) {
      overlayRoot.remove();
    }
  };

  if (!videoData || !mode) {
    return null;
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Generating content with AI...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h3 style={styles.errorTitle}>Error</h3>
        <p style={styles.errorText}>{error}</p>
        <button style={styles.button} onClick={() => setMode('choice')}>
          Try Again
        </button>
        <button style={{...styles.button, ...styles.secondaryButton}} onClick={handleClose}>
          Close
        </button>
      </div>
    );
  }

  if (mode === 'choice') {
    return <ChoiceOverlay onChoice={handleChoice} onClose={handleClose} />;
  }

  if (mode === 'quiz' && content) {
    return <QuizOverlay content={content} onClose={handleClose} />;
  }

  if (mode === 'qa' && content) {
    return <QAOverlay content={content} onClose={handleClose} />;
  }

  return null;
}

const styles = {
  loadingContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2147483647,
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(255, 255, 255, 0.3)',
    borderTop: '5px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#fff',
    marginTop: '20px',
    fontSize: '18px',
  },
  errorContainer: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    zIndex: 2147483647,
    maxWidth: '400px',
    textAlign: 'center',
  },
  errorTitle: {
    color: '#e74c3c',
    marginBottom: '15px',
  },
  errorText: {
    marginBottom: '20px',
    color: '#333',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '5px',
  },
  secondaryButton: {
    backgroundColor: '#95a5a6',
  },
};

// Find the shadow root mount point and render
const mountPoint = document.getElementById('overlay-mount');
if (mountPoint) {
  const root = ReactDOM.createRoot(mountPoint);
  root.render(<OverlayApp />);
}

// Add keyframe animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
