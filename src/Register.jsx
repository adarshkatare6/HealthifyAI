import React, { useState } from 'react';
import { Leaf, UserPlus, AlertTriangle, LogIn } from 'lucide-react';

export default function Register({ setView }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const baseUrl = import.meta.env.VITE_AUTH_SERVER_URL || '';
      const response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error: ${response.status}`);
      }

      setSuccess(true);
      // Auto-redirect to login after short delay
      setTimeout(() => {
        setView('login');
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2><Leaf className="auth-icon" /> Register to HealthifyAI</h2>
          <p>Create an account to get started</p>
        </div>

        {success ? (
          <div className="success-alert">
            Registration successful! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                autoComplete="username"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a secure password"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="error-alert">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary auth-btn" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex-center">
                  <span className="small-spinner"></span> 
                  Registering...
                </span>
              ) : (
                <span className="flex-center">
                  <UserPlus size={20} style={{marginRight: '8px'}} /> Register
                </span>
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>Already have an account? <button type="button" className="link-btn" onClick={() => setView('login')}><LogIn size={16} /> Login</button></p>
        </div>
      </div>
    </div>
  );
}
