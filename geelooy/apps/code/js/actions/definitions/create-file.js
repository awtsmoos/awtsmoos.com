
// B"H
/**
 * @file create-file.js
 * @brief Manifests a new file from nothingness.
 */

import { FileSystemProvider } from '../../fs-provider.js';
import { ContextParser } from '../utils/context-parser.js';
import { ActionModal } from '../utils/modal.js';
import { NameValidator } from '../utils/validator.js';

export const CreateFileAction = {
    async run(context) {
        let parent = ContextParser.getItem(context);
        
        const rawName = await ActionModal.prompt("B\"H\nName the new file:");
        const cleanName = await NameValidator.purify(rawName);
        
        if (!cleanName) return;

        console.log("B\"H - Creation: Manifesting file ->", cleanName);
        return await FileSystemProvider.create(parent, cleanName, 'file');
    }
};
