
// B"H
/**
 * @file view-html.js
 * @brief The Mirror of Perception.
 */

import { Tabs } from '../../tabs/index.js';
import { ContextParser } from '../utils/context-parser.js';
import { ActionModal } from '../utils/modal.js';

export const ViewHtmlAction = {
    async run(context) {
        const item = ContextParser.getItem(context);
        
        if (!item) {
            console.warn("B\"H - ViewHtml: No physical item found in context.");
            return;
        }

        if (item.kind === 'directory' || item.kind === 'root' || item.path.endsWith('/')) {
            await ActionModal.alert("B\"H\nA domain (directory) cannot be previewed. Select a physical file.");
            return;
        }

        console.log("B\"H - ViewHtml: Projecting light from " + item.path);

        const physicalType = item.originalType || item.type;

        const previewItem = {
            ...item,
            id: item.id ? item.id + "-preview" : item.path + "-preview",
            type: 'html-preview-file',
            originalType: physicalType, // B"H - PRESERVE THE IDENTITY
            name: "Preview: " + item.name
        };

        return Tabs.create(previewItem);
    }
};
