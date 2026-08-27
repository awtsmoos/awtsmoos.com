
// B"H
/**
 * @file ZipCopier.js
 * @brief Handles the 'Lazy Copy' intent for Zip archives.
 */

import { State } from '../../state.js';
import { UI } from '../../ui.js';
import { SelectionManager } from '../../selection-manager.js';

export const ZipCopier = {
    /**
     * @function execute
     * @description Marks the selected items in the spiritual clipboard as pending ZIP compression.
     */
    execute(items) {
        if (!items || items.length === 0) return;
        
        // Record the intent in the State vessel
        State.clipboardZip = { 
            items: [...items], 
            type: 'lazy-zip', 
            name: items.length === 1 ? `${items[0].name}.zip` : 'selection.zip' 
        };
        
        // Clear standard file clipboard to prevent confusion
        State.fileClipboard = []; 
        
        UI.showToast("Copied as ZIP (Compression will occur on Paste)", "success");
        
        // End selection mode gracefully
        if (typeof SelectionManager?.end === 'function') {
            SelectionManager.end();
        }
    }
};
