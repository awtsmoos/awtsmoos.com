
// B"H
/**
 * @file validator.js
 * @brief Purifies file and folder names before manifestation.
 */

import { ActionModal } from './modal.js';

export const NameValidator = {
    /**
     * B"H - Trims and verifies a name against the physical laws of the file system.
     * @param {string} name 
     * @returns {Promise<string|null>} The purified name, or null if utterly corrupted.
     */
    async purify(name) {
        if (!name) return null;
        
        // Remove trailing and leading void (spaces)
        const cleanName = name.trim();
        
        if (cleanName.length === 0) {
            await ActionModal.alert("B\"H\nA name cannot be empty.");
            return null;
        }

        // OPFS and standard file systems forbid these specific chaos markers
        const forbiddenChars = /[\\/:*?"<>|]/;
        if (forbiddenChars.test(cleanName)) {
            await ActionModal.alert("B\"H\nThe name contains forbidden marks: \\ / : * ? \" < > |");
            return null;
        }

        return cleanName;
    }
};
