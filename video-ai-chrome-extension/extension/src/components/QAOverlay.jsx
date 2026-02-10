import React from 'react';

export default function QAOverlay({ content, onClose }) {
  const qaData = content.generatedData?.qa || [];

  return (
    <div style={styles.container}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{content.generatedData?.title || 'Q&A'}</h2>
          <button style={styles.closeIcon} onClick={onClose}>✕</button>
        </div>

        <div style={styles.qaList}>
          {qaData.map((item, index) => (
            <div key={index} style={styles.qaItem}>
              <div style={styles.questionRow}>
                <span style={styles.qLabel}>Q{index + 1}</span>
                <p style={styles.question}>{item.question}</p>
              </div>
              <div style={styles.answerRow}>
                <span style={styles.aLabel}>A</span>
                <p style={styles.answer}>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <button style={styles.closeButton} onClick={onClose}>
          Close
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
    overflow: 'auto',
    padding: '20px',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #ecf0f1',
    paddingBottom: '20px',
    marginBottom: '30px',
  },
  title: {
    fontSize: '24px',
    color: '#2c3e50',
    margin: 0,
  },
  closeIcon: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#95a5a6',
    cursor: 'pointer',
    padding: '5px',
  },
  qaList: {
    marginBottom: '30px',
  },
  qaItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
  },
  questionRow: {
    display: 'flex',
    marginBottom: '15px',
  },
  answerRow: {
    display: 'flex',
  },
  qLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
    height: '40px',
    backgroundColor: '#3498db',
    color: '#fff',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '16px',
    marginRight: '15px',
  },
  aLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
    height: '40px',
    backgroundColor: '#27ae60',
    color: '#fff',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '16px',
    marginRight: '15px',
  },
  question: {
    flex: 1,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: 0,
    lineHeight: '1.6',
  },
  answer: {
    flex: 1,
    fontSize: '16px',
    color: '#495057',
    margin: 0,
    lineHeight: '1.6',
  },
  closeButton: {
    display: 'block',
    margin: '0 auto',
    padding: '12px 40px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
};
