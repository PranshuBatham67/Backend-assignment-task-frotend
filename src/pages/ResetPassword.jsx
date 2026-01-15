import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { passwordResetService } from '../services/passwordResetService';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

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

    useEffect(() => {
        const resetToken = searchParams.get('token');
        if (!resetToken) {
            toast.error('Invalid reset link');
            navigate('/login');
            return;
        }

        setToken(resetToken);
        verifyToken(resetToken);
    }, [searchParams, navigate]);

    const verifyToken = async (resetToken) => {
        try {
            const result = await passwordResetService.verifyResetToken(resetToken);
            if (result.valid) {
                setTokenValid(true);
                setEmail(result.email);
            } else {
                toast.error('This reset link is invalid or has expired');
                setTimeout(() => navigate('/forgot-password'), 2000);
            }
        } catch (error) {
            toast.error('Failed to verify reset link');
            setTimeout(() => navigate('/forgot-password'), 2000);
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            toast.error('Password must contain at least one uppercase letter');
            return;
        }

        if (!/[a-z]/.test(newPassword)) {
            toast.error('Password must contain at least one lowercase letter');
            return;
        }

        if (!/\d/.test(newPassword)) {
            toast.error('Password must contain at least one number');
            return;
        }

        setLoading(true);
        try {
            await passwordResetService.resetPassword(token, newPassword);
            toast.success('Password reset successfully! Please login with your new password.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Verifying reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Set new password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        For {email}
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>
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
                                    disabled={loading || newPassword !== confirmPassword}
                                    className="w-full btn btn-primary flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Resetting password...' : 'Reset password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
