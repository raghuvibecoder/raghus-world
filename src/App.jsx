import React, { useState, useEffect } from 'react';
import HomeDashboard from './components/HomeDashboard';
import GradeView from './components/GradeView';
import AdminPanel from './components/AdminPanel';
import { Lock, Unlock, LogOut, Settings, GraduationCap, Home } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [role, setRole] = useState('user'); // 'user' or 'admin'
  const [activeTab, setActiveTab] = useState('home'); // 'home', '2'-'8', 'admin'
  
  // Password prompt state
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [checkingSavedAuth, setCheckingSavedAuth] = useState(true);

  // Check for saved password in localStorage on mount
  useEffect(() => {
    const savedPassword = localStorage.getItem('raghus_world_password');
    if (savedPassword) {
      autoLogin(savedPassword);
    } else {
      setCheckingSavedAuth(false);
    }
  }, []);

  const autoLogin = async (password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setAuthToken(password);
        setRole(data.role);
      } else {
        localStorage.removeItem('raghus_world_password');
      }
    } catch (err) {
      console.error('Auto login error:', err);
    } finally {
      setCheckingSavedAuth(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setIsAuthenticated(true);
        setAuthToken(passwordInput);
        setRole(data.role);
        localStorage.setItem('raghus_world_password', passwordInput);
        setPasswordInput('');
      } else {
        setPasswordError(data.error || 'Incorrect password!');
      }
    } catch (err) {
      setPasswordError('Network error, please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('raghus_world_password');
    setIsAuthenticated(false);
    setAuthToken('');
    setRole('user');
    setActiveTab('home');
  };

  const handleAdminSuccess = (adminPass) => {
    setIsAuthenticated(true);
    setAuthToken(adminPass);
    setRole('admin');
    localStorage.setItem('raghus_world_password', adminPass);
  };

  if (checkingSavedAuth) {
    return (
      <div className="lock-screen">
        <div className="lock-card">
          <h1>RAGHU'S WORLD</h1>
          <p>Entering the workspace...</p>
        </div>
      </div>
    );
  }

  // Password Lock Screen Gate
  if (!isAuthenticated) {
    return (
      <div className="lock-screen">
        <div className="lock-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Lock size={48} style={{ color: 'var(--fun-yellow)' }} />
          </div>
          <h1>RAGHU'S WORLD</h1>
          <p>Please enter the secret password to enter the world! 🔑</p>
          <form onSubmit={handleLoginSubmit} className="password-form">
            <input 
              type="password" 
              className="password-input" 
              placeholder="Enter secret password..." 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              autoFocus
            />
            <button type="submit" className="unlock-btn">
              Unlock Portal 🚀
            </button>
            {passwordError && <div className="error-text">{passwordError}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <h1 className="funky-title">Raghu's World</h1>
        <div className="funky-subtitle">Interactive Student Portal 🌟</div>
      </header>

      {/* Navigation */}
      <nav className="nav-bar">
        <button 
          className={`nav-item home-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={18} />
          Home
        </button>

        {['2', '3', '4', '5', '6', '7', '8'].map(grade => (
          <button
            key={grade}
            className={`nav-item ${activeTab === grade ? 'active' : ''}`}
            onClick={() => setActiveTab(grade)}
          >
            <GraduationCap size={18} />
            {grade} Grade
          </button>
        ))}

        <button
          className={`nav-item admin-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <Settings size={18} />
          Admin
        </button>

        <button className="nav-item" onClick={handleLogout} style={{ marginLeft: 'auto', background: '#fee2e2', borderColor: '#ef4444', color: '#ef4444' }}>
          <LogOut size={18} />
          Lock Portal
        </button>
      </nav>

      {/* Main View Container */}
      <main className="main-content">
        {activeTab === 'home' && (
          <HomeDashboard 
            authToken={authToken} 
            role={role} 
            onLogout={handleLogout}
            onGoToAdmin={() => setActiveTab('admin')}
          />
        )}
        
        {activeTab >= '2' && activeTab <= '8' && (
          <GradeView 
            grade={activeTab} 
            authToken={authToken} 
            onLogout={handleLogout} 
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel 
            authToken={authToken} 
            role={role} 
            onAdminSuccess={handleAdminSuccess}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
}

export default App;
