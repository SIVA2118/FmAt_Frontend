import React from 'react';
import { Cloud, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: '12th Jan', active: 70000, bio: 98000, personal: 5000 },
    { name: '13th Jan', active: 72000, bio: 100000, personal: 4500 },
    { name: '14th Jan', active: 68000, bio: 90000, personal: 4000 },
    { name: '15th Jan', active: 71000, bio: 95000, personal: 3800 },
    { name: '16th Jan', active: 73000, bio: 100000, personal: 4200 },
    { name: '17th Jan', active: 25000, bio: 30000, personal: 1000 },
    { name: '18th Jan', active: 8000, bio: 10000, personal: 500 },
];

const ProgressBar = ({ label, value, max, color, countLabel }) => {
    const percentage = (value / max) * 100;
    return (
        <div className="progress-item" style={{ marginBottom: '1.5rem' }}>
            <div className="progress-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>
                <span>{label}</span>
                <span>{countLabel}</span>
            </div>
            <div className="progress-bg" style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                    className="progress-fill"
                    style={{
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: color,
                        borderRadius: '4px'
                    }}
                />
            </div>
        </div>
    );
};

const StatFooterItem = ({ value, label, color, unit }) => (
    <div className="stat-footer-item" style={{ textAlign: 'center', flex: 1, padding: '1rem', borderRight: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '2rem', fontWeight: '600', color: color, marginBottom: '0.25rem' }}>
            {value} <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: '400' }}>{unit}</span>
        </div>
        <div style={{ fontSize: '0.875rem', color: '#374151' }}>{label}</div>
    </div>
);

const AttendanceStatistics = () => {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="chart-card attendance-stats-card" style={{ gridColumn: '1 / -1' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
                    <Cloud size={24} color="#374151" fill="#374151" />
                    Attendance Statistics - <span style={{ color: '#059669', fontWeight: '400' }}>as on: {today}</span>
                </h3>
                <div className="minimize-btn">
                    <Minus size={20} color="#9ca3af" style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '2px', cursor: 'pointer' }} />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="stats-content-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2rem' }}>

                {/* Left: Chart */}
                <div className="stats-chart-area">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area type="monotone" dataKey="active" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} />
                            <Area type="monotone" dataKey="bio" stroke="#22c55e" fillOpacity={0.1} fill="#22c55e" strokeWidth={2} dot={{ r: 4, fill: "#22c55e" }} />
                            <Area type="monotone" dataKey="personal" stroke="#6366f1" fillOpacity={0.1} fill="#6366f1" strokeWidth={2} dot={{ r: 4, fill: "#6366f1" }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Right: Progress Bars */}
                <div className="stats-progress-area" style={{ padding: '0 1rem' }}>
                    <ProgressBar
                        label="Active User"
                        value={350415}
                        max={384239}
                        countLabel="350415 / 384239"
                        color="#3b82f6"
                    />

                    <ProgressBar
                        label="Desktop Device"
                        value={2726}
                        max={3100}
                        countLabel="2726 / 3100"
                        color="#0ea5e9"
                    />
                    <ProgressBar
                        label="Personal Device"
                        value={257511}
                        max={200000}
                        countLabel="257511"
                        color="#ef4444"
                    />
                </div>
            </div>

            {/* Footer Stats */}
            <div className="stats-footer" style={{ display: 'flex', borderTop: '1px solid #e5e7eb', paddingTop: '0' }}>
                <StatFooterItem value="09:36" label="Average In-Time" color="#ea580c" />
                <StatFooterItem value="17:40" label="Average Out-Time" color="#7e22ce" />
                <StatFooterItem value="0.66" unit="sec" label="Authentication Time" color="#0d9488" />
            </div>
        </div>
    );
};

export default AttendanceStatistics;
