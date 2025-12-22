// B"H
// FILE: js/visuals/particle-system.js

import { DOM } from '../state.js';
import { Editor } from '../editor.js'; 

export const ParticleSystem = {
    ctx: null,
    particles: [],
    charWidth: 0, // Dynamic cache
    
    init(ctx) {
        this.ctx = ctx;
        this._measureCharWidth();
    },
    
    _measureCharWidth() {
        if (!this.ctx) return;
        // B"H - Ensure the measurement font matches the Editor font (Fira Code)
        this.ctx.font = '14px "Fira Code", monospace';
        const metrics = this.ctx.measureText('M');
        this.charWidth = metrics.width;
        // Fallback if font didn't load yet or failed
        if (this.charWidth < 1) this.charWidth = 14 * 0.6;
    },
    
    spawnFromCaret(type) {
        const { left, top } = this._getCaretCoordinates();
        
        const count = type === 'delete' ? 8 : 2;
        const color = type === 'delete' ? '#f75d65' : '#00f6ff';
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: left,
                y: top,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 1) * 10, // Upward burst
                life: 1.0,
                color: color,
                size: Math.random() * 3 + 1
            });
        }
    },
    
    updateAndRender() {
        if (this.particles.length === 0) return;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.5; // Gravity
            p.life -= 0.05;
            
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = Math.max(0, p.life);
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },
    
    // B"H - Coordinate Calculation - Adjusted for Fixed CSS metrics
    _getCaretCoordinates() {
        const editor = DOM.editor;
        if (!editor) return { left: 0, top: 0 };
        
        if (!this.charWidth) this._measureCharWidth();
        
        // Strict Metrics from CSS
        const lineHeight = 24;
        const paddingTop = 10;
        const paddingLeft = 10;
        
        const { line, col } = Editor.getCursorInfo(); // 1-based
        const rect = editor.getBoundingClientRect();
        
        // Calculate Top relative to Viewport
        const top = rect.top + paddingTop + ((line - 1) * lineHeight) - editor.scrollTop + (lineHeight / 2);
        
        // Calculate Left using Dynamic Char Width
        const left = rect.left + paddingLeft + ((col - 1) * this.charWidth) - editor.scrollLeft;
        
        return { left, top };
    },
    
    // Exposed for NeonBrackets to use arbitrary indices
    _getCoordinatesForIndex(index) {
        const editor = DOM.editor;
        if (!editor) return { x: 0, y: 0 };
        
        if (!this.charWidth) this._measureCharWidth();

        const text = editor.value;
        const sub = text.substring(0, index);
        const lines = sub.split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        
        // Duplicate logic for safety in module scope
        const lineHeight = 24;
        const paddingTop = 10;
        const paddingLeft = 10;
        
        const rect = editor.getBoundingClientRect();
        
        const top = rect.top + paddingTop + ((line - 1) * lineHeight) - editor.scrollTop + (lineHeight / 2);
        const left = rect.left + paddingLeft + ((col - 1) * this.charWidth) - editor.scrollLeft;
        
        return { x: left, y: top };
    }
};