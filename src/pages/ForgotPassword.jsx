import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { passwordResetService } from '../services/passwordResetService';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Password strength indicator
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

        return {
            strength,
            label: labels[strength - 1] || 'Very Weak',
            color: colors[strength - 1] || 'bg-red-500'
        };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await passwordResetService.requestPasswordReset(email);
            toast.success('OTP sent to your email! Please check your inbox.');
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!otp) {
            toast.error('Please enter the OTP');
            return;
        }

        if (otp.length !== 6) {
            toast.error('OTP must be 6 digits');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            await passwordResetService.resetPassword(email, otp, newPassword);
            toast.success('Password reset successfully! Please login with your new password.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {step === 1 ? 'Reset your password' : 'Enter OTP & New Password'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            return to login
                        </Link>
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {step === 1 ? (
                            <>
                                <p className="mb-6 text-sm text-gray-600">
                                    Enter your email address and we'll send you a 6-digit  OTP to reset your password.
                                </p>
                                <form className="space-y-6" onSubmit={handleSendOTP}>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email address
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="input-field"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full btn btn-primary flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                            {loading ? 'Sending OTP...' : 'Send OTP'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <form className="space-y-6" onSubmit={handleResetPassword}>
                                <div className="text-center mb-4">
                                    <p className="text-sm text-gray-600">
                                        OTP sent to <strong>{email}</strong>
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-xs text-primary-600 hover:text-primary-500 mt-1"
                                    >
                                        Change email
                                    </button>
                                </div>

                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                        Enter 6-Digit OTP
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="otp"
                                            name="otp"
                                            type="text"
                                            required
                                            maxLength="6"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="input-field text-center text-2xl tracking-widest font-bold"
                                            placeholder="000000"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Check your email for the OTP code
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="newPassword"
                                            name="newPassword"
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="input-field"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    {newPassword && (
                                        <div className="mt-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-gray-600">Password strength:</span>
                                                <span className={`text-xs font-medium ${passwordStrength.strength >= 4 ? 'text-green-600' : 'text-gray-600'}`}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                                                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                    <p className="mt-2 text-xs text-gray-500">
                                        Must contain 8+ characters, uppercase, lowercase, and number.
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="input-field"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                                    )}
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading || newPassword !== confirmPassword || otp.length !== 6}
                                        className="w-full btn btn-primary flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Resetting password...' : 'Reset Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
