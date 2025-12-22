
// B"H
// FILE: js/visuals/caret-radar.js

import { ParticleSystem } from './particle-system.js';

export const CaretRadar = {
    ctx: null,
    angle: 0,
    pingScale: 0,
    
    init(ctx) {
        this.ctx = ctx;
    },
    
    ping() {
        this.pingScale = 1.0;
    },
    
    render() {
        // Retrieve the scientifically accurate coordinates from the ParticleSystem
        const { x, y } = ParticleSystem.getCaretCoordinates();
        
        // Animate
        this.angle += 0.1;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(this.angle);
        
        // Inner Rotating Ring
        this.ctx.strokeStyle = 'rgba(0, 246, 255, 0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 12, 0, Math.PI / 2);
        this.ctx.stroke();
        
        // Outer Rotating Ring
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 12, Math.PI, Math.PI * 1.5);
        this.ctx.stroke();
        
        // Ping Shockwave Effect
        if (this.pingScale > 0) {
            this.ctx.rotate(-this.angle); // Counter-rotate so shockwave stays static relative to page
            this.ctx.beginPath();
            const radius = 8 + (1 - this.pingScale) * 20;
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${this.pingScale * 0.8})`;
            this.ctx.stroke();
            
            this.pingScale -= 0.05;
        }
        
        this.ctx.restore();
    }
};
