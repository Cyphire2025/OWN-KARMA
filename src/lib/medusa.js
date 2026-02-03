import Medusa from "@medusajs/medusa-js"

// Use environment variable in production, localhost in development
const BACKEND_URL = import.meta.env.VITE_MEDUSA_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = import.meta.env.VITE_PUBLISHABLE_KEY || "pk_d7ca9745863cf197085ecdaf55d56d3d9e136b30a080ab0dfe0b532c89d074fa"

export const medusa = new Medusa({
    baseUrl: BACKEND_URL,
    maxRetries: 3,
    publishableApiKey: PUBLISHABLE_KEY
})

console.log('Medusa connected to:', BACKEND_URL)
