import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isStaff: boolean;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, refreshToken: string, userData: any) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        // Purge legacy global auth
        if (localStorage.getItem('access_token')) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
        }

        const storedToken = sessionStorage.getItem('access_token');
        const storedUser = sessionStorage.getItem('user_data');
        
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to restore auth state');
                logout();
            }
        }
        setLoading(false);

        const handleSessionExpired = () => {
            logout();
        };

        window.addEventListener('session-expired', handleSessionExpired);
        return () => window.removeEventListener('session-expired', handleSessionExpired);
    }, []);

    const login = (accessToken: string, refreshToken: string, userData: any) => {
        sessionStorage.setItem('access_token', accessToken);
        sessionStorage.setItem('refresh_token', refreshToken);
        
        const mappedUser: User = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            isStaff: userData.is_staff || false,
            phone: userData.phone || '',
        };

        sessionStorage.setItem('user_data', JSON.stringify(mappedUser));
        setToken(accessToken);
        setUser(mappedUser);
    };

    const logout = () => {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user_data');
        setToken(null);
        setUser(null);
        showToast('Logged out successfully', 'info');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            login, 
            logout, 
            isAuthenticated: !!token, 
            isAdmin: user?.isStaff || false,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
