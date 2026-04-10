import { useState, useEffect } from 'react';
import { Page } from '../../types';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { createCollection, updateCollection, fetchCollections } from '../../api';

interface AdminAddCollectionProps {
    onNavigate: (page: Page) => void;
    collectionId?: string;
}

interface FormErrors {
    name?: string;
    description?: string;
    slug?: string;
    image?: string;
}

export function AdminAddCollection({ onNavigate, collectionId }: AdminAddCollectionProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
    });

    const isEdit = !!collectionId;

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            fetchCollections()
                .then(collections => {
                    const collection = collections.find(c => c.id.toString() === collectionId);
                    if (collection) {
                        setFormData({
                            name: collection.name,
                            slug: collection.slug,
                            description: collection.description,
                        });
                    }
                })
                .catch(() => {
                    showToast('Failed to fetch collection details', 'error');
                    onNavigate('admin-dashboard');
                })
                .finally(() => setLoading(false));
        }
    }, [collectionId]);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (formData.name.trim().length < 3) {
            newErrors.name = 'Collection name must be at least 3 characters.';
        }
        if (formData.slug.trim().length < 3) {
            newErrors.slug = 'Slug must be at least 3 characters.';
        }
        if (formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[Admin] Submitting collection form...', formData);
        
        if (!validate()) {
            console.warn('[Admin] Collection form validation failed', errors);
            return;
        }

        setLoading(true);
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('slug', formData.slug.trim());
            submitData.append('description', formData.description.trim());
            
            if (imageFile) {
                submitData.append('image', imageFile);
                console.log('[Admin] Including new collection image file');
            }

            if (isEdit) {
                console.log(`[Admin] Updating collection ID: ${collectionId}`);
                await updateCollection(collectionId, submitData);
                showToast('Collection updated successfully!', 'success');
            } else {
                console.log('[Admin] Creating new collection');
                await createCollection(submitData);
                showToast('Collection created successfully!', 'success');
            }
            onNavigate('admin-dashboard');
        } catch (error) {
            console.error('[Admin] Collection submission error:', error);
            const msg = error instanceof Error ? error.message : `Failed to ${isEdit ? 'update' : 'create'} collection.`;
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        console.log(`[Admin] Collection field changed: ${name} = ${value}`);
        
        let newFormData = { ...formData, [name]: value };
        
        // Auto-generate slug from name if creating brand new
        if (name === 'name' && !isEdit) {
            newFormData.slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
        
        setFormData(newFormData);
        
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
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
                    {isEdit ? 'Edit Collection' : 'Create New Collection'}
                </h1>
                <p className="text-gray-500 mt-1">Group your products into aesthetic series or seasons.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                <div className="card space-y-6 border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 pb-4 border-b border-gray-50">General Details</h2>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Collection Name *</label>
                        <input
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Obsidian Series"
                            className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                        />
                        <FieldError field="name" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">URL Slug *</label>
                        <input
                            name="slug"
                            required
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="e.g. obsidian-series"
                            className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${errors.slug ? 'border-red-400' : 'border-gray-200'}`}
                        />
                        <FieldError field="slug" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description *</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe this collection..."
                            className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
                        />
                        <FieldError field="description" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Cover Image</label>
                        <input
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    console.log('[Admin] New collection image:', e.target.files[0].name);
                                    setImageFile(e.target.files[0]);
                                    setErrors(prev => ({ ...prev, image: undefined }));
                                }
                            }}
                            className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50/50 ${errors.image ? 'border-red-400' : 'border-gray-200'}`}
                        />
                        <FieldError field="image" />
                        <p className="text-[10px] text-gray-400 font-medium uppercase mt-2 italic">This image will be used as the collection background.</p>
                    </div>
                </div>

                <div className="pt-4 pb-12">
                    <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading} className="py-4 text-lg">
                        {isEdit ? 'Update Collection' : 'Create Collection'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
    );
}
