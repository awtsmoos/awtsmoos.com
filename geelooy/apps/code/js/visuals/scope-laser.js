
// B"H
// FILE: js/visuals/scope-laser.js

import { DOM } from '../state.js';
import { Editor } from '../editor.js';
import { ParticleSystem } from './particle-system.js';

export const ScopeLaser = {
    ctx: null,
    targetIndentPixels: 0,
    currentIndentPixels: 0, // Lerp value
    targetY: 0,
    currentY: 0,
    
    init(ctx) {
        this.ctx = ctx;
    },
    
    updatePosition() {
        const editor = DOM.editor;
        if (!editor) return;

        const text = editor.value;
        const start = editor.selectionStart;
        
        // 1. Find the current line content
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = text.indexOf('\n', start);
        const actualEnd = lineEnd === -1 ? text.length : lineEnd;
        const lineText = text.substring(lineStart, actualEnd);
        
        // 2. Extract leading whitespace
        const match = lineText.match(/^\s*/);
        const indentStr = match ? match[0] : '';
        
        // 3. Calculate Visual Width of Indentation (Handling Tabs)
        const style = window.getComputedStyle(editor);
        const tabSize = parseInt(style.tabSize) || 4;
        
        let visualCol = 0;
        for(const char of indentStr) {
            if(char === '\t') {
                visualCol += tabSize - (visualCol % tabSize);
            } else {
                visualCol++;
            }
        }
        
        // 4. Convert to Pixels (using the central physics engine width)
        const charWidth = ParticleSystem.charWidth || 8.4;
        this.targetIndentPixels = visualCol * charWidth;

        // 5. Calculate Y Position
        // We reuse the metric cache from ParticleSystem to ensure perfect sync
        const lineHeight = ParticleSystem.lineHeight || 24; 
        const paddingTop = ParticleSystem.paddingTop || 10;
        const borderTop = ParticleSystem.borderTop || 0;
        
        const { line } = Editor.getCursorInfo(); // 1-based line number
        // (line - 1) converts to 0-based index
        const yPos = borderTop + paddingTop + ((line - 1) * lineHeight) - editor.scrollTop;
        
        const rect = editor.getBoundingClientRect();
        this.targetY = rect.top + yPos;
    },
    
    render() {
        // Smooth Animation (Lerp)
        this.currentIndentPixels += (this.targetIndentPixels - this.currentIndentPixels) * 0.2;
        this.currentY += (this.targetY - this.currentY) * 0.3;
        
        // Culling
        if (this.currentY < 0 || this.currentY > window.innerHeight) return;

        const editor = DOM.editor;
        const rect = editor.getBoundingClientRect();
        const style = window.getComputedStyle(editor);
        
        // Get left offsets
        const paddingLeft = parseFloat(style.paddingLeft) || 10;
        const borderLeft = parseFloat(style.borderLeftWidth) || 0;
        
        // Absolute X position on screen
        const x = rect.left + borderLeft + paddingLeft + this.currentIndentPixels;
        
        // Draw Vertical Scope Line
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.currentY);
        this.ctx.lineTo(x, this.currentY + 24); // Height of one line
        
        // Enhanced Glow Style
        this.ctx.strokeStyle = 'rgba(0, 246, 255, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = 'rgba(0, 246, 255, 0.8)';
        this.ctx.stroke();
        
        this.ctx.shadowBlur = 0;
        
        // Optional: Horizontal Guide (faint)
        this.ctx.beginPath();
        this.ctx.moveTo(rect.left, this.currentY + 24);
        this.ctx.lineTo(rect.right, this.currentY + 24);
        this.ctx.strokeStyle = 'rgba(0, 246, 255, 0.08)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
};