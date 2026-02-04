import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { medusa } from '../lib/medusa'
import '../styles/product-detail.css'

function ProductDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        fetchProduct()
    }, [id])

    const fetchProduct = async () => {
        try {
            const { product } = await medusa.products.retrieve(id)
            setProduct(product)
            setSelectedVariant(product.variants?.[0])
            setLoading(false)
        } catch (error) {
            console.error('Error fetching product:', error)
            setLoading(false)
        }
    }

    const handleAddToCart = () => {
        // TODO: Implement cart functionality
        alert(`Added ${quantity} x ${product.title} to cart!`)
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
    const currentImage = images[selectedImage]?.url || product.thumbnail

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

                    {selectedVariant?.prices?.[0] && (
                        <p className="product-price">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: selectedVariant.prices[0].currency_code.toUpperCase()
                            }).format(selectedVariant.prices[0].amount / 100)}
                        </p>
                    )}

                    {/* Variant Options */}
                    {product.options?.map((option) => (
                        <div key={option.id} className="product-option">
                            <label>{option.title}:</label>
                            <div className="option-values">
                                {option.values?.map((value) => (
                                    <button
                                        key={value.id}
                                        className={`option-btn ${selectedVariant?.options?.find(o => o.value === value.value) ? 'active' : ''}`}
                                        onClick={() => {
                                            const variant = product.variants.find(v =>
                                                v.options?.some(o => o.value === value.value)
                                            )
                                            if (variant) setSelectedVariant(variant)
                                        }}
                                    >
                                        {value.value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

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
                        <details className="accordion-item">
                            <summary>PRODUCT DETAILS</summary>
                            <div className="accordion-content">
                                <p>{product.description || 'No description available.'}</p>
                                {product.material && <p><strong>Material:</strong> {product.material}</p>}
                                {product.weight && <p><strong>Weight:</strong> {product.weight}g</p>}
                            </div>
                        </details>

                        <details className="accordion-item">
                            <summary>SHIPPING & RETURNS</summary>
                            <div className="accordion-content">
                                <p>Free shipping on orders over $100.</p>
                                <p>30-day return policy.</p>
                                <p>Estimated delivery: 5-7 business days.</p>
                            </div>
                        </details>

                        {product.metadata?.vendor && (
                            <details className="accordion-item">
                                <summary>VENDOR INFORMATION</summary>
                                <div className="accordion-content">
                                    <p><strong>Sold by:</strong> {product.metadata.vendor}</p>
                                    <p>Rating: ⭐⭐⭐⭐⭐</p>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetailPage
