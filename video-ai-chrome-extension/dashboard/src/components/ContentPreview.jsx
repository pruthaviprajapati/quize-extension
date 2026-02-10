import React, { useState, useEffect } from 'react';
import { validateAnswers } from '../services/api';
import './ContentPreview.css';

export default function ContentPreview({ content, onClose }) {
  const isQuiz = content.contentType === 'quiz';
  const data = content.generatedData;
  const storageKey = `quiz_progress_${content.contentId}`;

  // State for user answers (initialized from local storage if available)
  const [userAnswers, setUserAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved).userAnswers : {};
    } catch (e) {
      return {};
    }
  });

  const [validationResults, setValidationResults] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved).validationResults : null;
    } catch (e) {
      return null;
    }
  });

  const [showResults, setShowResults] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved).showResults : false;
    } catch (e) {
      return false;
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Persist progress to local storage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({
      userAnswers,
      validationResults,
      showResults
    }));
  }, [userAnswers, validationResults, showResults, storageKey]);

  // Handle quiz option selection
  const handleQuizAnswer = (questionIndex, optionIndex) => {
    if (showResults) return; // Don't allow changes after submission
    
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: optionIndex,
    });
  };

  // Handle Q&A text input
  const handleQAAnswer = (questionIndex, value) => {
    if (showResults) return;
    
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: value,
    });
  };

  // Submit answers for validation
  const handleSubmit = async () => {
    const questionCount = isQuiz ? data.questions?.length : data.qa?.length;
    
    // Check if all questions are answered
    if (Object.keys(userAnswers).length < questionCount) {
      alert('Please answer all questions before submitting!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const results = await validateAnswers(content.contentId, userAnswers);
      setValidationResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Validation error:', error);
      alert('Failed to validate answers. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to try again
  const handleReset = () => {
    setUserAnswers({});
    setValidationResults(null);
    setShowResults(false);
    localStorage.removeItem(storageKey);
  };

  return (
    <div className="preview">
      <div className="preview-header">
        <button className="back-btn" onClick={onClose}>
          ← Back to List
        </button>
        <div className="preview-meta">
          <span className={`preview-badge ${content.contentType}`}>
            {content.contentType === 'quiz' ? '📝 QUIZ' : '💬 Q&A'}
          </span>
          <span className="preview-date">
            {new Date(content.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="preview-card">
        <h1 className="preview-title">{data.title}</h1>
        <div className="preview-info">
          <p><strong>Page:</strong> {content.pageTitle}</p>
          <p><strong>Domain:</strong> {content.domain}</p>
        </div>

        {/* Score display for quiz */}
        {showResults && isQuiz && validationResults && (
          <div className="score-banner">
            <div className="score-text">
              Your Score: {validationResults.score} / {validationResults.total}
            </div>
            <div className="score-percentage">
              {Math.round((validationResults.score / validationResults.total) * 100)}%
            </div>
          </div>
        )}

        <div className="preview-content">
          {isQuiz && (
            <div className="quiz-preview">
              {data.questions?.map((q, index) => {
                const result = showResults ? validationResults?.results[index] : null;
                
                return (
                  <div key={index} className="quiz-item">
                    <div className="question-number">Question {index + 1}</div>
                    <h3 className="question-text">{q.question}</h3>
                    
                    <div className="options-grid">
                      {q.options?.map((opt, i) => {
                        const isSelected = userAnswers[index] === i;
                        const isCorrect = showResults && result?.correctAnswer === i;
                        const isUserWrong = showResults && isSelected && !result?.isCorrect;
                        
                        return (
                          <div
                            key={i}
                            className={`option ${isSelected ? 'selected' : ''} ${
                              showResults ? (isCorrect ? 'correct' : isUserWrong ? 'wrong' : '') : ''
                            } ${!showResults ? 'clickable' : ''}`}
                            onClick={() => handleQuizAnswer(index, i)}
                          >
                            <span className="option-letter">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="option-text">{opt}</span>
                            {showResults && isCorrect && <span className="check">✓</span>}
                            {showResults && isUserWrong && <span className="cross">✗</span>}
                          </div>
                        );
                      })}
                    </div>

                    {showResults && result?.explanation && (
                      <div className="explanation">
                        <strong>Explanation:</strong> {result.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!isQuiz && (
            <div className="qa-preview">
              {data.qa?.map((item, index) => {
                const result = showResults ? validationResults?.results[index] : null;
                
                return (
                  <div key={index} className="qa-item">
                    <div className="qa-question">
                      <span className="qa-label">Q{index + 1}</span>
                      <p>{item.question}</p>
                    </div>
                    <div className="qa-answer-input">
                      <span className="qa-label">A</span>
                      <textarea
                        className="answer-textarea"
                        placeholder="Type your answer here..."
                        value={userAnswers[index] || ''}
                        onChange={(e) => handleQAAnswer(index, e.target.value)}
                        disabled={showResults}
                        rows={3}
                      />
                    </div>
                    {showResults && result?.correctAnswer && (
                      <div className="qa-correct-answer">
                        <strong>Correct Answer:</strong>
                        <p>{result.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="preview-actions">
          {!showResults ? (
            <button 
              className="submit-btn" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Checking...' : 'Submit Answers'}
            </button>
          ) : (
            <button className="reset-btn" onClick={handleReset}>
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
