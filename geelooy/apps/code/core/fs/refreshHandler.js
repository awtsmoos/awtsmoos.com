
// B"H
/**
 * @file refreshHandler.js
 * @brief THE CONSTANT RECREATION.
 * 
 * THE HYMN OF REFRESH:
 * Nothing stays static, all is reborn,
 * From the silence of delete to the data of morn.
 * We signal the Tree, we alert the whole frame,
 * That reality's map is no longer the same.
 * As He speaks the world every moment anew,
 * We refresh the Explorer for me and for you.
 */
import { State } from '../../js/state.js';

/**
 * @class RefreshHandler
 * @description Synchronizes the UI tree with the actual state of the file system.
 */
export class RefreshHandler {
    /**
     * B"H - Notifies the system that a specific directory or the whole workspace needs update.
     * @param {object} item - The directory that was modified.
     */
    static async refresh(item) {
        if (!item) return;

        console.log(`B"H - RefreshHandler: Renewing the vessel at ${item.path}...`);

        // If the item is a file, we refresh its parent.
        const target = item.kind === 'directory' ? item : this.getParent(item);

        // Emit a global event that the File Explorer listens to.
        window.dispatchEvent(new CustomEvent('awtsmoos-fs-changed', {
            detail: {
                target: target,
                workspaceId: item.workspaceId
            }
        }));
    }

    /**
     * B"H - Helper to find the parent context.
     */
    static getParent(item) {
        if (!item.path || item.path === '/') return item;
        const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
        return { ...item, path: parentPath, kind: 'directory' };
    }
}
