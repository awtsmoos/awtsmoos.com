
// B"H
// FILE: js/menus/main.js

import { State, DOM } from '../state.js';
import { MenuUI } from './ui.js';
import { Menus } from './index.js';
import { GitMetaProvider } from '../git/meta.js';

/**
 * @class MainMenu
 * @description The Keter (Crown) of the application's global actions.
 * 
 * THE POEM OF THE MENU:
 * A single click reveals the gate,
 * A second click shall seal the fate.
 * It peers through folders, deep and vast,
 * To find the repo's anchor cast.
 * If Git is found in branch or root,
 * The Manifest shall bear its fruit.
 */
export const MainMenu = {
    /**
     * @async
     * @function show
     * @description B"H. The ritual of toggling the global menu. 
     * It checks ancestry to reveal the Git Commit option for any nested file.
     */
    async show(e) {
        e.stopPropagation();

        // 1. TOGGLE LOGIC: If already visible, dissolve it.
        if (DOM.mainMenu.style.display === "block") {
            Menus.hideAll();
            return;
        }

        Menus.hideAll();
        
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        let gitInfo = null;

        // 2. DEEP GIT VISION: Find if the current file has a Git ancestor.
        if (activeTab && activeTab.item) {
            gitInfo = await GitMetaProvider.getGitInfoForFolder(activeTab.item);
        }

        const menuItems = [
            { label: "New File", action: "new-temp-file", icon: "file" },
            { label: "Open File...", action: "open-file", icon: "folder" },
            { isSeparator: true },
            { label: "Beautify Code", action: "beautify", icon: "brain" },
            { label: "Save File", action: "save", icon: "save", disabled: !activeTab || !activeTab.isDirty }
        ];

        // 3. REVEAL THE COMMIT RITUAL: Only if a repo ancestor is found.
        if (gitInfo) {
            menuItems.push({ label: "Commit Changes", action: "commit-changes", icon: "git-branch" });
        }

        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Find / Replace", action: "find-replace", icon: "search" });
        menuItems.push({ label: "Visual Settings", action: "visual-settings", icon: "eye" });
        menuItems.push({ label: "App Settings", action: "settings", icon: "settings" });
        menuItems.push({ isSeparator: true });
        menuItems.push({ label: "Help & Docs", action: "show-docs", icon: "brain" });

        const btnRect = DOM.hamburgerMenuBtn.getBoundingClientRect();
        MenuUI.renderMenu(DOM.mainMenu, menuItems, { 
            clientX: btnRect.left, 
            clientY: btnRect.bottom + 8 
        });

        // Ensure outside click closes the menu
        setTimeout(() => {
            document.addEventListener("click", MenuUI.handleDocumentClick, { once: true });
        }, 10);
    }
};
