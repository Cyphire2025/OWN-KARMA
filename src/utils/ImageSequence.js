export class ImageSequence {
    constructor(canvas, folder, totalFrames, prefix = 'frame_', frameStep = 1, onProgress = null) {
        this.canvas = canvas
        this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true })
        this.ctx.imageSmoothingEnabled = true
        this.ctx.imageSmoothingQuality = 'high'

        this.folder = folder
        this.totalFrames = totalFrames
        this.prefix = prefix
        this.frameStep = frameStep
        this.images = []
        this.frame = { index: 0 }
        this.loadedCount = 0
        this.actualFrameCount = 0
        this.onProgress = onProgress // Callback for loading progress

        // Advanced loading strategy
        this.loadingQueue = []
        this.loadingInProgress = new Set()
        this.maxConcurrentLoads = 6 // Chrome's connection limit per domain
        this.preloadRadius = 15 // Preload frames around current position

        // Resize handling
        this.resize()
        window.addEventListener('resize', () => this.resize())

        // Start intelligent loading
        this.initializeLoading()
    }

    initializeLoading() {
        // Create placeholder array
        for (let i = 0; i < this.totalFrames; i += this.frameStep) {
            this.images.push(null)
            this.actualFrameCount++
        }

        // Priority loading strategy:
        // 1. Load first frame immediately for instant display
        // 2. Load every 10th frame for smooth scrubbing
        // 3. Fill in remaining frames progressively

        // Phase 1: Critical frames (first frame + key frames)
        const criticalFrames = [0, 1, 2, 3, 4, 5] // First 6 frames for instant start

        // Phase 2: Key frames (every 10th) for smooth initial scrubbing
        const keyFrames = []
        for (let i = 10; i < this.actualFrameCount; i += 10) {
            keyFrames.push(i)
        }

        // Phase 3: All remaining frames
        const remainingFrames = []
        for (let i = 0; i < this.actualFrameCount; i++) {
            if (!criticalFrames.includes(i) && !keyFrames.includes(i)) {
                remainingFrames.push(i)
            }
        }

        // Queue frames in priority order
        this.loadingQueue = [...criticalFrames, ...keyFrames, ...remainingFrames]

        // Start loading
        this.processLoadingQueue()
    }

    processLoadingQueue() {
        // Load images in batches, respecting browser connection limits
        while (this.loadingInProgress.size < this.maxConcurrentLoads && this.loadingQueue.length > 0) {
            const frameIndex = this.loadingQueue.shift()
            this.loadImage(frameIndex)
        }
    }

    loadImage(frameIndex) {
        if (this.images[frameIndex] !== null || this.loadingInProgress.has(frameIndex)) {
            return // Already loaded or loading
        }

        this.loadingInProgress.add(frameIndex)

        const img = new Image()
        const indexStr = (frameIndex * this.frameStep).toString().padStart(4, '0')
        const imgPath = `/images/${this.folder}/${this.prefix}${indexStr}.jpg`

        img.onload = () => {
            this.images[frameIndex] = img
            this.loadedCount++
            this.loadingInProgress.delete(frameIndex)

            // Report loading progress
            if (this.onProgress) {
                const progress = (this.loadedCount / this.actualFrameCount) * 100
                this.onProgress(progress, this.loadedCount, this.actualFrameCount)
            }

            // Render if this is the current or nearby frame
            const currentFrameIndex = Math.floor(this.frame.index)
            if (Math.abs(frameIndex - currentFrameIndex) <= 2) {
                this.render()
            }

            // Continue loading queue
            this.processLoadingQueue()
        }

        img.onerror = () => {
            this.loadingInProgress.delete(frameIndex)
            this.processLoadingQueue()
        }

        img.src = imgPath
    }

    // Preload frames around current position for smooth playback
    preloadNearbyFrames(currentIndex) {
        const start = Math.max(0, currentIndex - this.preloadRadius)
        const end = Math.min(this.actualFrameCount - 1, currentIndex + this.preloadRadius)

        for (let i = start; i <= end; i++) {
            if (this.images[i] === null && !this.loadingInProgress.has(i)) {
                // Add to front of queue for priority loading
                this.loadingQueue.unshift(i)
            }
        }

        this.processLoadingQueue()
    }

    resize() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.render()
    }

    render() {
        let idx = Math.floor(this.frame.index)
        if (idx >= this.actualFrameCount) idx = this.actualFrameCount - 1
        if (idx < 0) idx = 0

        // Preload nearby frames for smooth scrubbing
        this.preloadNearbyFrames(idx)

        const img = this.images[idx]

        // If target frame not loaded, find nearest loaded frame
        if (!img || !img.complete || img.naturalWidth === 0) {
            // Search for nearest loaded frame
            let nearestImg = null
            let minDistance = Infinity

            for (let offset = 1; offset < 20; offset++) {
                // Check frames before and after
                const beforeIdx = idx - offset
                const afterIdx = idx + offset

                if (beforeIdx >= 0 && this.images[beforeIdx]?.complete) {
                    const distance = offset
                    if (distance < minDistance) {
                        minDistance = distance
                        nearestImg = this.images[beforeIdx]
                    }
                }

                if (afterIdx < this.actualFrameCount && this.images[afterIdx]?.complete) {
                    const distance = offset
                    if (distance < minDistance) {
                        minDistance = distance
                        nearestImg = this.images[afterIdx]
                    }
                }

                if (nearestImg) break
            }

            // Use nearest frame to avoid blank screen
            if (nearestImg) {
                this.drawImage(nearestImg)
            }
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
