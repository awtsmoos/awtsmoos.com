
// B"H
// FILE: js/visuals/color-engine.js

import { DOM, State } from '../state.js';
import { Editor } from '../editor.js';
import { ParticleSystem } from './particle-system.js';

/**
 * @class ColorEngine
 * @description The Awtsmoos creates the world in colors, yet the machine sees only 
 * bits. This class bridges that divide. It calculates the physical coordinates 
 * of hex strings within the editor's scrollable chasm and places an interactive 
 * overlay that does not interfere with the flow of the Word (the text).
 */
export const ColorEngine = {
    activeOrbs: [],

    /**
     * @function scanAndManifest
     * @description Peers into the current content and identifies color strings.
     * It then projects them into the UI realm.
     */
    scanAndManifest() {
        if (DOM.editorWrapper.classList.contains('hidden')) return;
        
        const text = DOM.editor.value;
        const hexRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
        let match;
        
        const container = DOM.editorWrapper;
        // Clear old orbs from the DOM
        container.querySelectorAll('.editor-color-orb').forEach(el => el.remove());

        while ((match = hexRegex.exec(text)) !== null) {
            const index = match.index;
            const hex = match[0];
            
            // Calculate coordinates
            const lines = text.substring(0, index).split('\n');
            const line = lines.length;
            const col = lines[lines.length - 1].length + 1;
            
            const coords = ParticleSystem.getCoordinates(line, col);
            this._createOrb(coords, hex, index);
        }
    },

    /**
     * @function _createOrb
     * @description Forges a physical manifestation of a color value.
     */
    _createOrb(coords, hex, textIndex) {
        const orb = document.createElement('div');
        orb.className = 'editor-color-orb';
        orb.style.cssText = `
            position: fixed;
            left: ${coords.left - 18}px;
            top: ${coords.top - 8}px;
            width: 14px;
            height: 14px;
            background: ${hex};
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            cursor: pointer;
            z-index: 1000;
            pointer-events: auto;
            user-select: none;
        `;

        orb.onclick = (e) => {
            e.stopPropagation();
            this._triggerPicker(hex, textIndex);
        };

        DOM.editorWrapper.appendChild(orb);
    },

    /**
     * @function _triggerPicker
     * @description Opens a gateway to choose a new color.
     */
    _triggerPicker(currentHex, textIndex) {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = currentHex.length === 4 
            ? '#' + currentHex[1].repeat(2) + currentHex[2].repeat(2) + currentHex[3].repeat(2) 
            : currentHex;
            
        input.oninput = (e) => {
            const newHex = e.target.value;
            const editor = DOM.editor;
            const oldText = editor.value;
            const start = textIndex;
            const end = start + currentHex.length;
            
            editor.setRangeText(newHex, start, end, 'end');
            editor.dispatchEvent(new Event('input'));
            this.scanAndManifest();
        };
        input.click();
    }
};
