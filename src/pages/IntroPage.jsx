import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImageSequence } from '../utils/ImageSequence'
import gsap from 'gsap'
import '../styles/divine.css'

const STAGES = [
    { id: 0, folder: 'intro', frames: 1823, loop: false },
    { id: 1, folder: 'car1', frames: 300, loop: false },
    { id: 2, folder: 'intro', frames: 1823, loop: false }
]

function IntroPage() {
    const navigate = useNavigate()
    const canvasRef = useRef(null)
    const headerRef = useRef(null)
    const seqRef = useRef(null)
    const [stage, setStage] = useState(0)

    // UI State
    const [showButton, setShowButton] = useState(false)
    const [showScrollPrompt, setShowScrollPrompt] = useState(false)

    const directionRef = useRef('next')

    const state = useRef({
        frame: 0,
        velocity: 0.5,
        baseSpeed: 0.5,
        targetSpeed: 0.5,
        buttonTriggered: false
    })

    // Initialize/Swap Sequence when Stage changes
    useEffect(() => {
        if (!canvasRef.current) return

        const currentStageData = STAGES[stage]
        state.current.buttonTriggered = false

        // --- Init Frame based on Direction ---
        if (directionRef.current === 'prev') {
            state.current.frame = currentStageData.frames - 1
            if (stage === 0) setShowButton(true)
            if (stage === 1) setShowScrollPrompt(true)
        } else {
            state.current.frame = 0
            setShowButton(false)
            setShowScrollPrompt(false)
        }

        // --- Speed Settings ---
        if (stage === 0) {
            state.current.velocity = 0.5
            state.current.baseSpeed = 0.5
        } else {
            state.current.velocity = 0.2
            state.current.baseSpeed = 0.2
        }

        // Fade Header IN
        if (headerRef.current) {
            gsap.fromTo(headerRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.8, delay: 0.5 }
            )
        }

        if (seqRef.current) {
            // 
        }

        seqRef.current = new ImageSequence(
            canvasRef.current,
            currentStageData.folder,
            currentStageData.frames,
            'frame_',
            1,
            null
        )
    }, [stage])

    // Main Animation Loop
    useEffect(() => {
        gsap.ticker.lagSmoothing(0)

        const tick = () => {
            if (!seqRef.current) return

            const s = state.current
            const config = STAGES[stage]

            s.velocity += (s.baseSpeed - s.velocity) * 0.05
            s.frame += s.velocity

            if (config.loop) {
                if (s.frame >= config.frames) s.frame = 0
                if (s.frame < 0) s.frame = config.frames - 1
            } else {
                // STRICT STOP AT END
                if (s.frame >= config.frames - 1) {
                    s.frame = config.frames - 1
                    s.velocity = 0 // HARD STOP

                    // Stage 0 Trigger: Button
                    if (stage === 0 && !s.buttonTriggered) {
                        s.buttonTriggered = true
                        setShowButton(true)
                    }
                    // Stage 1 Trigger: Scroll Prompt
                    if (stage === 1) setShowScrollPrompt(true)
                }

                // STRICT STOP AT START
                if (s.frame <= 0) {
                    s.frame = 0
                    if (s.velocity < 0) s.velocity = 0 // Prevent negative drift
                }
            }

            seqRef.current.frame.index = Math.floor(s.frame)
            seqRef.current.render()

            if (stage === 0) {
                syncIntroText(s.frame)
                if (s.frame > 500 && !s.buttonTriggered) {
                    s.buttonTriggered = true
                    setShowButton(true)
                }
            }
        }

        gsap.ticker.add(tick)

        const handleWheel = (e) => {
            const sensitivity = stage === 0 ? 0.05 : 0.02

            // --- Stage 1 Transitions ---
            if (stage === 1) {
                // NEXT: 1 -> 2 (Scroll Down at End)
                if (showScrollPrompt && e.deltaY > 50) {
                    transitionToStage(2, 'next')
                    return
                }
                // PREV: 1 -> 0 (Scroll Up at Start)
                if (state.current.frame < 50 && e.deltaY < -50) {
                    transitionToStage(0, 'prev')
                    return
                }
            }

            // --- Stage 2 Transitions ---
            if (stage === 2) {
                // PREV: 2 -> 1 (Scroll Up)
                if (e.deltaY < -50) {
                    transitionToStage(1, 'prev')
                    return
                }
            }

            state.current.velocity += e.deltaY * sensitivity

            // Limit max speed
            if (state.current.velocity > 4) state.current.velocity = 4
            if (state.current.velocity < -4) state.current.velocity = -4
        }

        window.addEventListener('wheel', handleWheel, { passive: false })

        return () => {
            gsap.ticker.remove(tick)
            window.removeEventListener('wheel', handleWheel)
        }
    }, [stage, showScrollPrompt])

    const transitionToStage = (nextStage, direction = 'next') => {
        const canvas = canvasRef.current
        const tl = gsap.timeline()
        directionRef.current = direction

        // Hide Header
        if (headerRef.current) gsap.set(headerRef.current, { opacity: 0 })

        // Slide Directions
        const outY = direction === 'next' ? '-100vh' : '100vh'
        const inY = direction === 'next' ? '100vh' : '-100vh'

        tl.to(canvas, {
            y: outY,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                setStage(nextStage)
            }
        })
            .set(canvas, { y: inY })
            .to(canvas, {
                y: '0%',
                duration: 0.8,
                ease: 'power2.out'
            })
    }

    const syncIntroText = (frame) => {
        const t1 = document.getElementById('text-1')
        if (t1) {
            if (frame > 90 && frame < 540) t1.style.opacity = 1
            else t1.style.opacity = 0
        }

        const t2 = document.getElementById('text-2')
        if (t2) {
            if (frame > 820 && frame < 1360) t2.style.opacity = 1
            else t2.style.opacity = 0
        }
    }

    const handleEnterExperience = () => {
        transitionToStage(1)
    }

    const handleExploreProducts = () => {
        const overlay = document.createElement('div')
        overlay.style.cssText = `
             position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
             background: #000; z-index: 9999; opacity: 0; transition: opacity 0.6s ease; pointer-events: none;
         `
        document.body.appendChild(overlay)
        requestAnimationFrame(() => overlay.style.opacity = '1')
        setTimeout(() => {
            navigate('/products')
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    overlay.style.transition = 'opacity 0.8s ease'
                    overlay.style.opacity = '0'
                    setTimeout(() => {
                        if (document.body.contains(overlay)) document.body.removeChild(overlay)
                    }, 800)
                }
            }, 100)
        }, 600)
    }

    // Styles
    const buttonStyle = {
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '9999px',
        padding: '1.2rem 3rem',
        fontSize: '0.7rem',
        letterSpacing: '0.25em',
        background: 'rgba(0, 0, 0, 0.3)',
        color: 'white',
        textTransform: 'uppercase',
        cursor: 'pointer',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.3s ease'
    }

    const wrapperStyle = {
        position: 'absolute',
        bottom: '10vh',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        transition: 'opacity 1s ease-out',
        textAlign: 'center'
    }

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000', overflow: 'hidden' }}>

            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

            {/* Stage 0: Intro */}
            {stage === 0 && (
                <>
                    <div id="text-1" className="intro-text-overlay" style={{ opacity: 0 }}>
                        <h2 className="text-3xl tracking-[1em] font-light">LIVING CONSCIOUSLY</h2>
                    </div>
                    <div id="text-2" className="intro-text-overlay" style={{ opacity: 0 }}>
                        <h2 className="text-3xl tracking-[1em] font-light">BUILDING OWN KARMA</h2>
                    </div>

                    <div style={{ ...wrapperStyle, opacity: showButton ? 1 : 0, pointerEvents: showButton ? 'auto' : 'none' }}>
                        <button
                            onClick={handleEnterExperience}
                            style={buttonStyle}
                            onMouseEnter={(e) => { e.target.style.background = 'white'; e.target.style.color = 'black' }}
                            onMouseLeave={(e) => { e.target.style.background = 'rgba(0, 0, 0, 0.3)'; e.target.style.color = 'white' }}
                        >
                            Enter Experience
                        </button>
                    </div>
                </>
            )}

            {/* Stage 1: Car - Scroll Prompt */}
            {stage === 1 && showScrollPrompt && (
                <div style={{ ...wrapperStyle, opacity: 1, pointerEvents: 'none' }}>
                    <p className="text-sm tracking-[0.2em] font-bold uppercase mb-2 text-white">
                        Scroll For More
                    </p>
                    <div className="animate-bounce">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                            <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Stage 2: Clean Loop - Centered Button */}
            {stage === 2 && (
                <div style={{ ...wrapperStyle, opacity: 1, pointerEvents: 'auto' }}>
                    <button
                        onClick={handleExploreProducts}
                        style={buttonStyle}
                        onMouseEnter={(e) => { e.target.style.background = 'white'; e.target.style.color = 'black' }}
                        onMouseLeave={(e) => { e.target.style.background = 'rgba(0, 0, 0, 0.3)'; e.target.style.color = 'white' }}
                    >
                        Explore Chapter 1
                    </button>
                </div>
            )}

            {/* Carousel Dots */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
                {STAGES.map((s, idx) => (
                    <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-500`}
                        style={{
                            background: stage === idx ? 'white' : 'rgba(255,255,255,0.2)',
                            transform: stage === idx ? 'scale(1.5)' : 'scale(1)'
                        }}
                    />
                ))}
            </div>

            <header
                ref={headerRef}
                className="absolute top-8 left-0 w-full z-50 pointer-events-none"
                style={{ textAlign: 'center', opacity: 1 }}
            >
                <h1 className="text-xl tracking-[0.5em] font-light text-white/80 inline-block">OWN KARMA</h1>
            </header>

            <style>{`
                .intro-text-overlay {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    text-align: center;
                    transition: opacity 0.5s ease;
                    pointer-events: none;
                    width: 100%;
                }
                .intro-text-overlay h2 {
                    font-size: clamp(1.5rem, 4vw, 3rem);
                    font-weight: 300;
                    letter-spacing: 0.5em;
                     text-shadow: 0 0 20px rgba(255,255,255,0.3);
                }
                .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
                .animate-bounce { animation: bounce 2s infinite; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes bounce { 
                    0%, 100% { transform: translateY(0); } 
                    50% { transform: translateY(10px); } 
                }
            `}</style>
        </div>
    )
}

export default IntroPage
