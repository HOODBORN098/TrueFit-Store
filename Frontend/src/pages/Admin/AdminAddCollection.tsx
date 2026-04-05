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
        if (!validate()) return;

        setLoading(true);
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('slug', formData.slug.trim());
            submitData.append('description', formData.description.trim());
            
            if (imageFile) {
                submitData.append('image', imageFile);
            }

            if (isEdit) {
                await updateCollection(collectionId, submitData);
                showToast('Collection updated successfully!', 'success');
            } else {
                await createCollection(submitData);
                showToast('Collection created successfully!', 'success');
            }
            onNavigate('admin-dashboard');
        } catch (error) {
            const msg = error instanceof Error ? error.message : `Failed to ${isEdit ? 'update' : 'create'} collection.`;
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
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
                {isEdit ? 'Edit Collection' : 'Create New Collection'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase mb-2">Collection Name *</label>
                    <input
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Obsidian Series"
                        className={`w-full border p-3 focus:outline-none focus:border-black transition-colors ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    <FieldError field="name" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase mb-2">URL Slug *</label>
                    <input
                        name="slug"
                        required
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder="e.g. obsidian-series"
                        className={`w-full border p-3 focus:outline-none focus:border-black transition-colors ${errors.slug ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    <FieldError field="slug" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase mb-2">Description *</label>
                    <textarea
                        name="description"
                        required
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe this collection..."
                        className={`w-full border p-3 focus:outline-none focus:border-black transition-colors resize-none ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    <FieldError field="description" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 uppercase mb-2">Cover Image</label>
                    <input
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setImageFile(e.target.files[0]);
                                setErrors(prev => ({ ...prev, image: undefined }));
                            }
                        }}
                        className={`w-full border p-3 focus:outline-none focus:border-black bg-white ${errors.image ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    <FieldError field="image" />
                    <p className="text-xs text-gray-400 mt-1">This image will be used as the collection background.</p>
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
                    {isEdit ? 'Update Collection' : 'Create Collection'}
                </Button>
            </form>
        </div>
    );
}
