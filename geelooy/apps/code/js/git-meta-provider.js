// B"H
// FILE: js/git-meta-provider.js

import { FileSystemProvider } from './fs-provider.js';

export const GitMetaProvider = {
    /**
     * Safely reads and parses the .awtsmoos-repo/ikar.js file from a folder.
     * @param {object} folderItem - The item representing the folder to check.
     * @returns {Promise<object|null>} - The Git metadata object, or null if not found.
     */
    async getGitInfoForFolder(folderItem) {
        // Construct the full path to our special metadata file.
        const ikarFilePath = folderItem.path === '/' 
            ? '/.awtsmoos-repo/ikar.js' 
            : `${folderItem.path}/.awtsmoos-repo/ikar.js`;

        const ikarFileItem = { ...folderItem, path: ikarFilePath, kind: 'file' };

        try {
            const content = await FileSystemProvider.read(ikarFileItem);
            
            // This is the SAFE parsing method. It finds the JSON-like object within the text.
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.warn("Found ikar.js but it contained no valid metadata object.", folderItem);
                return null;
            }
            
            // Parse the extracted text safely.
            const gitInfo = JSON.parse(jsonMatch[0]);
            return gitInfo;

        } catch (e) {
            // This is the normal case for folders that are NOT clones.
            // The FileSystemProvider will throw an error because the file doesn't exist.
            return null;
        }
    }
};