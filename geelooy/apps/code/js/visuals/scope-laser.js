// B"H
// FILE: js/visuals/scope-laser.js

import { DOM } from '../state.js';
import { Editor } from '../editor.js';

export const ScopeLaser = {
    ctx: null,
    targetIndent: 0,
    currentIndent: 0, // Lerp value
    targetY: 0,
    currentY: 0,
    
    init(ctx) {
        this.ctx = ctx;
    },
    
    updatePosition() {
        const editor = DOM.editor;
        const text = editor.value;
        const start = editor.selectionStart;
        
        // Find current line start
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = text.indexOf('\n', start);
        const actualEnd = lineEnd === -1 ? text.length : lineEnd;
        
        const lineText = text.substring(lineStart, actualEnd);
        
        // Calculate indentation
        const match = lineText.match(/^\s*/);
        const indentSpace = match ? match[0].length : 0;
        
        this.targetIndent = indentSpace;

        // Calculate Y Position based on Line Number
        const { line } = Editor.getCursorInfo(); // 1-based line number
        
        // Match CSS values exactly: Padding Top (10px) + (LineIndex * LineHeight (24px))
        // We subtract scrollTop to keep it relative to the viewport
        const lineHeight = 24; 
        const paddingTop = 10;
        
        // Line is 1-based, so line-1 is 0-based index
        const yPos = paddingTop + ((line - 1) * lineHeight) - editor.scrollTop;
        
        // Get Editor Rect to offset the canvas drawing (which covers whole screen)
        const rect = editor.getBoundingClientRect();
        this.targetY = rect.top + yPos;
    },
    
    render() {
        // Lerp for smooth movement
        this.currentIndent += (this.targetIndent - this.currentIndent) * 0.2;
        this.currentY += (this.targetY - this.currentY) * 0.3;
        
        // Don't draw if scrolled out of view loosely
        if (this.currentY < 0 || this.currentY > window.innerHeight) return;

        const editor = DOM.editor;
        // Ensure we are getting the rect every frame in case of resize
        const rect = editor.getBoundingClientRect();
        
        // Calculate X based on font metrics
        // Font size 14px * 0.6 (approx for Fira Code) is roughly 8.4px per char
        // But let's measure to be safe or use the fixed width assumption
        const charWidth = 14 * 0.6; 
        
        // CSS Padding Left + LineNumbers Width + Border
        // Actually, rect.left includes the line numbers if the canvas covers the screen.
        // But we want the laser INSIDE the editor text area.
        // We need to know the editor's computed padding-left.
        const style = window.getComputedStyle(editor);
        const paddingLeft = parseFloat(style.paddingLeft);
        
        const x = rect.left + paddingLeft + (this.currentIndent * charWidth);
        
        // Draw Vertical Line (The Scope)
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.currentY); // Top of line
        this.ctx.lineTo(x, this.currentY + 24); // Bottom of line (LineHeight)
        
        // Outer Glow
        this.ctx.strokeStyle = 'rgba(0, 246, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Horizontal Guide (Optional - faint line across)
        this.ctx.beginPath();
        this.ctx.moveTo(rect.left, this.currentY + 24);
        this.ctx.lineTo(rect.right, this.currentY + 24);
        this.ctx.strokeStyle = 'rgba(0, 246, 255, 0.05)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
};