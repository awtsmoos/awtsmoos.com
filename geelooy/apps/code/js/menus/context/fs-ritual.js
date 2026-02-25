
// B"H
/**
 * @file fs-ritual.js
 * @brief Manifesting standard filesystem interactions.
 * 
 * POEM OF THE VESSEL:
 * To open, to refresh, to bring something new,
 * These are the tasks that the FS will do.
 * Every file is a word, every folder a home,
 * Within the vast garden where logic may roam.
 */

import { State } from '../../state.js';

/**
 * @class FilesystemRitual
 * @description Provides the basic building blocks for the context menu
 * based on whether the item is a file or a directory.
 */
export const FilesystemRitual = {
    /**
     * @function getItems
     * @description Returns standard FS menu items.
     */
    getItems(item) {
        const menuItems = [];
        const isFile = (item.kind === "file");
        const isRoot = (item.path === "/" || !item.path || item.isWorkspaceRoot);
        const workspace = State.workspaces.find(ws => ws.id === (item.workspaceId || item.id));
        const isReadOnly = workspace?.readOnly || false;

        if (isFile) {
            menuItems.push({ label: "Open in Editor", action: "open-file-tab", icon: "file" });
        } else {
            menuItems.push({ label: "Browse in Commander", action: "open-file-commander-tab", icon: "folder" });
            menuItems.push({ label: "Open Terminal Here", action: "open-terminal-tab", icon: "laptop" });
        }
        
        menuItems.push({ label: "Refresh", action: "refresh", icon: "refresh" });
        menuItems.push({ label: "✨ Vibe Code", action: "open-vibe", icon: "brain-circuit" });

        if (!isReadOnly) {
            menuItems.push({ isSeparator: true });
            menuItems.push({ label: "New File", action: "new-file", icon: "file" });
            menuItems.push({ label: "New Folder", action: "new-folder", icon: "folder" });
            
            if (State.fileClipboard.length > 0 || State.clipboardZip) {
                menuItems.push({ label: "Paste Into", action: "paste", icon: "clipboard" });
            }
            
            if (!isRoot) {
                menuItems.push({ label: "Rename...", action: "rename", icon: "file" });
            }
        }
        return menuItems;
    }
};
