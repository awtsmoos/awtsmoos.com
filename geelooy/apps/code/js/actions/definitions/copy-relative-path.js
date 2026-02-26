
// B"H
/**
 * @file copy-relative-path.js
 */

import { ContextParser } from '../utils/context-parser.js';

export const CopyRelativePathAction = {
    async run(context) {
        const item = ContextParser.getItem(context);
        if (!item || !item.path) return;

        try {
            await navigator.clipboard.writeText(item.path);
            console.log("B\"H - Copy Path: Secured '", item.path, "' to clipboard.");
        } catch(e) {
            console.error("B\"H - Clipboard access denied by the physical realm.", e);
        }
    }
};
