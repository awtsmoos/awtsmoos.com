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
        const ikarFilePath = folderItem.path === '/' 
            ? '/.awtsmoos-repo/ikar.js' 
            : `${folderItem.path}/.awtsmoos-repo/ikar.js`;

        const ikarFileItem = { ...folderItem, path: ikarFilePath, kind: 'file' };

        try {
            const content = await FileSystemProvider.read(ikarFileItem);
            let textContent = (content instanceof Blob) ? await content.text() : content;
            if (!textContent) return null;

            // --- THE DEFINITIVE PARSING FIX ---
            // 1. Find the first '{'
            const objectStartIndex = textContent.indexOf('{');
            // 2. Find the LAST '}'
            const objectEndIndex = textContent.lastIndexOf('}');

            // 3. If either is missing, or if the end comes before the start, the file is invalid.
            if (objectStartIndex === -1 || objectEndIndex === -1 || objectEndIndex < objectStartIndex) {
                console.warn("Found ikar.js but it was malformed.", { folderItem, content });
                return null;
            }

            // 4. Slice ONLY the text between the first '{' and the last '}'.
            const jsonText = textContent.slice(objectStartIndex, objectEndIndex + 1);
            // --- END FIX ---
            
            const gitInfo = JSON.parse(jsonText);

            if (gitInfo && gitInfo.isClone === true) {
                return gitInfo;
            } else {
                console.warn("Found ikar.js but its content was not valid clone metadata.", { folderItem, content });
                return null;
            }

        } catch (e) {
            return null; // This is normal for non-clone folders.
        }
    }
};