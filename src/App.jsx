import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import IntroPage from './pages/IntroPage.jsx'

import ProductsPage from './pages/ProductsPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import DivinePage from './pages/DivinePage.jsx'
import KarmaPage from './pages/KarmaPage.jsx'
import DestinyPage from './pages/DestinyPage.jsx'
import BrokenHourglassPage from './pages/BrokenHourglassPage.jsx'

function App() {
    return (
        <BrowserRouter>
            {/* GLOBAL LOGO */}
            <a href="/" style={{
                position: 'fixed',
                top: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 99999,
                display: 'block',
                cursor: 'pointer',
                opacity: 0.9
            }}>
                <img
                    src="/backgrounds/website-logo.png"
                    alt="OWN KARMA"
                    style={{
                        height: '40px', // Adjusted height for elegance
                        width: 'auto',
                        objectFit: 'contain'
                    }}
                />
            </a>
            <Routes>
                <Route path="/" element={<IntroPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/divine" element={<DivinePage />} />
                <Route path="/karma-eye" element={<KarmaPage />} />
                <Route path="/destiny" element={<DestinyPage />} />
                <Route path="/broken-hourglass" element={<BrokenHourglassPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
