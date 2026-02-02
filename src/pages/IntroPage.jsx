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
            introSeqRef.current = new ImageSequence(canvasRef.current, 'intro', frameCounts.intro, 'frame_', 1)
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

        // Heading animations
        tl.fromTo('#intro-heading',
            { autoAlpha: 0, y: -20 },
            { autoAlpha: 1, y: 0, duration: 0.1, ease: 'power2.out' },
            0
        )
        tl.to('#intro-heading',
            { autoAlpha: 0, y: -10, duration: 0.1, ease: 'power2.in' },
            0.25
        )

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
        console.log('Starting cinematic transition to Chapter 1...')

        // Get the current canvas
        const introCanvas = canvasRef.current
        if (!introCanvas) return

        // Create transition overlay with current frame snapshot
        const transitionOverlay = document.createElement('div')
        transitionOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 9999;
            background: #000;
            opacity: 0;
            transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        `

        // Snapshot current frame
        const snapshot = document.createElement('canvas')
        snapshot.width = window.innerWidth
        snapshot.height = window.innerHeight
        const ctx = snapshot.getContext('2d')
        ctx.drawImage(introCanvas, 0, 0)
        snapshot.style.cssText = 'width: 100%; height: 100%; object-fit: cover;'

        transitionOverlay.appendChild(snapshot)
        document.body.appendChild(transitionOverlay)

        // Fade to black
        requestAnimationFrame(() => {
            transitionOverlay.style.opacity = '1'
        })

        // Clean up GSAP
        ScrollTrigger.getAll().forEach(trigger => trigger.kill())
        if (lenisRef.current) lenisRef.current.destroy()

        // Navigate and fade out
        setTimeout(() => {
            navigate('/products')
            setTimeout(() => {
                transitionOverlay.style.opacity = '0'
                setTimeout(() => document.body.removeChild(transitionOverlay), 1200)
            }, 100)
        }, 1200)
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
