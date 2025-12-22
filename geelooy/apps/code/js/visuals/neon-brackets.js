
// B"H
// FILE: js/visuals/neon-brackets.js

import { DOM } from '../state.js';
import { ParticleSystem } from './particle-system.js';

export const NeonBrackets = {
    ctx: null,
    matchIndices: null, 
    
    init(ctx) {
        this.ctx = ctx;
    },
    
    scan() {
        const text = DOM.editor.value;
        const cursor = DOM.editor.selectionStart;
        
        if (cursor === 0) {
            this.matchIndices = null;
            return;
        }

        const charBefore = text[cursor - 1];
        
        const pairs = { '(': ')', '{': '}', '[': ']' };
        const revPairs = { ')': '(', '}': '{', ']': '[' };
        
        this.matchIndices = null;
        
        if (pairs[charBefore]) {
            const partnerIdx = this._findMatch(text, cursor, 1, charBefore, pairs[charBefore]);
            if (partnerIdx !== -1) {
                this.matchIndices = { start: cursor - 1, end: partnerIdx };
            }
        } 
        else if (revPairs[charBefore]) {
            const partnerIdx = this._findMatch(text, cursor - 2, -1, charBefore, revPairs[charBefore]);
            if (partnerIdx !== -1) {
                this.matchIndices = { start: partnerIdx, end: cursor - 1 };
            }
        }
    },
    
    _findMatch(text, startPos, dir, openChar, closeChar) {
        let depth = 1;
        let i = startPos;
        const len = text.length;
        
        while (i >= 0 && i < len) {
            const char = text[i];
            if (char === openChar) depth++;
            else if (char === closeChar) depth--;
            
            if (depth === 0) return i;
            i += dir;
        }
        return -1;
    },
    
    render() {
        if (!this.matchIndices) return;
        
        // 1. Get raw coordinates (Left edge of character)
        const start = ParticleSystem.getCoordinates(this.matchIndices.start);
        const end = ParticleSystem.getCoordinates(this.matchIndices.end);
        
        // 2. Adjust X to center of character
        const charW = ParticleSystem.charWidth || 8.4;
        const halfChar = charW / 2;
        
        start.x += halfChar;
        end.x += halfChar;

        // Culling optimization (don't draw if off screen)
        const winH = window.innerHeight;
        const margin = 50;
        if ((start.y < -margin && end.y < -margin) || (start.y > winH + margin && end.y > winH + margin)) {
            return;
        }

        // 3. Draw the Curve
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        
        const dy = end.y - start.y;
        const dx = end.x - start.x;
        
        // Determine curvature based on relative positions
        const isVertical = Math.abs(dx) < 10;
        const controlXOffset = isVertical ? 40 : 0;
        
        this.ctx.bezierCurveTo(
            start.x - controlXOffset, start.y + (dy/2), 
            end.x - controlXOffset, end.y - (dy/2), 
            end.x, end.y
        );
        
        // Neon Glow Effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#ff00ff';
        this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.shadowBlur = 0;
        
        // Draw Endpoints
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.beginPath(); this.ctx.arc(start.x, start.y, 2.5, 0, Math.PI*2); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(end.x, end.y, 2.5, 0, Math.PI*2); this.ctx.fill();
    }
};
