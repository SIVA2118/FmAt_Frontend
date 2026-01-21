import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, Search } from 'lucide-react';
import XLSX from 'xlsx-js-style';

const AttendanceSheet = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        fetchMonthlyAttendance();
    }, [currentDate]);

    const fetchMonthlyAttendance = async () => {
        setLoading(true);
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();

            const response = await fetch(`http://localhost:5000/api/attendance/monthly?month=${month}&year=${year}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setAttendanceData(data);
            }
        } catch (error) {
            console.error('Error fetching monthly attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (e) => {
        const [year, month] = e.target.value.split('-');
        setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, 1));
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const daysArray = [];
        for (let i = 1; i <= days; i++) {
            daysArray.push(new Date(year, month, i));
        }
        return daysArray;
    };

    const days = getDaysInMonth(currentDate);

    const getStatusForDay = (employee, day) => {
        const dateStr = day.toISOString().split('T')[0];
        const status = employee.attendance[dateStr];
        return status ? 'P' : 'A'; // P for Present, A for Absent
    };

    // Filter Logic
    const filteredData = attendanceData.filter(emp => {
        const term = searchTerm.toLowerCase();
        return (
            emp.name.toLowerCase().includes(term) ||
            emp._id.toLowerCase().includes(term)
        );
    });

    const exportToExcel = () => {
        // Build data for Excel using filteredData
        const exportData = filteredData.map(emp => {
            const row = {
                'ID': emp._id.slice(-4),
                'Employee Name': emp.name,
                'Month': currentDate.toLocaleString('default', { month: 'long' })
            };
            days.forEach(day => {
                const dateHeader = day.getDate().toString();
                row[dateHeader] = getStatusForDay(emp, day);
            });
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(exportData);

        // Apply Styles
        if (ws['!ref']) {
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
                    const cell = ws[cell_address];
                    if (!cell) continue;

                    // Style Headers
                    if (R === 0) {
                        cell.s = {
                            font: { bold: true, color: { rgb: "FFFFFF" } },
                            fill: { fgColor: { rgb: "4F46E5" } }, // Indigo Header
                            alignment: { horizontal: "center" }
                        };
                    } else {
                        // Style Content
                        if (cell.v === 'P') {
                            cell.s = {
                                font: { color: { rgb: "008000" }, bold: true }, // Green
                                alignment: { horizontal: "center" }
                            };
                        } else if (cell.v === 'A') {
                            cell.s = {
                                font: { color: { rgb: "FF0000" }, bold: true }, // Red
                                alignment: { horizontal: "center" }
                            };
                        } else {
                            // Default alignment
                            if (!cell.s) cell.s = {};
                            cell.s.alignment = { horizontal: "center" };
                        }
                    }
                }
            }
        }

        // Auto-width columns
        const wscols = [
            { wch: 10 }, // ID
            { wch: 25 }, // Name
            { wch: 15 }, // Month
        ];
        // Add width for days
        for (let i = 0; i < 31; i++) wscols.push({ wch: 4 });
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance Sheet");
        XLSX.writeFile(wb, `Attendance_${currentDate.toLocaleString('default', { month: 'long' })}_${currentDate.getFullYear()}.xlsx`);
    };

    return (
        <div className="dashboard-container">
            <Header toggleSidebar={toggleSidebar} />
            <div className="dashboard-content-wrapper">
                <Sidebar isOpen={sidebarOpen} />
                <main className="main-content fade-in">
                    <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2>Attendance Sheet</h2>
                                <p className="sub-header" style={{ margin: '0.25rem 0 0 0', textTransform: 'none', color: 'var(--text-secondary)' }}>
                                    Monthly overview with smart filters.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {/* Date Filter */}
                                <div className="glass-panel" style={{ padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="month"
                                        value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`}
                                        onChange={handleMonthChange}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-primary)',
                                            fontWeight: '600',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            paddingRight: '0.5rem'
                                        }}
                                    />
                                </div>

                                {/* Export */}
                                <button onClick={exportToExcel} className="btn-submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem' }}>
                                    <Download size={18} /> Export
                                </button>
                            </div>
                        </div>

                        {/* Search Filter Box */}
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                            <div className="glass-input-container" style={{ flex: 1, maxWidth: '400px', display: 'flex', alignItems: 'center', padding: '0.6rem 1rem' }}>
                                <Search size={18} style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }} />
                                <input
                                    type="text"
                                    placeholder="Search by Name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-primary)',
                                        width: '100%',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '1000px' }}>
                                <thead style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderBottom: '1px solid var(--glass-border)' }}>
                                    <tr>
                                        <th style={{ position: 'sticky', left: 0, zIndex: 10, backgroundColor: '#161e2e', padding: '1rem', textAlign: 'left', minWidth: '200px', borderRight: '1px solid var(--glass-border)', color: 'var(--primary-blue)' }}>Employee</th>
                                        {days.map(day => (
                                            <th key={day.toISOString()} style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '30px' }}>
                                                <div style={{ fontWeight: 'bold' }}>{day.getDate()}</div>
                                                <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>{day.toLocaleString('default', { weekday: 'narrow' })}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={days.length + 1} style={{ padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</td>
                                        </tr>
                                    ) : filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan={days.length + 1} style={{ padding: '3rem', color: 'var(--text-secondary)' }}>
                                                {attendanceData.length === 0 ? "No employees found." : "No matching records found."}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData.map(emp => (
                                            <tr key={emp._id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="hover:bg-white/5">
                                                <td style={{ position: 'sticky', left: 0, zIndex: 10, backgroundColor: '#111827', padding: '0.75rem 1rem', textAlign: 'left', borderRight: '1px solid var(--glass-border)' }}>
                                                    <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{emp.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        #{emp._id.slice(-4)}
                                                    </div>
                                                </td>
                                                {days.map(day => {
                                                    const status = getStatusForDay(emp, day);
                                                    const isWeekend = day.getDay() === 0; // Sunday
                                                    return (
                                                        <td key={day.toISOString()} style={{ padding: '0.5rem', backgroundColor: isWeekend ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                                            <span style={{
                                                                display: 'inline-block',
                                                                width: '24px',
                                                                height: '24px',
                                                                lineHeight: '24px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold',
                                                                color: status === 'P' ? '#22c55e' : '#ef4444',
                                                                backgroundColor: status === 'P' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                                                            }}>
                                                                {status}
                                                            </span>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AttendanceSheet;
