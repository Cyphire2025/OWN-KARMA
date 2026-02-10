import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsAPI } from '../lib/api'
import '../styles/product-detail.css'

function ProductDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        fetchProduct()
    }, [id])

    const fetchProduct = async () => {
        try {
            const data = await productsAPI.getById(id)
            setProduct(data)
            // Auto-select first size if available
            if (data.sizes && data.sizes.length > 0) {
                setSelectedSize(data.sizes[0])
            }
            setLoading(false)
        } catch (error) {
            console.error('Error fetching product:', error)
            setLoading(false)
        }
    }

    const handleAddToCart = () => {
        if (!product) return;
        if (product.sizes?.length > 0 && !selectedSize) {
            alert('Please select a size');
            return;
        }
        // TODO: Implement cart functionality
        alert(`Added ${quantity} x ${product.title} (${selectedSize}) to cart!`)
    }

    if (loading) {
        return (
            <div className="product-detail-loading">
                <p>Loading product...</p>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="product-detail-error">
                <p>Product not found</p>
                <button onClick={() => navigate(-1)}>Go Back</button>
            </div>
        )
    }

    const images = product.images || []
    // Fallback to thumbnail if no images array, or placeholder
    const currentImage = images[selectedImage]?.url || product.thumbnail || ''

    return (
        <div className="product-detail-page">
            {/* Back Button */}
            <button className="back-button-detail" onClick={() => navigate(-1)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Back
            </button>

            <div className="product-detail-container">
                {/* Left Side - Images */}
                <div className="product-images-section">
                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="product-thumbnails">
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(idx)}
                                >
                                    <img src={img.url} alt={`${product.title} ${idx + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Main Image */}
                    <div className="product-main-image">
                        {currentImage ? (
                            <img src={currentImage} alt={product.title} />
                        ) : (
                            <div className="no-image">No Image</div>
                        )}
                    </div>
                </div>

                {/* Right Side - Product Info */}
                <div className="product-info-section">
                    <h1 className="product-title">{product.title}</h1>
                    {product.tagline && <p className="product-tagline">{product.tagline}</p>}

                    <div className="product-price-container">
                        <span className="product-price">
                            ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.compareAtPrice && (
                            <span className="product-compare-price">
                                ₹{product.compareAtPrice.toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>

                    {/* Size Selector */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div className="product-option">
                            <label>Size:</label>
                            <div className="option-values">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        className={`option-btn ${selectedSize === size ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="quantity-selector">
                        <label>Quantity:</label>
                        <div className="quantity-controls">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>
                    </div>

                    {/* Add to Cart */}
                    <button className="add-to-cart-btn" onClick={handleAddToCart}>
                        ADD TO CART
                    </button>

                    {/* Product Details Accordion */}
                    <div className="product-accordion">
                        <details className="accordion-item" open>
                            <summary>PRODUCT DETAILS</summary>
                            <div className="accordion-content">
                                <p>{product.description || 'No description available.'}</p>
                                {product.material && <p><strong>Material:</strong> {product.material}</p>}
                            </div>
                        </details>

                        <details className="accordion-item">
                            <summary>SHIPPING & RETURNS</summary>
                            <div className="accordion-content">
                                <p>Free shipping on orders over ₹2000.</p>
                                <p>7-day return policy.</p>
                                <p>Estimated delivery: 3-5 business days.</p>
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetailPage
