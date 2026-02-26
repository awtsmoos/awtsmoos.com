
// B"H
/**
 * @file copy-markdown.js
 */

import { ContextParser } from '../utils/context-parser.js';
import { ActionModal } from '../utils/modal.js';

export const CopyMarkdownAction = {
    async run(context) {
        const item = ContextParser.getItem(context);
        if (!item) return;

        console.log("B\"H - Markdown: Generating syntax for", item.path);
        
        const mdText = `## ${item.name}\nPath: \`${item.path}\`\nKind: ${item.kind}`;
        
        try {
            await navigator.clipboard.writeText(mdText);
            ActionModal.alert("B\"H\nMarkdown context copied to clipboard.");
        } catch(e) {
            console.error("B\"H - Clipboard failed.", e);
        }
    }
};
