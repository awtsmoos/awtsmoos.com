// B"H
// FILE: js/visuals/zen-rain.js

export const ZenRain = {
    canvas: null,
    ctx: null,
    drops: [],
    energy: 0, // Typing boosts energy (speed/brightness)
    
    init() {
        this.canvas = document.getElementById('canvas-bg');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Init drops
        const columns = Math.floor(this.canvas.width / 20);
        for(let i=0; i<columns; i++) {
            this.drops[i] = Math.random() * -100; // Start above screen
        }
    },
    
    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    addEnergy() {
        this.energy = Math.min(this.energy + 5, 50);
    },
    
    // B"H - New Method: Explicitly clear the canvas when effect is off
    clear() {
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },
    
    update() {
        if (!this.ctx) return;

        // Decay energy
        this.energy *= 0.98;
        
        // B"H - Use 'destination-out' to fade existing pixels to transparent.
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Adjust fade speed
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        
        // Determine color based on energy (Blue -> Green -> Red/White)
        let r = 0, g = 255, b = 200;
        if (this.energy > 30) { r = 255; g = 0; b = 255; } // Intense Magenta
        
        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.ctx.font = '15px monospace';
        
        for(let i=0; i<this.drops.length; i++) {
            // B"H - Hebrew Aleph-Bet Range (0x05D0 - 0x05EA)
            const char = String.fromCharCode(0x05D0 + Math.random() * 27);
            const x = i * 20;
            const y = this.drops[i] * 20;
            
            this.ctx.fillText(char, x, y);
            
            // Speed varies by energy
            const speed = (this.energy / 10) + 1; // Base 1, max 6
            
            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i] += (0.5 * speed);
        }
    }
};