import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import {
    Plus,
    Edit2,
    Trash2,
    Package,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    X
} from 'lucide-react';

// Mapping for readable page names
const PAGE_LABELS: Record<string, string> = {
    'divine': 'Divine Collection',
    'karma-eye': "Karma's Eye",
    'destiny': 'Destiny Series',
    'broken-hourglass': 'Broken Hourglass',
    'products': 'Main Catalog',
};

interface Product {
    _id: string;
    title: string;
    tagline?: string;
    price: number;
    category?: { _id: string; name: string };
    sizes?: string[]; // Updated to match your form data structure
    images?: { url: string }[];
    isActive: boolean;
    listOnPages?: string[];
}

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category');

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (categoryFilter) {
            setFilteredProducts(products.filter(p => p.category?._id === categoryFilter));
        } else {
            setFilteredProducts(products);
        }
    }, [categoryFilter, products]);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch (err) {
            console.error('API not available');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
        try {
            await api.delete(`/products/${id}`);
            // Optimistic update
            setProducts(products.filter(p => p._id !== id));
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const toggleActive = async (product: Product) => {
        try {
            // Optimistic update
            const newStatus = !product.isActive;
            setProducts(products.map(p =>
                p._id === product._id ? { ...p, isActive: newStatus } : p
            ));

            await api.put(`/products/${product._id}`, { isActive: newStatus });
        } catch (err) {
            fetchProducts(); // Revert on error
            alert('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="p-12 flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen bg-background text-text animate-fade-in">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-border pb-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Inventory</h2>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-500 text-sm">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} in your catalog
                        </p>
                        {categoryFilter && filteredProducts[0]?.category && (
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                                Page: {filteredProducts[0].category.name}
                                <button onClick={() => setSearchParams({})} className="hover:text-blue-900">
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <Link
                    to="/products/new"
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            {/* ── Empty State ── */}
            {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                        <Package size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                        {categoryFilter ? 'No products are currently listed on this page.' : 'Your catalog is currently empty. Add your first item to get started.'}
                    </p>
                    {categoryFilter ? (
                        <button onClick={() => setSearchParams({})} className="text-blue-600 font-bold hover:underline">
                            Clear Filter &rarr;
                        </button>
                    ) : (
                        <Link to="/products/new" className="text-blue-600 font-bold hover:underline">
                            Create Product &rarr;
                        </Link>
                    )}
                </div>
            )}

            {/* ── Products Table ── */}
            {filteredProducts.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="p-5 pl-6">Product Details</th>
                                    <th className="p-5">Category</th>
                                    <th className="p-5">Price</th>
                                    <th className="p-5">Sizes</th>
                                    <th className="p-5">Visibility</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50/80 transition-colors group">

                                        {/* Product Info */}
                                        <td className="p-5 pl-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0 relative">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img
                                                            src={product.images[0].url}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                            <Package size={20} className="text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{product.title}</p>
                                                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
                                                        {product.tagline || <span className="italic opacity-50">No tagline</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="p-5">
                                            <span className="inline-flex px-2.5 py-1 rounded-md border border-gray-200 bg-white text-xs font-bold text-gray-600">
                                                {product.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>

                                        {/* Price */}
                                        <td className="p-5 text-sm font-bold text-gray-900 font-mono">
                                            ₹{(product.price || 0).toLocaleString('en-IN')}
                                        </td>

                                        {/* Sizes (Fixed to use sizes array) */}
                                        <td className="p-5">
                                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                {product.sizes && product.sizes.length > 0 ? (
                                                    product.sizes.map((size, i) => (
                                                        <span key={i} className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">
                                                            {size}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">—</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Listed On (Fixed readable names) */}
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1.5">
                                                {product.listOnPages && product.listOnPages.length > 0 ? (
                                                    product.listOnPages.map((page) => (
                                                        <span key={page} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                            {PAGE_LABELS[page] || page}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-xs flex items-center gap-1">
                                                        <AlertCircle size={10} /> Hidden
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status Toggle */}
                                        <td className="p-5">
                                            <button
                                                onClick={() => toggleActive(product)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${product.isActive
                                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {product.isActive ? <CheckCircle2 size={12} /> : <EyeOff size={12} />}
                                                {product.isActive ? 'Active' : 'Draft'}
                                            </button>
                                        </td>

                                        {/* Actions (FIXED VISIBILITY) */}
                                        <td className="p-5 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/products/edit/${product._id}`}
                                                    className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                                                    title="Edit Product"
                                                >
                                                    <Edit2 size={18} strokeWidth={2.5} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={18} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;