
// B"H
/**
 * @file viewHtml.js
 * @brief THE VISION OF THE FIRMAMENT.
 * 
 * THE PSALM OF THE BROWSER:
 * The HTML is a seed, a thought in a file,
 * But here it blossoms in digital style.
 * We take the path, we create the new tab,
 * The soul of the page, we faithfully grab.
 * No longer lost in the contextless night,
 * We manifest beauty in the user's clear sight.
 */
import { ActionContextHelper } from '../contextHelper.js';
import { Tabs } from '../../../js/tabs/index.js';

/**
 * @class ViewHtmlCommand
 * @description Manifests a new tab specifically for previewing HTML content.
 */
export class ViewHtmlCommand {
    /**
     * B"H - Executes the command to view the HTML.
     * @param {object} rawContext - The initial trigger context.
     */
    static run(rawContext) {
        const context = ActionContextHelper.enrich(rawContext);
        const item = context.physicalItem;

        if (!item) {
            console.error('B"H - ViewHtml: No physical item found to manifest.');
            return;
        }

        console.log(`B"H - ViewHtml: Previewing ${item.path}...`);

        // B"H - Create a virtual preview item that points to the physical file.
        const previewItem = {
            ...item,
            id: `preview::${item.id || item.path}`,
            name: `Preview: ${item.name}`,
            type: 'html-preview-file', // Specialized type for the renderer
            originalItem: item
        };

        Tabs.create(previewItem);
    }
}

export const run = (ctx) => ViewHtmlCommand.run(ctx);
