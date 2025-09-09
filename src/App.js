// App.js
import React, { useEffect, useState } from 'react';
import './App.css';
import { FaPlus, FaEye, FaEyeSlash, FaSignOutAlt, FaArrowLeft, FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import { RiBookOpenFill, RiQuestionnaireFill } from "react-icons/ri";
import { BsStars, BsLightningChargeFill } from "react-icons/bs";
import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';

// Import SweetAlert2 with a safe fallback
let MySwal;
try {
  const Swal = require('sweetalert2');
  const withReactContent = require('sweetalert2-react-content');
  MySwal = withReactContent(Swal);
} catch (error) {
  // Fallback to basic alerts if SweetAlert2 is not available
  console.warn('SweetAlert2 not available, using fallback alerts');
  MySwal = {
    fire: (options) => {
      if (options.icon === 'success') {
        alert(options.title || 'Success');
      } else if (options.icon === 'error') {
        alert(options.title || 'Error: ' + (options.text || ''));
      } else if (options.icon === 'question') {
        const confirm = window.confirm(options.title || (options.text || 'Confirm?'));
        return Promise.resolve({ isConfirmed: confirm, isDenied: false, isDismissed: !confirm });
      } else {
        alert(options.title || '');
      }
      return Promise.resolve({ isConfirmed: true });
    }
  };
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddLessonForm, setShowAddLessonForm] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    image: "",
    questions: [
      { id: uuidv4(), text: "", options: ["", "", "", ""], correctAnswer: 0, image: "" }
    ]
  });

  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [deletingLesson, setDeletingLesson] = useState(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoadingLessons(true);
      // Simulate loading for skeleton effect
      await new Promise(resolve => setTimeout(resolve, 1200));
      const response = await fetch("https://grammar-backend-api.vercel.app/lessons");
      const data = await response.json();
      setLessons(data.lessons || []);
    } catch (err) {
      console.error("Error fetching lessons:", err);
      MySwal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to load lessons. Please try again later.',
        confirmButtonColor: '#7E6EF9'
      });
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

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
        
        // Success notification
        MySwal.fire({
          icon: 'success',
          title: 'Welcome back!',
          showConfirmButton: false,
          timer: 1500,
          background: '#7E6EF9',
          color: 'white'
        });
      } else {
        setLoginError(data.message || 'Login failed');
        MySwal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: data.message || 'Invalid credentials',
          confirmButtonColor: '#7E6EF9'
        });
      }
    } catch (err) {
      console.error(err);
      setLoginError('Server error');
      MySwal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Unable to connect to the server',
        confirmButtonColor: '#7E6EF9'
      });
    } finally {
      setLoading(false);
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
        MySwal.fire({
          icon: 'success',
          title: 'Lesson Saved!',
          text: 'Your lesson has been successfully saved.',
          confirmButtonColor: '#7E6EF9'
        });
        setShowAddLessonForm(false);
        setNewLesson({ title: "", image: "", questions: [{ text: "", image: "", options: ["", "", "", ""], correctAnswer: 0 }] });
        // Refresh the lessons list
        fetchLessons();
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: data.message || 'Unable to save lesson',
          confirmButtonColor: '#7E6EF9'
        });
      }
    } catch (err) {
      console.error(err);
      MySwal.fire({
        icon: 'error',
        title: 'Server Error',
        text: 'Please try again later',
        confirmButtonColor: '#7E6EF9'
      });
    }
  };

  const confirmLogout = () => {
    MySwal.fire({
      title: 'Log Out?',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7E6EF9',
      cancelButtonColor: '#FF5C5C',
      confirmButtonText: 'Yes, Log Out'
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
      }
    });
  };

  const deleteLesson = async (lessonId) => {
    setDeletingLesson(lessonId);
    try {
      const response = await fetch(`https://grammar-backend-api.vercel.app/lessons/${lessonId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      
      if (response.ok) {
        MySwal.fire({
          icon: 'success',
          title: 'Lesson Deleted!',
          text: 'The lesson has been successfully deleted.',
          confirmButtonColor: '#7E6EF9'
        });
        // Remove the lesson from the local state
        setLessons(lessons.filter(lesson => lesson.id !== lessonId));
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: data.message || 'Unable to delete lesson',
          confirmButtonColor: '#7E6EF9'
        });
      }
    } catch (err) {
      console.error(err);
      MySwal.fire({
        icon: 'error',
        title: 'Server Error',
        text: 'Please try again later',
        confirmButtonColor: '#7E6EF9'
      });
    } finally {
      setDeletingLesson(null);
    }
  };

  const confirmDeleteLesson = (lessonId, lessonTitle) => {
    MySwal.fire({
      title: 'Delete Lesson?',
      html: `Are you sure you want to delete <strong>"${lessonTitle}"</strong>? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF5C5C',
      cancelButtonColor: '#7E6EF9',
      confirmButtonText: 'Yes, Delete It',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      background: '#FFF',
      backdrop: 'rgba(0,0,0,0.4)'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteLesson(lessonId);
      }
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="app login-page">
        <div className="login-container">
          <div className="login-header">
            <div className="logo">
              <RiBookOpenFill className="logo-icon" />
              <h1>Grammar Master</h1>
            </div>
            <p>Fun grammar lessons for 5th graders</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <h2>Teacher Login</h2>
            
            <div className="input-group floating">
              <input 
                type="text" 
                id="username"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required
              />
              <label htmlFor="username">Username</label>
              <span className="input-icon">👤</span>
            </div>
            
            <div className="input-group floating password-group">
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
              <label htmlFor="password">Password</label>
              <span className="input-icon">🔒</span>
              <button type="button" className="toggle-password" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <div className="spinner"></div> : 
                <><BsLightningChargeFill className="btn-icon" /> Log In</>}
            </button>

            <p className="demo-credentials">Demo credentials: username: teacher, password: password</p>
          </form>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="logo">
            <RiBookOpenFill className="logo-icon" />
            <h1>Grammar Master</h1>
          </div>
          <div className="header-buttons">
            <button className="btn-primary add-btn" onClick={() => setShowAddLessonForm(true)}>
              <FaPlus /> Add Lesson
            </button>
            <button className="btn-secondary logout-btn" onClick={confirmLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>
        
        <div className="lessons-container">
          <div className="section-header">
            <h2>Choose a Lesson</h2>
            <p>Select a lesson to start practicing your grammar skills</p>
          </div>
          
          <div className="lessons-grid">
            {loadingLessons ? (
              // Skeleton loaders
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="lesson-card skeleton">
                  <div className="skeleton-icon"></div>
                  <div className="skeleton-line medium"></div>
                  <div className="skeleton-line short"></div>
                </div>
              ))
            ) : lessons.length === 0 ? (
              <div className="empty-state">
                <RiQuestionnaireFill className="empty-icon" />
                <h3>No lessons available</h3>
                <p>Add your first lesson to get started</p>
                <button className="btn-primary" onClick={() => setShowAddLessonForm(true)}>
                  <FaPlus /> Create Lesson
                </button>
              </div>
            ) : (
              lessons.map(lesson => (
                <div key={lesson.id} className="lesson-card">
                  <button 
                    className="delete-lesson-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteLesson(lesson.id, lesson.title);
                    }}
                    disabled={deletingLesson === lesson.id}
                  >
                    {deletingLesson === lesson.id ? (
                      <div className="spinner-small"></div>
                    ) : (
                      <FaTrash />
                    )}
                  </button>
                  <div className="lesson-content" onClick={() => startLesson(lesson)}>
                    <div className="lesson-icon">
                      <RiBookOpenFill />
                    </div>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.questions?.length || 0} questions</p>
                  </div>
                  <div className="card-hover-effect"></div>
                </div>
              ))
            )}
          </div>
          
          {showAddLessonForm && (
            <div className="modal-overlay">
              <div className="modal modern-modal">
                <h2 className="modal-title">
                  <FaPlus /> Add New Lesson
                </h2>

                <div className="form-group floating">
                  <input 
                    type="text" 
                    value={newLesson.title} 
                    onChange={(e) => setNewLesson({...newLesson, title: e.target.value})} 
                    required
                  />
                  <label>Lesson Title</label>
                </div>

                <div className="form-group floating">
                  <input 
                    type="text" 
                    value={newLesson.image} 
                    onChange={(e) => setNewLesson({...newLesson, image: e.target.value})} 
                  />
                  <label>Lesson Image URL (optional)</label>
                </div>

                <h3 className="section-title">
                  <RiQuestionnaireFill /> Questions
                </h3>

                {newLesson.questions.map((q, qIndex) => (
                  <div key={q.id} className="question-form">
                    <div className="question-header">
                      <h4>Question {qIndex + 1}</h4>
                      {newLesson.questions.length > 1 && (
                        <button 
                          type="button" 
                          className="btn-danger btn-sm"
                          onClick={() => {
                            setNewLesson({
                              ...newLesson,
                              questions: newLesson.questions.filter(question => question.id !== q.id)
                            });
                          }}
                        >
                          <FaTimes /> Remove
                        </button>
                      )}
                    </div>

                    <div className="form-group floating">
                      <input 
                        type="text" 
                        value={q.text} 
                        onChange={(e) => {
                          const updated = [...newLesson.questions];
                          updated[qIndex].text = e.target.value;
                          setNewLesson({...newLesson, questions: updated});
                        }} 
                        required
                      />
                      <label>Question Text</label>
                    </div>

                    <div className="form-group">
                      <label className="file-input-label">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            try {
                              const options = {
                                maxSizeMB: 0.2,
                                maxWidthOrHeight: 800,
                                useWebWorker: true,
                              };
                              const compressedFile = await imageCompression(file, options);

                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64String = reader.result;
                                const updated = [...newLesson.questions];
                                updated[qIndex].image = base64String;
                                setNewLesson({ ...newLesson, questions: updated });
                              };
                              reader.readAsDataURL(compressedFile);
                            } catch (error) {
                              console.error("Image compression error:", error);
                            }
                          }}
                        />
                        <span className="file-input-button">
                          <FaPlus /> Upload Question Image
                        </span>
                      </label>
                      {q.image && <img src={q.image} alt="preview" className="preview-img" />}
                    </div>

                    <div className="options-container">
                      <label>Answer Options</label>
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="form-group floating option-input">
                          <input 
                            type="text"
                            placeholder=" "
                            value={opt} 
                            onChange={(e) => {
                              const updated = [...newLesson.questions];
                              updated[qIndex].options[oIndex] = e.target.value;
                              setNewLesson({...newLesson, questions: updated});
                            }}
                            required
                          />
                          <label>Option {oIndex + 1}</label>
                        </div>
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
                        className="modern-select"
                      >
                        {q.options.map((_, idx) => (
                          <option key={idx} value={idx}>Option {idx + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                <button 
                  className="btn-secondary full-width"
                  onClick={() => {
                    setNewLesson({
                      ...newLesson,
                      questions: [
                        ...newLesson.questions,
                        { id: uuidv4(), text: "", options: ["", "", "", ""], correctAnswer: 0, image: "" }
                      ]
                    });
                  }}
                >
                  <FaPlus /> Add Another Question
                </button>

                <div className="modal-actions">
                  <button 
                    className="btn-primary"
                    onClick={saveLesson}
                  >
                    <FaCheck /> Save Lesson
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => setShowAddLessonForm(false)}
                  >
                    <FaTimes /> Cancel
                  </button>
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
          <div className="logo">
            <RiBookOpenFill className="logo-icon" />
            <h1>Grammar Master</h1>
          </div>
          <button className="btn-secondary back-btn" onClick={resetQuiz}>
            <FaArrowLeft /> Back to Lessons
          </button>
        </header>
        
        <div className="results-container">
          <div className="score-display">
            <div className={`score-circle ${score.percentage >= 80 ? 'excellent' : score.percentage >= 60 ? 'good' : 'poor'}`}>
              <span>{score.percentage}%</span>
            </div>
            <h2>Quiz Complete!</h2>
            <p>You answered {score.correct} out of {score.total} questions correctly</p>
          </div>
          
          <div className="result-feedback">
            {score.percentage >= 80 ? (
              <>
                <BsStars className="feedback-icon excellent" />
                <h3>Amazing! You're a Grammar Master! 🎉</h3>
                <p>Your grammar skills are impressive! Keep up the great work!</p>
              </>
            ) : score.percentage >= 60 ? (
              <>
                <BsStars className="feedback-icon good" />
                <h3>Good Job! 👍</h3>
                <p>You're on the right track! A little more practice and you'll master grammar!</p>
              </>
            ) : (
              <>
                <BsStars className="feedback-icon poor" />
                <h3>Keep Practicing! 💪</h3>
                <p>Don't worry! Practice makes perfect. Try again and you'll improve!</p>
              </>
            )}
          </div>
          
          <div className="question-review">
            <h3>Review Your Answers:</h3>
            {currentLesson.questions.map((question, index) => (
              <div key={question.id} className={`review-item ${studentAnswers[question.id] === question.correctAnswer ? 'correct' : 'incorrect'}`}>
                <div className="review-question">
                  <p><strong>Q{index + 1}:</strong> {question.text}</p>
                </div>
                <div className="review-answer">
                  <p className="correct-answer">Correct: {question.options[question.correctAnswer]}</p>
                  <p className="your-answer">Your answer: {studentAnswers[question.id] !== undefined ? 
                    question.options[studentAnswers[question.id]] : 'Not answered'}
                  </p>
                </div>
                <div className="review-status">
                  {studentAnswers[question.id] === question.correctAnswer ? 
                    <FaCheck className="status-icon correct" /> : 
                    <FaTimes className="status-icon incorrect" />
                  }
                </div>
              </div>
            ))}
          </div>
          
          <button className="btn-primary try-again-btn" onClick={resetQuiz}>
            <RiBookOpenFill /> Try Another Lesson
          </button>
        </div>
      </div>
    );
  }

  const question = currentLesson.questions[currentQuestion];

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <RiBookOpenFill className="logo-icon" />
          <h1>Grammar Master</h1>
        </div>
        <div className="lesson-header-buttons">
          <span className="lesson-progress">
            Question {currentQuestion + 1} of {currentLesson.questions.length}
          </span>
          <button className="btn-secondary back-btn" onClick={resetQuiz}>
            <FaArrowLeft /> Exit Lesson
          </button>
        </div>
      </header>

      <div className="quiz-container">
        <div className="lesson-header">
          <h2>{currentLesson.title}</h2>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${((currentQuestion + 1) / currentLesson.questions.length) * 100}%`}}
            ></div>
          </div>
        </div>

        {question.image && (
          <div className="question-image">
            <img src={question.image} alt="Question visual aid" />
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
                <div className="option-selector">
                  <div className="option-circle">
                    {studentAnswers[question.id] === index && <div className="option-dot"></div>}
                  </div>
                </div>
                <div className="option-text">{option}</div>
              </div>
            ))}
          </div>
        </div>

        <button 
          className="btn-primary next-btn" 
          onClick={nextQuestion}
          disabled={studentAnswers[question.id] === undefined}
        >
          {currentQuestion === currentLesson.questions.length - 1 ? 
            'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}

export default App;