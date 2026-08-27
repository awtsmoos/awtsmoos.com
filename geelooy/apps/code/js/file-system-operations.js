
// B"H
/**
 * @file file-system-operations.js
 * @brief THE DEEDS OF THE DIGITAL HAND.
 */
import { FileSystemProvider } from './fs-provider.js';
import { RefreshHandler } from '../core/fs/refreshHandler.js';

export const FileSystemOperations = {
    /**
     * B"H - Creates a new vessel of existence.
     */
    async create(parentItem, name, kind) {
        try {
            console.log(`B"H - FS Ops: Creating ${kind} '${name}' in ${parentItem.path}`);
            await FileSystemProvider.create(parentItem, name, kind);
            
            // B"H - Tikkun: Immediately refresh the UI
            await RefreshHandler.refresh(parentItem);
            return true;
        } catch (e) {
            console.error(`B"H - FS Ops Error: Creation failed.`, e);
            return false;
        }
    },

    /**
     * B"H - Dissolves a vessel back into the void.
     */
    async delete(item) {
        try {
            console.log(`B"H - FS Ops: Deleting ${item.path}`);
            await FileSystemProvider.delete(item);
            
            // B"H - Tikkun: Refresh the parent directory
            await RefreshHandler.refresh(item);
            return true;
        } catch (e) {
            console.error(`B"H - FS Ops Error: Deletion failed.`, e);
            return false;
        }
    },

    /**
     * B"H - Renames the spark.
     */
    async rename(item, newName) {
        try {
            await FileSystemProvider.rename(item, newName);
            await RefreshHandler.refresh(item);
            return true;
        } catch (e) {
            console.error(`B"H - FS Ops Error: Rename failed.`, e);
            return false;
        }
    }
};
