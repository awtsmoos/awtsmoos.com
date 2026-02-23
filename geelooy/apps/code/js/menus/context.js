// B"H
// FILE: js/menus/context.js

import { State, DOM } from '../state.js';
import { getItemUniquePath } from '../workspaces.js';
import { MenuUI } from './ui.js';
import { Menus } from './index.js';
import { Tabs } from '../tabs.js';
import { GitMetaProvider } from '../git/meta.js';

export const ContextMenu = {
    async show(e, item) {
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
        
        const isLocal = item.type === 'local' || item.type === 'opfs';
        
        // B"H - The new, more profound way of seeking the Git Root.
        const gitInfo = await GitMetaProvider.getGitInfoForFolder(item);
        const isGitAware = !!gitInfo;
        const isCandidateForInit = isDir && !isReadOnly && !isGitAware && (item.type === 'local' || item.type === 'opfs' || item.type === 'indexeddb');

        const menuItems = [];
        
        if (isFile) {
            menuItems.push({ label: "Open in Editor", action: "open-file-tab", icon: "file" });
            menuItems.push({ isSeparator: true });
        }
        
        if (isDir) {
            menuItems.push({ label: "Refresh", action: "refresh", icon: "brain" }); 
            menuItems.push({ label: "Browse in Commander", action: "open-file-commander", icon: "folder" });
            menuItems.push({ label: "Search in this Folder...", action: "search-in-folder", icon: "search" });
            menuItems.push({ label: "✨ Vibe Code", action: "open-vibe", icon: "brain-circuit" });
            menuItems.push({ isSeparator: true });
        }
        
        const isGithubRoot = item.type === 'github' && item.path === '/';
		const hasRepoInClipboard = State.clipboardCloneSource !== null;
		
		if (isGithubRoot) {
		    menuItems.push({ label: "Copy as Clone Source", action: "copy-for-clone", icon: "git-branch" });
		}
		
		if (isDir && hasRepoInClipboard && !isReadOnly) {
		    menuItems.push({ label: `Clone "${State.clipboardCloneSource.name}" here`, action: "clone-repo-here", icon: "download" });
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
        menuItems.push({ label: "Copy All Contents (MD)", action: "copy-all-contents", icon: "clipboard" });
         menuItems.push({ label: "Download All Contents (MD)", action: "download-all-contents", icon: "clipboard" });
        
        if (isLocal && !isWorkspaceRoot && !isReadOnly) {
             menuItems.push({ isSeparator: true });
             menuItems.push({ label: "Rename...", action: "rename", icon: "file" });
        }

        menuItems.push({ isSeparator: true });

        if (!isReadOnly) {
            if (isGitAware) {
		        menuItems.push({ label: "Git Actions...", action: "git-actions", icon: "git-branch" });
		        menuItems.push({ label: "Switch Branch...", action: "switch-branch", icon: "git-branch" });
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
