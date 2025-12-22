
// B"H
// FILE: js/visuals/particle-system.js

import { DOM } from '../state.js';
import { VisualSettings } from './settings.js';

export const ParticleSystem = {
    ctx: null,
    // B"H - Object Pool for Zero-Allocation Rendering
    pool: [], 
    activeParticles: [],
    maxParticles: 60, // Hard limit for Low RAM
    
    // Layout Metrics (Cached)
    charWidth: 0,
    lineHeight: 24,
    paddingTop: 10,
    paddingLeft: 10,
    borderLeft: 0,
    borderTop: 0,
    
    // The Otiot (Letters)
    hebrewChars: "אבגדהוזחטיכלמנסעפצקרשת",
    
    init(ctx) {
        this.ctx = ctx;
        this._measureCharWidth();
        this._initPool();
        
        window.addEventListener('resize', () => this._measureCharWidth());

        if (document.fonts) {
            document.fonts.ready.then(() => {
                this._measureCharWidth();
                setTimeout(() => this._measureCharWidth(), 500);
            });
        }
        setInterval(() => this._measureCharWidth(), 2000);
    },
    
    _initPool() {
        // Pre-allocate particles to avoid Garbage Collection stutter
        for(let i=0; i<this.maxParticles; i++) {
            this.pool.push({
                active: false,
                x: 0, y: 0,
                vx: 0, vy: 0,
                life: 0,
                char: '',
                color: '',
                size: 0,
                rotation: 0,
                rotationSpeed: 0
            });
        }
    },
    
    _measureCharWidth() {
        if (!this.ctx || !DOM.editor) return;
        const style = window.getComputedStyle(DOM.editor);
        const fontSize = style.fontSize || '14px';
        const fontFamily = style.fontFamily || 'monospace';
        const fontWeight = style.fontWeight || 'normal';
        this.ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
        
        const testString = '0'.repeat(100);
        const metrics = this.ctx.measureText(testString);
        const avgWidth = metrics.width / 100;

        if (avgWidth > 0) this.charWidth = avgWidth;
        else this.charWidth = parseFloat(fontSize) * 0.6; 
        
        this.lineHeight = parseFloat(style.lineHeight) || 24;
        this.paddingLeft = parseFloat(style.paddingLeft) || 10;
        this.paddingTop = parseFloat(style.paddingTop) || 10;
        this.borderLeft = parseFloat(style.borderLeftWidth) || 0;
        this.borderTop = parseFloat(style.borderTopWidth) || 0; 
    },
    
    getCoordinates(index) {
        const editor = DOM.editor;
        if (!editor || index < 0) return { x: 0, y: 0 };
        if (!this.charWidth) this._measureCharWidth();

        const text = editor.value;
        const style = window.getComputedStyle(editor);
        const lineStart = text.lastIndexOf('\n', index - 1) + 1;
        
        let lineNum = 0;
        for(let i=0; i<lineStart; i++) if (text[i] === '\n') lineNum++;

        const tabSize = parseInt(style.tabSize) || 4;
        let visualCol = 0;
        for (let i = lineStart; i < index; i++) {
            if (text[i] === '\t') {
                visualCol += tabSize - (visualCol % tabSize);
            } else {
                visualCol++;
            }
        }

        const rect = editor.getBoundingClientRect();
        const x = rect.left + this.borderLeft + this.paddingLeft + (visualCol * this.charWidth) - editor.scrollLeft;
        const y = rect.top + this.borderTop + this.paddingTop + (lineNum * this.lineHeight) - editor.scrollTop + (this.lineHeight / 2);

        return { x, y };
    },

    getCaretCoordinates() {
        const editor = DOM.editor;
        if (!editor) return { x: 0, y: 0 };
        return this.getCoordinates(editor.selectionEnd);
    },

    spawnFromCaret(type) {
        if (!VisualSettings.get('particles')) return;

        const { x, y } = this.getCaretCoordinates();
        
        // B"H - Limit spawn count based on active load
        const count = type === 'delete' ? 3 : 1; 
        const baseColor = type === 'delete' ? '247, 93, 101' : '0, 246, 255'; // RGB values
        
        for (let i = 0; i < count; i++) {
            // Find a dead particle in the pool
            const p = this.pool.find(p => !p.active);
            if (!p) return; // Pool exhausted, skip spawn (Performance safety)

            p.active = true;
            p.x = x;
            p.y = y;
            p.vx = (Math.random() - 0.5) * 4;
            // Float up for typing, fall down for delete
            p.vy = type === 'delete' ? (Math.random() * 2) : (Math.random() * -3 - 1);
            p.life = 1.0;
            p.color = baseColor;
            p.size = Math.random() * 10 + 12; // Larger for letters
            
            // B"H - Pick a random Hebrew Letter
            p.char = this.hebrewChars[Math.floor(Math.random() * this.hebrewChars.length)];
            p.rotation = (Math.random() - 0.5);
            p.rotationSpeed = (Math.random() - 0.5) * 0.2;
        }
    },
    
    updateAndRender() {
        // Only loop through pool, no new allocations
        let activeCount = 0;
        
        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.pool[i];
            if (!p.active) continue;
            
            activeCount++;
            
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            
            // Gravity/Friction
            p.vx *= 0.95;
            p.vy *= 0.95;
            p.life -= 0.03; // Fade out speed
            
            if (p.life <= 0) {
                p.active = false;
                continue;
            }
            
            // Render
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.globalAlpha = p.life;
            this.ctx.font = `${p.size}px "Times New Roman", serif`; // Serif looks better for Hebrew
            this.ctx.fillStyle = `rgba(${p.color}, ${p.life})`;
            
            // Add Glow
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = `rgba(${p.color}, 1)`;
            
            this.ctx.fillText(p.char, -p.size/2, p.size/2);
            this.ctx.restore();
        }
    }
};