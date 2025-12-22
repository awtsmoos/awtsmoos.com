
// B"H
// FILE: js/visuals/particle-system.js

import { DOM } from '../state.js';

export const ParticleSystem = {
    ctx: null,
    particles: [],
    charWidth: 0,
    lineHeight: 24,
    paddingTop: 10,
    paddingLeft: 10,
    borderLeft: 0,
    borderTop: 0,
    
    init(ctx) {
        this.ctx = ctx;
        this._measureCharWidth();
        
        // B"H - Re-measure on resize to catch zoom levels or font changes
        window.addEventListener('resize', () => this._measureCharWidth());

        // B"H - CRITICAL FIX: Wait for fonts to load specifically for the editor font.
        // We also poll periodically to catch late font swaps.
        if (document.fonts) {
            document.fonts.ready.then(() => {
                this._measureCharWidth();
                // Double check after a short delay
                setTimeout(() => this._measureCharWidth(), 500);
            });
            
            // Explicitly load the font we expect to be using
            try {
                document.fonts.load('14px "Fira Code"').then(() => this._measureCharWidth());
            } catch(e) {}
        }
        
        // B"H - Periodic Re-calibration (every 2s) to handle Zoom/DPI changes
        setInterval(() => this._measureCharWidth(), 2000);
    },
    
    _measureCharWidth() {
        if (!this.ctx || !DOM.editor) return;
        
        const style = window.getComputedStyle(DOM.editor);
        
        // B"H - Sync Context Font with Editor CSS exactly
        const fontSize = style.fontSize || '14px';
        const fontFamily = style.fontFamily || 'monospace';
        const fontWeight = style.fontWeight || 'normal';
        this.ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
        
        // B"H - "Average Width" Technique
        // Measuring a single 'M' is prone to sub-pixel rounding errors (e.g. 8.4 -> 8).
        // Measuring 100 chars and dividing gives a much higher precision average.
        const testString = '0'.repeat(100);
        const metrics = this.ctx.measureText(testString);
        const avgWidth = metrics.width / 100;

        if (avgWidth > 0) {
            this.charWidth = avgWidth;
        } else {
            // Emergency fallback to ~0.6x font size (standard mono ratio)
            this.charWidth = parseFloat(fontSize) * 0.6; 
        }
        
        // Cache Layout Metrics
        this.lineHeight = parseFloat(style.lineHeight) || 24;
        this.paddingLeft = parseFloat(style.paddingLeft) || 10;
        this.paddingTop = parseFloat(style.paddingTop) || 10;
        this.borderLeft = parseFloat(style.borderLeftWidth) || 0;
        this.borderTop = parseFloat(style.borderTopWidth) || 0; // Capture top border
        
        // Debug
        // console.log(`[ParticleSystem] CharWidth: ${this.charWidth.toFixed(4)}px | LineHeight: ${this.lineHeight}px`);
    },
    
    /**
     * B"H - The Single Source of Truth for Visual Alignment
     * Calculates the pixel (x, y) for a given character index in the editor.
     */
    getCoordinates(index) {
        const editor = DOM.editor;
        if (!editor || index < 0) return { x: 0, y: 0 };
        
        if (!this.charWidth) this._measureCharWidth();

        const text = editor.value;
        const style = window.getComputedStyle(editor);
        
        // 1. Find Line Start
        const lineStart = text.lastIndexOf('\n', index - 1) + 1;
        
        // 2. Calculate Line Number (Row)
        let lineNum = 0;
        // Simple scan is faster than split for huge files
        for(let i=0; i<lineStart; i++) {
            if (text[i] === '\n') lineNum++;
        }

        // 3. Calculate Visual Column (The "Tab Expander")
        const tabSize = parseInt(style.tabSize) || 4;
        let visualCol = 0;
        
        for (let i = lineStart; i < index; i++) {
            if (text[i] === '\t') {
                const distanceToNextStop = tabSize - (visualCol % tabSize);
                visualCol += distanceToNextStop;
            } else {
                visualCol++;
            }
        }

        const rect = editor.getBoundingClientRect();
        
        // B"H - Absolute Precision Formula
        // We use cached metrics (updated periodically) for consistency.
        const x = rect.left + this.borderLeft + this.paddingLeft + (visualCol * this.charWidth) - editor.scrollLeft;
        
        // Center the Y coordinate on the line text. 
        // Note: We use this.borderTop now to account for textarea borders.
        const y = rect.top + this.borderTop + this.paddingTop + (lineNum * this.lineHeight) - editor.scrollTop + (this.lineHeight / 2);

        return { x, y };
    },

    getCaretCoordinates() {
        const editor = DOM.editor;
        if (!editor) return { x: 0, y: 0 };
        return this.getCoordinates(editor.selectionEnd);
    },

    spawnFromCaret(type) {
        const { x, y } = this.getCaretCoordinates();
        
        const count = type === 'delete' ? 8 : 2;
        const color = type === 'delete' ? '#f75d65' : '#00f6ff';
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 1) * 10, 
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
    }
};