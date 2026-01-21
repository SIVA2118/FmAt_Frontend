import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Search, FileText, Download, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

const Reports = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);

    // Filter states
    const [filterType, setFilterType] = useState('all'); // 'all', 'date', 'month', 'year'
    const [filterValue, setFilterValue] = useState(new Date().toISOString().split('T')[0]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            // Assuming API is running on port 5000 as per other files
            const response = await fetch('http://localhost:5000/api/reports/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setReports(data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = (report.employeeId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (report.employeeId?._id || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filterType === 'all') return true;

        const reportDate = new Date(report.date);
        const filterD = new Date(filterValue);

        if (filterType === 'date') {
            return reportDate.toDateString() === filterD.toDateString();
        } else if (filterType === 'month') {
            return reportDate.getMonth() === filterD.getMonth() && reportDate.getFullYear() === filterD.getFullYear();
        } else if (filterType === 'year') {
            return reportDate.getFullYear() === filterD.getFullYear();
        }
        return true;
    });

    const exportToExcel = () => {
        const dataToExport = filteredReports.map(report => ({
            Employee: report.employeeId?.name || 'Unknown',
            Department: report.employeeId?.department || '-',
            Date: new Date(report.date).toLocaleDateString(),
            Title: report.title,
            Description: report.description,
            Status: report.status
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reports");
        XLSX.writeFile(wb, `Reports_${filterType}_${filterValue}.xlsx`);
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`http://localhost:5000/api/reports/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                // Optimistic update
                setReports(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
            } else {
                console.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' };
            case 'Reviewed': return { bg: 'rgba(124, 58, 237, 0.1)', text: '#a78bfa', border: 'rgba(124, 58, 237, 0.3)' };
            case 'viewed': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
            default: return { bg: 'rgba(234, 179, 8, 0.1)', text: '#facc15', border: 'rgba(234, 179, 8, 0.3)' };
        }
    };

    return (
        <div className="dashboard-container">
            <Header toggleSidebar={toggleSidebar} />
            <div className="dashboard-content-wrapper">
                <Sidebar isOpen={sidebarOpen} />
                <main className="main-content fade-in">
                    <div className="page-header">
                        <div>
                            <h2>Employee Reports</h2>
                            <p className="sub-header" style={{ margin: '0.25rem 0 0 0', textTransform: 'none', color: 'var(--text-secondary)' }}>
                                View and manage reports submitted by employees.
                            </p>
                        </div>
                    </div>

                    {/* Filters, Search and Export */}
                    <div className="glass-panel" style={{ padding: '1rem', borderRadius: '16px 16px 0 0', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>

                        {/* Search */}
                        <div style={{ position: 'relative', width: '250px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input"
                                style={{ paddingLeft: '2.5rem', backgroundColor: 'rgba(17, 24, 39, 0.5)' }}
                            />
                        </div>

                        {/* Filters */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="form-input"
                                style={{ width: 'auto', backgroundColor: 'rgba(17, 24, 39, 0.5)' }}
                            >
                                <option value="all">All Time</option>
                                <option value="date">Specific Date</option>
                                <option value="month">Specific Month</option>
                                <option value="year">Specific Year</option>
                            </select>

                            {filterType !== 'all' && (
                                <input
                                    type={filterType === 'date' ? 'date' : filterType === 'month' ? 'month' : 'number'}
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                    className="form-input"
                                    style={{ width: 'auto', backgroundColor: 'rgba(17, 24, 39, 0.5)' }}
                                    placeholder={filterType === 'year' ? "YYYY" : ""}
                                    min={filterType === 'year' ? "2000" : ""}
                                    max={filterType === 'year' ? "2100" : ""}
                                />
                            )}

                            <button
                                onClick={exportToExcel}
                                className="btn-submit"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem' }}
                            >
                                <Download size={18} />
                                Export Excel
                            </button>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ borderRadius: '0 0 16px 16px', borderTop: 'none', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderBottom: '1px solid var(--glass-border)' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading reports...</td>
                                    </tr>
                                ) : filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No reports found.</td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }} className="hover:bg-white/5">
                                            <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.85rem' }} title={report.employeeId?._id}>
                                                #{report.employeeId?._id ? report.employeeId._id.slice(-4) : '????'}
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div style={{
                                                        height: '2rem', width: '2rem', borderRadius: '50%',
                                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'var(--primary-blue)', marginRight: '0.75rem'
                                                    }}>
                                                        <FileText size={14} />
                                                    </div>
                                                    <div>
                                                        <div
                                                            onClick={() => setSelectedReport(report)}
                                                            style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)', cursor: 'pointer' }}
                                                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                                        >
                                                            {report.employeeId?.name || 'Unknown'}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{report.employeeId?.department}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {new Date(report.date).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>{report.title}</td>
                                            <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {report.description}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <select
                                                    value={report.status}
                                                    onChange={(e) => updateStatus(report._id, e.target.value)}
                                                    style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '500',
                                                        backgroundColor: getStatusColor(report.status).bg,
                                                        color: getStatusColor(report.status).text,
                                                        border: `1px solid ${getStatusColor(report.status).border}`,
                                                        cursor: 'pointer',
                                                        outline: 'none',
                                                        appearance: 'none', // Remove default arrow if desired, or keep it
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {['Pending', 'viewed', 'Reviewed', 'Approved'].map(status => (
                                                        <option key={status} value={status} style={{ backgroundColor: '#1e293b', color: '#FFF' }}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {selectedReport && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000,
                            backdropFilter: 'blur(5px)'
                        }} onClick={() => setSelectedReport(null)}>
                            <div
                                className="progress-report-card"
                                style={{
                                    width: '100%',
                                    maxWidth: '500px',
                                    backgroundColor: 'white',
                                    padding: '1.5rem',
                                    borderRadius: '4px',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                    color: '#1f2937',
                                    fontFamily: 'sans-serif'
                                }}
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div style={{ color: '#eab308' }}> {/* Yellow/Gold icon */}
                                        <FileText size={40} strokeWidth={1.5} />
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, letterSpacing: '0.05em', color: '#000' }}>PROJECT REPORT</h1>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#000', marginTop: '0.2rem' }}>FlarMinds Technologies</div>
                                    </div>
                                </div>

                                {/* Student/Employee Name Bar */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>Employee Name</div>
                                    <div style={{ backgroundColor: '#e5e7eb', padding: '0.75rem 1rem', borderRadius: '4px', fontWeight: '600', color: '#000' }}>
                                        {selectedReport.employeeId?.name || 'Unknown'}
                                    </div>
                                </div>

                                {/* Section & Adviser / Dept & ID */}
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>Department</div>
                                        <div style={{ backgroundColor: '#e5e7eb', padding: '0.75rem 1rem', borderRadius: '4px', fontWeight: '600', color: '#000' }}>
                                            {selectedReport.employeeId?.department || '-'}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem', color: '#374151' }}>Employee ID</div>
                                        <div style={{ backgroundColor: '#e5e7eb', padding: '0.75rem 1rem', borderRadius: '4px', fontWeight: '600', color: '#000' }}>
                                            #{selectedReport.employeeId?._id ? selectedReport.employeeId._id.slice(-4) : '????'}
                                        </div>
                                    </div>
                                </div>

                                {/* Grade Code / Status Section */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ backgroundColor: '#eab308', padding: '0.5rem 1rem', textAlign: 'center', fontWeight: '700', letterSpacing: '0.1em', color: '#000', marginBottom: '1rem' }}>
                                        STATUS
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '0 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                            <div style={{ fontWeight: '700' }}>Current Status:</div>
                                            <div style={{
                                                padding: '0.25rem 1rem',
                                                borderRadius: '4px',
                                                backgroundColor: getStatusColor(selectedReport.status).bg,
                                                color: getStatusColor(selectedReport.status).text,
                                                border: `1px solid ${getStatusColor(selectedReport.status).border}`,
                                                fontWeight: '600'
                                            }}>
                                                {selectedReport.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills Development / Report Title & Details */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ backgroundColor: '#eab308', padding: '0.5rem 1rem', textAlign: 'center', fontWeight: '700', letterSpacing: '0.1em', color: '#000', marginBottom: '1.5rem' }}>
                                        REPORT DETAILS
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ width: '120px', fontWeight: '700', color: '#374151' }}>Title</div>
                                            <div style={{ flex: 1, borderBottom: '1px solid #9ca3af', paddingBottom: '0.25rem', paddingLeft: '0.5rem' }}>
                                                {selectedReport.title}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ width: '120px', fontWeight: '700', color: '#374151' }}>Date</div>
                                            <div style={{ flex: 1, borderBottom: '1px solid #9ca3af', paddingBottom: '0.25rem', paddingLeft: '0.5rem' }}>
                                                {new Date(selectedReport.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments / Description */}
                                <div style={{ display: 'flex' }}>
                                    <div style={{
                                        backgroundColor: '#eab308',
                                        width: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        writingMode: 'vertical-rl',
                                        transform: 'rotate(180deg)',
                                        fontWeight: '700',
                                        letterSpacing: '0.1em',
                                        padding: '1rem 0',
                                        color: '#000'
                                    }}>
                                        DESCRIPTION
                                    </div>
                                    <div style={{ flex: 1, backgroundColor: '#e5e7eb', padding: '1rem', minHeight: '100px', whiteSpace: 'pre-wrap' }}>
                                        {selectedReport.description}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Reports;
