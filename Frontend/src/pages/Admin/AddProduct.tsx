import { useState } from 'react';
import { Page } from '../../types';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { createProduct } from '../../api';

interface AddProductProps {
    onNavigate: (page: Page) => void;
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

export function AddProduct({ onNavigate }: AddProductProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        imageUrl: '',
        sizes: [] as string[],
        colors: [] as string[],
        featured: false,
        newArrival: false,
    });

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
        if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl)) {
            newErrors.imageUrl = 'Image URL must start with http:// or https://';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await createProduct({
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category: formData.category,
                image_url: formData.imageUrl || null,
                sizes: formData.sizes,
                colors: formData.colors,
                featured: formData.featured,
                newArrival: formData.newArrival,
            });
            showToast('Product added successfully!', 'success');
            onNavigate('admin-dashboard');
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Failed to add product.';
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

    const toggleSize = (size: string) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size],
        }));
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

            <h1 className="text-3xl font-bold uppercase tracking-tight mb-8">Add New Product</h1>

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
                        <label className="block text-sm font-medium text-gray-700 uppercase mb-2">Price (Ksh) *</label>
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

                {/* Image URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase mb-2">Image URL</label>
                    <input
                        name="imageUrl"
                        type="url"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="https://images.unsplash.com/..."
                        className={`w-full border p-3 focus:outline-none focus:border-black ${errors.imageUrl ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    <FieldError field="imageUrl" />
                    <p className="text-xs text-gray-400 mt-1">Paste a direct link to the product image. Leave blank to use a default.</p>
                </div>

                {/* Sizes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase mb-3">Available Sizes</label>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_SIZES.map(size => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => toggleSize(size)}
                                className={`px-4 py-2 text-sm font-medium border transition-colors ${
                                    formData.sizes.includes(size)
                                        ? 'bg-black text-white border-black'
                                        : 'border-gray-300 hover:border-black'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
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

                <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
                    Create Product
                </Button>
            </form>
        </div>
    );
}
