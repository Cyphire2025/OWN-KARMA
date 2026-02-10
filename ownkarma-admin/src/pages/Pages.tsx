import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Plus, Trash2, Layers, Package, Edit2, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Category {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    color?: string;
    order?: number;
}

interface Product {
    _id: string;
    category: string | { _id: string };
}

const PRESET_COLORS = [
    '#7c5cfc', // Brand Purple
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
];

const PagesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        color: PRESET_COLORS[0],
        image: '',
        order: 0
    });
    const [isUploading, setIsUploading] = useState(false);
    const [productCounts, setProductCounts] = useState<Record<string, number>>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

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

            const counts: Record<string, number> = {};
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        try {
            const res = await api.post('/upload', formData);
            setForm({ ...form, image: res.data.url });
        } catch (err) {
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/categories/${editingId}`, form);
            } else {
                await api.post('/categories', form);
            }
            setShowForm(false);
            setEditingId(null);
            setForm({ name: '', description: '', color: PRESET_COLORS[0], image: '', order: 0 });
            fetchCategories();
        } catch (err) {
            alert(`Failed to ${editingId ? 'update' : 'create'} page. Make sure the backend is running.`);
        }
    };

    const handleEdit = (cat: Category) => {
        setForm({
            name: cat.name,
            description: cat.description || '',
            color: cat.color || PRESET_COLORS[0],
            image: cat.image || '',
            order: cat.order || 0
        });
        setEditingId(cat._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setForm({ name: '', description: '', color: PRESET_COLORS[0], image: '', order: 0 });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = categories.findIndex((c) => c._id === active.id);
        const newIndex = categories.findIndex((c) => c._id === over.id);

        const newOrder = arrayMove(categories, oldIndex, newIndex);
        setCategories(newOrder);

        // Update all categories with their new order on backend
        try {
            await Promise.all(
                newOrder.map((cat, index) =>
                    api.put(`/categories/${cat._id}`, { order: index })
                )
            );
        } catch (err) {
            console.error('Failed to sync order to backend', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this page and all its products?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert('Failed to delete page');
        }
    };

    return (
        <div className="p-12 max-w-7xl animate-fade-in font-sans">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-4xl font-extrabold text-[#0a0a0a] tracking-tight">Storefront Pages</h2>
                    <p className="text-[#64748b] text-base mt-2">
                        Manage dynamic pages for your frontend sidebar and their featured collections
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (showForm && !editingId) setShowForm(false);
                        else {
                            setEditingId(null);
                            setForm({ name: '', description: '', color: PRESET_COLORS[0], image: '', order: categories.length });
                            setShowForm(true);
                        }
                    }}
                    className="bg-[#0a0a0a] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl active:scale-95"
                >
                    <Plus size={20} strokeWidth={3} />
                    New Page
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="bg-white/80 backdrop-blur-2xl border border-white/40 p-10 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h3 className="font-bold text-[#0a0a0a] text-2xl mb-8">
                        {editingId ? 'Edit Page Details' : 'Configure New Page'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] mb-3 block">Page Title</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-[#f8fafc] border-0 rounded-2xl px-6 py-4 text-lg font-medium outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0a0a0a] transition-all"
                                        placeholder="Display name (e.g. Destiny Collection)"
                                        required
                                    />
                                </div>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full bg-[#f8fafc] border-0 rounded-2xl px-6 py-4 text-base font-medium outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0a0a0a] transition-all min-h-[120px]"
                                    placeholder="Page description or tagline..."
                                />

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] mb-4 block">Brand Color</label>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            {/* Custom Color Selector */}
                                            <div className="relative group">
                                                <input
                                                    type="color"
                                                    id="colorPicker"
                                                    value={form.color}
                                                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                                />
                                                <div
                                                    className="w-16 h-16 rounded-2xl shadow-lg border-4 border-white transition-transform group-hover:scale-105"
                                                    style={{ backgroundColor: form.color }}
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pick custom color</p>
                                                <input
                                                    type="text"
                                                    value={form.color}
                                                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                                                    className="w-32 bg-transparent text-xl font-black text-slate-700 outline-none uppercase"
                                                    placeholder="#000000"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {PRESET_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, color })}
                                                    className={`w-8 h-8 rounded-full transition-all duration-300 ${form.color.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-offset-2 ring-[#0a0a0a] scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] mb-3 block">Display Priority (Order)</label>
                                    <input
                                        type="number"
                                        value={form.order}
                                        onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-[#f8fafc] border-0 rounded-2xl px-6 py-4 text-lg font-medium outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0a0a0a] transition-all"
                                        placeholder="0 (Shows first)"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-2 ml-1">Lower numbers show first in the sidebar.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] mb-3 block">Banner / Sidebar Image</label>
                                <div className="group relative w-full aspect-video rounded-3xl bg-[#f8fafc] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-[#0a0a0a]/20">
                                    {form.image ? (
                                        <>
                                            <img src={form.image} className="w-full h-full object-cover" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ ...form, image: '' })}
                                                    className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="flex flex-col items-center cursor-pointer p-8 text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 text-[#64748b]">
                                                {isUploading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a0a0a]"></div> : <Package size={32} />}
                                            </div>
                                            <span className="text-sm font-bold text-[#475569]">Upload Image</span>
                                            <span className="text-xs text-[#94a3b8] mt-1">Visible on frontend navigation</span>
                                            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button type="submit" disabled={isUploading} className="bg-[#0a0a0a] text-white px-10 py-4 rounded-2xl font-bold hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50">
                                {isUploading ? 'Uploading...' : (editingId ? 'Update Page' : 'Save Page')}
                            </button>
                            <button type="button" onClick={handleCancel} className="px-8 py-4 rounded-2xl font-bold text-[#64748b] hover:bg-slate-100 transition-all">Cancel</button>
                        </div>
                    </form>
                </div >
            )}

            {/* Empty State */}
            {
                categories.length === 0 && !showForm && (
                    <div className="bg-white/50 backdrop-blur-xl p-20 text-center rounded-[3rem] border border-white/60">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 text-[#94a3b8]">
                            <Layers size={48} />
                        </div>
                        <h3 className="text-3xl font-bold text-[#0a0a0a] mb-4">No pages yet</h3>
                        <p className="text-[#64748b] text-lg mb-10 max-w-md mx-auto">
                            Your frontend sidebar is currently static. Create a page to start making it dynamic.
                        </p>
                        <button onClick={() => setShowForm(true)} className="bg-[#0a0a0a] text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all">
                            <Plus size={20} className="inline mr-2" />
                            Create First Page
                        </button>
                    </div>
                )
            }

            {/* Categories Grid */}
            {categories.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={categories.map(c => c._id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categories.map((cat) => (
                                <SortableCategory
                                    key={cat._id}
                                    cat={cat}
                                    handleEdit={handleEdit}
                                    handleDelete={handleDelete}
                                    productCounts={productCounts}
                                    categories={categories}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div >
    );
};

export default PagesPage;

const SortableCategory = ({ cat, handleEdit, handleDelete, productCounts, categories }: any) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: cat._id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition: transition || 'transform 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style as any}
            {...attributes}
            {...listeners}
            className={`group relative h-[420px] rounded-[2.5rem] overflow-hidden border-2 border-transparent transition-all duration-300 ${isDragging ? 'scale-105 shadow-2xl cursor-grabbing' : 'hover:-translate-y-2 cursor-grab'}`}
        >
            <div style={{ '--accent': cat.color || '#000000' } as any}>
                {/* Glow Source (behind) */}
                <div className={`absolute -inset-4 bg-[var(--accent)] blur-[60px] transition-opacity duration-700 rounded-[3rem] ${isDragging ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'}`} />

                {/* Background Image Container */}
                <div className={`absolute inset-0 rounded-[2.5rem] overflow-hidden bg-[#0a0a0a] border border-white/5 transition-colors duration-500 ${isDragging ? 'border-[var(--accent)] shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)]' : 'group-hover:border-[var(--accent)]'}`}>
                    {cat.image ? (
                        <img src={cat.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60" alt={cat.name} />
                    ) : (
                        <img
                            src={`/backgrounds/${(categories.indexOf(cat) % 4) + 1}.png`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-30"
                            alt={cat.name}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                </div>

                {/* Actions (Manual propagation stop to allow clicking buttons) */}
                <div className="absolute top-6 right-6 z-20 flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(cat); }}
                        className="bg-black/40 backdrop-blur-md p-3 rounded-2xl text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300 border border-white/10"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(cat._id); }}
                        className="bg-black/40 backdrop-blur-md p-3 rounded-2xl text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all duration-300 border border-white/10"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end pointer-events-none">
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-lg transition-all duration-500 group-hover:border-[var(--accent)] group-hover:shadow-[var(--accent)]/20">
                            <Layers size={22} className="group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">{cat.name}</h3>
                            <p className="text-white/80 text-sm line-clamp-2 leading-relaxed font-medium">
                                {cat.description || 'This collection represents a core pillar of the Own Karma experience.'}
                            </p>
                        </div>
                        <div className="flex items-center justify-between pt-6 mt-4 border-t border-white/20 pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2 text-white/90 text-[13px] font-bold">
                                <Package size={16} />
                                {productCounts[cat._id] || 0} ITEMS
                            </div>
                            <Link
                                to={`/products?category=${cat._id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white text-black px-5 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-wider hover:bg-slate-100 transition-colors shadow-lg"
                            >
                                View Products
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
