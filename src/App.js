// App.js
import React, { useState } from 'react';
import './App.css';

// Sample lesson data
const lessons = [
  {
    id: 1,
    title: "Nouns and Pronouns",
    questions: [
      {
        id: 1,
        text: "Which word is a noun in this sentence: 'The cat jumped over the fence.'?",
        options: ["The", "cat", "jumped", "over"],
        correctAnswer: 1,
        image: "https://example.com/cat.jpg"
      },
      {
        id: 2,
        text: "What is the pronoun in this sentence: 'She went to the store.'?",
        options: ["went", "to", "She", "store"],
        correctAnswer: 2,
        image: "https://picsum.photos/seed/picsum/200/300"
      },
      {
        id: 3,
        text: "Which of these is a proper noun?",
        options: ["city", "teacher", "London", "book"],
        correctAnswer: 2,
        image: "https://picsum.photos/seed/picsum/200/300"
      }
    ]
  },
  {
    id: 2,
    title: "Verbs and Tenses",
    questions: [
      {
        id: 1,
        text: "What is the verb in this sentence: 'The children play in the park.'?",
        options: ["The", "children", "play", "park"],
        correctAnswer: 2,
        image: "https://picsum.photos/seed/picsum/200/300"
      },
      {
        id: 2,
        text: "Which verb is in the past tense?",
        options: ["walk", "walks", "walked", "walking"],
        correctAnswer: 2,
        image: "https://picsum.photos/seed/picsum/200/300"
      }
    ]
  },
  {
    id: 3,
    title: "Adjectives and Adverbs",
    questions: [
      {
        id: 1,
        text: "Which word is an adjective in this sentence: 'The red ball bounced high.'?",
        options: ["The", "red", "ball", "high"],
        correctAnswer: 1,
        image: "https://picsum.photos/seed/picsum/200/300"
      },
      {
        id: 2,
        text: "Which word is an adverb in this sentence: 'She quickly finished her homework.'?",
        options: ["She", "quickly", "finished", "homework"],
        correctAnswer: 1,
        image: "https://picsum.photos/seed/picsum/200/300"
      }
    ]
  }
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // toggle password visibility
  const [loginError, setLoginError] = useState(''); // error message

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://grammar-backend-api.vercel.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        setLoginError('');
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Server error');
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  const startLesson = (lesson) => {
    setCurrentLesson(lesson);
    setCurrentQuestion(0);
    setStudentAnswers({});
    setShowResults(false);
  };

  const handleStudentAnswer = (questionId, answerIndex) => {
    setStudentAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < currentLesson.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    currentLesson.questions.forEach(question => {
      if (studentAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: currentLesson.questions.length,
      percentage: Math.round((correct / currentLesson.questions.length) * 100)
    };
  };

  const resetQuiz = () => {
    setCurrentLesson(null);
    setShowResults(false);
  };

if (!isLoggedIn) {
    return (
      <div className="app login-page">
        <div className="login-container">
          <h1>Grammar Master App</h1>
          <h2>Teacher Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Username:</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter username"
              />
            </div>
            <div className="input-group password-group">
              <label>Password:</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter password"
                />
                <span className="toggle-password" onClick={togglePasswordVisibility}>
                  {showPassword ? '🐵' : '🙈'}
                </span>
              </div>
            </div>
            {loginError && <p className="error-message">{loginError}</p>}
            <button type="submit" className="login-btn">Login</button>
          </form>
          <p className="demo-credentials">Demo: username: teacher, password: password</p>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Grammar Master</h1>
          <button className="logout-btn" onClick={() => {
            setIsLoggedIn(false);
            localStorage.removeItem('isLoggedIn'); // clear login state
          }}>Logout</button>
        </header>
        <div className="lessons-container">
          <h2>Select a Lesson</h2>
          <div className="lessons-grid">
            {lessons.map(lesson => (
              <div key={lesson.id} className="lesson-card" onClick={() => startLesson(lesson)}>
                <div className="lesson-icon">📚</div>
                <h3>{lesson.title}</h3>
                <p>{lesson.questions.length} questions</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    
    return (
      <div className="app">
        <header className="app-header">
          <h1>Grammar Master</h1>
          <button className="back-btn" onClick={resetQuiz}>Back to Lessons</button>
        </header>
        <div className="results-container">
          <h2>Quiz Results</h2>
          <div className="score-display">
            <div className={`score-circle ${score.percentage >= 80 ? 'excellent' : score.percentage >= 60 ? 'good' : 'poor'}`}>
              <span>{score.percentage}%</span>
            </div>
            <p>You got {score.correct} out of {score.total} questions right!</p>
          </div>
          
          {score.percentage >= 80 ? (
            <div className="celebration">
              <div className="confetti"></div>
              <div className="confetti"></div>
              <div className="confetti"></div>
              <div className="confetti"></div>
              <div className="confetti"></div>
              <h3>Excellent Job! 🎉</h3>
            </div>
          ) : score.percentage >= 60 ? (
            <div className="celebration">
              <h3>Good Work! 👍</h3>
            </div>
          ) : (
            <div className="celebration">
              <h3>Keep Practicing! 💪</h3>
            </div>
          )}
          
          <div className="question-review">
            <h3>Review Answers:</h3>
            {currentLesson.questions.map(question => (
              <div key={question.id} className="review-item">
                <p><strong>Q: {question.text}</strong></p>
                <p>Correct answer: {question.options[question.correctAnswer]}</p>
                <p className={studentAnswers[question.id] === question.correctAnswer ? 'correct' : 'incorrect'}>
                  Your answer: {studentAnswers[question.id] !== undefined ? 
                    question.options[studentAnswers[question.id]] : 'Not answered'}
                </p>
              </div>
            ))}
          </div>
          
          <button className="try-again-btn" onClick={resetQuiz}>Try Another Lesson</button>
        </div>
      </div>
    );
  }

const question = currentLesson.questions[currentQuestion];

return (
  <div className="app">
    <header className="app-header">
      <h1>Grammar Master</h1>
      <div className="lesson-header-buttons">
        <span className="lesson-progress">
          Question {currentQuestion + 1} of {currentLesson.questions.length}
        </span>
        <button className="back-btn" onClick={resetQuiz}>Back to Lessons</button>
      </div>
    </header>

    <div className="quiz-container">
      <h2>{currentLesson.title}</h2>

      {/* Display question image if exists */}
      {question.image && (
        <div className="question-image">
          <img src={question.image} alt="Question" />
        </div>
      )}

      <div className="question-card">
        <h3>{question.text}</h3>
        <div className="options-container">
          {question.options.map((option, index) => (
            <div 
              key={index} 
              className={`option ${studentAnswers[question.id] === index ? 'selected' : ''}`}
              onClick={() => handleStudentAnswer(question.id, index)}
            >
              {option}
            </div>
          ))}
        </div>
      </div>

      <button 
        className="next-btn" 
        onClick={nextQuestion}
        disabled={studentAnswers[question.id] === undefined}
      >
        {currentQuestion === currentLesson.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
      </button>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{width: `${((currentQuestion + 1) / currentLesson.questions.length) * 100}%`} }
        ></div>
      </div>
    </div>

  </div>
);

}

export default App;