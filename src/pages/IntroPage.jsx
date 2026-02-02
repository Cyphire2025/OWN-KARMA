import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { frameCounts } from '../frame_manifest.js'
import { ImageSequence } from '../utils/ImageSequence.js'

gsap.registerPlugin(ScrollTrigger)

const SCROLL_DURATION_INTRO = 200

function IntroPage() {
    const navigate = useNavigate()
    const canvasRef = useRef(null)
    const introSeqRef = useRef(null)
    const lenisRef = useRef(null)

    useEffect(() => {
        // Initialize Lenis smooth scroll
        const lenis = new Lenis({
            duration: 1.6,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureDirection: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8,
            touchMultiplier: 1.5,
        })

        lenisRef.current = lenis

        lenis.on('scroll', ScrollTrigger.update)

        function raf(time) {
            lenis.raf(time * 1000)
            requestAnimationFrame(raf)
        }
        requestAnimationFrame(raf)

        gsap.ticker.lagSmoothing(0)

        // Initialize image sequence
        if (canvasRef.current) {
            introSeqRef.current = new ImageSequence(canvasRef.current, 'intro', frameCounts.intro, 'frame_', 1, null)
        }

        // Setup animations immediately
        setupIntroAnimations()

        return () => {
            if (lenisRef.current) {
                lenisRef.current.destroy()
            }
            ScrollTrigger.getAll().forEach(trigger => trigger.kill())
        }
    }, [])

    const setupIntroAnimations = () => {
        const introSection = document.querySelector('#intro-section')
        if (!introSection || !introSeqRef.current) return

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: introSection,
                start: 'top top',
                end: `+=${SCROLL_DURATION_INTRO}%`,
                pin: true,
                scrub: 1.5,
            }
        })

        // Image Sequence
        tl.to(introSeqRef.current.frame, {
            index: introSeqRef.current.actualFrameCount - 1,
            ease: 'none',
            duration: 1,
            onUpdate: () => introSeqRef.current.render()
        }, 0)

        // Text 1
        tl.fromTo('#intro-text-1',
            { autoAlpha: 0, y: 50, filter: 'blur(20px)', scale: 0.9 },
            { autoAlpha: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 0.15, ease: 'power3.out' },
            0.05
        )
        tl.to('#intro-text-1',
            { autoAlpha: 0, y: -30, filter: 'blur(15px)', duration: 0.15, ease: 'power2.in' },
            0.3
        )

        // Text 2
        tl.fromTo('#intro-text-2',
            { autoAlpha: 0, scale: 0.95, filter: 'blur(15px)', y: 30 },
            { autoAlpha: 1, scale: 1, filter: 'blur(0px)', y: 0, duration: 0.2, ease: 'power3.out' },
            0.45
        )
        tl.to('#intro-text-2',
            { autoAlpha: 0, filter: 'blur(10px)', y: -20, duration: 0.15 },
            0.75
        )

        // Button
        tl.fromTo('#explore-btn',
            { autoAlpha: 0, y: 30, scale: 0.95 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.2, ease: 'power2.out' },
            0.8
        )
    }

    const handleExploreProducts = () => {
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

        // Fade to black
        requestAnimationFrame(() => {
            overlay.style.opacity = '1'
        })

        // Clean up GSAP and Lenis before leaving
        ScrollTrigger.getAll().forEach(trigger => trigger.kill())
        if (lenisRef.current) lenisRef.current.destroy()

        // Navigate after fade
        setTimeout(() => {
            navigate('/products')

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

    return (
        <>
            {/* Header */}
            <header className="main-header">
                <h1>Own Karma / The Journey</h1>
            </header>

            {/* Intro Section */}
            <section id="intro-section" className="scroll-sequence">
                <div className="media-container">
                    <canvas ref={canvasRef} id="intro-canvas"></canvas>
                </div>

                <div className="overlay-content">
                    {/* Main Text Animations */}
                    <div className="center-text hero-text" id="intro-text-1">Living consciously</div>
                    <div className="center-text hero-text" id="intro-text-2">Building Own Karma</div>

                    <div className="action-container">
                        <button className="explore-btn" id="explore-btn" onClick={handleExploreProducts}>
                            <span>Explore Products</span>
                        </button>
                    </div>
                </div>
            </section>
        </>
    )
}

export default IntroPage
