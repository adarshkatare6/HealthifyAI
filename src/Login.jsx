import React, { useState, useEffect } from 'react';
import { Leaf, LogIn, AlertTriangle, UserPlus } from 'lucide-react';

export default function Login({ setView, setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    let timer;
    if (isLoading) {
      // If loading takes more than 5 seconds, show waking up message
      timer = setTimeout(() => {
        setIsWakingUp(true);
      }, 5000);
    } else {
      setIsWakingUp(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsWakingUp(false);

    try {
      const baseUrl = import.meta.env.VITE_AUTH_SERVER_URL || '';
      const response = await fetch(`${baseUrl}/login`, {
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

      setToken(data.token);
      setView('upload');
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
          <h2><Leaf className="auth-icon" /> Login to HealthifyAI</h2>
          <p>Access your AI-powered health analysis</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              autoComplete="current-password"
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
                Logging in...
              </span>
            ) : (
              <span className="flex-center">
                <LogIn size={20} style={{marginRight: '8px'}} /> Login
              </span>
            )}
          </button>
        </form>

        {isWakingUp && (
          <div className="waking-up-alert">
            <div className="spinner-small"></div>
            Server is waking up, please wait...
          </div>
        )}

        <div className="auth-footer">
          <p>New user? <button type="button" className="link-btn" onClick={() => setView('register')}><UserPlus size={16} /> Register</button></p>
        </div>
      </div>
    </div>
  );
}
