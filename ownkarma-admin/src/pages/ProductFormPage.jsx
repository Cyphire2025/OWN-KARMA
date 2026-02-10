import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import {
    ArrowLeft,
    Plus,
    X,
    Upload,
    Image as ImageIcon,
    Package,
    Trash2,
    Save,
    Layers,
    DollarSign,
    Globe,
    CheckCircle2
} from 'lucide-react';

// Configuration for frontend visibility
const FRONTEND_PAGES = [
    { value: 'divine', label: 'Divine Collection', path: '/divine' },
    { value: 'karma-eye', label: "Karma's Eye", path: '/karma-eye' },
    { value: 'destiny', label: 'Destiny Series', path: '/destiny' },
    { value: 'broken-hourglass', label: 'Broken Hourglass', path: '/broken-hourglass' },
    { value: 'products', label: 'Main Catalog', path: '/products' },
];

// Reusable Styles for Consistency
const STYLES = {
    label: "block text-sm font-medium text-muted-foreground mb-1.5",
    input: "w-full bg-card border border-border text-text text-sm rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all placeholder:text-muted/50",
    card: "bg-card border border-border rounded-xl shadow-sm p-6",
    sectionTitle: "text-lg font-semibold text-text flex items-center gap-2 mb-6",
    buttonSecondary: "px-4 py-2 rounded-lg border border-border bg-card text-text hover:bg-secondary transition-colors text-sm font-medium",
    buttonPrimary: "px-6 py-2 rounded-lg bg-brand text-white hover:bg-brand/90 transition-all text-sm font-medium shadow-md shadow-brand/20 flex items-center gap-2",
};

const ProductFormPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [categories, setCategories] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        tagline: '',
        description: '',
        price: '',
        compareAtPrice: '',
        category: searchParams.get('category') || '',
        productType: '',
        sizes: [],
        customSizeInput: '',
        themeColor: '#646464',
        glowColor: '255, 255, 255',
        isActive: true,
        images: [],
        listOnPages: [],
    });

    useEffect(() => {
        fetchCategories();
        if (isEditing) fetchProduct();
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            const data = res.data;
            setForm({
                title: data.title || '',
                tagline: data.tagline || '',
                description: data.description || '',
                price: data.price?.toString() || '',
                compareAtPrice: data.compareAtPrice?.toString() || '',
                category: data.category?._id || data.category || '',
                productType: data.productType || '',
                sizes: data.sizes || [],
                customSizeInput: '',
                themeColor: data.themeColor || '#646464',
                glowColor: data.glowColor || '255, 255, 255',
                isActive: data.isActive !== false,
                images: data.images || [],
                listOnPages: data.listOnPages || [],
            });
        } catch (err) {
            console.error('Failed to fetch product details');
        }
    };

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // ── Size Management ──
    const addSize = () => {
        const size = form.customSizeInput.trim().toUpperCase();
        if (size && !form.sizes.includes(size)) {
            setForm((prev) => ({
                ...prev,
                sizes: [...prev.sizes, size],
                customSizeInput: '',
            }));
        }
    };

    const removeSize = (size) => {
        setForm((prev) => ({
            ...prev,
            sizes: prev.sizes.filter((s) => s !== size),
        }));
    };

    const handleSizeKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSize();
        }
    };

    const quickSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    // ── Image Upload (Optimized) ──
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingImages(true);
        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append('image', file);
                try {
                    const res = await api.post('/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    return { url: res.data.url, alt: file.name };
                } catch (err) {
                    // Fallback to local preview if API fails
                    return { url: URL.createObjectURL(file), alt: file.name };
                }
            });

            const newImages = await Promise.all(uploadPromises);
            updateField('images', [...form.images, ...newImages]);
        } catch (error) {
            console.error("Upload error", error);
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (index) => {
        updateField('images', form.images.filter((_, i) => i !== index));
    };

    // ── Toggle Pages ──
    const togglePage = (pageValue) => {
        setForm((prev) => {
            const exists = prev.listOnPages.includes(pageValue);
            return {
                ...prev,
                listOnPages: exists
                    ? prev.listOnPages.filter((p) => p !== pageValue)
                    : [...prev.listOnPages, pageValue],
            };
        });
    };

    // ── Submit ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...form,
            price: Number(form.price),
            compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
            category: form.category || undefined,
            productType: form.productType || undefined,
        };

        try {
            if (isEditing) {
                await api.put(`/products/${id}`, payload);
            } else {
                await api.post('/products', payload);
            }
            navigate('/products');
        } catch (err) {
            alert('Failed to save product. Please check connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text p-6 md:p-12 animate-fade-in">
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">

                {/* ── Top Bar ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-border pb-6">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="p-2.5 rounded-lg border border-border bg-white text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-gray-900">
                                {isEditing ? 'Edit Product' : 'Add New Product'}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {isEditing ? `Refining SKU: ${id}` : 'Fill in the details below to create a new SKU.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploadingImages}
                            className="px-8 py-2.5 rounded-xl bg-black text-white font-bold text-sm shadow-lg hover:bg-gray-900 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="animate-pulse">Saving...</span>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {isEditing ? 'Save Changes' : 'Publish Product'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Main Column (Left) ── */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. General Info */}
                        <div className={STYLES.card}>
                            <h3 className={STYLES.sectionTitle}>
                                <Package size={20} className="text-brand" />
                                General Information
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className={STYLES.label}>Product Title <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={form.title}
                                        onChange={(e) => updateField('title', e.target.value)}
                                        placeholder="e.g. Oversized Heavyweight Hoodie"
                                        className={STYLES.input}
                                    />
                                </div>

                                <div>
                                    <label className={STYLES.label}>Tagline</label>
                                    <input
                                        type="text"
                                        value={form.tagline}
                                        onChange={(e) => updateField('tagline', e.target.value)}
                                        placeholder="e.g. Crafted for eternity."
                                        className={STYLES.input}
                                    />
                                </div>

                                <div>
                                    <label className={STYLES.label}>Description</label>
                                    <textarea
                                        rows={6}
                                        value={form.description}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        placeholder="Detailed product description..."
                                        className={`${STYLES.input} h-auto leading-relaxed resize-y`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Media */}
                        <div className={STYLES.card}>
                            <h3 className={STYLES.sectionTitle}>
                                <ImageIcon size={20} className="text-brand" />
                                Media Gallery
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {form.images.map((img, i) => (
                                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-secondary/20">
                                        <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-border hover:border-brand hover:bg-brand/5 cursor-pointer transition-all">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                                        {uploadingImages ? (
                                            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Upload size={20} className="text-muted-foreground" />
                                        )}
                                    </div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        {uploadingImages ? 'Uploading...' : 'Add Image'}
                                    </span>
                                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {/* 3. Variants & Sizes */}
                        <div className={STYLES.card}>
                            <h3 className={STYLES.sectionTitle}>
                                <Layers size={20} className="text-gray-900" />
                                Variants & Inventory
                            </h3>

                            <div className="space-y-6">
                                {/* Quick Select Buttons */}
                                <div>
                                    <label className={STYLES.label}>Quick Select Sizes</label>
                                    <div className="flex flex-wrap gap-3">
                                        {quickSizes.map((size) => {
                                            const isSelected = form.sizes.includes(size);
                                            return (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            removeSize(size);
                                                        } else {
                                                            setForm((prev) => ({ ...prev, sizes: [...prev.sizes, size] }));
                                                        }
                                                    }}
                                                    className={`min-w-[3rem] px-4 py-2.5 rounded-lg text-sm font-bold border transition-all duration-200 ${isSelected
                                                        ? 'bg-black text-white border-black shadow-md transform scale-105'
                                                        : 'bg-white text-gray-900 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Input */}
                                <div>
                                    <label className={STYLES.label}>Add Custom Size</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={form.customSizeInput}
                                            onChange={(e) => updateField('customSizeInput', e.target.value)}
                                            onKeyDown={handleSizeKeyDown}
                                            placeholder="e.g. 3XL, ONE SIZE"
                                            className={`${STYLES.input} uppercase placeholder:normal-case`}
                                        />
                                        <button
                                            type="button"
                                            onClick={addSize}
                                            className="px-6 py-2 bg-gray-100 text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Active Sizes List (Added Up Below) */}
                                {form.sizes.length > 0 && (
                                    <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                            Active Inventory List
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {form.sizes.map((size) => (
                                                <span
                                                    key={size}
                                                    className="inline-flex items-center gap-2 pl-4 pr-2 py-1.5 rounded-full bg-black text-white text-sm font-bold shadow-sm animate-in fade-in zoom-in duration-200"
                                                >
                                                    {size}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSize(size)}
                                                        className="p-0.5 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Sidebar (Right) ── */}
                    <div className="space-y-8">

                        {/* 1. Status & Visibility */}
                        <div className={STYLES.card}>
                            <h3 className={STYLES.sectionTitle}>
                                <Globe size={20} className="text-brand" />
                                Publishing
                            </h3>

                            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/10 mb-6">
                                <span className="text-sm font-medium">Store Status</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold uppercase ${form.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                                        {form.isActive ? 'Active' : 'Draft'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => updateField('isActive', !form.isActive)}
                                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className={STYLES.label}>Frontend Visibility</label>
                                <div className="flex flex-col gap-3">
                                    {FRONTEND_PAGES.map((page) => {
                                        const isSelected = form.listOnPages.includes(page.value);
                                        return (
                                            <button
                                                key={page.value}
                                                type="button"
                                                onClick={() => togglePage(page.value)}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border text-sm font-bold transition-all duration-200 ${isSelected
                                                    ? 'bg-black text-white border-black shadow-lg scale-[1.02]'
                                                    : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span>{page.label}</span>

                                                {/* The Check Icon: Only shows when selected, forces white color */}
                                                {isSelected && (
                                                    <CheckCircle2 size={18} className="text-white" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 2. Pricing */}
                        <div className={STYLES.card}>
                            <h3 className={STYLES.sectionTitle}>
                                <DollarSign size={20} className="text-brand" />
                                Pricing
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={STYLES.label}>Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={form.price}
                                        onChange={(e) => updateField('price', e.target.value)}
                                        placeholder="0.00"
                                        className={STYLES.input}
                                    />
                                </div>
                                <div>
                                    <label className={STYLES.label}>Compare at Price (₹)</label>
                                    <input
                                        type="number"
                                        value={form.compareAtPrice}
                                        onChange={(e) => updateField('compareAtPrice', e.target.value)}
                                        placeholder="0.00"
                                        className={STYLES.input}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Leave empty to hide.</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Organization */}
                        <div className={STYLES.card}>
                            <h3 className={STYLES.sectionTitle}>Organization</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={STYLES.label}>Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => updateField('category', e.target.value)}
                                        className={STYLES.input}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={STYLES.label}>Product Type</label>
                                    <select
                                        value={form.productType}
                                        onChange={(e) => updateField('productType', e.target.value)}
                                        className={STYLES.input}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="hoodie">Hoodies & Knits</option>
                                        <option value="tshirt">T-Shirts</option>
                                        <option value="jacket">Jackets</option>
                                        <option value="accessory">Accessories</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductFormPage;