// App.js
import React, { useEffect, useState } from 'react';
import './App.css';
import { FaPlus, FaEye, FaEyeSlash, FaSignOutAlt, FaArrowLeft, FaCheck, FaTimes, FaTrash, FaEdit, FaBook, FaUserGraduate,FaLinkedin, FaInstagram, 
  FaEnvelope,FaChalkboardTeacher } from "react-icons/fa";
import { RiBookOpenFill, RiQuestionnaireFill } from "react-icons/ri";
import { BsStars, BsLightningChargeFill } from "react-icons/bs";
import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';
import DataTable from "react-data-table-component";

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
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
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
  const [savingLesson, setSavingLesson] = useState(false);
  const [imageSizeError, setImageSizeError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isRegister, setIsRegister] = useState(false);

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgot_email, setforgot_email] = useState('');
  const [userType, setUserType] = useState(localStorage.getItem("user_type") || "Teacher");
  const [view, setView] = useState("lessons"); 
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

const handleRegister = async (e) => {
  e.preventDefault();

  // ✅ client-side password validation
  const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  if (!passwordRegex.test(password)) {
    setLoginError('Password must be at least 8 characters long and include at least one special character');
    MySwal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: 'Password must be at least 8 characters long and include at least one special character',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7E6EF9',
       
      });
    return; // stop execution, don't touch loading
  }

  // ✅ reset error & enable loading only if password valid
  setLoginError('');
  setLoading(true);

  try {
    const response = await fetch('https://grammar-backend-api.vercel.app/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setUserId(data.userId);
      setShowOtp(true); // show OTP form
      MySwal.fire({
        icon: 'info',
        title: 'Verify Your Email',
        text: 'An OTP has been sent to your email. Please enter it below.',
        confirmButtonColor: '#7E6EF9'
      });
    } else {
      setLoginError(data.message || 'Registration failed');
      MySwal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: data.message,
        confirmButtonText: 'OK',
        showDenyButton: true,
        denyButtonText: 'Verify OTP',
        confirmButtonColor: '#7E6EF9',
        denyButtonColor: '#4CAF50'
      }).then((result) => {
        if (result.isDenied) {
          setShowOtp(true); // show OTP form state in React
        }
      });
    }
  } catch (err) {
    console.error(err);
    setLoginError('Server error');
  } finally {
    setLoading(false);
  }
};


  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://grammar-backend-api.vercel.app/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        MySwal.fire({
          icon: 'success',
          title: 'Verified!',
          text: 'Your account has been verified. You can now log in.',
          confirmButtonColor: '#7E6EF9'
        });
         setShowOtp(false);
         setIsRegister(false);
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'OTP Error',
          text: data.message,
          confirmButtonColor: '#7E6EF9'
        });
      }
    } catch (err) {
      console.error(err);
      MySwal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Unable to verify OTP',
        confirmButtonColor: '#7E6EF9'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://grammar-backend-api.vercel.app/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        MySwal.fire({
          icon: 'success',
          title: 'OTP Resent!',
          text: 'Check your email for the new OTP.',
          confirmButtonColor: '#7E6EF9'
        });
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message,
          confirmButtonColor: '#7E6EF9'
        });
      }
    } catch (err) {
      console.error(err);
      MySwal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Unable to resend OTP',
        confirmButtonColor: '#7E6EF9'
      });
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://grammar-backend-api.vercel.app/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forgot_email }),
      });

      const data = await response.json();

      if (response.ok) {
        MySwal.fire({
          icon: 'success',
          title: 'Password Reset Successful!',
          text: 'Your password has been reset. You can now log in with your new password.',
          confirmButtonColor: '#7E6EF9'
        });
         setShowForgotPassword(false);
         setforgot_email(false);
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Reset password Error',
          text: data.message,
          confirmButtonColor: '#7E6EF9'
        });
      }
    } catch (err) {
      console.error(err);
      MySwal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Unable to reset your password',
        confirmButtonColor: '#7E6EF9'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoadingLessons(true);
      // Simulate loading for skeleton effect
      // await new Promise(resolve => setTimeout(resolve, 1200));

      const token = localStorage.getItem("token"); // ✅ get saved token

      const response = await fetch("https://grammar-backend-api.vercel.app/lessons", {
        headers: {
          "Authorization": `Bearer ${token}`,  // ✅ send token in header
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // token missing, invalid or expired
          localStorage.removeItem("token");
          localStorage.removeItem("isLoggedIn");
          setIsLoggedIn(false); // Update state to trigger re-render
          // window.location.href = "/login"; // This line is not needed with the state change
        }
        throw new Error("Unauthorized or expired session");
      }

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

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);

      const token = localStorage.getItem("token"); // ✅ get saved token

      const response = await fetch("https://grammar-backend-api.vercel.app/classes", {
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ send token in header
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // token missing, invalid or expired
          localStorage.removeItem("token");
          localStorage.removeItem("isLoggedIn");
          setIsLoggedIn(false); // Update state to trigger re-render
        }
        throw new Error("Unauthorized or expired session");
      }

      const data = await response.json();
      setClasses(data.classes || []); // expecting { classes: [...] }
    } catch (err) {
      console.error("Error fetching classes:", err);
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to load classes. Please try again later.",
        confirmButtonColor: "#7E6EF9",
      });
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    // Only attempt to fetch lessons if the user is considered logged in
    if (isLoggedIn) {
      fetchLessons();
      fetchClasses();
    }
  }, [isLoggedIn]); // Dependency on isLoggedIn ensures it runs when login status changes

  // Define columns for DataTable
  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, width: "70px" },
    { name: "Class Name", selector: (row) => row.name, sortable: true },
    { name: "Description", selector: (row) => row.description },
    { name: "Level", selector: (row) => row.level, sortable: true },
    { 
      name: "Created At", 
      selector: (row) => new Date(row.created_at).toLocaleDateString(), 
      sortable: true 
    },
  ];


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
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_type", data.user_type);
        setUserType(data.user_type);
        setLoginError('');
        
        // MySwal.fire({
        //   icon: 'success',
        //   title: 'Welcome back!',
        //   showConfirmButton: false,
        //   timer: 1500,
        //   background: '#7E6EF9',
        //   color: 'white'
        // });
        await fetchLessons();
      } else {
        setLoginError(data.message || loginError || 'Login failed');
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

  const validateLesson = () => {
    const errors = {};
    let firstErrorField = null;

    // Lesson title
    if (!newLesson.title.trim()) {
      errors.title = "Lesson title is required";
      if (!firstErrorField) firstErrorField = "title";
    }

    // Questions
    newLesson.questions.forEach((q, qIndex) => {
      if (!q.text.trim()) {
        errors[`q${qIndex}-text`] = "Question text is required";
        if (!firstErrorField) firstErrorField = `q${qIndex}-text`;
      }
      q.options.forEach((opt, oIndex) => {
        if (!opt.trim()) {
          errors[`q${qIndex}-opt${oIndex}`] = "Option is required";
          if (!firstErrorField) firstErrorField = `q${qIndex}-opt${oIndex}`;
        }
      });
    });

    setValidationErrors(errors);

    // Focus first error input
    if (firstErrorField) {
      const el = document.querySelector(`[data-field="${firstErrorField}"]`);
      if (el) el.focus();
      return false;
    }

    return true;
  };


  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const togglePasswordVisibilityRegister = () => {
    setShowPasswordRegister(prev => !prev);
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

  const updateLessonApi = async (lessonId, updatedLesson) => {
    const token = localStorage.getItem("token"); // ✅ get saved token

    try {
      const response = await fetch(`https://grammar-backend-api.vercel.app/lessons/${lessonId}`, {
        method: "PUT", // ✅ use PUT for update
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ send token in header
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedLesson), // ✅ body is a sibling of headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update lesson");
      }

      return data; // ✅ return the updated lesson data
    } catch (err) {
      console.error("Update lesson error:", err);
      throw err; // ✅ propagate error to caller
    }
  };


  const saveLesson = async () => {
    if (!validateLesson()) {
      return; // Stops save if errors
    }
    if (editingLessonId) 
    {
      setSavingLesson(true);
        try {
          await updateLessonApi(editingLessonId, newLesson);
          MySwal.fire({
            icon: 'success',
            title: 'Lesson Updated!',
            text: 'Your lesson has been successfully updated.',
            confirmButtonColor: '#7E6EF9'
          });
          setShowAddLessonForm(false);
          setEditingLessonId(null);
          setNewLesson({ title: "", image: "", questions: [{ text: "", image: "", options: ["", "", "", ""], correctAnswer: 0 }] });
          fetchLessons(); // refresh list
        } catch (err) {
          console.error(err);
          MySwal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'Please try again later',
            confirmButtonColor: '#7E6EF9'
          });
        } finally {
          
          setSavingLesson(false);
        }
    }else{
      setSavingLesson(true);
      try {

        const token = localStorage.getItem("token"); // ✅ get saved token

        const response = await fetch("https://grammar-backend-api.vercel.app/lessons", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`, // ✅ send token in header
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newLesson), // ✅ body is a sibling of headers
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
      } finally {
        setSavingLesson(false);
      } 
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

      const token = localStorage.getItem("token"); // ✅ get saved token

      const response = await fetch(`https://grammar-backend-api.vercel.app/lessons/${lessonId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ send token in header
        },
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

const handleImageUpload = async (e, qIndex) => {
  const file = e.target.files[0];
  if (!file) return;

  // Check file size (50KB = 50 * 1024 bytes)
  const maxSize = 50 * 1024;
  if (file.size > maxSize) {
    setImageSizeError("Image size must be less than 50KB");
    e.target.value = ""; // Clear the file input
    setTimeout(() => setImageSizeError(""), 3000); // Clear error after 3 seconds
    return;
  }

  try {
    const options = {
      maxSizeMB: 0.05, // 50KB
      maxWidthOrHeight: 800,
      useWebWorker: true,
      onProgress: (progress) => {
        setUploadProgress(prev => ({ ...prev, [qIndex]: progress }));
      },
    };
    const compressedFile = await imageCompression(file, options);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const updated = [...newLesson.questions];
      updated[qIndex].image = base64String;
      setNewLesson({ ...newLesson, questions: updated });
      setImageSizeError(""); // Clear any previous error
    };
    reader.readAsDataURL(compressedFile);
  } catch (error) {
    console.error("Image compression error:", error);
    MySwal.fire({
      icon: 'error',
      title: 'Upload Error',
      text: 'Failed to process the image. Please try again.',
      confirmButtonColor: '#7E6EF9'
    });
  }
};

  if (showOtp) {
    return (
      <form onSubmit={handleVerifyOtp} className="login-form" style={{maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px'}}>
        <h2>Email Verification</h2>
        <div className="input-group floating">
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <label htmlFor="otp">Enter OTP</label>
        </div>
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? <div className="spinner"></div> : "Verify OTP"}
        </button>
        <p className="demo-credentials">
          Didn’t get the code? <a href="#" onClick={handleResendOtp}>Resend OTP</a>
        </p>

      </form>
    );
  }

  if (showForgotPassword) {
    return (
      <form onSubmit={handleForgotPassword} className="login-form" style={{maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px'}}>
        <h2>Forgot Password</h2>
        <div className="input-group floating">
          <input
            type="email"
            id="forgot_email"
            value={forgot_email}
            onChange={(e) => setforgot_email(e.target.value)}
            required
          />
          <label htmlFor="forgot_email">Enter your email</label>
        </div>
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? <div className="spinner"></div> : "Reset Password"}
        </button>
      </form>
    );
  }

if (isRegister) {
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
  
          <form onSubmit={handleRegister} className="login-form"> {/* Use the correct handler */}
            <h2>Teacher Registration</h2>
            <div className="input-group floating">
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <label htmlFor="fullName">Full Name</label>
              <span className="input-icon">👨‍🏫</span>
            </div>
            <div className="input-group floating">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="email">Email</label>
              <span className="input-icon">✉️</span>
            </div>
            <div className="input-group floating">
              <input
                type="text"
                id="regUsername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label htmlFor="regUsername">Username</label>
              <span className="input-icon">👤</span>
            </div>
            <div className="input-group floating password-group">
              <input
                type={showPasswordRegister ? 'text' : 'password'} 
                id="regPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='new-password'
                required
              />
              <label htmlFor="regPassword">Password</label>
              <span className="input-icon">🔒</span>
              <button type="button" className="toggle-password" onClick={togglePasswordVisibilityRegister}>
                {showPasswordRegister ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <div className="spinner"></div> : 
              <><BsLightningChargeFill className="btn-icon" /> Register</>}
            </button>
            <p className="demo-credentials">
              Already have an account? <a href="#" onClick={() => setIsRegister(false)}>Back to Login</a>
            </p>
          </form>
        </div>
      </div>
    );
  }
  
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
            <p className="demo-credentials">
              <a href="#" onClick={() => setShowForgotPassword(true)}>Forgot Password</a>
            </p>
  
            {/* <p className="demo-credentials">Demo credentials: username: teacher, password: password</p> */}
            <p className="demo-credentials">
              Don't have an account? <a href="#" onClick={() => setIsRegister(true)}>Register now</a>
            </p>
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
              {userType === "Admin" && (
                <>
                  {view === "lessons" ? (
                    <button 
                      className="btn-secondary classes-btn" 
                      onClick={() => setView("classes")}
                    >
                      <FaUserGraduate /> Classes
                    </button>
                  ) : (
                    <button 
                      className="btn-secondary lessons-btn" 
                      onClick={() => setView("lessons")}
                    >
                      <FaBook /> Lessons
                    </button>
                  )}
                </>
              )}
            <button className="btn-secondary logout-btn" onClick={confirmLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>
        {view === "lessons" ? (
        <div className="lessons-container">
          <div className="section-header">
            <h2>Choose a Lesson</h2>
            <p>Select a lesson to start practicing your grammar skills</p>
          </div>
            {view === "lessons" ? (
              <button className="btn-primary add-btn" style={{marginBottom:'25px'}} onClick={() => setShowAddLessonForm(true)}>
                <FaPlus /> Add Lesson
              </button>
            ) : null}
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
                  <button 
                      className="edit-lesson-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddLessonForm(true);
                        setNewLesson({
                          ...lesson,
                          questions: lesson.questions.map(q => ({ ...q }))
                        });
                        setEditingLessonId(lesson.id); // <- store the lesson id for update
                      }}
                    >
                    <FaEdit />
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

                {/* Lesson Title */}
                <div className="form-group floating">
                  <input 
                    type="text" 
                    value={newLesson.title} 
                    data-field="title"
                    className={validationErrors.title ? "error-input" : ""}
                    onChange={(e) => setNewLesson({...newLesson, title: e.target.value})} 
                  />
                  <label>Lesson Title</label>
                  {validationErrors.title && <span className="error-message">{validationErrors.title}</span>}
                </div>

                {/* Hidden Lesson Image URL (optional, not required) */}
                <div className="form-group floating" style={{display:'none'}}>
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

                    {/* Question Text */}
                    <div className="form-group floating">
                      <input 
                        type="text" 
                        value={q.text} 
                        data-field={`q${qIndex}-text`}
                        className={validationErrors[`q${qIndex}-text`] ? "error-input" : ""}
                        onChange={(e) => {
                          const updated = [...newLesson.questions];
                          updated[qIndex].text = e.target.value;
                          setNewLesson({...newLesson, questions: updated});
                        }} 
                      />
                      <label>Question Text</label>
                      {validationErrors[`q${qIndex}-text`] && (
                        <span className="error-message">{validationErrors[`q${qIndex}-text`]}</span>
                      )}
                    </div>

                    {/* Image Upload - Optional */}
                    <div className="form-group">
                      <label className="file-input-label">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, qIndex)}
                        />
                        <span className="file-input-button">
                          <FaPlus /> Upload Question Image
                        </span>
                      </label>
                      {imageSizeError && (
                        <div className="error-message-small">{imageSizeError}</div>
                      )}
                      {/* Show compression/upload progress */}
                      {uploadProgress[qIndex] && uploadProgress[qIndex] < 100 && (
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${uploadProgress[qIndex]}%` }}
                          >
                            {Math.round(uploadProgress[qIndex])}%
                          </div>
                        </div>
                      )}
                      {q.image && <img src={q.image} alt="preview" className="preview-img" />}
                    </div>

                    {/* Options */}
                    <div className="options-container">
                      <label>Answer Options</label>
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="form-group floating option-input">
                          <input 
                            type="text"
                            placeholder=" "
                            value={opt} 
                            data-field={`q${qIndex}-opt${oIndex}`}
                            className={validationErrors[`q${qIndex}-opt${oIndex}`] ? "error-input" : ""}
                            onChange={(e) => {
                              const updated = [...newLesson.questions];
                              updated[qIndex].options[oIndex] = e.target.value;
                              setNewLesson({...newLesson, questions: updated});
                            }}
                          />
                          <label>Option {oIndex + 1}</label>
                          {validationErrors[`q${qIndex}-opt${oIndex}`] && (
                            <span className="error-message">{validationErrors[`q${qIndex}-opt${oIndex}`]}</span>
                          )}
                        </div>

                      ))}
                    </div>

                    {/* Correct Answer Select */}
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
                        required
                      >
                        {q.options.map((_, idx) => (
                          <option key={idx} value={idx}>Option {idx + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {/* Add Question Button */}
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

                {/* Modal Actions */}
                <div className="modal-actions">
                  <button 
                    className="btn-primary"
                    onClick={saveLesson}
                    disabled={savingLesson}
                  >
                    {savingLesson ? (
                      <div className="spinner-small"></div>
                    ) : (
                      <><FaCheck /> Save Lesson</>
                    )}
                  </button>
                  <button 
                    className="btn-secondary" 
                  onClick={() => {
                    setShowAddLessonForm(false);
                    setEditingLessonId(null);
                    setNewLesson({ title: "", image: "", questions: [{ text: "", image: "", options: ["", "", "", ""], correctAnswer: 0 }] });
                  }}
                  disabled={savingLesson}
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
        ) : (
          <div className="classes-container">
            <div className="section-header">
              <h2>All Classes</h2>
              <button className="btn-primary" onClick={() => alert('Add Class functionality coming soon!')}>
                <FaPlus /> Add Class
              </button>
            </div>
            {loadingClasses ? (
                <p>Loading classes...</p>
              ) : classes.length === 0 ? (
                  <div className="no-classes">
                    <FaChalkboardTeacher className="no-classes-icon" />
                    <h3>No classes available</h3>
                    <p>Click on <strong>Add Class</strong> to create your first class!</p>
                  </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={classes}
                  pagination
                  highlightOnHover
                  striped
                  responsive
                  defaultSortFieldId={1}
                />
              )}
          </div>
        )}
        <footer className="app-footer">
          <p>© {new Date().getFullYear()} Hadi Koubaissi</p>
          <div className="footer-links">
            <div className="footer-item">
              <a href="https://linkedin.com/in/hadi-koubaissi" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
              <span>Hadi Koubaissi</span>
            </div>
            <div className="footer-item">
              <a href="https://www.instagram.com/hadi_koubaissi/" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <span>hadi_koubaissi</span>
            </div>
            <div className="footer-item">
              <a href="mailto:koubaissihadi2@gmail.com">
                <FaEnvelope />
              </a>
              <span>koubaissihadi2@gmail.com</span>
            </div>
          </div>
        </footer>

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