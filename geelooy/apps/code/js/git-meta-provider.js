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
    // B"H
// FILE: js/git-meta-provider.js

// ... inside the GitMetaProvider object ...

    // REPLACE your existing getGitInfoForFolder function with this one.
    async getGitInfoForFolder(folderItem) {
        const ikarFilePath = folderItem.path === '/' 
            ? '/.awtsmoos-repo/ikar.js' 
            : `${folderItem.path}/.awtsmoos-repo/ikar.js`;

        const ikarFileItem = { ...folderItem, path: ikarFilePath, kind: 'file' };

        try {
            // This 'content' could be a string OR a Blob/File object.
            const content = await FileSystemProvider.read(ikarFileItem);
            
            // --- NEW, ROBUST CONTENT HANDLING ---
            let textContent = '';
            if (typeof content === 'string') {
                textContent = content;
            } else if (content instanceof Blob) {
                // If we get a Blob or File, we must read its text content asynchronously.
                textContent = await content.text();
            } else {
                // If we get nothing, we can't proceed.
                return null;
            }
            // --- END NEW LOGIC ---

            const objectStartIndex = textContent.indexOf('{');
            if (objectStartIndex === -1) {
                console.warn("Found ikar.js but it did not contain a valid metadata object.", folderItem);
                return null;
            }

            const jsonText = textContent.substring(objectStartIndex);
            const gitInfo = JSON.parse(jsonText);

            if (gitInfo && gitInfo.isClone === true) {
                return gitInfo;
            } else {
                console.warn("Found ikar.js but its content was not valid clone metadata.", folderItem);
                return null;
            }

        } catch (e) {
            // This is the normal, expected case for any folder that is NOT a clone.
            return null;
        }
    }
};