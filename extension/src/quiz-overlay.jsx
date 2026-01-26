import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './quiz-overlay.css';

const QuizOverlay = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Listen for quiz data from content script
    const handleMessage = (event) => {
      if (event.data.type === 'INIT_QUIZ') {
        console.log('Quiz data received:', event.data.data);
        setQuizData(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    if (showResults) return;
    
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
  };

  const handleClose = () => {
    window.postMessage({ type: 'QUIZ_COMPLETED' }, '*');
  };

  if (!quizData) {
    return (
      <div className="quiz-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];
  const allAnswered = quizData.questions.every((_, idx) => selectedAnswers[idx] !== undefined);
  const percentage = quizData.questions.length > 0 ? (score / quizData.questions.length) * 100 : 0;

  if (showResults) {
    return (
      <div className="quiz-container">
        <div className="quiz-card results-card">
          <div className="results-header">
            <h1>🎉 Quiz Completed!</h1>
          </div>
          
          <div className="score-display">
            <div className="score-circle" style={{
              background: percentage >= 70 ? '#4caf50' : percentage >= 50 ? '#ff9800' : '#f44336'
            }}>
              <div className="score-text">
                <span className="score-number">{score}</span>
                <span className="score-total">/{quizData.questions.length}</span>
              </div>
              <div className="score-percentage">{percentage.toFixed(0)}%</div>
            </div>
          </div>

          <div className="results-summary">
            <h3>Answer Review</h3>
            {quizData.questions.map((q, idx) => {
              const isCorrect = selectedAnswers[idx] === q.correctAnswer;
              return (
                <div key={idx} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="review-header">
                    <span className="review-number">Q{idx + 1}</span>
                    <span className={`review-badge ${isCorrect ? 'badge-correct' : 'badge-incorrect'}`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <p className="review-question">{q.question}</p>
                  {!isCorrect && (
                    <div className="review-answers">
                      <p className="your-answer">Your answer: {q.options[selectedAnswers[idx]]}</p>
                      <p className="correct-answer">Correct answer: {q.options[q.correctAnswer]}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button className="btn btn-primary" onClick={handleClose}>
            Close Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <div className="quiz-header">
          <h1>📚 Educational Quiz</h1>
          <p className="video-title">{quizData.videoTitle || 'YouTube Video Quiz'}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
            />
          </div>
          <p className="progress-text">
            Question {currentQuestion + 1} of {quizData.questions.length}
          </p>
        </div>

        <div className="quiz-content">
          <h2 className="question-text">{question.question}</h2>
          
          <div className="options-container">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                className={`option-button ${selectedAnswers[currentQuestion] === idx ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(currentQuestion, idx)}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-footer">
          <div className="navigation-buttons">
            <button 
              className="btn btn-secondary" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              ← Previous
            </button>
            
            {currentQuestion === quizData.questions.length - 1 ? (
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={!allAnswered}
              >
                Submit Quiz
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={handleNext}
              >
                Next →
              </button>
            )}
          </div>
          
          {!allAnswered && (
            <p className="warning-text">Please answer all questions before submitting</p>
          )}

          <div className="answer-indicators">
            {quizData.questions.map((_, idx) => (
              <div
                key={idx}
                className={`indicator ${selectedAnswers[idx] !== undefined ? 'answered' : ''} ${idx === currentQuestion ? 'current' : ''}`}
                onClick={() => setCurrentQuestion(idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mount React component
const root = document.getElementById('yt-quiz-root');
if (root) {
  ReactDOM.createRoot(root).render(<QuizOverlay />);
}
