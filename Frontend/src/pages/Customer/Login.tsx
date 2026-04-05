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

            if (loginRes.ok && loginData.user) {
                // Safely extract the custom user profile injected by the backend CustomTokenObtainPairSerializer
                const userData = loginData.user;

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
