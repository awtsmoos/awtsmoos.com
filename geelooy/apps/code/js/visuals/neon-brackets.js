
// B"H
// FILE: js/visuals/neon-brackets.js

import { DOM } from '../state.js';

export const NeonBrackets = {
    ctx: null,
    matchIndices: null, // Stores { start: {line, col}, end: {line, col} }
    charWidth: 0,
    
    init(ctx) {
        this.ctx = ctx;
        this.measureChar();
    },

    measureChar() {
        if (!this.ctx) return;
        // B"H - Must match CSS exactly
        this.ctx.font = '14px "Fira Code", monospace';
        const metrics = this.ctx.measureText('M');
        this.charWidth = metrics.width;
        
        // Safety Fallback if font loads late
        if (this.charWidth === 0 || this.charWidth < 7) this.charWidth = 8.4; 
    },
    
    scan() {
        const text = DOM.editor.value;
        const cursor = DOM.editor.selectionStart;
        
        // Safety check
        if (cursor === 0) {
            this.matchIndices = null;
            return;
        }

        const charBefore = text[cursor - 1];
        
        // Bracket Maps
        const pairs = { '(': ')', '{': '}', '[': ']' };
        const revPairs = { ')': '(', '}': '{', ']': '[' };
        
        this.matchIndices = null;
        
        // 1. Check if cursor is just after an Opening Bracket
        if (pairs[charBefore]) {
            const partnerIdx = this._findMatch(text, cursor, 1, charBefore, pairs[charBefore]);
            if (partnerIdx !== -1) {
                this.matchIndices = {
                    start: this._getLineCol(text, cursor - 1),
                    end: this._getLineCol(text, partnerIdx)
                };
            }
        } 
        // 2. Check if cursor is just after a Closing Bracket (Backward Search)
        else if (revPairs[charBefore]) {
            // We search BACKWARDS starting from cursor-2
            const partnerIdx = this._findMatch(text, cursor - 2, -1, charBefore, revPairs[charBefore]);
            if (partnerIdx !== -1) {
                this.matchIndices = {
                    start: this._getLineCol(text, partnerIdx), // The opening bracket is earlier
                    end: this._getLineCol(text, cursor - 1)    // The closing bracket is here
                };
            }
        }
    },
    
    _findMatch(text, startPos, dir, openChar, closeChar) {
        let depth = 1;
        let i = startPos;
        const len = text.length;
        
        while (i >= 0 && i < len) {
            const char = text[i];
            
            if (char === openChar) {
                depth++;
            } else if (char === closeChar) {
                depth--;
            }
            
            if (depth === 0) return i;
            
            i += dir;
        }
        return -1;
    },

    _getLineCol(text, index) {
        // Count newlines up to the index to get the Line Number
        // Count characters since the last newline to get Column Number
        // This is strictly accurate to how textarea renders.
        let line = 0;
        let lastNewlineIdx = -1;
        
        for (let i = 0; i < index; i++) {
            if (text[i] === '\n') {
                line++;
                lastNewlineIdx = i;
            }
        }
        
        const col = index - (lastNewlineIdx + 1);
        return { line, col };
    },
    
    render() {
        if (!this.matchIndices) return;
        
        // Dynamic Re-measurement (in case font loaded late)
        if (!this.charWidth) this.measureChar();

        const editor = DOM.editor;
        
        // B"H - LIVE METRICS
        // We must calculate coordinates continuously because scrollTop changes.
        // We read the ComputedStyle to be pixel-perfect with CSS.
        const style = window.getComputedStyle(editor);
        const lineHeight = parseFloat(style.lineHeight) || 24;
        const paddingLeft = parseFloat(style.paddingLeft) || 10;
        const paddingTop = parseFloat(style.paddingTop) || 10;
        
        // Current Scroll Offsets
        const scrollTop = editor.scrollTop;
        const scrollLeft = editor.scrollLeft;
        const rect = editor.getBoundingClientRect();

        // Helper to convert semantic (line, col) to screen (x, y)
        const getCoords = (pos) => {
            // X = EditorLeft + Padding + (Col * CharWidth) - ScrollX + CenterOffset
            const x = rect.left + paddingLeft + (pos.col * this.charWidth) - scrollLeft + (this.charWidth / 2);
            
            // Y = EditorTop + Padding + (Line * LineHeight) - ScrollY + CenterOffset
            const y = rect.top + paddingTop + (pos.line * lineHeight) - scrollTop + (lineHeight / 2);
            
            return { x, y };
        };

        const start = getCoords(this.matchIndices.start);
        const end = getCoords(this.matchIndices.end);
        
        // Performance Culling: Don't draw if both points are off-screen vertically
        const winH = window.innerHeight;
        const margin = 100; // Allow drawing slightly offscreen to prevent popping
        if ((start.y < -margin && end.y < -margin) || (start.y > winH + margin && end.y > winH + margin)) {
            return;
        }

        // --- DRAWING THE LINE ---
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        
        // Bezier Curve Logic
        // If on different lines, curve out to the left or right to avoid text
        // If on same line, curve slightly down/up.
        
        const dy = end.y - start.y;
        const dx = end.x - start.x;
        
        // Control Point Offset logic
        // We want a nice C-shape or S-shape connecting them.
        // Simple heuristic: Pull control points horizontally based on height difference.
        
        // If vertical distance is large, curve out more
        const curvature = Math.min(Math.abs(dy) * 0.5, 150); 
        
        // Control Points
        // We pull the control points towards the indentation (left) usually,
        // to create a bracket-like visual on the left gutter if they are far apart.
        // But for arbitrary brackets, a direct curve is safer.
        
        // Strategy: 
        // CP1 is below start. CP2 is above end.
        const cp1x = start.x - (Math.abs(dx) * 0.2); 
        const cp1y = start.y + (Math.abs(dy) * 0.5);
        
        const cp2x = end.x - (Math.abs(dx) * 0.2);
        const cp2y = end.y - (Math.abs(dy) * 0.5);
        
        // B"H - Enhanced Curve for Clarity
        // If they are strictly vertical (same col), curve left.
        const isVertical = Math.abs(dx) < 10;
        const controlXOffset = isVertical ? 40 : 0;

        this.ctx.bezierCurveTo(
            start.x - controlXOffset, start.y + (dy/2), 
            end.x - controlXOffset, end.y - (dy/2), 
            end.x, end.y
        );
        
        // Neon Glow Style
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#ff00ff';
        this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Reset Shadow
        this.ctx.shadowBlur = 0;
        
        // Draw Anchor Dots
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.beginPath(); this.ctx.arc(start.x, start.y, 3, 0, Math.PI*2); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(end.x, end.y, 3, 0, Math.PI*2); this.ctx.fill();
    }
};
