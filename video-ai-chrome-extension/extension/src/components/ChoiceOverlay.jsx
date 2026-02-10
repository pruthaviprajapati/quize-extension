import React from 'react';

export default function ChoiceOverlay({ onChoice, onClose }) {
  return (
    <div style={styles.container}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Video Completed!</h2>
        <p style={styles.subtitle}>What would you like to generate?</p>
        
        <div style={styles.buttonGroup}>
          <button 
            style={{...styles.button, ...styles.quizButton}} 
            onClick={() => onChoice('quiz')}
          >
            <span style={styles.icon}>📝</span>
            <span style={styles.buttonText}>Quiz (MCQs)</span>
            <span style={styles.description}>Test your knowledge with multiple choice questions</span>
          </button>
          
          <button 
            style={{...styles.button, ...styles.qaButton}} 
            onClick={() => onChoice('qa')}
          >
            <span style={styles.icon}>💬</span>
            <span style={styles.buttonText}>Q&A</span>
            <span style={styles.description}>Get question-answer pairs for review</span>
          </button>
        </div>
        
        <button style={styles.closeButton} onClick={onClose}>
          Skip
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2147483647,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    marginBottom: '10px',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: '16px',
    color: '#7f8c8d',
    marginBottom: '30px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px',
  },
  button: {
    padding: '20px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  quizButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  qaButton: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  icon: {
    fontSize: '40px',
  },
  buttonText: {
    fontSize: '20px',
  },
  description: {
    fontSize: '14px',
    fontWeight: 'normal',
    opacity: 0.9,
  },
  closeButton: {
    padding: '10px 30px',
    backgroundColor: '#ecf0f1',
    color: '#7f8c8d',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
