import React from 'react';

export default function Portfolio({ holdings, stocks, onSell }) {
    const totalValue = holdings.reduce((total, holding) => {
        const stock = stocks.find(s => s.ticker === holding.ticker);
        return total + (stock ? stock.price * holding.shares : 0);
    }, 0);

    if (holdings.length === 0) {
        return (
            <div className="card">
                <h2>📋 Ваш портфель</h2>
                <p style={{ color: '#718096', textAlign: 'center', padding: '20px' }}>
                    У вас пока нет акций. Купите что-нибудь!
                </p>
            </div>
        );
    }

    return (
        <div className="card">
            <h2>📋 Ваш портфель</h2>
            <p style={{ marginBottom: '16px', color: '#718096' }}>Общая стоимость: ${totalValue.toFixed(2)}</p>
            {holdings.map(holding => {
                const stock = stocks.find(s => s.ticker === holding.ticker);
                return (
                    <div key={holding.ticker} style={{ borderBottom: '1px solid #e2e8f0', padding: '12px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>{holding.ticker}</strong>
                                <div style={{ color: '#718096', fontSize: '14px' }}>
                                    {holding.shares} акций @ ${stock?.price} = ${((stock?.price || 0) * holding.shares).toFixed(2)}
                                </div>
                            </div>
                            <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => {
                                const sharesToSell = prompt(`Сколько акций ${holding.ticker} продать? (макс. ${holding.shares})`);
                                if (sharesToSell && parseInt(sharesToSell) > 0 && parseInt(sharesToSell) <= holding.shares) {
                                    onSell(holding.ticker, parseInt(sharesToSell));
                                }
                            }}>Продать</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}