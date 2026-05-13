
// B"H
/**
 * @file fs-ritual.js
 * @brief The manifestation of filesystem rituals.
 */

import { State } from '../../state.js';

export const FilesystemRitual = {
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
            menuItems.push({ label: "Open in Virtual OS", action: "open-virtual-os", icon: "monitor" });
        }
        
        menuItems.push({ label: "Refresh", action: "refresh", icon: "refresh" });
        menuItems.push({ label: "✨ Vibe Code", action: "open-vibe", icon: "brain-circuit" });

        if (!isReadOnly) {
            menuItems.push({ isSeparator: true });
            menuItems.push({ label: "New File", action: "new-file", icon: "file" });
            menuItems.push({ label: "New Folder", action: "new-folder", icon: "folder" });
            
            menuItems.push({ isSeparator: true });
            menuItems.push({ label: "Copy", action: "copy-item", icon: "copy" });
            
            // B"H - Register Duplicate for files
            if (isFile) {
                menuItems.push({ label: "Duplicate", action: "duplicate-item", icon: "copy" });
            }
            
            if (State.fileClipboard.length > 0 || State.clipboardZip) {
                menuItems.push({ label: "Paste Into", action: "paste", icon: "clipboard" });
            }
            
            if (!isRoot) menuItems.push({ label: "Rename...", action: "rename", icon: "file" });
        }
        return menuItems;
    }
};
