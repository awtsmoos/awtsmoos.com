// B"H
// FILE: js/menus/context.js

import { State, DOM } from '../state.js';
import { getItemUniquePath } from '../workspaces.js';
import { MenuUI } from './ui.js';
import { Menus } from './index.js';
import { Tabs } from '../tabs.js';
import { GitMetaProvider } from '../git/meta.js';

export const ContextMenu = {
    // B"H
	// FILE: js/menus/context.js
	
	async show(e, item) {
	    e.preventDefault();
	    e.stopPropagation();
	    if (State.isSelectionModeActive) return;
	    
	    // 1. SET CONTEXT
	    State.contextTarget = item;
	    Menus.hideAll();
	    
	    // Outside click closer
	    setTimeout(function() { 
	        document.addEventListener("click", MenuUI.handleDocumentClick); 
	    }, 0);
	    
	    // Sidebar visual highlight
	    var mapKey = getItemUniquePath(item);
	    var entry = State.domItemMap.get(mapKey);
	    if (entry && entry.el) entry.el.classList.add("context-active");
	
	    // 2. DETECTION
	    var isFile = (item.kind === "file");
	    var isWorkspaceRoot = (item.path === "/" || !item.path || item.isWorkspaceRoot);
	    var isDir = !isFile || isWorkspaceRoot;
	    
	    var workspaceId = item.workspaceId || item.id;
	    var workspace = State.workspaces.find(function(ws) { return ws.id === workspaceId; });
	    var isReadOnly = (workspace && workspace.readOnly) ? true : false;
	
	    // 3. GIT DETECTION (The Anchor)
	    // We check the item itself first. If it's a file, the provider handles looking up.
	    var gitInfo = await GitMetaProvider.getGitInfoForFolder(item);
	
	    var menuItems = [];
	
	    // --- SECTION 1: VIEW/OPEN ---
	    if (isFile) {
	        menuItems.push({ label: "Open in Editor", action: "open-file-tab", icon: "file" });
	    } else {
	        menuItems.push({ label: "Browse in Commander", action: "open-file-commander", icon: "folder" });
	    }
	    
	    menuItems.push({ label: "Refresh", action: "refresh", icon: "refresh" });
	    menuItems.push({ label: "✨ Vibe Code", action: "open-vibe", icon: "brain-circuit" });
	    menuItems.push({ label: "Search Here...", action: "search-in-folder", icon: "search" });
	
	    // --- SECTION 2: GIT ACTIONS (CRITICAL) ---
	    if (gitInfo && !isReadOnly) {
	        menuItems.push({ isSeparator: true });
	        menuItems.push({ label: "Git Actions...", action: "git-actions", icon: "git-branch" });
	        menuItems.push({ label: "Switch Branch...", action: "switch-branch", icon: "git-branch" });
	    } else if (isDir && !isReadOnly && (item.type === 'local' || item.type === 'opfs' || item.type === 'indexeddb')) {
	        // Option to initialize if not already a repo
	        menuItems.push({ isSeparator: true });
	        menuItems.push({ label: "Initialize Git Repo...", action: "git-init", icon: "github" });
	    }
	
	    menuItems.push({ isSeparator: true });
	
	    // --- SECTION 3: CREATION & EDITING ---
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
	
	    // --- SECTION 4: TRANSFER & DOWNLOADS ---
	    menuItems.push({ label: 'Copy "' + item.name + '"', action: "copy-single", icon: "copy" });
	    menuItems.push({ label: "Copy Relative Path", action: "copy-relative-path", icon: "link" });
	    
	    // Markdown Content Options
	    menuItems.push({ label: "Copy All Contents (MD)", action: "copy-all-contents", icon: "clipboard" });
	    menuItems.push({ label: "Download All Contents (MD)", action: "download-all-contents", icon: "download" });
	
	    if (isFile) {
	        menuItems.push({ label: "Download File", action: "download-file", icon: "download" });
	        menuItems.push({ label: "Calculate Hash", action: "calculate-hash", icon: "brain" });
	    } else {
	        menuItems.push({ label: "Copy as ZIP", action: "copy-zip-single", icon: "save" });
	        menuItems.push({ label: "Download ZIP", action: "download-zip-single", icon: "download" });
	    }
	
	    menuItems.push({ isSeparator: true });
	    menuItems.push({ label: "Select", action: "start-selection", icon: "select-all" });
	
	    // --- SECTION 5: SYSTEM ---
	    menuItems.push({ isSeparator: true });
	    menuItems.push({ label: "Properties", action: "file-properties", icon: "list" });
	
	    if (!isReadOnly) {
	        if (isWorkspaceRoot) {
	            menuItems.push({ label: "Remove Workspace", action: "delete-workspace", icon: "x", danger: true });
	        } else {
	            menuItems.push({ label: "Delete", action: "delete", icon: "trash", danger: true });
	        }
	    }
	
	    menuItems.push({ isSeparator: true });
	    menuItems.push({ label: "Cancel", action: "cancel-menu", icon: "x" });
	
	    // --- B"H - THE CONTEXT LOGIC ---
	    // If it's a file, we automatically target the parent directory for
	    // directory-based actions like Vibe, Refresh, and New File.
	    if (isFile && item.path) {
	        var parts = item.path.split("/");
	        parts.pop();
	        var parentPath = parts.join("/") || "/";
	        
	        State.contextTarget = { 
	            ...item, 
	            path: parentPath, 
	            kind: 'directory', 
	            workspaceId: workspaceId 
	        };
	        State.contextFileTarget = item; // Store actual file for Hash/Download
	    } else {
	        State.contextTarget = item;
	    }
	
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
