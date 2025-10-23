// B"H
// FILE: js/git-meta-provider.js

import { FileSystemProvider } from './fs-provider.js';

export const GitMetaProvider = {
    /**
     * Safely reads and parses the .awtsmoos-repo/ikar.js file from a folder.
     * @param {object} folderItem - The item representing the folder to check.
     * @returns {Promise<object|null>} - The Git metadata object, or null if not found.
     */
    
    // REPLACE your existing getGitInfoForFolder function with this one.
    async getGitInfoForFolder(folderItem) {
        const ikarFilePath = folderItem.path === '/' 
            ? '/.awtsmoos-repo/ikar.js' 
            : `${folderItem.path}/.awtsmoos-repo/ikar.js`;

        const ikarFileItem = { ...folderItem, path: ikarFilePath, kind: 'file' };

        try {
            const content = await FileSystemProvider.read(ikarFileItem);
            
            // --- NEW, ROBUST PARSING LOGIC (NO REGEX) ---
            // 1. Find the start of the object.
            const objectStartIndex = content.indexOf('{');
            if (objectStartIndex === -1) {
                console.warn("Found ikar.js but it did not contain a valid metadata object.", folderItem, content);
                return null;
            }

            // 2. Isolate the object text from the rest of the file.
            const jsonText = content.substring(objectStartIndex);
            
            // 3. Let the native, secure JSON parser do the heavy lifting.
            const gitInfo = JSON.parse(jsonText);
            // --- END NEW LOGIC ---

            // We still validate that the parsed object is one of ours.
            if (gitInfo && gitInfo.isClone === true) {
                return gitInfo;
            } else {
                console.warn("Found ikar.js but its content was not valid clone metadata.", folderItem);
                return null;
            }

        } catch (e) {
        
            // This is the normal, expected case for any folder that is NOT a clone.
            // We simply return null and do not log any warning.
            return null;
        }
    }
};