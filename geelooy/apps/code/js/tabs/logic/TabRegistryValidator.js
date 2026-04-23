
// B"H
/**
 * @file TabRegistryValidator.js
 * @brief THE SENESCHAL OF THE OPEN WINDOWS.
 */

import { State } from '../../state.js';
import { MultidimensionalSeal } from '../../core/identity/MultidimensionalSeal.js';

export const TabRegistryValidator = {
    /**
     * @function findExistingManifestation
     * @description Checks if a tab already exists for the specific intent.
     * @param {object} item - The item to check.
     * @param {string} intentType - The requested view (vibe, editor, preview).
     */
    findExistingManifestation(item, intentType) {
        if (!item) return null;
        
        // Construct the intent seal. A Vibe tab must be distinct from an Editor tab!
        const canonicalBase = MultidimensionalSeal.cast(item);
        const intentKey = `${intentType}::${canonicalBase}`;

        console.log(`[TabRegistry] B"H - Validating intent: ${intentKey}`);

        return State.tabs.find(t => {
            const tabItemType = t.item.type || t.fileType;
            // Determine if the existing tab's intent matches the new request
            let existingIntent = 'editor';
            if (t.isPreview || t.fileType === 'html-preview') existingIntent = 'preview';
            else if (t.fileType === 'vibe' || t.item.type === 'vibe-session') existingIntent = 'vibe';
            else if (t.item.type === 'terminal') existingIntent = 'terminal';
            else if (t.item.type === 'commander') existingIntent = 'commander';

            const existingSeal = MultidimensionalSeal.cast(t.item);
            const fullExistingKey = `${existingIntent}::${existingSeal}`;

            return fullExistingKey === intentKey;
        });
    }
};
