import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldAlert, LogIn } from 'lucide-react';
import * as api from '../services/apiService';
import './Login.css';

const Login = ({ isAdminRoute }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isAdminRoute) {
      if (email === 'admin@kgkite.ac.in' && password === '123') {
        navigate('/admin/dashboard');
      } else {
        alert('Invalid admin credentials.');
      }
    } else {
      try {
        const student = await api.ssoLoginAPI(email);
        localStorage.setItem('studentId', student.id);
        localStorage.setItem('studentEmail', student.email);
        localStorage.setItem('studentYear', student.yearOfStudy || 1);
        navigate('/dashboard');
      } catch (err) {
        alert(err.message || 'SSO Login Failed');
      }
    }
  };

  const handleSimulateGoogleLogin = async () => {
    const ssoEmail = prompt("SIMULATED GOOGLE LOGIN\n\nPlease enter your @kgkite.ac.in Google email:");
    if (!ssoEmail) return;
    
    try {
      const student = await api.ssoLoginAPI(ssoEmail);
      localStorage.setItem('studentId', student.id);
      localStorage.setItem('studentEmail', student.email);
      localStorage.setItem('studentYear', student.yearOfStudy || 1);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'SSO Login Failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel animate-fade-in">
        <div className="login-header">
          {isAdminRoute ? (
            <ShieldAlert size={48} className="icon-admin" />
          ) : (
            <User size={48} className="icon-student" />
          )}
          <h1 className="text-gradient">
            {isAdminRoute ? "Admin Portal" : "Student Login"}
          </h1>
          <p className="subtitle">
            {isAdminRoute 
              ? "Manage hostel allocations securely." 
              : "Book your preferred hostel bed easily."}
          </p>
        </div>

        {isAdminRoute ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Admin Email Address</label>
              <input 
                type="email" 
                placeholder="admin@kgkite.ac.in" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn-primary login-btn">
              <LogIn size={20} />
              <span>Admin Sign In</span>
            </button>
          </form>
        ) : (
          <div className="login-form" style={{textAlign: 'center', marginTop: '2rem'}}>
            <button 
              type="button" 
              className="btn-primary login-btn" 
              onClick={handleSimulateGoogleLogin}
              style={{
                background: 'white', 
                color: '#333', 
                border: '1px solid #ddd',
                padding: '1rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{width: '24px'}}/>
              <span>Login with College Email</span>
            </button>
            <p style={{marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              Only @kgkite.ac.in emails are permitted.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
