// App.js
import React, { useEffect, useState } from 'react';
import './App.css';
import { FaPlus } from "react-icons/fa"; // plus icon

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
  const [loading, setLoading] = useState(false);
  const [showAddLessonForm, setShowAddLessonForm] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    image: "",
    questions: [
      { text: "", options: ["", "", "", ""], correctAnswer: 0 }
    ]
  });
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch("https://grammar-backend-api.vercel.app/lessons");
        const data = await response.json();
        setLessons(data.lessons || []);
      } catch (err) {
        console.error("Error fetching lessons:", err);
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchLessons();
  }, []);


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // start loader

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
    } finally {
      setLoading(false); // stop loader
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
const saveLesson = async () => {
  try {
    const response = await fetch("https://grammar-backend-api.vercel.app/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLesson),
    });

    const data = await response.json();
    if (response.ok) {
      alert("✅ Lesson saved successfully!");
      setShowAddLessonForm(false);
      setNewLesson({ title: "", image: "", questions: [{ text: "", image: "", options: ["", "", "", ""], correctAnswer: 0 }] });
    } else {
      alert("❌ Error: " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("⚠️ Server error");
  }
};

if (!isLoggedIn) {
    return (
      <div className="app login-page">
        <div className="login-container">
          <h1>Grammar Master</h1>
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
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : "Login"}
            </button>

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
        <div className="header-buttons">
          <button className="add-btn" onClick={() => setShowAddLessonForm(true)}>
            <FaPlus /> Add Lessons
          </button>
          <button className="logout-btn" onClick={() => {
            setIsLoggedIn(false);
            localStorage.removeItem('isLoggedIn');
          }}>Logout</button>
        </div>
      </header>
        <div className="lessons-container">
          <h2>Select a Lesson</h2>
          <div className="lessons-grid">
            {loadingLessons ? (
              <p>Loading lessons...</p>
            ) : lessons.length === 0 ? (
              <p>No lessons found. Add your first lesson!</p>
            ) : (
              lessons.map(lesson => (
                <div key={lesson.id} className="lesson-card" onClick={() => startLesson(lesson)}>
                  <div className="lesson-icon">📚</div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.questions.length} questions</p>
                </div>
              ))
            )}
          </div>
          {showAddLessonForm && (
<div className="modal-overlay">
  <div className="modal modern-modal">
    <h2 className="modal-title">➕ Add New Lesson</h2>

    {/* Lesson Info */}
    <div className="form-group">
      <label>Lesson Title</label>
      <input 
        type="text" 
        placeholder="Enter lesson title" 
        value={newLesson.title} 
        onChange={(e) => setNewLesson({...newLesson, title: e.target.value})} 
      />
    </div>

    <div className="form-group">
      <label>Lesson Image URL</label>
      <input 
        type="text" 
        placeholder="Paste image URL" 
        value={newLesson.image} 
        onChange={(e) => setNewLesson({...newLesson, image: e.target.value})} 
      />
    </div>

    <h3 className="section-title">Questions</h3>

{newLesson.questions.map((q, qIndex) => (
  <div key={qIndex} className="question-form">
    {/* Question Header with Number */}
    <h4 className="question-title">
      Question {qIndex + 1}
    </h4>

    <div className="form-group">
      <label>Question Text</label>
      <input 
        type="text" 
        placeholder="Enter question text" 
        value={q.text} 
        onChange={(e) => {
          const updated = [...newLesson.questions];
          updated[qIndex].text = e.target.value;
          setNewLesson({...newLesson, questions: updated});
        }} 
      />
    </div>

    <div className="form-group">
      <label>Upload Question Image</label>
      <input 
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            const imageUrl = URL.createObjectURL(file);
            const updated = [...newLesson.questions];
            updated[qIndex].image = imageUrl;
            setNewLesson({...newLesson, questions: updated});
          }
        }}
      />
      {q.image && <img src={q.image} alt="preview" className="preview-img" />}
    </div>

    <div className="options-container">
      <label>Options</label>
      {q.options.map((opt, oIndex) => (
        <input 
          key={oIndex}
          type="text"
          placeholder={`Option ${oIndex+1}`} 
          value={opt} 
          onChange={(e) => {
            const updated = [...newLesson.questions];
            updated[qIndex].options[oIndex] = e.target.value;
            setNewLesson({...newLesson, questions: updated});
          }}
        />
      ))}
    </div>

    <div className="form-group">
      <label>Correct Answer</label>
      <select 
        value={q.correctAnswer}
        onChange={(e) => {
          const updated = [...newLesson.questions];
          updated[qIndex].correctAnswer = parseInt(e.target.value);
          setNewLesson({...newLesson, questions: updated});
        }}
      >
        {q.options.map((_, idx) => (
          <option key={idx} value={idx}>Option {idx+1}</option>
        ))}
      </select>
    </div>

    {/* Delete Question Button */}
    <button 
      className="btn-cancel" 
      onClick={() => {
        const updated = newLesson.questions.filter((_, index) => index !== qIndex);
        setNewLesson({...newLesson, questions: updated});
      }}
    >
      🗑️ Delete Question
    </button>
  </div>
))}



    <button 
      className="btn-secondary"
      onClick={() => {
        setNewLesson({
          ...newLesson,
          questions: [...newLesson.questions, { text: "", image: "", options: ["", "", "", ""], correctAnswer: 0 }]
        });
      }}
    >
      ➕ Add Another Question
    </button>

    <div className="modal-actions">
      <button 
        className="btn-primary"
        onClick={() => {
          lessons.push({...newLesson, id: lessons.length+1});
          setShowAddLessonForm(false);
          setNewLesson({ title: "", image: "", questions: [{ text: "", image: "", options: ["", "", "", ""], correctAnswer: 0 }] });
          saveLesson();
        }}
      >
        💾 Save Lesson
      </button>
      <button className="btn-cancel" onClick={() => setShowAddLessonForm(false)}>❌ Cancel</button>
    </div>
  </div>
</div>

)}
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