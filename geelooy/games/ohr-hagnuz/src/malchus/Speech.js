
/**
 * B"H
 * Speech: The Final Sefirah, where the Light becomes World.
 * 
 * "With ten utterances the world was created." 
 * Here, we utter the commands to the Document Object Model (DOM).
 * We define the physical boundaries and the resolution of our reality.
 * 
 * @module Speech
 */
export class Speech {
    static canvas = null;
    static ctx = null;

    /**
     * Manifest the physical canvas vessel.
     * It transforms the abstract idea of "graphics" into a tangible array of pixels.
     */
    static manifest() {
        this.canvas = document.getElementById('ohr-hagnuz-vessel');
        this.ctx = this.canvas.getContext('2d', {
            alpha: false,
            desynchronized: true
        });

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * Adjust the dimensions of reality to match the container.
     * Just as the Divine Light fills all vessels according to their capacity.
     */
    static resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
        this.ctx.scale(dpr, dpr);
        
        // Ensure smooth rendering for the "realistic" feel
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }

    /**
     * Get the drawing context, the pen of the Creator.
     * @returns {CanvasRenderingContext2D}
     */
    static getPen() {
        return this.ctx;
    }

    /**
     * Clear the screen, returning it to the state of 'Ayin' (Nothingness)
     * before the next frame is spoken into being.
     */
    static clear() {
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }
}
