import React, { useState } from 'react';
import { Page } from '../../types';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

interface CustomerSignupProps {
    onNavigate: (page: Page) => void;
}

export function CustomerSignup({ onNavigate }: CustomerSignupProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        setIsLoading(true);

        const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

        try {
            const res = await fetch(`${API_URL}/api/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.email, // using email as username
                    email: formData.email,
                    password: formData.password,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    phone: formData.phone
                }),
            });

            const data = await res.json();

            if (res.ok) {
                showToast('Registration successful! Please sign in.', 'success');
                onNavigate('customer-login');
            } else {
                const errorMessage = Object.values(data).flat().join(', ');
                showToast(errorMessage || 'Registration failed', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-center uppercase tracking-tight mb-8">
                    Create Account
                </h2>
                <form className="space-y-6" onSubmit={handleSignup}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">First Name</label>
                            <input
                                type="text"
                                required
                                name="firstName"
                                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Last Name</label>
                            <input
                                type="text"
                                required
                                name="lastName"
                                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            name="email"
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Phone Number</label>
                        <input
                            type="tel"
                            required
                            name="phone"
                            placeholder="e.g. +254 712 345 678"
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            name="password"
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            required
                            name="confirmPassword"
                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <Button variant="primary" size="lg" fullWidth isLoading={isLoading} type="submit">
                        Register
                    </Button>

                    <p className="text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => onNavigate('customer-login')}
                            className="text-black font-medium hover:underline"
                        >
                            Sign in
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
