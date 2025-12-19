
// B"H
// FILE: js/git/meta.js

import { FileSystemProvider } from '../fs-provider.js';

export const GitMetaProvider = {
    /*B"H*/

/**
 * Safely reads and parses the .awtsmoos-repo/ikar.js file from a folder.
 * @param {object} folderItem - The item representing the folder to check.
 * @returns {Promise<object|null>} - The Git metadata object, or null if not found.
 */
async getGitInfoForFolder(folderItem) {
    if (folderItem.type === 'github') {
        return null;
    }

    const ikarFilePath = folderItem.path === '/' 
        ? '/.awtsmoos-repo/ikar.js' 
        : `${folderItem.path}/.awtsmoos-repo/ikar.js`;

    const ikarFileItem = { ...folderItem, path: ikarFilePath, kind: 'file' };

    try {
        const content = await FileSystemProvider.read(ikarFileItem);
        let textContent = (content instanceof Blob) ? await content.text() : content;
        if (!textContent) return null;

        const objectStartIndex = textContent.indexOf('{');
        const objectEndIndex = textContent.lastIndexOf('}');
        if (objectStartIndex === -1 || objectEndIndex === -1 || objectEndIndex < objectStartIndex) {
            return null;
        }
        const jsonText = textContent.slice(objectStartIndex, objectEndIndex + 1);
        
        const gitInfo = JSON.parse(jsonText);
        if (gitInfo && gitInfo.isClone === true) {
            return gitInfo;
        } else {
            console.warn("Found ikar.js but its content was not valid clone metadata.", { folderItem, content });
            return null;
        }

    } catch (e) {
        return null;
    }
}
};
