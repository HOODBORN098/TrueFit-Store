import { useEffect, useState } from 'react';
import { Page } from '../../types';
import { Button } from '../../components/ui/Button';
import { Plus, LogOut, Edit2, Trash2 } from 'lucide-react';
import { deleteProduct, fetchProducts, fetchCollections, deleteCollection, ApiCollection } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    stock: number;
}

interface AdminDashboardProps {
    onNavigate: (page: Page) => void;
    onEditProduct: (id: string) => void;
    onEditCollection: (id: string) => void;
}

export function AdminDashboard({ onNavigate, onEditProduct, onEditCollection }: AdminDashboardProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [collections, setCollections] = useState<ApiCollection[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'collections'>('products');
    const { showToast } = useToast();
    const { logout } = useAuth();

    const loadProducts = () => {
        fetchProducts()
            .then(data => {
                const results = data.results.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: parseFloat(p.price),
                    category: p.category,
                    stock: p.stock
                }));
                setProducts(results);
            })
            .catch(err => {
                console.error(err);
                showToast('Failed to load products', 'error');
            });
    };

    const loadCollections = () => {
        fetchCollections()
            .then(data => setCollections(data))
            .catch(err => {
                console.error(err);
                showToast('Failed to load collections', 'error');
            });
    };

    useEffect(() => {
        loadProducts();
        loadCollections();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteProduct(id);
            showToast('Product deleted successfully', 'success');
            loadProducts();
        } catch (error: any) {
            showToast(error.message || 'Failed to delete product', 'error');
        }
    };

    const handleDeleteCollection = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteCollection(id);
            showToast('Collection deleted successfully', 'success');
            loadCollections();
        } catch (error: any) {
            showToast(error.message || 'Failed to delete collection', 'error');
        }
    };

    const handleLogout = () => {
        logout();
        onNavigate('home');
    };

    return (
        <div className="max-w-[1920px] mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold uppercase tracking-tight">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut size={16} className="mr-2" /> Logout
                    </Button>
                    {activeTab === 'products' ? (
                        <Button variant="primary" size="sm" onClick={() => onNavigate('admin-add-product')}>
                            <Plus size={16} className="mr-2" /> Add Product
                        </Button>
                    ) : (
                        <Button variant="primary" size="sm" onClick={() => onNavigate('admin-add-collection' as Page)}>
                            <Plus size={16} className="mr-2" /> Add Collection
                        </Button>
                    )}
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-gray-200 mb-8">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
                        activeTab === 'products' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    Products
                </button>
                <button
                    onClick={() => setActiveTab('collections')}
                    className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
                        activeTab === 'collections' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    Collections
                </button>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden">
                {activeTab === 'products' ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KSH {product.price.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => onEditProduct(product.id.toString())}
                                                className="text-gray-400 hover:text-black transition-colors"
                                                title="Edit Product"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete Product"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {collections.map((collection) => (
                                <tr key={collection.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{collection.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection.slug}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => onEditCollection(collection.id.toString())} 
                                                className="text-gray-400 hover:text-black transition-colors"
                                                title="Edit Collection"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCollection(collection.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete Collection"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {collections.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 uppercase tracking-widest text-sm">
                                        No collections found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
