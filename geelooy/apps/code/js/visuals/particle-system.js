// B"H
// FILE: js/visuals/particle-system.js

import { DOM } from '../state.js';
import { VisualSettings } from './settings.js';
import { Editor } from '../editor.js'; 

export const ParticleSystem = {
    ctx: null,
    pool: [], 
    maxParticles: 300, // B"H - Increased pool for explosions
    hebrewChars: "אבגדהוזחטיכלמנסעפצקרשת",
    
    init(ctx) {
        this.ctx = ctx;
        this._initPool();
    },
    
    _initPool() {
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
    
    getCoordinates(line, col) {
        const editor = DOM.editor;
        if (!editor) return { left: 0, top: 0 };
        
        const style = window.getComputedStyle(editor);
        const lineHeight = parseFloat(style.lineHeight) || 24;
        const paddingLeft = parseFloat(style.paddingLeft);
        const paddingTop = parseFloat(style.paddingTop);
        const fontSize = parseFloat(style.fontSize);
        const charWidth = fontSize * 0.6; 
        
        const rect = editor.getBoundingClientRect();
        
        const top = rect.top + paddingTop + ((line - 1) * lineHeight) - editor.scrollTop + (lineHeight / 2);
        const left = rect.left + paddingLeft + ((col - 1) * charWidth) - editor.scrollLeft;
        
        return { left, top };
    },

    getCaretCoordinates() {
        const { line, col } = Editor.getCursorInfo();
        return this.getCoordinates(line, col);
    },

    spawnExplosion(x, y) {
        const particleCount = 20;
        const colors = ['#00f6ff', '#ff00ff', '#a8ff00', '#ffffff', '#ffd700']; 

        for (let i = 0; i < particleCount; i++) {
            const p = this.pool.find(p => !p.active);
            if (!p) break;

            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2;

            p.active = true;
            p.x = x;
            p.y = y;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.life = 1.0;
            
            p.color = colors[Math.floor(Math.random() * colors.length)];
            p.size = Math.random() * 18 + 10;
            p.char = this.hebrewChars[Math.floor(Math.random() * this.hebrewChars.length)];
            p.rotation = Math.random() * Math.PI;
            p.rotationSpeed = (Math.random() - 0.5) * 0.5;
        }
    },

    spawnFromCaret(type) {
        if (!VisualSettings.get('particles')) return;

        const { left, top } = this.getCaretCoordinates();
        const count = type === 'delete' ? 3 : 1; 
        const baseColor = type === 'delete' ? '#f75d65' : '#00f6ff'; 
        
        for (let i = 0; i < count; i++) {
            const p = this.pool.find(p => !p.active);
            if (!p) break; 

            p.active = true;
            p.x = left;
            p.y = top;
            p.vx = (Math.random() - 0.5) * 4;
            p.vy = type === 'delete' ? (Math.random() * 2) : (Math.random() * -3 - 1);
            p.life = 1.0;
            p.color = baseColor;
            p.size = Math.random() * 10 + 12; 
            
            p.char = this.hebrewChars[Math.floor(Math.random() * this.hebrewChars.length)];
            p.rotation = (Math.random() - 0.5);
            p.rotationSpeed = (Math.random() - 0.5) * 0.2;
        }
    },
    
    updateAndRender() {
        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.pool[i];
            if (!p.active) continue;
            
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            
            p.vx *= 0.96;
            p.vy += 0.1; // Gravity simulation
            p.life -= 0.02; 
            
            if (p.life <= 0) {
                p.active = false;
                continue;
            }
            
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.globalAlpha = p.life;
            this.ctx.font = `bold ${p.size}px "Times New Roman", serif`; 
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = p.color;
            this.ctx.fillText(p.char, -p.size/2, p.size/2);
            this.ctx.restore();
        }
    }
};