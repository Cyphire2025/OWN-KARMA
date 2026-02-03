import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImageSequence } from '../utils/ImageSequence'
import gsap from 'gsap'
import '../styles/divine.css'

const STAGES = [
    { id: 0, folder: 'intro', frames: 1823, loop: false },
    { id: 1, folder: 'car', frames: 300, loop: false },
    { id: 2, folder: 'intro', frames: 1823, loop: false }
]

function IntroPage() {
    const navigate = useNavigate()
    const canvasRef = useRef(null)
    const headerRef = useRef(null)
    const seqRef = useRef(null)
    const progressRef = useRef(null)

    const [stage, setStage] = useState(0)

    // UI State
    const [showButton, setShowButton] = useState(false)
    const [showScrollPrompt, setShowScrollPrompt] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false) // Hamburger Menu State

    // Audio State
    const [isMuted, setIsMuted] = useState(false)
    const audioRef = useRef(null)

    useEffect(() => {
        // Initialize Audio
        const audio = new Audio('/audio/background.mp3')
        audio.loop = true
        audio.volume = 0.5
        audioRef.current = audio

        // Try to play immediately
        const playPromise = audio.play()

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay prevented by browser. Muting.", error)
                setIsMuted(true)
                audio.muted = true
                // We attempt to play again muted, or wait for interaction
                audio.play()
            })
        }

        return () => {
            audio.pause()
            audio.src = ''
        }
    }, [])

    const toggleAudio = () => {
        if (!audioRef.current) return

        const newMutedState = !isMuted
        setIsMuted(newMutedState)
        audioRef.current.muted = newMutedState

        // Ensure it's playing if we unmute (in case it paused)
        if (!newMutedState) {
            audioRef.current.play().catch(e => console.error("Play failed", e))
        }
    }

    // Header Visibility (No state for transitions to avoid re-renders, purely DOM)
    // const [showHeader, setShowHeader] = useState(true) // Removed to fix smoother transitions as requested. directionRef = useRef('next')

    const directionRef = useRef('next')

    const state = useRef({
        frame: 0,
        velocity: 0.5,
        baseSpeed: 0.5,
        targetSpeed: 0.5,
        buttonTriggered: false
    })

    // Track previous frame to avoid redundant DOM updates
    const prevFrameRef = useRef(-1)

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
        if (stage === 0 || stage === 2) {
            state.current.velocity = 0.75 // NOTICEABLY SLOWER (Half original speed)
            state.current.baseSpeed = 0.75
        } else {
            state.current.velocity = 0.5
            state.current.baseSpeed = 0.2
        }

        // UNIQUE KEY for Cache: folder + frames
        const seqKey = `${currentStageData.folder}-${currentStageData.frames}`

        // USE CACHED FACTORY
        seqRef.current = ImageSequence.getSequence(
            seqKey,
            canvasRef.current,
            currentStageData.folder,
            currentStageData.frames,
            'frame_',
            1,
            null,
            '.avif'
        )

        // Force initial render of the new sequence
        seqRef.current.frame.index = Math.floor(state.current.frame)
        seqRef.current.render(true)

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

            // --- Logic ---
            if (config.loop) {
                if (s.frame >= config.frames) s.frame = 0
                if (s.frame < 0) s.frame = config.frames - 1
            } else {
                if (s.frame >= config.frames - 1) {
                    s.frame = config.frames - 1
                    s.velocity = 0

                    if (stage === 0 && !s.buttonTriggered) {
                        s.buttonTriggered = true
                        setShowButton(true)
                    }
                    if (stage === 1) setShowScrollPrompt(true)
                }
                if (s.frame <= 0) {
                    s.frame = 0
                    if (s.velocity < 0) s.velocity = 0 // Prevent negative drift
                }
            }

            const currentIdx = Math.floor(s.frame)

            // OPTIMIZATION: Check if frame index actually changed before updating DOM
            if (currentIdx !== prevFrameRef.current) {
                prevFrameRef.current = currentIdx

                // --- Render Frame ---
                seqRef.current.frame.index = currentIdx
                seqRef.current.render() // .render() has internal optimization now

                // --- DOM Updates only on frame change ---
                if (progressRef.current) {
                    const progress = Math.max(0, Math.min(1, s.frame / (config.frames - 1)))
                    progressRef.current.style.height = `${progress * 100}%`
                }

                if (stage === 0) {
                    syncIntroText(s.frame)
                    if (s.frame > 500 && !s.buttonTriggered) {
                        s.buttonTriggered = true
                        setShowButton(true)
                    }
                }
            }
        }

        gsap.ticker.add(tick)

        const handleWheel = (e) => {
            // ----------------------------------------
            // --- SCROLL SPEED CONFIGURATION SECTION ---
            // ----------------------------------------
            const MOON_SCROLL_SPEED = 1.0   // 1st & 3rd Video (Fast)
            const CAR_SCROLL_SPEED = 0.015  // 2nd Video (Slow)

            const MOON_MAX_VELOCITY = 20    // Max Speed Cap for Moon (High -> Fast traverse)
            const CAR_MAX_VELOCITY = 4      // Max Speed Cap for Car
            // ----------------------------------

            const sensitivity = (stage === 0 || stage === 2) ? MOON_SCROLL_SPEED : CAR_SCROLL_SPEED

            // --- Stage 1 Transitions ---
            if (stage === 1) {
                if (showScrollPrompt && e.deltaY > 50) {
                    transitionToStage(2, 'next')
                    return
                }
                if (state.current.frame < 50 && e.deltaY < -50) {
                    transitionToStage(0, 'prev')
                    return
                }
            }

            // --- Stage 2 Transitions ---
            if (stage === 2) {
                // ONLY Transition to 1 if we are at the START of the video
                if (state.current.frame < 50 && e.deltaY < -50) {
                    transitionToStage(1, 'prev')
                    return
                }
            }

            state.current.velocity += e.deltaY * sensitivity

            const maxSpeed = (stage === 0 || stage === 2) ? MOON_MAX_VELOCITY : CAR_MAX_VELOCITY

            if (state.current.velocity > maxSpeed) state.current.velocity = maxSpeed
            if (state.current.velocity < -maxSpeed) state.current.velocity = -maxSpeed
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

        // UNMOUNT HEADER INSTANTLY
        // setShowHeader(false) // Removed to prevent crash
        if (headerRef.current) gsap.set(headerRef.current, { opacity: 0, overwrite: true })

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

            {/* Stage 0 */}
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

            {/* Stage 1 */}
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

            {/* Stage 2 */}
            {stage === 2 && (
                <div style={{ ...wrapperStyle, opacity: 1, pointerEvents: 'auto' }}>
                    <button
                        onClick={handleExploreProducts}
                        style={buttonStyle}
                        onMouseEnter={(e) => { e.target.style.background = 'white'; e.target.style.color = 'black' }}
                        onMouseLeave={(e) => { e.target.style.background = 'rgba(0, 0, 0, 0.3)'; e.target.style.color = 'white' }}
                    >
                        Explore Products
                    </button>
                </div>
            )}

            {/* Progress Dots - Fixed Inline Styles */}
            <div style={{
                position: 'absolute',
                right: '2rem',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                zIndex: 9999
            }}>
                {STAGES.map((s, idx) => {
                    const isActive = stage === idx;
                    return (
                        <div key={idx} style={{
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            transition: 'all 0.5s ease'
                        }}>
                            {isActive ? (
                                <div style={{
                                    width: '6px',
                                    height: '48px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '999px',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    <div
                                        ref={progressRef}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#fff',
                                            borderRadius: '999px',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            height: '0%'
                                        }}
                                    />
                                </div>
                            ) : (
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                    borderRadius: '50%'
                                }} />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Header - Fixed to Center Properly */}
            <header
                ref={headerRef}
                className="absolute top-8 left-0 w-full z-50 pointer-events-none"
                style={{ textAlign: 'center', opacity: 1 }}
            >
                <h1 className="text-xl tracking-[0.5em] font-light text-white/80 inline-block">OWN KARMA</h1>
            </header>

            {/* --- AUDIO TOGGLE --- */}
            <div
                onClick={toggleAudio}
                style={{
                    position: 'absolute',
                    top: '2.5rem',
                    right: '2.5rem',
                    zIndex: 99999,
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    opacity: 0.8,
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
            >
                {isMuted ? (
                    // Muted Icon
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <line x1="23" y1="9" x2="17" y2="15"></line>
                        <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                ) : (
                    // Speaker Icon
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                )}
            </div>

            {/* --- HAMBURGER MENU BUTTON --- */}
            <div
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                    position: 'absolute',
                    top: '2.5rem',
                    left: '2.5rem',
                    zIndex: 99999,
                    cursor: 'pointer',
                    width: '32px',
                    height: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}
            >
                <div style={{ width: '100%', height: '1.5px', background: 'white', transition: 'all 0.3s' }} />
                <div style={{ width: '100%', height: '1.5px', background: 'white', transition: 'all 0.3s' }} />
            </div>

            {/* --- BACKDROP BLUR OVERLAY --- */}
            <div
                onClick={() => setMenuOpen(false)}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 99997,
                    opacity: menuOpen ? 1 : 0,
                    pointerEvents: menuOpen ? 'auto' : 'none',
                    transition: 'opacity 0.6s ease'
                }}
            />

            {/* --- SIDEBAR MENU DRAWER --- */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                maxWidth: '450px', // Sidebar Width
                height: '100vh',
                background: '#090909',
                zIndex: 99998,
                transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)', // Slide Effect
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)', // Smooth Easing
                boxShadow: '10px 0 30px rgba(0,0,0,0.5)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                overflowY: 'auto'
            }}>
                <div style={{ width: '100%', padding: '2rem', paddingTop: '6rem' }}>
                    <h2 style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.8rem',
                        letterSpacing: '0.15em',
                        marginBottom: '2rem',
                        fontFamily: 'sans-serif',
                        marginLeft: '5px' // Align with cards
                    }}>
                        ALL TIMEPIECES
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {[
                            { name: 'DIVINE', img: '/backgrounds/1.png', link: '/divine' },
                            { name: "KARMA'S EYE", img: '/backgrounds/2.png', link: '/karma-eye' },
                            { name: 'DESTINY', img: '/backgrounds/3.png', link: '/destiny' },
                            { name: 'BROKEN HOURGLASS', img: '/backgrounds/4.png', link: '/broken-hourglass' }
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    setMenuOpen(false)
                                    // Navigate Logic
                                    navigate(item.link)
                                }}
                                style={{
                                    height: '140px',
                                    width: '100%',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {/* BG Image */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    backgroundImage: `url(${item.img})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    filter: 'brightness(0.6)',
                                    transition: 'transform 0.5s'
                                }} />

                                {/* Content */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    paddingRight: '3rem'
                                }}>
                                    <h3 style={{
                                        color: 'white',
                                        fontSize: '1.5rem',
                                        letterSpacing: '0.05em',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        {item.name}
                                        {/* Chevron Icon */}
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
