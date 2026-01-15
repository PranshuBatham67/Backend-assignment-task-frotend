import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for active session on load
        const storedUser = authService.getCurrentUser();
        if (storedUser && authService.isAuthenticated()) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            setUser(response.user);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async (data) => {
        const response = await authService.register(data);
        return response;
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout failed locally", error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
