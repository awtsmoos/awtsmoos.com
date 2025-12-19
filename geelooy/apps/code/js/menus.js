
// B"H
// FILE: js/menus.js
import { State, DOM } from "./state.js";
import { getItemUniquePath } from "./workspaces.js";
import { Actions } from "./actions.js";
import { Editor } from "./editor.js";
import { beautify } from "/scripts/awtsmoos/MerkavaBeautifier/beautifier.js";

// Global exposure for debugging or legacy access
window.beautify = beautify;
window.editor = Editor;

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

    show(e, item) {
        e.preventDefault();
        e.stopPropagation();
        if (State.isSelectionModeActive) return;
        
        State.contextTarget = item;
        this.hideAll();
        
        setTimeout(() => document.addEventListener("click", this.handleDocumentClick), 0);
        
        // B"H - Zip Entry Handling
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
        
        // B"H - Directory Options
        if (isDir) {
            menuItems.push({ label: "Refresh", action: "refresh", icon: "brain" }); 
            menuItems.push({ label: "Browse in Commander", action: "open-file-commander", icon: "folder" });
            menuItems.push({ isSeparator: true });
        }

        menuItems.push({ label: `Copy "${item.name}"`, action: "copy-single", icon: "copy" });
        
        // B"H - New Download/Zip Options
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
                menuItems.push({ label: "Switch Branch...", action: "switch-branch", icon: "git-branch" }); // B"H
            } else if (isGithubWS) {
                // Git actions for direct workspace root or subfolders?
                // Usually root.
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

    // B"H - Specialized Menu for Zip Entries
    showZipMenu(e, item) {
        const menuItems = [];
        
        if (item.kind === 'file') {
            menuItems.push({ label: "Open", action: "open-zip-entry", icon: "file" });
        }
        
        menuItems.push({ label: `Copy "${item.name}"`, action: "copy-single", icon: "copy" });
        
        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Select", action: "start-selection", icon: "select-all" });
        menuItems.push({ label: "Copy All Contents", action: "copy-all-contents", icon: "clipboard" });

        // Directory Actions (Paste)
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
        // Zip specific actions
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
        // Delay to ensure rendering has occurred for dimension calculation
        setTimeout(() => {
            const { clientX: x, clientY: y } = coords;
            menu.style.display = "block";
            const menuRect = menu.getBoundingClientRect();
            
            // Prevent Horizontal Overflow
            const adjustedX = x + menuRect.width > window.innerWidth 
                ? window.innerWidth - menuRect.width - 5 
                : x;
            
            // Prevent Vertical Overflow (Smart positioning: Flip up if needed)
            let adjustedY = y;
            if (y + menuRect.height > window.innerHeight) {
                // If there's more space above than below, go up
                if (y > window.innerHeight / 2) {
                    adjustedY = y - menuRect.height;
                    // Additional safety if element is taller than y position
                    if (adjustedY < 0) adjustedY = 5; 
                } else {
                    // Stick to bottom edge
                    adjustedY = window.innerHeight - menuRect.height - 5;
                }
            }
            
            menu.style.left = `${adjustedX}px`;
            menu.style.top = `${adjustedY}px`;
        }, 10);
    },

    handleAction(action) {
        this.hideAll();
        Actions.handle(action);
    }
};
