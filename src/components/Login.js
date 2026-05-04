import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export default function Login({ onLogin, onSwitch }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            onLogin(data.token, data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 style={{ marginBottom: '24px', textAlign: 'center' }}> Вход</h1>
                {error && <div style={{ background: '#fed7d7', color: '#c53030', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Загрузка...' : 'Войти'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '16px' }}>
                    Нет аккаунта? <button onClick={onSwitch} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer' }}>Регистрация</button>
                </p>
            </div>
        </div>
    );
}