// Global cache for ImageSequence instances
export const sequenceCache = {}

export class ImageSequence {
    static getSequence(key, canvas, folder, totalFrames, prefix, frameStep, onProgress, extension) {
        if (sequenceCache[key]) {
            const seq = sequenceCache[key]
            seq.setCanvas(canvas) // Re-bind to new canvas element
            return seq
        }

        const newSeq = new ImageSequence(canvas, folder, totalFrames, prefix, frameStep, onProgress, extension)
        sequenceCache[key] = newSeq
        return newSeq
    }

    constructor(canvas, folder, totalFrames, prefix = 'frame_', frameStep = 1, onProgress = null, extension = '.jpg') {
        this.folder = folder
        this.totalFrames = totalFrames
        this.prefix = prefix
        this.extension = extension
        this.frameStep = frameStep
        this.images = []
        this.frame = { index: 0 }
        this.loadedCount = 0
        this.actualFrameCount = 0
        this.onProgress = onProgress
        this.lastRenderedIndex = -1 // Track last render

        // Loading State
        this.loadingQueue = []
        this.loadingInProgress = new Set()
        this.maxConcurrentLoads = 12
        this.preloadRadius = 50

        // Initialize Context
        this.setCanvas(canvas)

        // Start independent loading immediately
        this.initializeLoading()
    }

    setCanvas(canvas) {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler)
        }

        this.canvas = canvas
        this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true })
        this.ctx.imageSmoothingEnabled = true
        this.ctx.imageSmoothingQuality = 'high'

        // Bind resize handler to instance so we can remove it
        this.resizeHandler = () => this.resize()
        window.addEventListener('resize', this.resizeHandler)

        // Force resize and render on new canvas
        this.resize()
    }

    initializeLoading() {
        if (this.images.length > 0) return // Already initialized

        // Create placeholder array
        for (let i = 0; i < this.totalFrames; i += this.frameStep) {
            this.images.push(null)
            this.actualFrameCount++
        }

        // Priority loading logic
        const criticalFrames = [0, 1, 2, 3, 4, 5]
        const keyFrames = []
        for (let i = 10; i < this.actualFrameCount; i += 10) {
            keyFrames.push(i)
        }

        const remainingFrames = []
        for (let i = 0; i < this.actualFrameCount; i++) {
            if (!criticalFrames.includes(i) && !keyFrames.includes(i)) {
                remainingFrames.push(i)
            }
        }

        this.loadingQueue = [...criticalFrames, ...keyFrames, ...remainingFrames]
        this.processLoadingQueue()
    }

    processLoadingQueue() {
        while (this.loadingInProgress.size < this.maxConcurrentLoads && this.loadingQueue.length > 0) {
            const frameIndex = this.loadingQueue.shift()
            this.loadImage(frameIndex)
        }
    }

    loadImage(frameIndex) {
        if (this.images[frameIndex] !== null || this.loadingInProgress.has(frameIndex)) return

        this.loadingInProgress.add(frameIndex)
        const img = new Image()
        const indexStr = (frameIndex * this.frameStep).toString().padStart(4, '0')
        const imgPath = `/images/${this.folder}/${this.prefix}${indexStr}${this.extension}`

        img.onload = () => {
            this.images[frameIndex] = img
            this.loadedCount++
            this.loadingInProgress.delete(frameIndex)

            if (this.onProgress) {
                const progress = (this.loadedCount / this.actualFrameCount) * 100
                this.onProgress(progress, this.loadedCount, this.actualFrameCount)
            }

            // If we just loaded the current frame or neighbor, force a re-render
            const currentFrameIndex = Math.floor(this.frame.index)
            if (Math.abs(frameIndex - currentFrameIndex) <= 2) {
                this.render(true) // Force render when new relevant asset arrives
            }

            this.processLoadingQueue()
        }

        img.onerror = () => {
            this.loadingInProgress.delete(frameIndex)
            this.processLoadingQueue()
        }

        img.src = imgPath
    }

    preloadNearbyFrames(currentIndex) {
        const start = Math.max(0, currentIndex - this.preloadRadius)
        const end = Math.min(this.actualFrameCount - 1, currentIndex + this.preloadRadius)

        for (let i = start; i <= end; i++) {
            if (this.images[i] === null && !this.loadingInProgress.has(i)) {
                this.loadingQueue.unshift(i)
            }
        }
        this.processLoadingQueue()
    }

    resize() {
        if (!this.canvas) return
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.render(true) // Force render on resize
    }

    // Main API call from GSAP loop
    // Now accepts force flag to bypass optimization
    render(force = false) {
        if (this.isRendering) return
        this.isRendering = true

        requestAnimationFrame(() => {
            this._renderFrame(force)
            this.isRendering = false
        })
    }

    _renderFrame(force) {
        let idx = Math.floor(this.frame.index)
        if (idx >= this.actualFrameCount) idx = this.actualFrameCount - 1
        if (idx < 0) idx = 0

        // OPTIMIZATION: Only draw if frame changed or forced
        if (!force && idx === this.lastRenderedIndex) {
            return
        }

        this.lastRenderedIndex = idx
        this.preloadNearbyFrames(idx)

        const img = this.images[idx]

        // If target frame not loaded, find nearest loaded frame
        if (!img || !img.complete || img.naturalWidth === 0) {
            let nearestImg = null
            let minDistance = Infinity

            for (let offset = 1; offset < 30; offset++) {
                const beforeIdx = idx - offset
                const afterIdx = idx + offset

                if (beforeIdx >= 0 && this.images[beforeIdx]?.complete) {
                    if (offset < minDistance) {
                        minDistance = offset
                        nearestImg = this.images[beforeIdx]
                    }
                }
                if (afterIdx < this.actualFrameCount && this.images[afterIdx]?.complete) {
                    if (offset < minDistance) {
                        minDistance = offset
                        nearestImg = this.images[afterIdx]
                    }
                }
                if (nearestImg) break
            }

            if (nearestImg) this.drawImage(nearestImg)
            return
        }

        this.drawImage(img)
    }

    drawImage(img) {
        const cvsW = this.canvas.width
        const cvsH = this.canvas.height
        const imgRatio = img.width / img.height
        const canvasRatio = cvsW / cvsH

        let drawW, drawH

        if (canvasRatio > imgRatio) {
            drawW = cvsW
            drawH = cvsW / imgRatio
        } else {
            drawH = cvsH
            drawW = cvsH * imgRatio
        }

        const drawX = (cvsW - drawW) / 2
        const drawY = (cvsH - drawH) / 2

        this.ctx.clearRect(0, 0, cvsW, cvsH)
        this.ctx.drawImage(img, drawX, drawY, drawW, drawH)
    }
}
