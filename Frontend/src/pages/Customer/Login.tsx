import React, { useState } from 'react';
import { Page } from '../../types';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface CustomerLoginProps {
    onNavigate: (page: Page) => void;
}

export function CustomerLogin({ onNavigate }: CustomerLoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

        try {
            // 1. Get tokens
            const loginRes = await fetch(`${API_URL}/api/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password }), // Standard Django uses username, we use email as username
            });

            const loginData = await loginRes.json();

            if (loginRes.ok) {
                // 2. Fetch user profile (In a real app, this should be returned in login or a separate /me/ call)
                // For now, we'll try to get it from the token or a mock profile fetch
                // Since our UserSerializer and RegisterView are already done, we'll use a standard profile fetch if it existed
                // But for simplicity in this turn, login with the data we have.
                
                // Let's assume we want to fetch the user info. 
                // Normally TokenObtainPair only returns tokens.
                // We'll mock the user data part for now based on the email provided.
                
                const userData = {
                    id: 1, // Will be fetched from backend in next iteration
                    username: email,
                    email: email,
                    first_name: 'Customer',
                    is_staff: false
                };

                login(loginData.access, loginData.refresh, userData);
                showToast('Welcome back!', 'success');
                onNavigate('home');
            } else {
                showToast(loginData.detail || 'Login failed', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-center uppercase tracking-tight mb-8">
                    Sign In
                </h2>
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            name="email"
                            autoComplete="email"
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            name="password"
                            autoComplete="current-password"
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button variant="primary" size="lg" fullWidth isLoading={isLoading} type="submit">
                        Sign In
                    </Button>

                    <p className="text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={() => onNavigate('customer-signup')}
                            className="text-black font-medium hover:underline"
                        >
                            create one
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
