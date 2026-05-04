import React, { useState, useEffect, useCallback } from 'react';
import StockCard from './StockCard';
import Portfolio from './Portfolio';

const API_URL = process.env.REACT_APP_API_URL;
const WS_URL = process.env.REACT_APP_WS_URL;

export default function Dashboard({ token, user, onLogout }) {
    const [stocks, setStocks] = useState([]);
    const [balance, setBalance] = useState(user?.balance || 10000);
    const [holdings, setHoldings] = useState(user?.holdings || []);
    const [ws, setWs] = useState(null);
    const [myStock, setMyStock] = useState(null);

    const calculateNetWorth = useCallback(() => {
        let stocksValue = 0;
        holdings.forEach(holding => {
            const stock = stocks.find(s => s.ticker === holding.ticker);
            if (stock) stocksValue += stock.price * holding.shares;
        });
        return balance + stocksValue;
    }, [balance, holdings, stocks]);

    const loadStocks = async () => {
        try {
            const res = await fetch(`${API_URL}/api/stocks`);
            const data = await res.json();
            setStocks(data);
            const myStockData = data.find(s => s.ownerId === user?.id);
            setMyStock(myStockData);
        } catch (err) {
            console.error('Ошибка загрузки акций:', err);
        }
    };

    const connectWebSocket = useCallback(() => {
        const socket = new WebSocket(WS_URL, [`jwt_${token}`]);
        socket.onopen = () => console.log('WebSocket подключен');
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'TICKER_UPDATE') {
                setStocks(prev => prev.map(s =>
                    s.ticker === data.payload.ticker ? { ...s, price: data.payload.price } : s
                ));
                
                setMyStock(prev => {
                    if (prev && prev.ticker === data.payload.ticker) {
                        return { ...prev, price: data.payload.price };
                    }
                    return prev;
                });
            }
        };
        socket.onclose = () => setTimeout(() => connectWebSocket(), 3000);
        setWs(socket);
    }, [token]);

    useEffect(() => {
        loadStocks();
        connectWebSocket();
        return () => { if (ws) ws.close(); };
    }, []);

    const updatePrice = async (ticker, newPrice) => {
        try {
            const res = await fetch(`${API_URL}/api/stocks/${ticker}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ price: newPrice })
            });
            if (!res.ok) { const err = await res.json(); alert(err.error); }
        } catch { alert('Ошибка обновления цены'); }
    };

    const buyStock = async (ticker, shares) => {
        try {
            const res = await fetch(`${API_URL}/api/buy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ticker, shares })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setBalance(data.balance);
            setHoldings(data.holdings);
        } catch (err) { alert(err.message); }
    };

    const sellStock = async (ticker, shares) => {
        try {
            const res = await fetch(`${API_URL}/api/sell`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ticker, shares })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setBalance(data.balance);
            setHoldings(data.holdings);
        } catch (err) { alert(err.message); }
    };

    const netWorth = calculateNetWorth();

    return (
        <div className="container">
            <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Личная биржа</h1>
                        <h2>Добро пожаловать, <strong>{user?.username}</strong></h2>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p><strong>Баланс:</strong> ${balance.toFixed(2)}</p>
                        <p><strong>Капитал:</strong> ${netWorth.toFixed(2)}</p>
                        <button onClick={onLogout} className="btn btn-danger">Выйти</button>
                    </div>
                </div>
            </div>
            
            {myStock && (
                <div className="card" style={{ marginBottom: '20px', background: '#f0fff4', border: '2px solid #48bb78' }}>
                    <h2>Ваша компания: {myStock.ticker}</h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span>Текущая цена: ${myStock.price}</span>
                        <input type="number" id="newPrice" placeholder="Новая цена" style={{ width: '120px', margin: 0 }} />
                        <button className="btn btn-primary" onClick={() => {
                            const newPrice = parseFloat(document.getElementById('newPrice').value);
                            if (newPrice > 0) updatePrice(myStock.ticker, newPrice);
                        }}>Обновить цену</button>
                    </div>
                </div>
            )}
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 2 }}>
                    <h2>📈 Рынок</h2>
                    {stocks.map(stock => (
                        <StockCard key={stock.ticker} stock={stock} currentUser={user} onBuy={buyStock} holdings={holdings} />
                    ))}
                </div>
                <div style={{ flex: 1 }}>
                    <Portfolio holdings={holdings} stocks={stocks} onSell={sellStock} />
                </div>
            </div>
        </div>
    );
}