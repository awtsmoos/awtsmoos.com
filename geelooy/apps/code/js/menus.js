// B"H
// FILE: code/js/menus.js
import { State, DOM } from "./state.js";
import { getItemUniquePath, Workspaces } from "./workspaces.js";
import { Actions } from "./actions.js";
import { Editor } from "./editor.js";
import { Tabs } from "./tabs/index.js";
import { beautify } from "/scripts/awtsmoos/MerkavaBeautifier/beautifier.js";
import { VibeController } from "./vibe/vibe-controller.js";

export const Menus = {
    registerCustomMenus(menuConfigs) {
        if (!Array.isArray(menuConfigs)) return;
        State.customMenus = menuConfigs;
    },

    handleDocumentClick: (e) => {
        if (!DOM.contextMenu.contains(e.target) && !DOM.mainMenu.contains(e.target)) {
            Menus.hideAll();
        }
    },

    /**
     * B"H - Show specialized menu for Tab Bar tabs.
     */
    showTabMenu(e, tab) {
        e.preventDefault();
        e.stopPropagation();
        this.hideAll();

        const menuItems = [
            { label: "Show in Workspace", action: "reveal-in-workspace", icon: "search" },
            { isSeparator: true },
            { label: "Close", action: "close-tab-direct", icon: "x", danger: true }
        ];

        // Store the target tab for the action handler
        State.contextTabTarget = tab;

        this.renderMenu(DOM.contextMenu, menuItems, { clientX: e.clientX, clientY: e.clientY });
    },

    /**
     * B"H - Reveal ritual. Recursively opens folders to find a file.
     * Rewritten to be absolute: It forces refreshes down the chain to guarantee visibility.
     */
    async revealInWorkspace(tab) {
        if (!tab || !tab.item || tab.item.path === '/') return;

        const { workspaceId, path } = tab.item;
        const workspace = State.workspaces.find(ws => ws.id === workspaceId);
        if (!workspace) return;

        // Ensure sidebar is open
        const appContainer = document.querySelector('.app-container');
        if (appContainer.classList.contains('sidebar-collapsed')) {
             document.getElementById('sidebar-toggle-btn')?.click();
        }

        // 1. Ensure Workspace Root is Expanded and Refreshed
        const rootItem = { ...workspace, path: '/', kind: 'directory' };
        const rootUniquePath = getItemUniquePath(rootItem);
        
        if (!State.expandedFolders.has(rootUniquePath)) {
            State.expandedFolders.add(rootUniquePath);
        }
        // Force refresh the root to ensure top-level children are in the DOM map
        await Workspaces.refreshNode(rootItem);

        // 2. Recursively Expand and Refresh Path Segments
        const pathSegments = path.split('/').filter(Boolean);
        let currentAccum = '';
        
        // Iterate up to the parent folder of the item
        for (let i = 0; i < pathSegments.length - 1; i++) {
            currentAccum += '/' + pathSegments[i];
            const segmentItem = { ...tab.item, path: currentAccum, kind: 'directory' };
            const uniquePath = getItemUniquePath(segmentItem);
            
            // Mark as expanded in state
            if (!State.expandedFolders.has(uniquePath)) {
                State.expandedFolders.add(uniquePath);
            }
            
            // Critical: Await the refresh. This ensures the children (including the next segment)
            // are rendered and registered in State.domItemMap before we proceed.
            await Workspaces.refreshNode(segmentItem);
        }

        // 3. Locate and Flash the Element
        const finalUniquePath = getItemUniquePath(tab.item);
        
        const flashElement = () => {
            const entry = State.domItemMap.get(finalUniquePath);
            if (entry && entry.el && document.body.contains(entry.el)) {
                entry.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                entry.el.classList.remove('reveal-flash');
                void entry.el.offsetWidth; // Trigger reflow
                entry.el.classList.add('reveal-flash');
                setTimeout(() => entry.el.classList.remove('reveal-flash'), 2500);
                return true;
            }
            return false;
        };

        if (!flashElement()) {
            // Polling fallback for stubborn rendering cycles
            let attempts = 0;
            const poller = setInterval(() => {
                attempts++;
                if (flashElement() || attempts > 15) clearInterval(poller);
            }, 100);
        }
    },

    show(e, item) {
        e.preventDefault();
        e.stopPropagation();
        if (State.isSelectionModeActive) return;
        
        State.contextTarget = item;
        this.hideAll();
        
        setTimeout(() => document.addEventListener("click", this.handleDocumentClick), 0);
        
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
        const isLocal = item.type === 'local';
        const isGithubWS = item.type === 'github';
        
        const menuItems = [];
        
        if (isDir) {
            menuItems.push({ label: "Refresh", action: "refresh", icon: "brain" }); 
            menuItems.push({ label: "Browse in Commander", action: "open-file-commander", icon: "folder" });
            menuItems.push({ label: "✨ Vibe Code", action: "open-vibe", icon: "brain-circuit" });
            menuItems.push({ isSeparator: true });
        }

        menuItems.push({ label: `Copy "${item.name}"`, action: "copy-single", icon: "copy" });
        
        if (isDir) {
            menuItems.push({ label: "Copy as ZIP", action: "copy-zip-single", icon: "save" });
            menuItems.push({ label: "Download ZIP", action: "download-zip-single", icon: "download" });
        } else if (isFile) {
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

        if (!isReadOnly && !isWorkspaceRoot) {
            menuItems.push({ label: "Delete", action: "delete", icon: "trash", danger: true });
        }
        if (isWorkspaceRoot) {
            menuItems.push({ label: "Remove Workspace", action: "delete-workspace", icon: "x", danger: true });
        }
        
        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Cancel", action: "cancel-menu", icon: "x" });

        this.renderMenu(DOM.contextMenu, menuItems, e);
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

        this.renderMenu(DOM.contextMenu, menuItems, e);
    },

    showMainMenu(e) {
        e.stopPropagation();
        if (DOM.mainMenu.style.display === "block") {
            this.hideAll();
            return;
        }
        this.hideAll();
        document.addEventListener("click", this.handleDocumentClick, { once: true, capture: true });
        
        const activeTab = State.tabs.find((t) => t.id === State.activeTabId);
        let isGitAware = false;
        let isReadOnly = true;
        
        if (activeTab) {
            const workspace = State.workspaces.find((ws) => ws.id === activeTab.item.workspaceId);
            isReadOnly = workspace?.readOnly || false;
            
            if (activeTab.item.type === "github") {
                isGitAware = true;
            } else if (activeTab.item.type === "local" || activeTab.item.type === "indexeddb") {
                const findGitRoot = (item) => {
                    if (!item || !item.path) return null;
                    const uniquePath = getItemUniquePath(item);
                    const entry = State.domItemMap.get(uniquePath);
                    if (entry?.item?.isGitClone) return entry.item;
                    const parentPath = item.path.substring(0, item.path.lastIndexOf("/")) || "/";
                    if (item.path === parentPath) return null;
                    return findGitRoot({ ...item, path: parentPath, kind: "directory" });
                };
                if (findGitRoot(activeTab.item)) isGitAware = true;
            }
        }

        const menuItems = [
            { label: "New File", action: "new-temp-file", icon: "file" },
            { label: "Open File...", action: "open-file", icon: "folder" }
        ];

        if (!isReadOnly) {
            menuItems.push({ isSeparator: true });
            menuItems.push({ label: "Beautify", action: "beautify", icon: "brain" });
            menuItems.push({ label: "Save", action: "save", icon: "save", disabled: !activeTab || !activeTab.isDirty });
            if (isGitAware) {
                menuItems.push({ label: "Commit All Changes", action: "commit-changes", icon: "git-branch" });
            }
        }

        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Download", action: "download", icon: "download", disabled: !activeTab });

        if (activeTab) {
            const name = activeTab.item.name.toLowerCase();
            if (name.endsWith(".html") || name.endsWith(".htm")) {
                menuItems.push({ label: "Preview HTML", action: "view-html", icon: "eye" });
            }
            if ((name.endsWith(".json") || name.endsWith(".awtsmoosjson")) && !activeTab.isHexView) {
                menuItems.push({ 
                    label: activeTab.isAltarView ? "Reconstitute to Text" : "Transmute to Altar", 
                    action: "toggle-altar-view", icon: "brain-circuit" 
                });
            }
            if (name.endsWith(".awtsmoosjson")) {
                menuItems.push({ 
                    label: activeTab.isHexView ? "View as JSON" : "View as Hex", 
                    action: "toggle-awtsmoos-view", icon: activeTab.isHexView ? "eye" : "brain-circuit" 
                });
            }
        }

        const hasSelection = activeTab && DOM.editor.selectionStart !== DOM.editor.selectionEnd;
        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Find / Replace", action: "find-replace", icon: "search", disabled: !activeTab });
        menuItems.push({ label: "Select All", action: "select-all", icon: "select-all", disabled: !activeTab });
        menuItems.push({ label: "Copy", action: "copy", icon: "copy", disabled: !hasSelection });
        menuItems.push({ label: "Copy All", action: "copy-all", icon: "copy", disabled: !activeTab });
        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Toggle Keyboard Helper", action: "toggle-keyboard-helper", icon: "laptop" });
        menuItems.push({ label: "Toggle Fullscreen", action: "toggle-fullscreen", icon: "fullscreen" });
        menuItems.push({ label: "Settings", action: "settings", icon: "settings" });

        const btnRect = DOM.hamburgerMenuBtn.getBoundingClientRect();
        this.renderMenu(DOM.mainMenu, menuItems, { clientX: btnRect.left, clientY: btnRect.bottom + 5 });
    },

    renderMenu(container, items, coords) {
        container.innerHTML = items.map(i => {
            if (i.isSeparator) return `<hr class="menu-separator">`;
            const dangerStyle = i.danger ? 'style="color: var(--color-accent-danger);"' : "";
            return `
                <button class="menu-button" data-action="${i.action}" ${i.disabled ? "disabled" : ""} ${dangerStyle}>
                    <svg class="svg-icon"><use href="#icon-${i.icon || 'play'}"/></svg> 
                    ${i.label}
                </button>`;
        }).join("");
        
        this.positionAndDisplay(container, coords);
    },

    hideAll() {
        DOM.contextMenu.style.display = "none";
        DOM.mainMenu.style.display = "none";
        document.querySelectorAll(".context-active").forEach(el => el.classList.remove("context-active"));
        document.removeEventListener("click", this.handleDocumentClick);
    },

    positionAndDisplay(menu, coords) {
        setTimeout(() => {
            const { clientX: x, clientY: y } = coords;
            menu.style.display = "block";
            const menuRect = menu.getBoundingClientRect();
            
            const adjustedX = x + menuRect.width > window.innerWidth 
                ? window.innerWidth - menuRect.width - 5 
                : x;
            
            let adjustedY = y;
            if (y + menuRect.height > window.innerHeight) {
                if (y > window.innerHeight / 2) {
                    adjustedY = y - menuRect.height;
                    if (adjustedY < 0) adjustedY = 5; 
                } else {
                    adjustedY = window.innerHeight - menuRect.height - 5;
                }
            }
            
            menu.style.left = `${adjustedX}px`;
            menu.style.top = `${adjustedY}px`;
        }, 10);
    },

    handleAction(action) {
        this.hideAll();
        if (action === 'open-vibe') {
            VibeController.init();
            VibeController.open(State.contextTarget);
        } else if (action === 'reveal-in-workspace') {
            this.revealInWorkspace(State.contextTabTarget);
        } else if (action === 'close-tab-direct') {
            if (State.contextTabTarget) Tabs.close(State.contextTabTarget.id);
        } else {
            Actions.handle(action);
        }
    }
};