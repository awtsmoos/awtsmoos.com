// B"H
// FILE: js/git-meta-provider.js

import { FileSystemProvider } from './fs-provider.js';

export const GitMetaProvider = {
    /*B"H*/

/**
 * Safely reads and parses the .awtsmoos-repo/ikar.js file from a folder.
 * This definitive version understands the Paradox of the Source: a direct GitHub
 * workspace is the essence itself and cannot contain a sign of that essence
 * (an ikar.js file). It now immediately ceases its search when questioned about
 * such a reality, preventing the cascade of 'Not Found' errors during initialization.
 * @param {object} folderItem - The item representing the folder to check.
 * @returns {Promise<object|null>} - The Git metadata object, or null if not found.
 */
async getGitInfoForFolder(folderItem) {
    // THE TWIST & THE FIX: This is the guard against the paradox.
    // A direct GitHub workspace is the source reality; it cannot be a clone of itself.
    // Therefore, it is impossible for it to contain the '.awtsmoos-repo' marker.
    // We must abort the search immediately to prevent the system from asking a
    // meaningless question that results in a cascade of 404 errors.
    if (folderItem.type === 'github') {
        return null;
    }

    // For all other realities (local, indexeddb), the question remains valid, and the
    // original logic is allowed to proceed.
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
          //  console.warn("Found ikar.js but it was malformed.", { folderItem, content });
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
        // This is the expected and normal outcome for any non-clone folder.
        return null;
    }
}
};