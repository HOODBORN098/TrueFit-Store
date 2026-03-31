import { useEffect, useState } from 'react';
import { Page } from '../../types';
import { Button } from '../../components/ui/Button';
import { Plus, LogOut } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    stock: number;
}

interface AdminDashboardProps {
    onNavigate: (page: Page) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/products/')
            .then(res => res.json())
            .then(data => {
                const results = data.results ? data.results : (Array.isArray(data) ? data : []);
                setProducts(results);
            })
            .catch(console.error);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        onNavigate('home');
    };

    return (
        <div className="max-w-[1920px] mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold uppercase tracking-tight">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut size={16} className="mr-2" /> Logout
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => onNavigate('admin-add-product')}>
                        <Plus size={16} className="mr-2" /> Add Product
                    </Button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Ksh {product.price.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
