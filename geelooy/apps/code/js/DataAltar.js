// B"H
// FILE: js/DataAltar.js
// The Insane Vivid Extreme Data Altar Engine

import { DOM } from './state.js';

export const DataAltar = {
    
    /**
     * Manifests the Altar UI from a live JavaScript object.
     * @param {object} liveData - The parsed JSON object.
     */
    manifest(liveData) {
        DOM.dataAltarContainer.innerHTML = ''; // Cleanse the chamber
        const rootNode = this._createNode(liveData, 'root');
        DOM.dataAltarContainer.appendChild(rootNode);
    },

    /**
     * Recursively creates the interactive HTML for a given piece of data.
     * This is where the VISUAL INSANITY happens.
     */
    _createNode(data, key) {
        const container = document.createElement('div');
        container.className = 'altar-node';
        
        const type = this._getType(data);
        container.dataset.type = type;

        const keyEl = document.createElement('span');
        keyEl.className = 'altar-key';
        keyEl.textContent = `${key}: `;
        
        if (type === 'object' || type === 'array') {
            const details = document.createElement('details');
            details.open = true; // Start expanded
            const summary = document.createElement('summary');
            summary.appendChild(keyEl);
            
            const braceOpen = document.createElement('span');
            braceOpen.className = 'altar-brace';
            braceOpen.textContent = type === 'object' ? '{' : '[';
            summary.appendChild(braceOpen);
            
            details.appendChild(summary);
            
            if (type === 'object') {
                for (const childKey in data) {
                    details.appendChild(this._createNode(data[childKey], childKey));
                }
            } else { // array
                data.forEach((item, index) => {
                    details.appendChild(this._createNode(item, index));
                });
            }
            
            const braceClose = document.createElement('span');
            braceClose.className = 'altar-brace';
            braceClose.textContent = type === 'object' ? '}' : ']';
            details.appendChild(braceClose);
            
            container.appendChild(details);
        } else {
            container.appendChild(keyEl);
            const valueEl = document.createElement('span');
            valueEl.className = 'altar-value';
            valueEl.contentEditable = true;
            valueEl.textContent = this._formatValue(data, type);
            
            // When a value is edited, directly mutate the source object.
            valueEl.addEventListener('blur', () => {
                // This is complex - you need a way to link this DOM element back
                // to the original object property to mutate it. We'll simplify for now.
                // A real implementation would use data attributes to store the path.
            });

            container.appendChild(valueEl);
        }

        return container;
    },

    _getType(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    },

    _formatValue(value, type) {
        if (type === 'string') return `"${value}"`;
        return String(value);
    }
};