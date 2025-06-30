// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Loginpage.css';

// function Loginpage() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (!username || !password) {
//       setError('Please enter both username and password');
//       return;
//     }

//     try {
//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         localStorage.setItem('authToken', data.token);
//         localStorage.setItem('username', data.user.username);
//         localStorage.setItem('role', data.user.role);
//         navigate('/sidebar');
//       } else {
//         setError(data.message || 'Login failed');
//       }
//     } catch {
//       setError('Network error. Please try again.');
//     }
//   };

//   return (
//     <div className="login-page-wrapper">
//       <div className="login-page-background"></div>
//       <div className="login-page-container">
//         <div className="login-card">
//           <h2 className="login-title">Student Management Software</h2>
//           <p className="login-subtitle">Login with your credentials</p>
//           {error && <div className="login-error-message">{error}</div>}

//           <form className="login-form" onSubmit={handleLogin}>
//             <input
//               type="text"
//               placeholder="Username"
//               className="login-input"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//             />
//             <div className="password-input-container">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 placeholder="Password"
//                 className="login-input"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//               <span 
//                 className="password-toggle" 
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? 'HIDE' : 'SHOW'}
//               </span>
//             </div>
//             <button type="submit" className="login-submit-btn">Login</button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Loginpage;


// Loginpage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Loginpage.css';

function Loginpage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('role', data.user.role);
        
        // Store student-specific data if role is student
       if (data.user.role === 'student') {
  localStorage.setItem('studentClass', data.user.class);
  localStorage.setItem('studentSection', data.user.section);
}
        
        navigate('/sidebar');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-page-background"></div>
      <div className="login-page-container">
        <div className="login-card">
          <h2 className="login-title">Student Management Software</h2>
          <p className="login-subtitle">Login with your credentials</p>
          {error && <div className="login-error-message">{error}</div>}

          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </span>
            </div>
            <button type="submit" className="login-submit-btn">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Loginpage;