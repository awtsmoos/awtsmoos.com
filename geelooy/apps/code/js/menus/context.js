
// B"H
// FILE: js/menus/context.js

import { State, DOM } from '../state.js';
import { getItemUniquePath } from '../workspaces.js';
import { MenuUI } from './ui.js';
import { Menus } from './index.js';
import { GitMetaProvider } from '../git/meta.js';

/**
 * --- CONTEXT MENU PROVIDER ---
 * Decoupled from execution logic. This module's holy task is to perceive
 * the context and declare the appropriate actions, which are then handled by the dispatcher.
 */
export const ContextMenu = {
	
	async show(e, item) {
	    e.preventDefault();
	    e.stopPropagation();
	    if (State.isSelectionModeActive) return;
	    
	    State.contextTarget = item;
	    Menus.hideAll();
	    
	    const mapKey = getItemUniquePath(item);
	    const entry = State.domItemMap.get(mapKey);
	    if (entry && entry.el) entry.el.classList.add("context-active");
	
		const isFile = (item.kind === "file");
		const isWorkspaceRoot = (item.path === "/" || !item.path || item.isWorkspaceRoot === true);
		
		const workspaceId = item.workspaceId || item.id;
	    const workspace = State.workspaces.find(ws => ws.id === workspaceId);
	    const isReadOnly = workspace?.readOnly || false;
	
		const gitSearchItem = isWorkspaceRoot ? { ...item, path: "/", workspaceId: workspaceId } : item;
		const gitInfo = await GitMetaProvider.getGitInfoForFolder(gitSearchItem);
		
	    const menuItems = [];

	    if (isFile) {
	        menuItems.push({ label: "Open in Editor", action: "open-file-tab", icon: "file" });
	    } else {
	        menuItems.push({ label: "Browse in Commander", action: "open-file-commander-tab", icon: "folder" });
            menuItems.push({ label: "Open Terminal Here", action: "open-terminal-tab", icon: "laptop" });
	    }
	    
	    menuItems.push({ label: "Refresh", action: "refresh", icon: "refresh" });
	    menuItems.push({ label: "✨ Vibe Code", action: "open-vibe", icon: "brain-circuit" });
	    menuItems.push({ label: "Search Here...", action: "search-in-folder", icon: "search" });
	
	    if (gitInfo && !isReadOnly) {
	        menuItems.push({ isSeparator: true });
	        menuItems.push({ label: "Git Actions...", action: "git-actions", icon: "git-branch" });
	        menuItems.push({ label: "Switch Branch...", action: "switch-branch", icon: "git-branch" });
	    }
	
	    menuItems.push({ isSeparator: true });
	
	    if (!isReadOnly) {
	        menuItems.push({ label: "New File", action: "new-file", icon: "file" });
	        menuItems.push({ label: "New Folder", action: "new-folder", icon: "folder" });
	        
	        if (State.fileClipboard.length > 0 || State.clipboardZip) {
	            menuItems.push({ label: "Paste Into", action: "paste", icon: "clipboard" });
	        }
	        
	        if (!isWorkspaceRoot) {
	            menuItems.push({ label: "Rename...", action: "rename", icon: "file" });
	        }
	        menuItems.push({ isSeparator: true });
	    }
	
	    menuItems.push({ label: 'Copy "' + item.name + '"', action: "copy-single", icon: "copy" });
	    menuItems.push({ label: "Copy Relative Path", action: "copy-relative-path", icon: "link" });
	    menuItems.push({ label: "Copy All Contents (MD)", action: "copy-all-contents", icon: "clipboard" });
	
	    if (isFile) {
	        menuItems.push({ label: "Download File", action: "download-file", icon: "download" });
	    } else {
	        menuItems.push({ label: "Download ZIP", action: "download-zip-single", icon: "download" });
	    }
	
	    menuItems.push({ isSeparator: true });
	    menuItems.push({ label: "Select", action: "start-selection", icon: "select-all" });
	    menuItems.push({ isSeparator: true });
	
	    if (!isReadOnly) {
	        if (isWorkspaceRoot) {
	            menuItems.push({ label: "Remove Workspace", action: "delete-workspace", icon: "x", danger: true });
	        } else {
	            menuItems.push({ label: "Delete", action: "delete", icon: "trash", danger: true });
	        }
	    }
	
	    MenuUI.renderMenu(DOM.contextMenu, menuItems, e);
	},
    showZipMenu: (e, item) => { /* ... placeholder ... */ }
};
