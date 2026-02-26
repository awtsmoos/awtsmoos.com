
// B"H
/**
 * @file revealInExplorer.js
 * @brief THE DISCOVERY OF THE HIDDEN.
 * 
 * THE HYMN OF THE MAP:
 * Where is the spark? In which folder does it hide?
 * We reveal the path where the secrets reside.
 * The tree shall unfold, the branches shall part,
 * Showing the observer the file's very heart.
 * From the root to the leaf, the connection is clear,
 * Bringing the distant item suddenly near.
 */
import { ActionContextHelper } from '../contextHelper.js';

/**
 * @class RevealInExplorerCommand
 * @description Synchronizes the file tree view to focus and expand the path to the specified item.
 */
export class RevealInExplorerCommand {
    /**
     * B"H - Runs the revelation.
     */
    static run(rawContext) {
        const context = ActionContextHelper.enrich(rawContext);
        const item = context.physicalItem;

        if (!item) return;

        console.log(`B"H - RevealInExplorer: Pointing the way to ${item.path}...`);

        // Emit event for the Explorer UI
        window.dispatchEvent(new CustomEvent('awtsmoos-reveal-item', {
            detail: { item }
        }));
    }
}

export const run = (ctx) => RevealInExplorerCommand.run(ctx);
