
// B"H
/**
 * @file create-folder.js
 * @brief Manifests a new folder.
 */

import { FileSystemProvider } from '../../fs-provider.js';
import { ContextParser } from '../utils/context-parser.js';
import { ActionModal } from '../utils/modal.js';
import { NameValidator } from '../utils/validator.js';

export const CreateFolderAction = {
    async run(context) {
        const parent = ContextParser.getItem(context);
        
        const rawName = await ActionModal.prompt("B\"H\nName the new folder:");
        const cleanName = await NameValidator.purify(rawName);
        
        if (!cleanName) return;

        console.log("B\"H - Creation: Manifesting folder ->", cleanName);
        return await FileSystemProvider.create(parent, cleanName, 'directory');
    }
};
