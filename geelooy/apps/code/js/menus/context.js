// B"H
// FILE: js/menus/context.js

import { State, DOM } from '../state.js';
import { getItemUniquePath } from '../workspaces.js';
import { MenuUI } from './ui.js';
import { Menus } from './index.js';

/**
 * --- CONTEXT MENU RITUALS ---
 * Generates and positions context menus based on the essence of the target item.
 * B"H.
 */
export const ContextMenu = {
    show(e, item) {
        e.preventDefault();
        e.stopPropagation();
        if (State.isSelectionModeActive) return;
        
        State.contextTarget = item;
        Menus.hideAll();
        
        setTimeout(() => document.addEventListener("click", MenuUI.handleDocumentClick), 0);
        
        if (item.type === 'zip-entry') {
            this.showZipMenu(e, item);
            return;
        }
        
        const mapKey = getItemUniquePath(item);
        const targetEl = (State.domItemMap.get(mapKey))?.el;
        if (targetEl) targetEl.classList.add("context-active");
        
        const isDir = item.kind === "directory";
        const isFile = item.kind === "file";
        const isWorkspaceRoot = item.path === "/";
        const workspace = State.workspaces.find((ws) => ws.id === (item.workspaceId || item.id));
        const isReadOnly = workspace?.readOnly || false;
        const isGitClone = item.isGitClone;
        const isCandidateForInit = isDir && !isReadOnly && item.type !== "github";
        const isLocal = item.type === 'local' || item.type === 'opfs';
        const isGithubWS = item.type === 'github';
        
        const menuItems = [];
        
        if (isDir) {
            menuItems.push({ label: "Refresh", action: "refresh", icon: "brain" }); 
            menuItems.push({ label: "Browse in Commander", action: "open-file-commander", icon: "folder" });
            menuItems.push({ label: "Search in this Folder...", action: "search-in-folder", icon: "search" }); // B"H
            menuItems.push({ label: "✨ Vibe Code", action: "open-vibe", icon: "brain-circuit" });
            menuItems.push({ isSeparator: true });
        }

        menuItems.push({ label: `Copy "${item.name}"`, action: "copy-single", icon: "copy" });
        menuItems.push({ label: "Copy Relative Path", action: "copy-relative-path", icon: "link" }); 
        
        if (isDir) {
            menuItems.push({ label: "Copy as ZIP", action: "copy-zip-single", icon: "save" });
            menuItems.push({ label: "Download ZIP", action: "download-zip-single", icon: "download" });
        } else if (isFile) {
            menuItems.push({ label: "Calculate Hash", action: "calculate-hash", icon: "brain" }); 
            menuItems.push({ label: "Download File", action: "download-file", icon: "download" });
        }

        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Select", action: "start-selection", icon: "select-all" });
        menuItems.push({ label: "Copy All Contents", action: "copy-all-contents", icon: "clipboard" });
        
        if (isLocal && !isWorkspaceRoot && !isReadOnly) {
             menuItems.push({ isSeparator: true });
             menuItems.push({ label: "Rename...", action: "rename", icon: "file" });
        }

        menuItems.push({ isSeparator: true });

        if (isDir && !isReadOnly) {
            if (isGitClone) {
                menuItems.push({ label: "Git Actions...", action: "git-actions", icon: "git-branch" });
                menuItems.push({ label: "Switch Branch...", action: "switch-branch", icon: "git-branch" });
            } else if (isGithubWS) {
                if (isWorkspaceRoot) {
                    menuItems.push({ label: "Switch Branch...", action: "switch-branch", icon: "git-branch" });
                }
            } else if (isCandidateForInit) {
                menuItems.push({ label: "Initialize as GitHub Repo...", action: "git-init", icon: "github" });
            }
        }

        if (!isReadOnly) {
            const clipboardItemUniquePath = State.fileClipboard?.[0];
            const clipboardItem = clipboardItemUniquePath ? (State.domItemMap.get(clipboardItemUniquePath))?.item : null;
            const hasZipClipboard = !!State.clipboardZip;

            if ((isDir || isFile) && (clipboardItem || hasZipClipboard)) {
                menuItems.push({ isSeparator: true });
                const pasteLabel = hasZipClipboard ? "Paste ZIP" : "Paste item(s) here";
                menuItems.push({ label: pasteLabel, action: "paste", icon: "clipboard" });
            }
            if (isDir) {
                menuItems.push({ isSeparator: true });
                menuItems.push({ label: "New File", action: "new-file", icon: "file" });
                menuItems.push({ label: "New Folder", action: "new-folder", icon: "folder" });
            }
        }
        
        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Properties", action: "file-properties", icon: "list" }); 

        if (!isReadOnly && !isWorkspaceRoot) {
            menuItems.push({ label: "Delete", action: "delete", icon: "trash", danger: true });
        }
        if (isWorkspaceRoot) {
            menuItems.push({ label: "Remove Workspace", action: "delete-workspace", icon: "x", danger: true });
        }
        
        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Cancel", action: "cancel-menu", icon: "x" });

        MenuUI.renderMenu(DOM.contextMenu, menuItems, e);
    },

    showZipMenu(e, item) {
        const menuItems = [];
        
        if (item.kind === 'file') {
            menuItems.push({ label: "Open", action: "open-zip-entry", icon: "file" });
        }
        
        menuItems.push({ label: `Copy "${item.name}"`, action: "copy-single", icon: "copy" });
        
        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Select", action: "start-selection", icon: "select-all" });
        menuItems.push({ label: "Copy All Contents", action: "copy-all-contents", icon: "clipboard" });

        if (item.kind === 'directory') {
             const clipboardItemUniquePath = State.fileClipboard?.[0];
             const clipboardItem = clipboardItemUniquePath ? (State.domItemMap.get(clipboardItemUniquePath))?.item : null;
             const hasZipClipboard = !!State.clipboardZip;

             if (clipboardItem || hasZipClipboard) {
                menuItems.push({ isSeparator: true });
                const pasteLabel = hasZipClipboard ? "Paste ZIP" : "Paste item(s) here";
                menuItems.push({ label: pasteLabel, action: "paste", icon: "clipboard" });
            }
            
            menuItems.push({ isSeparator: true });
            menuItems.push({ label: "New File", action: "new-file", icon: "file" });
            menuItems.push({ label: "New Folder", action: "new-folder", icon: "folder" });
        }

        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Delete from Zip", action: "delete", icon: "trash", danger: true });

        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Cancel", action: "cancel-menu", icon: "x" });

        MenuUI.renderMenu(DOM.contextMenu, menuItems, e);
    }
};