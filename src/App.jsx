import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import IntroPage from './pages/IntroPage.jsx'

import ProductsPage from './pages/ProductsPage.jsx'
import DivinePage from './pages/DivinePage.jsx'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<IntroPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/divine" element={<DivinePage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
