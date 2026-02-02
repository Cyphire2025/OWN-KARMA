import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/products.css'

const products = [
    {
        name: 'DIVINE',
        tagline: 'Beyond Human Understanding',
        color: '#646464ff',
        image: '/backgrounds/1.png'
    },
    {
        name: 'KARMA\'S EYE',
        tagline: 'Witness To Every Action',
        color: '#646464ff',
        image: '/backgrounds/2.png'
    },
    {
        name: 'DESTINY',
        tagline: 'Written In The Stars',
        color: '#646464ff',
        image: '/backgrounds/3.png'
    },
    {
        name: 'BROKEN HOURGLASS',
        tagline: 'Time\'s Final Surrender',
        color: '#646464ff',
        image: '/backgrounds/4.png'
    }
]

function ProductsPage() {
    const navigate = useNavigate()
    const starsRef = useRef(null)

    useEffect(() => {
        createStars()
    }, [])

    const createStars = () => {
        const container = starsRef.current
        if (!container) return

        // Create multiple layers of stars
        const starCount = 200

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div')
            star.className = 'star'

            // Random position
            star.style.left = `${Math.random() * 100}%`
            star.style.top = `${Math.random() * 100}%`

            // Random size
            const size = Math.random() * 2 + 1
            star.style.width = `${size}px`
            star.style.height = `${size}px`

            // Random animation duration
            star.style.animationDuration = `${Math.random() * 3 + 2}s`
            star.style.animationDelay = `${Math.random() * 3}s`

            container.appendChild(star)
        }
    }

    const handleCardClick = (productName) => {
        if (productName === 'DIVINE') {
            navigate('/divine')
        } else {
            // TODO: Navigate to other pages later
            console.log(`Navigating to ${productName}`)
        }
    }

    return (
        <div className="products-page-luxury">
            {/* Animated Starry Background */}
            <div className="stars-container" ref={starsRef}></div>

            {/* Header - Top Fixed */}
            <header className="luxury-header-fixed">
                <h1>OWN KARMA</h1>
            </header>

            {/* Products Grid */}
            <div className="products-container">
                <div className="products-grid">
                    {products.map((product, index) => (
                        <div
                            key={index}
                            className="product-card-luxury"
                            style={{ '--card-color': product.color }}
                            onClick={() => handleCardClick(product.name)}
                        >
                            <div className="card-inner">
                                {product.image && (
                                    <>
                                        <div
                                            className="card-background"
                                            style={{ backgroundImage: `url(${product.image})` }}
                                        ></div>
                                        <div className="card-overlay"></div>
                                    </>
                                )}
                                <div className="card-glow"></div>
                                <div className="card-space-glow"></div>
                                <div className="card-content">
                                    <h3 className="card-name">{product.name} </h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer - Bottom Fixed */}
            <footer className="luxury-footer-fixed">
                <p>Crafted with consciousness · Building Own Karma</p>
            </footer>
        </div>
    )
}

export default ProductsPage
