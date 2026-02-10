import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../lib/api';
import '../styles/products-section.css';

/**
 * Reusable Products Section Component
 * Fetches and displays products based on the page they should be listed on
 * 
 * @param {string} pageName - The page identifier (e.g., 'divine', 'karma-eye', 'destiny', 'broken-hourglass', 'products')
 * @param {string} title - Section title (e.g., "Divine Collection")
 * @param {string} subtitle - Section subtitle (e.g., "Curated pieces for conscious living")
 */
const ProductsSection = ({ pageName, categoryId, title, subtitle }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, [pageName, categoryId]);

    const fetchProducts = async () => {
        try {
            console.log(`Fetching products...`);

            // Fetch products using either category ID (if dynamic page) or page internal name (legacy)
            const params = { active: true };
            if (categoryId) params.category = categoryId;
            else if (pageName) params.page = pageName;

            const data = await productsAPI.getAll(params);

            setProducts(data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error.message || 'Failed to load products');
            setLoading(false);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    // removed early return to allow empty state to render

    return (
        <section className="products-section">
            <div className="products-container">
                <div className="products-header">
                    <h2>{title}</h2>
                    {subtitle && <p>{subtitle}</p>}
                </div>

                {loading ? (
                    <div className="products-loading">
                        <p>Loading products...</p>
                    </div>
                ) : error ? (
                    <div className="products-error">
                        <p style={{ color: '#ff6b6b' }}>Error: {error}</p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '1rem' }}>
                            Check browser console for details
                        </p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products && products.length > 0 ? (
                            products.map((product) => {
                                const image = product.images?.[0]?.url || product.thumbnail;

                                return (
                                    <div
                                        key={product._id}
                                        className="product-card"
                                        onClick={() => handleProductClick(product._id)}
                                        style={{
                                            '--product-glow': product.glowColor || '255, 255, 255',
                                            '--product-theme': product.themeColor || '#646464ff'
                                        }}
                                    >
                                        <div className="product-image">
                                            {image ? (
                                                <img src={image} alt={product.title} />
                                            ) : (
                                                <div className="product-image-placeholder">
                                                    <span>No Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="product-info">
                                            <h3 className="product-title">{product.title}</h3>
                                            {product.tagline && (
                                                <p className="product-subtitle">{product.tagline}</p>
                                            )}
                                            {product.price && (
                                                <div className="product-pricing">
                                                    <span className="product-price">
                                                        ₹{product.price.toLocaleString('en-IN')}
                                                    </span>
                                                    {product.compareAtPrice && (
                                                        <span className="product-compare-price">
                                                            ₹{product.compareAtPrice.toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="products-empty">
                                <p>No products listed yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductsSection;
