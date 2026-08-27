
// B"H
/**
 * @file render.js
 * @brief THE GENERATOR OF FORMS (HaMetzayer).
 * 
 * CHAPTER 5: THE TRANSLATION INTO MATTER
 * This module is the master scribe for the Editor's interior. 
 * It iterates over the active tab's properties and summons 
 * the appropriate UI component—swatches for colors, 
 * grids for selections, or toggles for binary truths.
 * 
 * THE POEM OF THE COMPONENT:
 * A color is a swatch, a choice is a grid,
 * Revealing the sparks that the Registry hid!
 * We loop through the keys, we loop through the names,
 * To play with the essence, to win in the games!
 */

import { TabButton } from '../ui/components/TabButton.js';
import { ColorGrid } from '../ui/components/ColorGrid.js';
import { SelectGrid } from '../ui/components/SelectGrid.js';
import { RangeInput } from '../ui/components/RangeInput.js';
import { ToggleInput } from '../ui/components/ToggleInput.js';

export class EditorRender {
    /**
     * @function tabs
     * @description Generates the list of tab buttons based on the Editor's configuration.
     * @param {EditorManager} editor 
     * @returns {string} HTML string.
     */
    static tabs(editor) {
        return Object.keys(editor.tabs)
            .map(tab => TabButton.render(tab, editor.activeTab === tab))
            .join('');
    }

    /**
     * @function controls
     * @description Generates the full set of form controls for the currently active tab.
     * @param {EditorManager} editor 
     * @returns {string} HTML string.
     */
    static controls(editor) {
        let html = '';
        const activeKeys = editor.tabs[editor.activeTab] || [];
        
        activeKeys.forEach(key => {
            const config = editor.partsData[key];
            if (!config) return;

            html += `
                <div class="control-group">
                    <label class="control-label" for="ctrl-${key}">${config.label}</label>
            `;

            // THE ROUTING OF TYPES
            if (config.type === 'color') {
                html += ColorGrid.render(editor, key, config);
            } else if (config.type === 'select') {
                html += SelectGrid.render(editor, key, config);
            } else if (config.type === 'range') {
                html += RangeInput.render(editor, key, config);
            } else if (config.type === 'toggle') {
                html += ToggleInput.render(editor, key, config);
            }

            html += `</div>`;
        });
        
        return html;
    }
}
