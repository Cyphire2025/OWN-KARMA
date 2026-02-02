export class ImageSequence {
    constructor(canvas, folder, totalFrames, prefix = 'frame_', frameStep = 1) {
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

        // Resize handling
        this.resize()
        window.addEventListener('resize', () => this.resize())

        // Start loading
        this.preload()
    }

    preload() {
        for (let i = 0; i < this.totalFrames; i += this.frameStep) {
            const img = new Image()
            const indexStr = i.toString().padStart(4, '0')
            const imgPath = `/images/${this.folder}/${this.prefix}${indexStr}.jpg`
            img.src = imgPath

            img.onload = () => {
                this.loadedCount++
                if (this.loadedCount === 1) {
                    this.render()
                }
            }

            this.images.push(img)
            this.actualFrameCount++
        }
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

        const img = this.images[idx]

        // Only draw if image is loaded and valid (not broken)
        if (img && img.complete && img.naturalWidth > 0) {
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

            this.ctx.drawImage(img, drawX, drawY, drawW, drawH)
        }
    }
}
