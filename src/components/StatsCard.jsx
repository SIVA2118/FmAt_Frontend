import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, trend, onClick }) => {
    return (
        <div
            className="stats-card"
            style={{
                borderTop: `4px solid ${color}`,
                cursor: onClick ? 'pointer' : 'default'
            }}
            onClick={onClick}
        >
            <div className="stats-header">
                <span className="stats-title">{title}</span>
                <div className="stats-icon" style={{ backgroundColor: `${color}20`, color: color }}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="stats-value">{value}</div>
            {trend && (
                <div className={`stats-trend ${trend > 0 ? 'positive' : 'negative'}`}>
                    {trend > 0 ? '+' : ''}{trend}% from yesterday
                </div>
            )}
        </div>
    );
};

export default StatsCard;
