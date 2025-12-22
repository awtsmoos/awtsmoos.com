
// B"H
// FILE: js/visuals/neon-brackets.js

import { DOM } from '../state.js';
import { ParticleSystem } from './particle-system.js'; 

export const NeonBrackets = {
    ctx: null,
    match: null, // { start: {x,y}, end: {x,y} }
    
    init(ctx) {
        this.ctx = ctx;
    },
    
    scan() {
        const text = DOM.editor.value;
        const cursor = DOM.editor.selectionStart;
        
        const charBefore = text[cursor - 1];
        // const charAt = text[cursor]; // Not used currently
        
        const pairs = { '(': ')', '{': '}', '[': ']' };
        const revPairs = { ')': '(', '}': '{', ']': '[' };
        
        this.match = null;
        
        if (pairs[charBefore]) {
            const partner = this._findMatch(text, cursor, 1, charBefore, pairs[charBefore]);
            if (partner !== -1) this._setCoords(cursor - 1, partner);
        } else if (revPairs[charBefore]) {
            const partner = this._findMatch(text, cursor - 2, -1, charBefore, revPairs[charBefore]);
            if (partner !== -1) this._setCoords(partner, cursor - 1);
        }
    },
    
    _findMatch(text, startPos, dir, openChar, closeChar) {
        let depth = 1;
        let i = startPos;
        while (i >= 0 && i < text.length) {
            if (text[i] === openChar) depth += dir;
            else if (text[i] === closeChar) depth -= dir;
            
            if (depth === 0) return i;
            i += dir;
        }
        return -1;
    },
    
    _setCoords(idx1, idx2) {
        const getXY = (idx) => {
            const sub = DOM.editor.value.substring(0, idx);
            const lines = sub.split('\n');
            const line = lines.length;
            const col = lines[lines.length-1].length + 1;
            
            // B"H - Use the shared, rectified calculation
            const coords = ParticleSystem.getCoordinates(line, col);
            return { x: coords.left, y: coords.top };
        };
        
        this.match = { start: getXY(idx1), end: getXY(idx2) };
    },
    
    render() {
        if (!this.match) return;
        
        const { start, end } = this.match;
        
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        
        // Draw a bezier curve connecting them
        const cp1x = start.x + 50;
        const cp1y = start.y;
        const cp2x = end.x - 50;
        const cp2y = end.y;
        
        this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, end.x, end.y);
        
        this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Glow points
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.beginPath(); this.ctx.arc(start.x, start.y, 3, 0, Math.PI*2); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(end.x, end.y, 3, 0, Math.PI*2); this.ctx.fill();
    }
};
