import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImageSequence } from '../utils/ImageSequence'
import gsap from 'gsap'
import { medusa } from '../lib/medusa'
import '../styles/divine.css'

const frameCounts = {
    car: 150 // 300 / 2 for stride 2 optimization
}

function BrokenHourglassPage() {
    const navigate = useNavigate()
    const canvasRef = useRef(null)
    const seqRef = useRef(null)
    const containerRef = useRef(null)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Animation State
    const state = useRef({
        frame: 0,
        velocity: 0.16, // Matching Intro Page stage speed
        baseSpeed: 0.16
    })

    useEffect(() => {
        gsap.ticker.lagSmoothing(0)

        // Initialize canvas
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth
            canvasRef.current.height = window.innerHeight

            // Initialize image sequence using 'car' frames
            seqRef.current = ImageSequence.getSequence(
                'car-300', // Cache key
                canvasRef.current,
                'car', // Folder name
                frameCounts.car * 2, // Original frame count
                'frame_',
                2, // Stride 2 optimization
                null,
                '.avif'
            )
        }

        // Animation Heartbeat
        const tick = () => {
            if (!seqRef.current) return

            const s = state.current

            // Auto-play logic
            s.frame += s.velocity

            // Loop wrapping
            const total = frameCounts.car
            if (s.frame >= total) {
                s.frame = s.frame % total
            } else if (s.frame < 0) {
                s.frame = total + (s.frame % total)
            }

            // Render
            seqRef.current.frame.index = Math.floor(s.frame)
            seqRef.current.render()
        }

        gsap.ticker.add(tick)

        // Fetch products from Medusa
        fetchProducts()

        return () => {
            gsap.ticker.remove(tick)
        }
    }, [])

    const fetchProducts = async () => {
        try {
            console.log('Fetching BROKEN HOURGLASS collection...')
            const collectionsResponse = await medusa.collections.list()

            // Look for "Broken Hourglass" collection
            const brokenCollection = collectionsResponse.collections.find(
                col => col.title.toLowerCase().includes('broken')
            )

            if (!brokenCollection) {
                console.log('Broken Hourglass collection not found')
                setProducts([])
                setLoading(false)
                return
            }

            const response = await medusa.products.list({
                collection_id: [brokenCollection.id]
            })

            setProducts(response.products || [])
            setLoading(false)
        } catch (error) {
            console.error('Error fetching products:', error)
            setError(error.message)
            setLoading(false)
        }
    }

    const handleBack = () => {
        navigate('/')
    }

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`)
    }

    return (
        <div className="divine-page-scroll" ref={containerRef}>
            {/* Back Button */}
            <button className="back-button" onClick={handleBack}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {/* Video Section (Canvas Based) */}
            <section className="video-section">
                <canvas ref={canvasRef} className="divine-canvas" style={{ zIndex: 0 }} />

                {/* Header */}
                <header className="divine-header">
                    <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>BROKEN HOURGLASS</h1>
                    <p>Time's Final Surrender</p>
                </header>

                {/* Cloud Transition Effect */}
                <div className="cloud-transition"></div>
            </section>

            {/* Content Sections */}
            <section className="content-section ideation-section">
                <div className="content-container">
                    <div className="content-text">
                        <span className="section-label">PHILOSOPHY</span>
                        <h2>Embracing the beauty of the finite.</h2>
                        <p>
                            <strong>Broken Hourglass</strong> challenges our perception of time.
                            It is not about counting the seconds, but making the seconds count.
                            A tribute to impermanence and the urgency of now.
                        </p>
                    </div>
                    <div className="content-image">
                        <div className="image-placeholder">
                            <img src="/backgrounds/4.png" alt="Broken Hourglass Concept" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="content-section engineering-section">
                <div className="content-container reverse">
                    <div className="content-image">
                        <div className="image-placeholder">
                            <img src="/backgrounds/2.png" alt="Broken Hourglass Detail" />
                        </div>
                    </div>
                    <div className="content-text">
                        <span className="section-label">EXPERIENCE</span>
                        <h2>Timeless design for the modern age.</h2>
                        <p>
                            Shattering conventions to reveal the essence of elegance.
                            The <strong>Broken Hourglass</strong> collection is built for those
                            who live beyond the constraints of the clock.
                        </p>
                    </div>
                </div>
            </section>

            {/* Products Section - Connected to Backend */}
            <section className="products-section">
                <div className="products-container">
                    <div className="products-header">
                        <h2>Broken Hourglass Collection</h2>
                        <p>Limited editions for the bold</p>
                    </div>

                    {loading ? (
                        <div className="products-loading">
                            <p>Loading products...</p>
                        </div>
                    ) : error ? (
                        <div className="products-loading">
                            <p style={{ color: '#ff6b6b' }}>Error: {error}</p>
                            <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '1rem' }}>
                                Check browser console for details
                            </p>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {products && products.length > 0 ? (
                                products.map((product) => {
                                    const image = product.thumbnail || product.images?.[0]?.url
                                    const price = product.variants?.[0]?.prices?.[0]

                                    return (
                                        <div
                                            key={product.id}
                                            className="product-card"
                                            onClick={() => handleProductClick(product.id)}
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
                                                {product.subtitle && (
                                                    <p className="product-subtitle">{product.subtitle}</p>
                                                )}
                                                {price && (
                                                    <p className="product-price">
                                                        {new Intl.NumberFormat('en-US', {
                                                            style: 'currency',
                                                            currency: price.currency_code.toUpperCase()
                                                        }).format(price.amount / 100)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="products-loading">
                                    <p>No products found</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default BrokenHourglassPage
