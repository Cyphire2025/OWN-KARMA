import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { frameCounts } from '../frame_manifest.js'
import { ImageSequence } from '../utils/ImageSequence.js'

gsap.registerPlugin(ScrollTrigger)

const SCROLL_DURATION_CHAP1 = 300

function Chapter1Page() {
    const canvasRef = useRef(null)
    const chap1SeqRef = useRef(null)
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
            chap1SeqRef.current = new ImageSequence(canvasRef.current, 'chap1', frameCounts.chap1, 'frame_', 1)
        }

        // Setup animations immediately
        setupChapter1Animations()

        return () => {
            if (lenisRef.current) {
                lenisRef.current.destroy()
            }
            ScrollTrigger.getAll().forEach(trigger => trigger.kill())
        }
    }, [])

    const setupChapter1Animations = () => {
        const chap1Section = document.querySelector('#chapter1-section')
        if (!chap1Section || !chap1SeqRef.current) return

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: chap1Section,
                start: 'top top',
                end: `+=${SCROLL_DURATION_CHAP1}%`,
                pin: true,
                scrub: 1.5,
            }
        })

        // Image Sequence
        tl.to(chap1SeqRef.current.frame, {
            index: chap1SeqRef.current.actualFrameCount - 1,
            ease: 'none',
            duration: 1,
            onUpdate: () => chap1SeqRef.current.render()
        }, 0)

        // Text 1
        tl.fromTo('#c1-text-1',
            { autoAlpha: 0, filter: 'blur(20px)', y: 50, scale: 0.9 },
            { autoAlpha: 1, filter: 'blur(0px)', y: 0, scale: 1, duration: 0.2, ease: 'power3.out' },
            0.15
        )
        tl.to('#c1-text-1',
            { autoAlpha: 0, filter: 'blur(15px)', y: -40, duration: 0.2, ease: 'power2.in' },
            0.42
        )

        // Text 2
        tl.fromTo('#c1-text-2',
            { autoAlpha: 0, scale: 0.92, filter: 'blur(20px)', y: 50 },
            { autoAlpha: 1, scale: 1, filter: 'blur(0px)', y: 0, duration: 0.22, ease: 'power3.out' },
            0.52
        )
        tl.to('#c1-text-2',
            { autoAlpha: 0, filter: 'blur(15px)', y: -35, duration: 0.18, ease: 'power2.in' },
            0.78
        )

        // Button
        tl.fromTo('#explore-chap2-btn',
            { autoAlpha: 0, y: 30, scale: 0.95 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.2, ease: 'power2.out' },
            0.85
        )
    }

    const handleExploreChapter2 = () => {
        alert('Chapter 2 coming soon!')
    }

    return (
        <>
            {/* Header */}
            <header className="main-header">
                <h1>Own Karma / The Journey</h1>
            </header>

            {/* Chapter 1 Section */}
            <section id="chapter1-section" className="scroll-sequence">
                <div className="media-container">
                    <canvas
                        ref={canvasRef}
                        id="chap1-canvas"
                        style={{ opacity: 1, visibility: 'visible', display: 'block', position: 'absolute', zIndex: 1 }}
                    ></canvas>
                </div>

                <div className="overlay-content">
                    <div className="center-text hero-text" id="c1-text-1" style={{ fontSize: '2.5rem' }}>
                        We do not stand above creation.
                    </div>
                    <div className="center-text hero-text" id="c1-text-2" style={{ fontSize: '2.5rem' }}>
                        We live inside it.
                    </div>

                    <div className="action-container">
                        <button className="explore-btn" id="explore-chap2-btn" onClick={handleExploreChapter2}>
                            <span>Explore Chapter 2</span>
                        </button>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Chapter1Page
