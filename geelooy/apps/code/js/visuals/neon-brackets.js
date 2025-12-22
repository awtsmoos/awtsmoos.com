
// B"H
// FILE: js/visuals/neon-brackets.js

import { DOM } from '../state.js';
import { ParticleSystem } from './particle-system.js'; 

export const NeonBrackets = {
    ctx: null,
    match: null, // { start: {line, col}, end: {line, col} }
    
    init(ctx) {
        this.ctx = ctx;
    },
    
    scan() {
        const text = DOM.editor.value;
        const cursor = DOM.editor.selectionStart;
        
        const charBefore = text[cursor - 1];
        
        const pairs = { '(': ')', '{': '}', '[': ']' };
        const revPairs = { ')': '(', '}': '{', ']': '[' };
        
        this.match = null;
        
        if (pairs[charBefore]) {
            const partner = this._findMatch(text, cursor, 1, charBefore, pairs[charBefore]);
            if (partner !== -1) this._setMatchInfo(cursor - 1, partner);
        } else if (revPairs[charBefore]) {
            const partner = this._findMatch(text, cursor - 2, -1, charBefore, revPairs[charBefore]);
            if (partner !== -1) this._setMatchInfo(partner, cursor - 1);
        }
    },
    
    _findMatch(text, startPos, dir, openChar, closeChar) {
        let depth = 1;
        let i = startPos;
        while (i >= 0 && i < text.length) {
            // B"H - Fixed logic: Nesting always increases depth, matching decreases it.
            // Direction only affects traversal order.
            if (text[i] === openChar) depth++;
            else if (text[i] === closeChar) depth--;
            
            if (depth === 0) return i;
            i += dir;
        }
        return -1;
    },
    
    _setMatchInfo(idx1, idx2) {
        const getLineCol = (idx) => {
            const sub = DOM.editor.value.substring(0, idx);
            const lines = sub.split('\n');
            const line = lines.length;
            const col = lines[lines.length-1].length + 1;
            return { line, col };
        };
        
        this.match = { start: getLineCol(idx1), end: getLineCol(idx2) };
    },
    
    render() {
        if (!this.match) return;
        
        // Calculate coords dynamically every frame to account for scroll
        const startCoords = ParticleSystem.getCoordinates(this.match.start.line, this.match.start.col);
        const endCoords = ParticleSystem.getCoordinates(this.match.end.line, this.match.end.col);
        
        const start = { x: startCoords.left, y: startCoords.top };
        const end = { x: endCoords.left, y: endCoords.top };
        
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
