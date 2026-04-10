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
        console.log(`[Admin] Deleting product with ID: ${id}`);
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            console.log('[Admin] Product deletion cancelled');
            return;
        }

        try {
            await deleteProduct(id);
            showToast('Product deleted successfully', 'success');
            loadProducts();
        } catch (error: any) {
            console.error(`[Admin] Error deleting product ${id}:`, error);
            showToast(error.message || 'Failed to delete product', 'error');
        }
    };

    const handleDeleteCollection = async (id: number) => {
        console.log(`[Admin] Deleting collection with ID: ${id}`);
        if (!window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
            console.log('[Admin] Collection deletion cancelled');
            return;
        }

        try {
            await deleteCollection(id);
            showToast('Collection deleted successfully', 'success');
            loadCollections();
        } catch (error: any) {
            console.error(`[Admin] Error deleting collection ${id}:`, error);
            showToast(error.message || 'Failed to delete collection', 'error');
        }
    };

    const handleLogout = () => {
        console.log('[Admin] Logging out...');
        logout();
        onNavigate('home');
    };

    const handleTabChange = (tab: 'products' | 'collections') => {
        console.log(`[Admin] Switching tab to: ${tab}`);
        setActiveTab(tab);
    };

    const handleNavigate = (page: Page) => {
        console.log(`[Admin] Navigating to: ${page}`);
        onNavigate(page);
    };

    const handleEditProduct = (id: string) => {
        console.log(`[Admin] Editing product ID: ${id}`);
        onEditProduct(id);
    };

    const handleEditCollection = (id: string) => {
        console.log(`[Admin] Editing collection ID: ${id}`);
        onEditCollection(id);
    };

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your storefront inventory and collections.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={handleLogout} className="text-gray-600">
                        <LogOut size={16} className="mr-2" /> Logout
                    </Button>
                    {activeTab === 'products' ? (
                        <Button variant="primary" size="sm" onClick={() => handleNavigate('admin-add-product')}>
                            <Plus size={16} className="mr-2" /> Add Product
                        </Button>
                    ) : (
                        <Button variant="primary" size="sm" onClick={() => handleNavigate('admin-add-collection' as Page)}>
                            <Plus size={16} className="mr-2" /> Add Collection
                        </Button>
                    )}
                </div>
            </div>

            {/* Tab Switcher - Card Based */}
            <div className="card !p-1 flex gap-1 mb-8 bg-gray-100/50 border-gray-200">
                <button
                    onClick={() => handleTabChange('products')}
                    className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all ${
                        activeTab === 'products' 
                        ? 'bg-white shadow-sm text-indigo-600 border border-gray-200' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                >
                    Products
                </button>
                <button
                    onClick={() => handleTabChange('collections')}
                    className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all ${
                        activeTab === 'collections' 
                        ? 'bg-white shadow-sm text-indigo-600 border border-gray-200' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                >
                    Collections
                </button>
            </div>

            <div className="card overflow-hidden !p-0 border-gray-200">
                {activeTab === 'products' ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Product Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Inventory</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-medium">#{product.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                                            <div className="text-xs text-indigo-500 font-medium">KSH {product.price.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 rounded">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-bold ${product.stock < 10 ? 'text-amber-500' : 'text-gray-700'}`}>
                                                {product.stock} <span className="text-[10px] text-gray-400 font-normal uppercase ml-1">Units</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditProduct(product.id.toString())}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Edit Product"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Collection Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Slug</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {collections.map((collection) => (
                                    <tr key={collection.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">#{collection.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{collection.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-500 font-medium">/{collection.slug}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditCollection(collection.id.toString())} 
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Edit Collection"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCollection(collection.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
                                                    <Plus size={24} />
                                                </div>
                                                <p className="text-gray-400 font-medium lowercase italic">No collections found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
