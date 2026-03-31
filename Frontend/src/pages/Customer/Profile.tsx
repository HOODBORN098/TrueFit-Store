import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Page } from '../../types';

interface ProfilePageProps {
    onNavigate: (page: Page) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('orders');


    const handleLogout = () => {
        logout();
        onNavigate('home');
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 min-h-screen">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                    <h2 className="text-xl font-bold uppercase tracking-wide mb-6">My Account</h2>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
                    >
                        Order History
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
                    >
                        Profile Settings
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-red-50 text-red-600 transition-colors border-t border-gray-100 mt-4"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {activeTab === 'orders' && (
                        <div className="animate-fade-in">
                            <h3 className="text-lg font-bold uppercase mb-6">Recent Orders</h3>
                            {/* Mock Orders */}
                            <div className="space-y-4">
                                {[1, 2].map((orderId) => (
                                    <div key={orderId} className="border border-gray-100 p-6 rounded-lg hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="font-bold">Order #{202400 + orderId}</p>
                                                <p className="text-sm text-gray-500">Placed on January 30, 2026</p>
                                            </div>
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 font-bold uppercase tracking-wider rounded">
                                                Delivered
                                            </span>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="h-16 w-12 bg-gray-200" />
                                            <div className="h-16 w-12 bg-gray-200" />
                                        </div>
                                        <div className="mt-4 flex justify-between items-center text-sm">
                                            <span className="font-medium">Total: Ksh 14,500</span>
                                            <button className="underline hover:text-gray-600">View Details</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="animate-fade-in max-w-md">
                            <h3 className="text-lg font-bold uppercase mb-6">Profile Details</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">First Name</label>
                                    <input
                                        value={user?.firstName}
                                        readOnly
                                        className="w-full border-b border-gray-300 py-2 focus:outline-none text-gray-600 bg-gray-50 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email</label>
                                    <input
                                        value={user?.email}
                                        readOnly
                                        className="w-full border-b border-gray-300 py-2 focus:outline-none text-gray-600 bg-gray-50 cursor-not-allowed"
                                    />
                                </div>
                                <Button disabled>Update Profile (Coming Soon)</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
