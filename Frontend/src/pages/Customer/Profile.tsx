import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { fetchMyOrders } from '../../api';
import { Page } from '../../types';

interface ProfilePageProps {
    onNavigate: (page: Page) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('orders');
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'orders' && user) {
            setLoading(true);
            fetchMyOrders()
                .then(data => setOrders(data))
                .catch(err => {
                    console.error('Failed to fetch orders:', err);
                    setOrders([]); // Or handle error state
                })
                .finally(() => setLoading(false));
        }
    }, [activeTab, user]);


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
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-lg" />
                                    ))}
                                </div>
                            ) : orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="border border-gray-100 p-6 rounded-lg hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="font-bold">Order #{order.id}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                                                            month: 'long',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <span className={`text-[10px] px-2 py-1 font-bold uppercase tracking-wider rounded ${
                                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex gap-4">
                                                {order.items?.slice(0, 3).map((item: any, idx: number) => (
                                                    <div key={idx} className="h-16 w-12 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                                                        {item.product_image ? (
                                                            <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="text-[8px] text-gray-400 text-center px-1">{item.product_name}</div>
                                                        )}
                                                    </div>
                                                ))}
                                                {order.items?.length > 3 && (
                                                    <div className="h-16 w-12 bg-gray-50 flex items-center justify-center text-xs text-gray-400 font-medium">
                                                        +{order.items.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-4 flex justify-between items-center text-sm">
                                                <span className="font-medium">Total: KSH {parseFloat(order.total_amount).toLocaleString()}</span>
                                                <button className="underline hover:text-gray-600">View Details</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 border border-dashed border-gray-200">
                                    <p className="text-gray-400 uppercase tracking-widest text-sm mb-4">
                                        {orders === null ? 'Failed to load orders' : 'No orders yet'}
                                    </p>
                                    <Button size="sm" onClick={() => onNavigate('shop')}>Start Shopping</Button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="animate-fade-in max-w-md">
                            <h3 className="text-lg font-bold uppercase mb-6">Profile Details</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">First Name</label>
                                        <p className="border-b border-gray-100 py-2 text-sm">{user?.firstName || '—'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Last Name</label>
                                        <p className="border-b border-gray-100 py-2 text-sm">{user?.lastName || '—'}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                                    <p className="border-b border-gray-100 py-2 text-sm">{user?.email}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Phone Number</label>
                                    <p className="border-b border-gray-100 py-2 text-sm">{user?.phone || 'Not provided'}</p>
                                </div>
                                <div className="pt-4">
                                    <Button variant="outline" fullWidth disabled>Edit Profile (Coming Soon)</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
