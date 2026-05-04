import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [view, setView] = useState('login');

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    const handleLogin = (token, userData) => {
        setToken(token);
        setUser(userData);
        setView('dashboard');
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        setView('login');
    };

    if (!token) {
        if (view === 'register') {
            return <Register onRegister={handleLogin} onSwitch={() => setView('login')} />;
        }
        return <Login onLogin={handleLogin} onSwitch={() => setView('register')} />;
    }

    return <Dashboard token={token} user={user} onLogout={handleLogout} />;
}

export default App;