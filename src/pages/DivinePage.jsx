import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImageSequence } from '../utils/ImageSequence'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../styles/divine.css'

gsap.registerPlugin(ScrollTrigger)

const frameCounts = {
    divine: 300
}

function DivinePage() {
    const navigate = useNavigate()
    const canvasRef = useRef(null)
    const divineSeqRef = useRef(null)
    const containerRef = useRef(null)
    const [videoPlayed, setVideoPlayed] = useState(false)

    useEffect(() => {
        gsap.ticker.lagSmoothing(0)

        // Initialize canvas size first
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth
            canvasRef.current.height = window.innerHeight

            // Initialize image sequence using Cache
            divineSeqRef.current = ImageSequence.getSequence(
                'car-300', // Unique Cache Key
                canvasRef.current,
                'car',
                frameCounts.divine,
                'frame_',
                1,
                null,
                '.avif'
            )
        }

        // Auto-play after images start loading
        setTimeout(() => {
            playOnce()
        }, 100)

        return () => {
            gsap.killTweensOf(divineSeqRef.current?.frame)
            ScrollTrigger.getAll().forEach(trigger => trigger.kill())
        }
    }, [])

    const playOnce = () => {
        if (!divineSeqRef.current) return

        // Track last rendered frame locally to avoid closure issues if possible, 
        // but here onUpdate is a closure. We can use a property on the ref or just let the optimized render() handle it.
        // Since we upgraded ImageSequence.render() to check internally, ANY call to render() is now cheap if frame hasn't changed.
        // So we can just call render() safely!

        // Animate from frame 0 to last frame - INFINITE LOOP
        gsap.to(divineSeqRef.current.frame, {
            index: frameCounts.divine - 1,
            duration: 10,
            ease: 'none',
            repeat: -1, // Loop infinitely
            yoyo: false,
            onUpdate: () => {
                // The internal optimized render() will only draw when index changes
                divineSeqRef.current.render()
            },
            onRepeat: () => {
                // Reset to frame 0 on each loop
                divineSeqRef.current.frame.index = 0
            }
        })
    }

    const handleBack = () => {
        navigate('/')
    }

    return (
        <div className="divine-page-scroll" ref={containerRef}>
            {/* Back Button */}
            <button className="back-button" onClick={handleBack}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {/* Video Section */}
            <section className="video-section">
                <canvas ref={canvasRef} className="divine-canvas" />

                {/* Header */}
                <header className="divine-header">
                    <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>DIVINE</h1>
                    <p>Beyond Human Understanding</p>
                </header>

                {/* Cloud Transition Effect */}
                <div className="cloud-transition"></div>
            </section>

            {/* Content Sections */}
            <section className="content-section ideation-section">
                <div className="content-container">
                    <div className="content-text">
                        <span className="section-label">PHILOSOPHY</span>
                        <h2>Where consciousness meets creation and silence speaks louder than words.</h2>
                        <p>
                            Inspired by the eternal quest for meaning, <strong>Divine</strong> represents
                            the journey beyond human understanding, where every moment is a meditation
                            and every action becomes sacred.
                        </p>
                    </div>
                    <div className="content-image">
                        <div className="image-placeholder">
                            <img src="/backgrounds/divine1.png" alt="" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="content-section engineering-section">
                <div className="content-container reverse">
                    <div className="content-image">
                        <div className="image-placeholder">
                            <img src="/backgrounds/divine2.png" alt="" />
                        </div>
                    </div>
                    <div className="content-text">
                        <span className="section-label">EXPERIENCE</span>
                        <h2>Crafted for those who seek depth over distraction.</h2>
                        <p>
                            Every detail is intentional. Every frame tells a story.
                            <strong>Divine</strong> invites you to pause, reflect, and discover
                            the extraordinary within the ordinary.
                        </p>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <h2>Begin Your Journey</h2>
                <p>Experience the convergence of art, philosophy, and consciousness.</p>
                <button className="cta-button">Explore More</button>
            </section>
        </div>
    )
}

export default DivinePage
