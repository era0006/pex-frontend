import React, { useState } from 'react';

export default function StockCard({ stock, currentUser, onBuy, holdings }) {
    const [shares, setShares] = useState(1);
    const userHolding = holdings.find(h => h.ticker === stock.ticker);
    const ownedShares = userHolding?.shares || 0;
    const isOwner = stock.ownerId === currentUser?.id;

    const handleBuy = () => { if (shares > 0) onBuy(stock.ticker, shares); };

    return (
        <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                    <h3 style={{ fontSize: '24px' }}>{stock.ticker}</h3>
                    <p style={{ color: '#718096' }}>{stock.name}</p>
                    <p>Владелец: {stock.ownerName}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>${stock.price}</p>
                    {ownedShares > 0 && <p style={{ color: '#48bb78' }}>У вас: {ownedShares} акций</p>}
                </div>
            </div>
            
            {!isOwner && (
                <div style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="number" min="1" value={shares} onChange={(e) => setShares(parseInt(e.target.value) || 0)} style={{ width: '100px', margin: 0 }} />
                    <button className="btn btn-primary" onClick={handleBuy}>Купить {shares} акц.{shares !== 1 ? 'ий' : 'ия'}</button>
                </div>
            )}
            
            {isOwner && <p style={{ marginTop: '12px', color: '#ecc94b' }}>⭐ Ваша компания</p>}
        </div>
    );
}