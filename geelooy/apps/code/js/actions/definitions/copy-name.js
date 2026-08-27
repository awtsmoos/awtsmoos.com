
// B"H
/**
 * @file copy-name.js
 */

import { ContextParser } from '../utils/context-parser.js';

export const CopyNameAction = {
    async run(context) {
        const item = ContextParser.getItem(context);
        if (!item || !item.name) return;

        try {
            await navigator.clipboard.writeText(item.name);
            console.log("B\"H - Copy Name: Secured '", item.name, "' to clipboard.");
        } catch(e) {
            console.error("B\"H - Clipboard access denied by the physical realm.", e);
        }
    }
};
