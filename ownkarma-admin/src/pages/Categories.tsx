import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Plus, Trash2, Layers, Package, ChevronRight } from 'lucide-react';

interface Category {
    _id: string;
    name: string;
    description?: string;
}

interface Product {
    _id: string;
    category: string | { _id: string };
}

const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', description: '' });
    const [productCounts, setProductCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                api.get('/categories'),
                api.get('/products'),
            ]);
            setCategories(catRes.data);

            // Count products per category
            const counts: Record<string, number> = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            prodRes.data.forEach((p: any) => {
                const catId = p.category?._id || p.category;
                if (typeof catId === 'string') {
                    counts[catId] = (counts[catId] || 0) + 1;
                }
            });
            setProductCounts(counts);
        } catch (err) {
            console.log('API not available');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/categories', form);
            setShowForm(false);
            setForm({ name: '', description: '' });
            fetchCategories();
        } catch (err) {
            alert('Failed to create category. Make sure the backend is running.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category and all its products?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    return (
        <div className="p-12 max-w-6xl animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-text tracking-tight">Product Categories</h2>
                    <p className="text-muted text-sm mt-2">
                        Create categories (e.g. "Destiny", "Divine") and add product variations under each
                    </p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2.5">
                    <Plus size={16} />
                    New Category
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="card p-8 mb-8">
                    <h3 className="font-semibold text-text text-lg mb-6">Create New Category</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Category Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Destiny, Divine, Karma's Eye..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Description</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="e.g. Hoodies inspired by fate and stars"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button type="submit" className="btn-primary">Create Category</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Empty State */}
            {categories.length === 0 && !showForm && (
                <div className="card p-16 text-center">
                    <Layers size={48} className="text-dim mx-auto mb-5" />
                    <h3 className="text-xl font-semibold text-text mb-2">No categories yet</h3>
                    <p className="text-muted text-sm mb-8 max-w-md mx-auto">
                        Start by creating your first product category. Each category represents a product line
                        (e.g., "Destiny") and can have multiple color/style variations under it.
                    </p>
                    <button onClick={() => setShowForm(true)} className="btn-primary">
                        <Plus size={16} className="inline mr-2" />
                        Create First Category
                    </button>
                </div>
            )}

            {/* Categories Grid */}
            {categories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <div key={cat._id} className="card p-7 group relative">
                            <div className="flex items-start justify-between mb-5">
                                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                                    <Layers size={24} className="text-accent" />
                                </div>
                                <button
                                    onClick={() => handleDelete(cat._id)}
                                    className="opacity-0 group-hover:opacity-100 transition-all p-2.5 rounded-xl hover:bg-danger/10"
                                >
                                    <Trash2 size={16} className="text-danger" />
                                </button>
                            </div>

                            <h3 className="font-bold text-xl text-text mb-1">{cat.name}</h3>
                            <p className="text-muted text-sm mb-5">{cat.description || 'No description'}</p>

                            <div className="flex items-center justify-between pt-5 border-t border-border">
                                <div className="flex items-center gap-2 text-dim text-xs">
                                    <Package size={14} />
                                    {productCounts[cat._id] || 0} product{(productCounts[cat._id] || 0) !== 1 ? 's' : ''}
                                </div>
                                <Link
                                    to={`/products/new?category=${cat._id}`}
                                    className="flex items-center gap-1.5 text-accent text-xs font-medium hover:text-accent-light transition-colors"
                                >
                                    Add Product
                                    <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
