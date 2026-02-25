
// B"H
// FILE: js/menus/context.js

import { State, DOM } from '../state.js';
import { getItemUniquePath } from '../workspaces/index.js';
import { MenuUI } from './ui.js';
import { Menus } from './index.js';

/**
 * @class ContextMenu
 * @description The vessel that defines the possible actions in specific situations.
 * 
 * THE POEM OF CHOICE:
 * One light, many shadows.
 * Depending on where the soul touches the world (a file or a folder),
 * different acts of creation are available.
 * We manifest the options for copying, moving, downloading, and archival.
 * Every option is a spark of intent.
 */
export const ContextMenu = {
	/**
     * @async
     * @function show
     * @description B"H. Reveals the menu for standard filesystem items.
     */
	async show(e, item) {
	    e.preventDefault(); e.stopPropagation();
	    if (State.isSelectionModeActive) return;
	    
	    State.contextTarget = item;
	    Menus.hideAll();
	    
	    const mapKey = getItemUniquePath(item);
	    const entry = State.domItemMap.get(mapKey);
	    if (entry && entry.el) entry.el.classList.add("context-active");
	
		const isFile = (item.kind === "file");
		const isWorkspaceRoot = (item.path === "/" || !item.path || item.isWorkspaceRoot === true);
        const workspace = State.workspaces.find(ws => ws.id === (item.workspaceId || item.id));
        const isReadOnly = workspace?.readOnly || false;
	    const isDir = !isFile;
	
	    const menuItems = [];

	    // --- View Actions ---
	    if (isFile) {
	        menuItems.push({ label: "Open in Editor", action: "open-file-tab", icon: "file" });
	    } else {
	        menuItems.push({ label: "Browse in Commander", action: "open-file-commander-tab", icon: "folder" });
            menuItems.push({ label: "Open Terminal Here", action: "open-terminal-tab", icon: "laptop" });
	    }
	    
	    menuItems.push({ label: "Refresh", action: "refresh", icon: "refresh" });
	    menuItems.push({ label: "✨ Vibe Code", action: "open-vibe", icon: "brain-circuit" });

	    menuItems.push({ isSeparator: true });
	
	    // --- Creation/Destruction (if not read-only) ---
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
	
	    // --- Data Transfer Rituals ---
	    menuItems.push({ label: 'Copy Name', action: "copy-single", icon: "copy" });
	    menuItems.push({ label: "Copy Relative Path", action: "copy-relative-path", icon: "link" });
	    
        // B"H - Restored MD Context Download
	    menuItems.push({ label: "Copy All as Markdown", action: "copy-all-contents", icon: "clipboard" });
        menuItems.push({ label: "Download MD Context", action: "download-all-contents", icon: "download" });

	    if (isFile) {
	        menuItems.push({ label: "Download File", action: "download-file", icon: "download" });
	    } else {
            // B"H - Added Copy as ZIP (Lazy)
	        menuItems.push({ label: "Copy as ZIP", action: "copy-zip-single", icon: "save" });
	        menuItems.push({ label: "Download ZIP", action: "download-zip-single", icon: "download" });
	    }
	
	    menuItems.push({ isSeparator: true });
	    menuItems.push({ label: "Select Multiple", action: "start-selection", icon: "select-all" });
	    menuItems.push({ isSeparator: true });
	
	    if (!isReadOnly) {
	        if (isWorkspaceRoot) {
	            menuItems.push({ label: "Remove Workspace", action: "delete-workspace", icon: "x", danger: true });
	        } else {
	            menuItems.push({ label: "Delete", action: "delete", icon: "trash", danger: true });
	        }
	    }
	
	    MenuUI.renderMenu(DOM.contextMenu, menuItems, e);
	}
};
