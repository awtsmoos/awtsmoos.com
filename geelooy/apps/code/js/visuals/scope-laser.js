
// B"H
// FILE: js/visuals/scope-laser.js

import { DOM } from '../state.js';
import { ParticleSystem } from './particle-system.js';

export const ScopeLaser = {
    ctx: null,
    targetIndent: 0,
    currentIndent: 0, // Lerp value
    
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
    },
    
    render() {
        // Lerp for smooth movement
        this.currentIndent += (this.targetIndent - this.currentIndent) * 0.2;
        
        if (this.currentIndent < 0.5) return; // Don't draw at 0 indent
        
        const editor = DOM.editor;
        const style = window.getComputedStyle(editor);
        const fontSize = parseFloat(style.fontSize);
        const charWidth = fontSize * 0.6; 
        const paddingLeft = parseFloat(style.paddingLeft);
        const rect = editor.getBoundingClientRect();
        
        // B"H - Added scrollLeft subtraction for horizontal scrolling support
        const x = rect.left + paddingLeft + (this.currentIndent * charWidth) - editor.scrollLeft;
        
        // Get Cursor Y for gradient center using ParticleSystem
        const coords = ParticleSystem.getCaretCoordinates();
        const y = coords.top;
        
        // Define beam height (shorter)
        const beamHeight = 250; 
        const topY = y - (beamHeight / 2);
        const bottomY = y + (beamHeight / 2);

        // Draw Gradient Laser
        const gradient = this.ctx.createLinearGradient(x, topY, x, bottomY);
        gradient.addColorStop(0, 'rgba(0, 246, 255, 0)');
        gradient.addColorStop(0.2, 'rgba(0, 246, 255, 0.05)');
        gradient.addColorStop(0.5, 'rgba(0, 246, 255, 0.6)'); // Core intensity
        gradient.addColorStop(0.8, 'rgba(0, 246, 255, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 246, 255, 0)');
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, topY);
        this.ctx.lineTo(x, bottomY);
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Inner Core (Thinner, White)
        const innerGradient = this.ctx.createLinearGradient(x, topY + 50, x, bottomY - 50);
        innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        innerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
        innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.beginPath();
        this.ctx.moveTo(x, topY + 50);
        this.ctx.lineTo(x, bottomY - 50);
        this.ctx.strokeStyle = innerGradient;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
};
