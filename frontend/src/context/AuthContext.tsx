import { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/client';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    company_id?: number;
    permissions?: Record<string, boolean>;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    hasPermission: (permission: string) => boolean;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
    };

    const hasPermission = (permission: string) => {
        if (!user) return false;
        if (user.role === 'SUPER_ADMIN') return true;
        // Check dynamic permissions map
        return !!user.permissions?.[permission];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, hasPermission, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
