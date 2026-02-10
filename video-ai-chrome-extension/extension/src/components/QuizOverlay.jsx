import React, { useState, useEffect } from 'react';

export default function QuizOverlay({ content, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Disable page scrolling
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const questions = content.generatedData?.questions || [];

  const handleAnswer = (questionIndex, answerIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Check if all questions answered
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting');
      return;
    }

    // Calculate score
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.answerIndex) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setShowResults(true);
  };

  const handleCloseResults = () => {
    document.body.style.overflow = '';
    onClose();
  };

  if (showResults) {
    return (
      <div style={styles.container}>
        <div style={styles.resultsModal}>
          <h2 style={styles.resultsTitle}>Quiz Results</h2>
          <div style={styles.scoreCircle}>
            <div style={styles.scoreText}>
              {score}/{questions.length}
            </div>
            <div style={styles.percentage}>
              {Math.round((score / questions.length) * 100)}%
            </div>
          </div>
          
          <div style={styles.reviewSection}>
            <h3 style={styles.reviewTitle}>Review Answers</h3>
            {questions.map((q, index) => (
              <div key={index} style={styles.reviewItem}>
                <p style={styles.reviewQuestion}>
                  {index + 1}. {q.question}
                </p>
                <p style={styles.reviewAnswer}>
                  <strong>Your answer:</strong> {q.options[answers[index]]}
                  {answers[index] === q.answerIndex ? ' ✓' : ' ✗'}
                </p>
                {answers[index] !== q.answerIndex && (
                  <p style={styles.correctAnswer}>
                    <strong>Correct answer:</strong> {q.options[q.answerIndex]}
                  </p>
                )}
                {q.explanation && (
                  <p style={styles.explanation}>{q.explanation}</p>
                )}
              </div>
            ))}
          </div>
          
          <button style={styles.closeButton} onClick={handleCloseResults}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  return (
    <div style={styles.container}>
      <div style={styles.quizModal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{content.generatedData?.title || 'Quiz'}</h2>
          <div style={styles.progress}>
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>

        <div style={styles.questionSection}>
          <p style={styles.questionText}>{question?.question}</p>
          
          <div style={styles.options}>
            {question?.options.map((option, index) => (
              <button
                key={index}
                style={{
                  ...styles.option,
                  ...(selectedAnswer === index ? styles.selectedOption : {}),
                }}
                onClick={() => handleAnswer(currentQuestion, index)}
              >
                <span style={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span style={styles.optionText}>{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.footer}>
          <button 
            style={styles.navButton} 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button 
              style={{...styles.navButton, ...styles.submitButton}} 
              onClick={handleSubmit}
            >
              Submit Quiz
            </button>
          ) : (
            <button 
              style={styles.navButton} 
              onClick={handleNext}
              disabled={selectedAnswer === undefined}
            >
              Next
            </button>
          )}
        </div>

        <p style={styles.note}>
          * You must complete the quiz before closing this window
        </p>
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2147483647,
    overflow: 'auto',
    padding: '20px',
  },
  quizModal: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    maxWidth: '700px',
    width: '100%',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  },
  resultsModal: {
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
    borderBottom: '2px solid #ecf0f1',
    paddingBottom: '20px',
    marginBottom: '30px',
  },
  title: {
    fontSize: '24px',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  progress: {
    fontSize: '14px',
    color: '#7f8c8d',
  },
  questionSection: {
    marginBottom: '30px',
  },
  questionText: {
    fontSize: '20px',
    color: '#2c3e50',
    marginBottom: '25px',
    lineHeight: '1.6',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: '#f8f9fa',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  optionLetter: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    backgroundColor: '#fff',
    border: '2px solid #dee2e6',
    borderRadius: '50%',
    marginRight: '15px',
    fontWeight: 'bold',
    color: '#495057',
  },
  optionText: {
    flex: 1,
    color: '#2c3e50',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '2px solid #ecf0f1',
    paddingTop: '20px',
  },
  navButton: {
    padding: '12px 30px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  submitButton: {
    backgroundColor: '#27ae60',
  },
  note: {
    fontSize: '12px',
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: '15px',
    fontStyle: 'italic',
  },
  resultsTitle: {
    fontSize: '28px',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '30px',
  },
  scoreCircle: {
    width: '150px',
    height: '150px',
    margin: '0 auto 40px',
    backgroundColor: '#3498db',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  scoreText: {
    fontSize: '36px',
    fontWeight: 'bold',
  },
  percentage: {
    fontSize: '18px',
  },
  reviewSection: {
    marginBottom: '30px',
  },
  reviewTitle: {
    fontSize: '20px',
    color: '#2c3e50',
    marginBottom: '20px',
  },
  reviewItem: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  reviewQuestion: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  reviewAnswer: {
    fontSize: '14px',
    color: '#495057',
    marginBottom: '5px',
  },
  correctAnswer: {
    fontSize: '14px',
    color: '#27ae60',
    marginBottom: '5px',
  },
  explanation: {
    fontSize: '14px',
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginTop: '10px',
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
