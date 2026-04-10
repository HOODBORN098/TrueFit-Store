import { useState, useEffect } from 'react';
import { Page } from '../../types';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { createProduct, updateProduct, fetchProduct, fetchCollections, ApiCollection } from '../../api';

interface AddProductProps {
    onNavigate: (page: Page) => void;
    productId?: string;
}

interface FormErrors {
    name?: string;
    description?: string;
    price?: string;
    stock?: string;
    category?: string;
    imageUrl?: string;
}

const CATEGORIES = ['Tops', 'Bottoms', 'Outerwear', 'Hoodies', 'Accessories', 'Footwear', 'Sets'];

export function AddProduct({ onNavigate, productId }: AddProductProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [availableCollections, setAvailableCollections] = useState<ApiCollection[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        sizes: [] as {name: string, price: number}[],
        colors: [] as string[],
        featured: false,
        newArrival: false,
        collections: [] as number[],
    });

    const isEdit = !!productId;

    useEffect(() => {
        fetchCollections()
            .then(data => setAvailableCollections(data))
            .catch(err => console.error('Failed to fetch collections', err));

        if (isEdit) {
            setLoading(true);
            fetchProduct(productId)
                .then(product => {
                    setFormData({
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        category: product.category,
                        stock: product.stock.toString(),
                        sizes: typeof product.sizes[0] === 'string' 
                            ? (product.sizes as string[]).map(s => ({ name: s, price: parseFloat(product.price) }))
                            : (product.sizes as any[]),
                        colors: product.colors,
                        featured: product.featured,
                        newArrival: product.newArrival,
                        collections: product.collections || [],
                    });
                })
                .catch(() => {
                    showToast('Failed to fetch product details', 'error');
                    onNavigate('admin-dashboard');
                })
                .finally(() => setLoading(false));
        }
    }, [productId]);

    // ── Client-side validation ──────────────────────────────────────────────
    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (formData.name.trim().length < 3) {
            newErrors.name = 'Product name must be at least 3 characters.';
        }
        if (formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters.';
        }
        const priceNum = parseFloat(formData.price);
        if (isNaN(priceNum) || priceNum <= 0) {
            newErrors.price = 'Price must be a positive number.';
        }
        const stockNum = parseInt(formData.stock);
        if (isNaN(stockNum) || stockNum < 0) {
            newErrors.stock = 'Stock must be 0 or more.';
        }
        if (!formData.category) {
            newErrors.category = 'Please select a category.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[Admin] Submitting product form...', formData);
        
        if (!validate()) {
            console.warn('[Admin] Product form validation failed', errors);
            return;
        }

        setLoading(true);
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('description', formData.description.trim());
            submitData.append('price', formData.price);
            submitData.append('stock', formData.stock);
            submitData.append('category', formData.category);
            
            submitData.append('sizes', JSON.stringify(formData.sizes));
            submitData.append('colors', JSON.stringify(formData.colors));
            
            submitData.append('featured', String(formData.featured));
            submitData.append('newArrival', String(formData.newArrival));
            submitData.append('collections', JSON.stringify(formData.collections));

            if (imageFile) {
                submitData.append('image', imageFile);
                console.log('[Admin] Including new image file');
            }

            if (isEdit) {
                console.log(`[Admin] Updating product ID: ${productId}`);
                await updateProduct(productId, submitData);
                showToast('Product updated successfully!', 'success');
            } else {
                console.log('[Admin] Creating new product');
                await createProduct(submitData);
                showToast('Product added successfully!', 'success');
            }
            onNavigate('admin-dashboard');
        } catch (error) {
            console.error('[Admin] Product submission error:', error);
            const msg = error instanceof Error ? error.message : `Failed to ${isEdit ? 'update' : 'add'} product.`;
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log(`[Admin] Form field changed: ${name} = ${value}`);
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const toggleSize = (sizeName: string) => {
        console.log(`[Admin] Toggling size: ${sizeName}`);
        setFormData(prev => {
            const exists = prev.sizes.find(s => s.name === sizeName);
            if (exists) {
                return { ...prev, sizes: prev.sizes.filter(s => s.name !== sizeName) };
            } else {
                return { ...prev, sizes: [...prev.sizes, { name: sizeName, price: Number(formData.price) || 0 }] };
            }
        });
    };

    const toggleColor = (color: string) => {
        console.log(`[Admin] Toggling color: ${color}`);
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.includes(color)
                ? prev.colors.filter(c => c !== color)
                : [...prev.colors, color],
        }));
    };
    
    const toggleCollection = (id: number) => {
        console.log(`[Admin] Toggling collection ID: ${id}`);
        setFormData(prev => ({
            ...prev,
            collections: prev.collections.includes(id)
                ? prev.collections.filter(cId => cId !== id)
                : [...prev.collections, id],
        }));
    };

    const FieldError = ({ field }: { field: keyof FormErrors }) =>
        errors[field] ? <p className="text-red-500 text-xs font-semibold mt-1 animate-fade-in">{errors[field]}</p> : null;

    return (
        <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in-up">
            <button
                type="button"
                onClick={() => {
                    console.log('[Admin] Navigating back to dashboard');
                    onNavigate('admin-dashboard');
                }}
                className="flex items-center text-sm font-semibold text-gray-500 hover:text-indigo-600 mb-8 transition-colors group"
            >
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>

            <div className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                    {isEdit ? 'Edit Product' : 'Add New Product'}
                </h1>
                <p className="text-gray-500 mt-1">Configure your product details, inventory, and categorization.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                
                {/* Basic Info Card */}
                <div className="card space-y-6 border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 pb-4 border-b border-gray-50">Basic Information</h2>
                    
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Product Name *</label>
                        <input
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Cargo Utility Pant"
                            className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                        />
                        <FieldError field="name" />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description *</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the product, its fit, material, etc."
                            className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
                        />
                        <FieldError field="description" />
                    </div>

                    {/* Price + Stock */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Price (KSH) *</label>
                            <input
                                name="price"
                                type="number"
                                step="1"
                                min="1"
                                required
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="e.g. 4500"
                                className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${errors.price ? 'border-red-400' : 'border-gray-200'}`}
                            />
                            <FieldError field="price" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Stock Qty *</label>
                            <input
                                name="stock"
                                type="number"
                                min="0"
                                required
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="e.g. 50"
                                className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${errors.stock ? 'border-red-400' : 'border-gray-200'}`}
                            />
                            <FieldError field="stock" />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category *</label>
                        <select
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleChange}
                            className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white appearance-none ${errors.category ? 'border-red-400' : 'border-gray-200'}`}
                        >
                            <option value="">— Select a category —</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <FieldError field="category" />
                    </div>
                </div>

                {/* Media & Variants Card */}
                <div className="card space-y-6 border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 pb-4 border-b border-gray-50">Media & Variants</h2>
                    
                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Product Image</label>
                        <div className="relative">
                            <input
                                name="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        console.log('[Admin] New image selected:', e.target.files[0].name);
                                        setImageFile(e.target.files[0]);
                                        setErrors(prev => ({ ...prev, imageUrl: undefined }));
                                    }
                                }}
                                className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50/50 ${errors.imageUrl ? 'border-red-400' : 'border-gray-200'}`}
                            />
                        </div>
                        <FieldError field="imageUrl" />
                        <p className="text-[10px] text-gray-400 font-medium uppercase mt-2 italic">Recommended: 1080x1080px with transparent background.</p>
                    </div>

                    {/* Sizes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Available Sizes & Custom Pricing</label>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_SIZES.map(size => {
                                    const isSelected = formData.sizes.some(s => s.name === size);
                                    return (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => toggleSize(size)}
                                            className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                                                isSelected
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                                                    : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-500'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                            {formData.sizes.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
                                    {formData.sizes.map(sizeObj => (
                                        <div key={sizeObj.name} className="flex flex-col">
                                            <label className="text-[10px] font-bold uppercase mb-1 text-indigo-400">Size {sizeObj.name} Price (KSH)</label>
                                            <input 
                                                type="number" 
                                                value={sizeObj.price || ''}
                                                onChange={(e) => {
                                                    const newPrice = Number(e.target.value);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        sizes: prev.sizes.map(s => 
                                                            s.name === sizeObj.name ? { ...s, price: newPrice } : s
                                                        )
                                                    }));
                                                }}
                                                className="w-full border border-indigo-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Colors */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Available Colors</label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => toggleColor(color)}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                                        formData.colors.includes(color)
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-500'
                                    }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Classification Card */}
                <div className="card space-y-6 border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 pb-4 border-b border-gray-50">Classification & Collections</h2>
                    
                    {/* Flags */}
                    <div className="flex flex-wrap gap-8 py-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.featured}
                                onChange={e => {
                                    console.log(`[Admin] Featured flag toggled: ${e.target.checked}`);
                                    setFormData(prev => ({ ...prev, featured: e.target.checked }));
                                }}
                                className="w-5 h-5 accent-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm font-bold text-gray-600 group-hover:text-indigo-600 transition-colors uppercase">Featured Product</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.newArrival}
                                onChange={e => {
                                    console.log(`[Admin] New Arrival flag toggled: ${e.target.checked}`);
                                    setFormData(prev => ({ ...prev, newArrival: e.target.checked }));
                                }}
                                className="w-5 h-5 accent-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm font-bold text-gray-600 group-hover:text-indigo-600 transition-colors uppercase">New Arrival</span>
                        </label>
                    </div>
                    
                    {/* Collections Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Add to Collections</label>
                        <div className="flex flex-wrap gap-2">
                            {availableCollections.length > 0 ? (
                                availableCollections.map(col => (
                                    <button
                                        key={col.id}
                                        type="button"
                                        onClick={() => toggleCollection(col.id)}
                                        className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                                            formData.collections.includes(col.id)
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                                                : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-500'
                                        }`}
                                    >
                                        {col.name}
                                    </button>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic lowercase">No collections available. Create one first.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-4 pb-12">
                    <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading} className="py-4 text-lg">
                        {isEdit ? 'Update Product' : 'Create Product'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
    );
}
