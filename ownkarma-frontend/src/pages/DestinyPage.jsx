import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImageSequence } from '../utils/ImageSequence'
import gsap from 'gsap'
import '../styles/divine.css' // Reusing divine styles for full screen canvas

const frameCounts = {
    divine: 300 // Reusing Divine frames
}

function DestinyPage() {
    const navigate = useNavigate()
    const canvasRef = useRef(null)
    const seqRef = useRef(null)

    // Physics State
    const state = useRef({
        frame: 0,
        velocity: 0.2, // Base auto-play speed (positive = forward)
        baseSpeed: 0.2,
        isScrolling: false,
        scrollToVelocityTimeout: null
    })

    useEffect(() => {
        gsap.ticker.lagSmoothing(0)

        // Initialize canvas
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth
            canvasRef.current.height = window.innerHeight

            // Initialize sequence with DIVINE frames
            seqRef.current = ImageSequence.getSequence(
                'car-300',
                canvasRef.current,
                'car', // Reusing folder
                frameCounts.divine,
                'frame_',
                1,
                null,
                '.avif'
            )
        }

        // The Heartbeat: Custom Animation Loop
        const tick = () => {
            if (!seqRef.current) return

            const s = state.current

            // 1. Friction / Return to Base Speed
            // Linearly interpolate velocity back to baseSpeed
            // The 0.05 factor controls how fast it returns to auto-play after scrolling
            s.velocity += (s.baseSpeed - s.velocity) * 0.05

            // 2. Update Position
            s.frame += s.velocity

            // 3. Handle Infinite Loop (Wrapping)
            const total = frameCounts.divine
            if (s.frame >= total) {
                s.frame = s.frame % total
            } else if (s.frame < 0) {
                s.frame = total + (s.frame % total)
            }

            // 4. Render
            // Update the sequence reference frame
            seqRef.current.frame.index = Math.floor(s.frame)
            seqRef.current.render() // Optimized internally
        }

        gsap.ticker.add(tick)

        // Scroll Interaction Logic
        const handleWheel = (e) => {
            // e.deltaY > 0 is scrolling down (usually moving content up / forward in time)
            // e.deltaY < 0 is scrolling up (backward in time)

            // Adjust sensitivity
            const sensitivity = 0.02 // SIGNIFICANTLY SLOWER for precise control

            // Invert delta if needed based on desired "scroll down = forward" logic
            // Usually Scroll Down (positive deltaY) -> Go Forward
            // Scroll Up (negative deltaY) -> Go Backward
            const delta = e.deltaY * sensitivity

            // Inject velocity
            state.current.velocity += delta

            // Clamp max velocity to prevent crazy spinning
            const maxVel = 2.0 // Cap max speed lower
            if (state.current.velocity > maxVel) state.current.velocity = maxVel
            if (state.current.velocity < -maxVel) state.current.velocity = -maxVel
        }

        window.addEventListener('wheel', handleWheel)

        return () => {
            gsap.ticker.remove(tick)
            window.removeEventListener('wheel', handleWheel)
        }
    }, [])

    const handleBack = () => {
        navigate('/')
    }

    return (
        <div className="divine-page-scroll" style={{ overflow: 'hidden', height: '100vh' }}>
            {/* Back Button */}
            <button className="back-button" onClick={handleBack}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {/* Video Canvas */}
            <canvas ref={canvasRef} className="divine-canvas" style={{ zIndex: 1 }} />

            {/* Header Overlay */}
            <header className="divine-header">
                <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>DESTINY</h1>
                <p>Written In The Stars</p>
            </header>

        </div>
    )
}

export default DestinyPage
