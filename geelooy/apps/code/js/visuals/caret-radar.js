
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
        // Use ParticleSystem's helper to get coords
        const { left, top } = ParticleSystem.getCaretCoordinates();
        
        this.angle += 0.1;
        
        // Draw rotating bracket
        this.ctx.save();
        this.ctx.translate(left, top);
        this.ctx.rotate(this.angle);
        
        this.ctx.strokeStyle = 'rgba(0, 246, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 15, 0, Math.PI / 2);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 15, Math.PI, Math.PI * 1.5);
        this.ctx.stroke();
        
        // Draw Ping
        if (this.pingScale > 0) {
            this.ctx.rotate(-this.angle); // Reset rotation for ping
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 5 + (1 - this.pingScale) * 30, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${this.pingScale})`;
            this.ctx.stroke();
            
            this.pingScale -= 0.05;
        }
        
        this.ctx.restore();
    }
};