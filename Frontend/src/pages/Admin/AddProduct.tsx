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
        if (!validate()) return;

        setLoading(true);
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('description', formData.description.trim());
            submitData.append('price', formData.price);
            submitData.append('stock', formData.stock);
            submitData.append('category', formData.category);
            
            // Append lists as JSON strings so DRF's JSONField can parse them
            submitData.append('sizes', JSON.stringify(formData.sizes));
            submitData.append('colors', JSON.stringify(formData.colors));
            
            // Append booleans as strings
            submitData.append('featured', String(formData.featured));
            submitData.append('newArrival', String(formData.newArrival));
            
            // For ManyToManyField with FormData, we can append multiple times or use JSON
            // Since we use JSON for sizes/colors, let's be consistent
            submitData.append('collections', JSON.stringify(formData.collections));

            if (imageFile) {
                submitData.append('image', imageFile);
            }

            if (isEdit) {
                await updateProduct(productId, submitData);
                showToast('Product updated successfully!', 'success');
            } else {
                await createProduct(submitData);
                showToast('Product added successfully!', 'success');
            }
            onNavigate('admin-dashboard');
        } catch (error) {
            const msg = error instanceof Error ? error.message : `Failed to ${isEdit ? 'update' : 'add'} product.`;
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const toggleSize = (sizeName: string) => {
        setFormData(prev => {
            const exists = prev.sizes.find(s => s.name === sizeName);
            if (exists) {
                return { ...prev, sizes: prev.sizes.filter(s => s.name !== sizeName) };
            } else {
                return { ...prev, sizes: [...prev.sizes, { name: sizeName, price: Number(formData.price) || 0 }] };
            }
        });
    };

    const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const AVAILABLE_COLORS = ['Black', 'White', 'Gray', 'Navy', 'Beige', 'Olive', 'Brown', 'Red'];

    const toggleColor = (color: string) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.includes(color)
                ? prev.colors.filter(c => c !== color)
                : [...prev.colors, color],
        }));
    };
    
    const toggleCollection = (id: number) => {
        setFormData(prev => ({
            ...prev,
            collections: prev.collections.includes(id)
                ? prev.collections.filter(cId => cId !== id)
                : [...prev.collections, id],
        }));
    };

    const FieldError = ({ field }: { field: keyof FormErrors }) =>
        errors[field] ? <p className="text-red-500 text-xs mt-1">{errors[field]}</p> : null;

    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            <button
                onClick={() => onNavigate('admin-dashboard')}
                className="flex items-center text-sm text-gray-500 hover:text-black mb-8"
            >
                <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </button>

            <h1 className="text-3xl font-bold uppercase tracking-tight mb-8">
                {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase mb-2">Product Name *</label>
                    <input
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Cargo Utility Pant"
                        className={`w-full border p-3 focus:outline-none focus:border-black transition-colors ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    <FieldError field="name" />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase mb-2">Description *</label>
                    <textarea
                        name="description"
                        required
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the product, its fit, material, etc."
                        className={`w-full border p-3 focus:outline-none focus:border-black transition-colors resize-none ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    <FieldError field="description" />
                </div>

                {/* Price + Stock */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 uppercase mb-2">Price (KSH) *</label>
                        <input
                            name="price"
                            type="number"
                            step="1"
                            min="1"
                            required
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="e.g. 4500"
                            className={`w-full border p-3 focus:outline-none focus:border-black ${errors.price ? 'border-red-400' : 'border-gray-300'}`}
                        />
                        <FieldError field="price" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 uppercase mb-2">Stock Qty *</label>
                        <input
                            name="stock"
                            type="number"
                            min="0"
                            required
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="e.g. 50"
                            className={`w-full border p-3 focus:outline-none focus:border-black ${errors.stock ? 'border-red-400' : 'border-gray-300'}`}
                        />
                        <FieldError field="stock" />
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase mb-2">Category *</label>
                    <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className={`w-full border p-3 focus:outline-none focus:border-black bg-white ${errors.category ? 'border-red-400' : 'border-gray-300'}`}
                    >
                        <option value="">— Select a category —</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <FieldError field="category" />
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase mb-2">Product Image</label>
                    <input
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setImageFile(e.target.files[0]);
                                setErrors(prev => ({ ...prev, imageUrl: undefined }));
                            }
                        }}
                        className={`w-full border p-3 focus:outline-none focus:border-black bg-white ${errors.imageUrl ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    <FieldError field="imageUrl" />
                    <p className="text-xs text-gray-400 mt-1">Select an image from your computer.</p>
                </div>

                {/* Sizes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase mb-3">Available Sizes & Prices</label>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_SIZES.map(size => {
                                const isSelected = formData.sizes.some(s => s.name === size);
                                return (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => toggleSize(size)}
                                        className={`px-4 py-2 text-sm font-medium border transition-colors ${
                                            isSelected
                                                ? 'bg-black text-white border-black'
                                                : 'border-gray-300 hover:border-black'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                        {formData.sizes.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 mt-2 bg-gray-50 p-4 border border-gray-100">
                                {formData.sizes.map(sizeObj => (
                                    <div key={sizeObj.name}>
                                        <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Size {sizeObj.name} Price (KSH)</label>
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
                                            className="w-full border p-2 text-sm focus:outline-none focus:border-black"
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
                    <label className="block text-sm font-medium text-gray-700 uppercase mb-3">Available Colors</label>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_COLORS.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => toggleColor(color)}
                                className={`px-4 py-2 text-sm font-medium border transition-colors ${
                                    formData.colors.includes(color)
                                        ? 'bg-black text-white border-black'
                                        : 'border-gray-300 hover:border-black'
                                }`}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Flags */}
                <div className="flex gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={e => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                            className="w-4 h-4 accent-black"
                        />
                        <span className="text-sm font-medium uppercase">Featured Product</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.newArrival}
                            onChange={e => setFormData(prev => ({ ...prev, newArrival: e.target.checked }))}
                            className="w-4 h-4 accent-black"
                        />
                        <span className="text-sm font-medium uppercase">New Arrival</span>
                    </label>
                </div>
                
                {/* Collections Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase mb-3">Add to Collections</label>
                    <div className="flex flex-wrap gap-2">
                        {availableCollections.length > 0 ? (
                            availableCollections.map(col => (
                                <button
                                    key={col.id}
                                    type="button"
                                    onClick={() => toggleCollection(col.id)}
                                    className={`px-4 py-2 text-sm font-medium border transition-colors ${
                                        formData.collections.includes(col.id)
                                            ? 'bg-black text-white border-black'
                                            : 'border-gray-300 hover:border-black'
                                    }`}
                                >
                                    {col.name}
                                </button>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400 italic">No collections available. Create one first.</p>
                        )}
                    </div>
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
                    {isEdit ? 'Update Product' : 'Create Product'}
                </Button>
            </form>
        </div>
    );
}
