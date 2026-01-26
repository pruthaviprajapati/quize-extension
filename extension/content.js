// Content Script - Detects video end and triggers quiz
const BACKEND_URL = 'http://localhost:5000';

let quizActive = false;
let videoCheckInterval = null;

// Function to get current video ID
function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

// Function to inject the quiz overlay
function injectQuizOverlay(quizData) {
  if (quizActive) return;
  quizActive = true;

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'yt-quiz-overlay';
  overlay.innerHTML = `
    <div id="yt-quiz-root"></div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    #yt-quiz-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      z-index: 999999;
      overflow-y: auto;
      overflow-x: hidden;
    }
    
    body.quiz-active {
      overflow: hidden !important;
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(overlay);
  document.body.classList.add('quiz-active');

  // Render the quiz directly
  renderQuiz(quizData);
}

// Function to render the quiz
function renderQuiz(quizData) {
  const root = document.getElementById('yt-quiz-root');
  if (!root) return;

  let currentQuestion = 0;
  let score = 0;
  const userAnswers = [];

  function renderQuestion() {
    const question = quizData.questions[currentQuestion];
    
    root.innerHTML = `
      <div style="max-width: 800px; margin: 50px auto; padding: 40px; background: white; border-radius: 15px; box-shadow: 0 10px 50px rgba(0,0,0,0.3);">
        <h1 style="color: #1a1a1a; margin-bottom: 10px; font-size: 28px;">Educational Quiz</h1>
        <p style="color: #666; margin-bottom: 30px;">Video: ${quizData.videoTitle || 'YouTube Video'}</p>
        
        <div style="margin-bottom: 20px; color: #666;">
          Question ${currentQuestion + 1} of ${quizData.questions.length}
        </div>
        
        <h2 style="color: #333; margin-bottom: 30px; font-size: 22px; line-height: 1.5;">${question.question}</h2>
        
        <div id="options-container">
          ${question.options.map((option, index) => `
            <button class="quiz-option" data-index="${index}" style="
              display: block;
              width: 100%;
              padding: 15px 20px;
              margin: 10px 0;
              background: #f5f5f5;
              border: 2px solid #ddd;
              border-radius: 8px;
              text-align: left;
              cursor: pointer;
              font-size: 16px;
              transition: all 0.3s;
            ">
              ${String.fromCharCode(65 + index)}. ${option}
            </button>
          `).join('')}
        </div>
        
        <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: center;">
          <div style="color: #666;">Score: ${score}/${currentQuestion}</div>
          <div id="quiz-message" style="color: #ff6b6b; font-weight: bold;"></div>
        </div>
      </div>
    `;

    // Add click handlers
    document.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', handleAnswer);
      btn.addEventListener('mouseenter', function() {
        this.style.background = '#e8e8e8';
        this.style.borderColor = '#007bff';
      });
      btn.addEventListener('mouseleave', function() {
        this.style.background = '#f5f5f5';
        this.style.borderColor = '#ddd';
      });
    });
  }

  function handleAnswer(e) {
    const selectedIndex = parseInt(e.target.dataset.index);
    const question = quizData.questions[currentQuestion];
    const isCorrect = selectedIndex === question.correctAnswer;

    if (isCorrect) {
      score++;
      e.target.style.background = '#4caf50';
      e.target.style.borderColor = '#4caf50';
      e.target.style.color = 'white';
    } else {
      e.target.style.background = '#ff6b6b';
      e.target.style.borderColor = '#ff6b6b';
      e.target.style.color = 'white';
      
      // Highlight correct answer
      const correctBtn = document.querySelector(`[data-index="${question.correctAnswer}"]`);
      correctBtn.style.background = '#4caf50';
      correctBtn.style.borderColor = '#4caf50';
      correctBtn.style.color = 'white';
    }

    userAnswers.push({ question: currentQuestion, selected: selectedIndex, correct: isCorrect });

    // Disable all buttons
    document.querySelectorAll('.quiz-option').forEach(btn => {
      btn.disabled = true;
      btn.style.cursor = 'not-allowed';
    });

    // Next question after delay
    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion < quizData.questions.length) {
        renderQuestion();
      } else {
        showResults();
      }
    }, 1500);
  }

  function showResults() {
    const percentage = Math.round((score / quizData.questions.length) * 100);
    const passed = percentage >= 60;

    root.innerHTML = `
      <div style="max-width: 800px; margin: 50px auto; padding: 40px; background: white; border-radius: 15px; box-shadow: 0 10px 50px rgba(0,0,0,0.3); text-align: center;">
        <h1 style="color: ${passed ? '#4caf50' : '#ff6b6b'}; margin-bottom: 20px; font-size: 32px;">
          ${passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}
        </h1>
        
        <p style="font-size: 24px; color: #333; margin: 20px 0;">
          Your Score: <strong>${score}/${quizData.questions.length}</strong> (${percentage}%)
        </p>
        
        <p style="color: #666; margin: 20px 0; font-size: 16px;">
          ${passed 
            ? 'Great job! You understood the content well.' 
            : 'Consider rewatching the video to better understand the concepts.'}
        </p>
        
        <button id="close-quiz" style="
          margin-top: 30px;
          padding: 15px 40px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          cursor: pointer;
          transition: background 0.3s;
        ">
          Close Quiz
        </button>
      </div>
    `;

    document.getElementById('close-quiz').addEventListener('click', closeQuiz);
    document.getElementById('close-quiz').addEventListener('mouseenter', function() {
      this.style.background = '#0056b3';
    });
    document.getElementById('close-quiz').addEventListener('mouseleave', function() {
      this.style.background = '#007bff';
    });
  }

  function closeQuiz() {
    const overlay = document.getElementById('yt-quiz-overlay');
    if (overlay) overlay.remove();
    document.body.classList.remove('quiz-active');
    quizActive = false;
  }

  // Start the quiz
  renderQuestion();
}

// Function to check if video has ended
function setupVideoEndListener() {
  const video = document.querySelector('video');
  
  if (!video) {
    console.log('Video element not found, retrying...');
    return;
  }

  console.log('YouTube Quiz Extension: Video element found');

  // Remove existing listener if any
  video.removeEventListener('ended', handleVideoEnd);
  
  // Add new listener
  video.addEventListener('ended', handleVideoEnd);
}

// Handle video end event
async function handleVideoEnd() {
  console.log('Video ended, checking if educational...');
  
  const videoId = getVideoId();
  if (!videoId) {
    console.error('No video ID found');
    return;
  }

  try {
    // Call backend to check if video is educational and get quiz
    const response = await fetch(`${BACKEND_URL}/api/quiz/check/${videoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.isEducational && data.questions && data.questions.length > 0) {
      console.log('Educational video detected, showing quiz...');
      injectQuizOverlay(data);
    } else {
      console.log('Video is not educational or no quiz available');
    }
  } catch (error) {
    console.error('Error fetching quiz:', error);
  }
}

// Listen for quiz completion
window.addEventListener('message', (event) => {
  if (event.data.type === 'QUIZ_COMPLETED') {
    // Remove overlay
    const overlay = document.getElementById('yt-quiz-overlay');
    if (overlay) {
      overlay.remove();
    }
    document.body.classList.remove('quiz-active');
    quizActive = false;
  }
});

// Initialize when page loads
function init() {
  console.log('YouTube Quiz Extension: Initializing...');
  
  // Setup video listener immediately
  setupVideoEndListener();
  
  // Also check periodically in case video element loads later
  videoCheckInterval = setInterval(() => {
    if (!document.querySelector('video')?.hasAttribute('data-quiz-listener')) {
      const video = document.querySelector('video');
      if (video) {
        video.setAttribute('data-quiz-listener', 'true');
        setupVideoEndListener();
      }
    }
  }, 2000);
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Handle YouTube SPA navigation
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    quizActive = false;
    setTimeout(setupVideoEndListener, 1000);
  }
}).observe(document, { subtree: true, childList: true });
