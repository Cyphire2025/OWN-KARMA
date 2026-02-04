import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
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

    useLayoutEffect(() => {
        // Cleanup transition overlays from IntroPage if they persist
        const overlays = document.querySelectorAll('.transition-overlay')
        overlays.forEach(el => el.remove())

        createStars()

        // Context for safe cleanup
        const ctx = gsap.context(() => {
            // Instant "Dealt Hand" Entrance - Bulletproof Logic
            gsap.fromTo('.product-card-luxury',
                {
                    x: '120vw', // Start fully off-screen to the right
                    autoAlpha: 0, // Handles opacity + visibility
                    scale: 0.8,
                    rotateZ: 0
                },
                {
                    x: 0,
                    autoAlpha: 1, // Becomes visible only when moving
                    scale: 1,
                    duration: 1.0,
                    ease: 'power3.out',
                    stagger: {
                        each: 0.05,
                        from: 'start'
                    },
                    // Fan out logic
                    rotation: (i) => (i - 1.5) * 10,
                    y: (i) => Math.abs(i - 1.5) * 30,
                    force3D: true,
                    clearProps: 'autoAlpha' // Keep visibility active
                }
            )
        })

        return () => ctx.revert() // Cleanup to prevent double-firing glitch
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

    const handleCardHover = (e, index, isEnter) => {
        const target = e.currentTarget

        if (isEnter) {
            gsap.to(target, {
                rotation: 0,
                y: -60,
                scale: 1.1,
                zIndex: 100,
                duration: 0.2, // Instant response
                ease: 'power2.out',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            })
        } else {
            // Restore fan state
            gsap.to(target, {
                rotation: (index - 1.5) * 10,
                y: Math.abs(index - 1.5) * 30,
                scale: 1,
                zIndex: 1,
                duration: 0.3,
                ease: 'power2.out',
                clearProps: 'zIndex,boxShadow'
            })
        }
    }

    const handleTransition = (path) => {
        // Create fade overlay
        const overlay = document.createElement('div')
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #000;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.6s ease;
            pointer-events: none;
        `
        document.body.appendChild(overlay)

        // Force browser repaint
        requestAnimationFrame(() => {
            overlay.style.opacity = '1'
        })

        // Navigate after fade
        setTimeout(() => {
            navigate(path)

            // Cleanup overlay after navigation (smooth cross-fade)
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    // Fade out overlay on new page
                    overlay.style.transition = 'opacity 0.8s ease'
                    overlay.style.opacity = '0'
                    setTimeout(() => {
                        if (document.body.contains(overlay)) {
                            document.body.removeChild(overlay)
                        }
                    }, 800)
                }
            }, 100)
        }, 600)
    }

    const handleCardClick = (productName) => {
        if (productName === 'DIVINE') {
            handleTransition('/divine')
        } else if (productName === "KARMA'S EYE") {
            handleTransition('/karma-eye')
        } else if (productName === 'DESTINY') {
            handleTransition('/destiny')
        } else if (productName === 'BROKEN HOURGLASS') {
            handleTransition('/broken-hourglass')
        } else {
            console.log(`Navigating to ${productName}`)
        }
    }

    return (
        <div className="products-page-luxury">
            {/* Animated Starry Background */}
            <div className="stars-container" ref={starsRef}></div>

            {/* Products Grid */}
            <div className="products-container">
                <div className="products-grid">
                    {products.map((product, index) => (
                        <div
                            key={index}
                            className="product-card-luxury"
                            style={{ '--card-color': product.color }}
                            onClick={() => handleCardClick(product.name)}
                            onMouseEnter={(e) => handleCardHover(e, index, true)}
                            onMouseLeave={(e) => handleCardHover(e, index, false)}
                        >
                            <div className="card-inner">
                                {product.image && (
                                    <>
                                        <div
                                            className="card-background"
                                            style={{ backgroundImage: `url(${product.image})` }}
                                        ></div>
                                        <div className="card-overlay"></div>
                                        <div className="card-space-glow"></div>
                                        <div className="card-glow"></div>
                                    </>
                                )}
                                <div className="card-content">
                                    <h3 className="card-name">{product.name}</h3>
                                    <p className="card-tagline">{product.tagline}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer - Bottom Fixed */}
            <footer className="luxury-footer-fixed">
                <p>Crafted with Consciousness &middot; Building Own Karma</p>
            </footer>
        </div>
    )
}

export default ProductsPage
