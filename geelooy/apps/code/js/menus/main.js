// B"H
// FILE: js/menus/main.js

import { State, DOM } from '../state.js';
import { getItemUniquePath } from '../workspaces.js';
import { MenuUI } from './ui.js';
import { Menus } from './index.js';

export const MainMenu = {
    show(e) {
        e.stopPropagation();
        if (DOM.mainMenu.style.display === "block") {
            Menus.hideAll();
            return;
        }
        Menus.hideAll();
        document.addEventListener("click", MenuUI.handleDocumentClick, { once: true, capture: true });
        
        const activeTab = State.tabs.find((t) => t.id === State.activeTabId);
        let isGitAware = false;
        let isReadOnly = true;
        
        if (activeTab) {
            const workspace = State.workspaces.find((ws) => ws.id === activeTab.item.workspaceId);
            isReadOnly = workspace?.readOnly || false;
            
            if (activeTab.item.type === "github") {
                isGitAware = true;
            } else if (['local', 'indexeddb', 'opfs'].includes(activeTab.item.type)) {
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
        menuItems.push({ label: "Visual Settings", action: "visual-settings", icon: "eye" }); // B"H - NEW
        menuItems.push({ label: "Toggle Keyboard Helper", action: "toggle-keyboard-helper", icon: "laptop" });
        menuItems.push({ label: "Toggle Fullscreen", action: "toggle-fullscreen", icon: "fullscreen" });
        menuItems.push({ label: "Settings", action: "settings", icon: "settings" });
        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Help & Docs", action: "show-docs", icon: "brain" }); // B"H - NEW

        const btnRect = DOM.hamburgerMenuBtn.getBoundingClientRect();
        MenuUI.renderMenu(DOM.mainMenu, menuItems, { clientX: btnRect.left, clientY: btnRect.bottom + 5 });
    }
};