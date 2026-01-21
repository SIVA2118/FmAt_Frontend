import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import {
    UserPlus, Save, Loader, AlertCircle, CheckCircle,
    User, Briefcase, MapPin, CreditCard, Phone, Heart, FileText
} from 'lucide-react';
import { JOB_ROLES } from '../utils/jobRoles';
import './CreateEmployee.css';

const FormContext = React.createContext(null);

const SectionHeader = ({ title, icon: Icon }) => (
    <div className="section-header-custom">
        {Icon && <Icon size={24} className="section-icon" />}
        <h3>{title}</h3>
    </div>
);

const InputGroup = ({ label, name, type = 'text', required = false, options = null }) => {
    const { formData, handleChange } = React.useContext(FormContext);
    const inputId = `field-${name}`;

    return (
        <div className="input-group">
            <label className="input-label" htmlFor={inputId}>
                {label} {required && <span className="required-star">*</span>}
            </label>
            {options ? (
                <select
                    id={inputId}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="form-select"
                >
                    <option value="">Select {label}</option>
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            ) : (
                <input
                    id={inputId}
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required={required}
                    className="form-input"
                />
            )}
        </div>
    );
};

const CreateEmployee = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        // Account
        name: '', email: '', password: '',

        // Personal
        dob: '', gender: 'Male', maritalStatus: 'Single', bloodGroup: '',
        fatherName: '', motherName: '',

        // Contact
        phone: '', personalEmail: '',
        emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '',

        // Address
        currentAddress: '', permanentAddress: '',

        // Identity
        aadharNumber: '', panNumber: '',

        // Professional
        joiningDate: '', department: '', designation: '',
        employmentType: 'Full-Time', status: 'Active', salary: '',

        // Bank
        bankAccountName: '', bankAccountNumber: '', bankIfscCode: '', bankName: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const payload = {
            ...formData,
            emergencyContact: {
                name: formData.emergencyContactName,
                relation: formData.emergencyContactRelation,
                phone: formData.emergencyContactPhone
            },
            bankDetails: {
                accountName: formData.bankAccountName,
                accountNumber: formData.bankAccountNumber,
                ifscCode: formData.bankIfscCode,
                bankName: formData.bankName
            }
        };

        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;

            const response = await fetch('http://localhost:5000/api/admin/register-employee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create employee');
            }

            setSuccess('Employee created successfully!');
            window.scrollTo(0, 0);
            setFormData({
                name: '', email: '', password: '',
                dob: '', gender: 'Male', maritalStatus: 'Single', bloodGroup: '',
                fatherName: '', motherName: '',
                phone: '', personalEmail: '',
                emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '',
                currentAddress: '', permanentAddress: '',
                aadharNumber: '', panNumber: '',
                joiningDate: '', department: '', designation: '',
                employmentType: 'Full-Time', status: 'Active', salary: '',
                bankAccountName: '', bankAccountNumber: '', bankIfscCode: '', bankName: ''
            });

        } catch (err) {
            console.error(err);
            setError(err.message);
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Header toggleSidebar={toggleSidebar} />
            <div className="dashboard-content-wrapper">
                <Sidebar isOpen={sidebarOpen} />
                <main className="main-content" style={{ padding: 0, backgroundColor: '#0f172a' }}>
                    <FormContext.Provider value={{ formData, handleChange }}>
                        <div className="create-employee-wrapper">
                            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                                <div className="page-header-custom">
                                    <h2>Add New Employee</h2>
                                </div>

                                <form onSubmit={handleSubmit} className="glass-container">
                                    <div className="glass-content">
                                        {error && (
                                            <div className="alert alert-error">
                                                <AlertCircle size={20} />
                                                <span>{error}</span>
                                            </div>
                                        )}
                                        {success && (
                                            <div className="alert alert-success">
                                                <CheckCircle size={20} />
                                                <span>{success}</span>
                                            </div>
                                        )}

                                        {/* Account Details */}
                                        <div style={{ marginBottom: '2rem' }}>
                                            <SectionHeader title="Account Information" icon={UserPlus} />
                                            <div className="form-grid-3">
                                                <InputGroup label="Full Name" name="name" required />
                                                <InputGroup label="Official Email" name="email" type="email" required />
                                                <InputGroup label="Password" name="password" type="password" required />
                                            </div>
                                        </div>

                                        {/* Personal Information */}
                                        <SectionHeader title="Personal Information" icon={User} />
                                        <div className="form-grid">
                                            <InputGroup label="Date of Birth" name="dob" type="date" />
                                            <InputGroup label="Gender" name="gender" options={['Male', 'Female', 'Other']} />
                                            <InputGroup label="Marital Status" name="maritalStatus" options={['Single', 'Married', 'Divorced', 'Widowed']} />
                                            <InputGroup label="Blood Group" name="bloodGroup" />
                                            <InputGroup label="Father's Name" name="fatherName" />
                                            <InputGroup label="Mother's Name" name="motherName" />
                                        </div>

                                        {/* Contact Information */}
                                        <SectionHeader title="Contact Information" icon={Phone} />
                                        <div className="form-grid-2">
                                            <InputGroup label="Phone Number" name="phone" required />
                                            <InputGroup label="Personal Email" name="personalEmail" type="email" />
                                        </div>

                                        <div className="sub-header">Emergency Contact</div>
                                        <div className="form-grid-3">
                                            <InputGroup label="Contact Name" name="emergencyContactName" />
                                            <InputGroup label="Relation" name="emergencyContactRelation" />
                                            <InputGroup label="Phone" name="emergencyContactPhone" />
                                        </div>

                                        {/* Address */}
                                        <SectionHeader title="Address Details" icon={MapPin} />
                                        <div className="form-grid">
                                            <div className="input-group">
                                                <label className="input-label" htmlFor="field-currentAddress">Current Address</label>
                                                <textarea
                                                    id="field-currentAddress"
                                                    name="currentAddress"
                                                    value={formData.currentAddress}
                                                    onChange={handleChange}
                                                    className="form-textarea"
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label" htmlFor="field-permanentAddress">Permanent Address</label>
                                                <textarea
                                                    id="field-permanentAddress"
                                                    name="permanentAddress"
                                                    value={formData.permanentAddress}
                                                    onChange={handleChange}
                                                    className="form-textarea"
                                                />
                                            </div>
                                        </div>

                                        {/* Identity */}
                                        <SectionHeader title="Identity Proofs" icon={FileText} />
                                        <div className="form-grid-2">
                                            <InputGroup label="Aadhar Number" name="aadharNumber" />
                                            <InputGroup label="PAN Number" name="panNumber" />
                                        </div>

                                        {/* Professional Details */}
                                        <SectionHeader title="Professional Details" icon={Briefcase} />
                                        <div className="form-grid">
                                            <InputGroup label="Designation" name="designation" required options={JOB_ROLES} />
                                            <InputGroup label="Department" name="department" />
                                            <InputGroup label="Joining Date" name="joiningDate" type="date" />
                                            <InputGroup label="Employment Type" name="employmentType" options={['Full-Time', 'Part-Time', 'Contract', 'Intern']} />
                                            <InputGroup label="Status" name="status" options={['Active', 'Inactive']} />
                                            <InputGroup label="Salary (CTC)" name="salary" type="number" />
                                        </div>

                                        {/* Bank Details */}
                                        <SectionHeader title="Bank Details" icon={CreditCard} />
                                        <div className="form-grid-2">
                                            <InputGroup label="Bank Name" name="bankName" />
                                            <InputGroup label="Account Holder Name" name="bankAccountName" />
                                            <InputGroup label="Account Number" name="bankAccountNumber" />
                                            <InputGroup label="IFSC Code" name="bankIfscCode" />
                                        </div>

                                        {/* Actions */}
                                        <div className="button-group">
                                            <button type="button" className="btn-cancel">
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="btn-submit"
                                            >
                                                {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                                                {loading ? 'Creating...' : 'Create Employee'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </FormContext.Provider>
                </main>
            </div>
        </div>
    );
};

export default CreateEmployee;
