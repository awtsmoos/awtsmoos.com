// B"H
// FILE: js/visuals/color-orbs.js

import { DOM } from '../state.js';

export const ColorOrbs = {
    // Note: This logic is integrated into the Editor update loop manually via ui.js or editor.js
    // because it modifies the Line Numbers column, not the Canvas.
    
    scanAndRender(lineNumbersContainer) {
        const text = DOM.editor.value;
        const lines = text.split('\n');
        const children = lineNumbersContainer.children;
        
        // Optimization: Only scan visible lines? 
        // For simplicity, we scan regex on lines corresponding to children.
        
        for (let i = 0; i < lines.length; i++) {
            if (i >= children.length) break;
            
            const line = lines[i];
            const hexMatch = line.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
            
            const numDiv = children[i];
            // Clear previous orbs
            const existingOrb = numDiv.querySelector('.color-orb');
            if (existingOrb) existingOrb.remove();
            
            if (hexMatch) {
                const color = hexMatch[0];
                const orb = document.createElement('span');
                orb.className = 'color-orb';
                orb.style.backgroundColor = color;
                orb.title = color;
                numDiv.appendChild(orb);
            }
        }
    }
};