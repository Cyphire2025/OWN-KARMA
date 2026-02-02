import React from 'react'
import './Loader.css'

function Loader({ progress }) {
    return (
        <div className="premium-loader">
            <div className="loader-content">
                <h1 className="loader-brand">OWN KARMA</h1>
                <p className="loader-tagline">Crafted with Consciousness</p>

                <div className="loader-bar-container">
                    <div className="loader-bar">
                        <div
                            className="loader-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="loader-percentage">{Math.floor(progress)}%</div>
                </div>

                <p className="loader-status">
                    {progress < 30 && 'Awakening consciousness...'}
                    {progress >= 30 && progress < 60 && 'Building your journey...'}
                    {progress >= 60 && progress < 90 && 'Crafting the experience...'}
                    {progress >= 90 && progress < 100 && 'Almost ready...'}
                    {progress >= 100 && 'Welcome'}
                </p>
            </div>
        </div>
    )
}

export default Loader
