import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

interface AuthContextType {
    user: any; // Ideally use your User interface here
    login: (userData: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);

    // On mount, check if user is already logged in (optional check)
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    const login = (userData: any) => {
        setUser(userData.user); // Assuming the API response has a 'user' field
        localStorage.setItem('user', JSON.stringify(userData.user)); // Save only the user object, not the entire response
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};