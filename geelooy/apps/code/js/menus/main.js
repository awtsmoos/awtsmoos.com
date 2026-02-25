
// B"H
// FILE: js/menus/main.js

import { State, DOM } from '../state.js';
import { MenuUI } from './ui.js';
import { Menus } from './index.js';
import { GitMetaProvider } from '../git/meta.js';

/**
 * @class MainMenu
 * @description The Keter of global operations. 
 * 
 * THE POEM OF THE MENU:
 * The Word of the Awtsmoos is infinite, yet He gives us a menu of choice.
 * Every option is a path to rectification. 
 * We look at the current focus (the Active Tab) and reveal the 
 * specific powers available to that vessel.
 * If it is a vessel of structure (HTML), we reveal the vision (Preview).
 * If it is a vessel of content, we reveal the gathering (Select/Copy).
 */
export const MainMenu = {
    /**
     * @async
     * @function show
     * @description B"H. Manifests the global menu. It calculates the 
     * current state of the active tab and provides the relevant rituals.
     */
    async show(e) {
        if (e) e.stopPropagation();

        if (DOM.mainMenu.style.display === "block") {
            Menus.hideAll();
            return;
        }

        Menus.hideAll();
        
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        const gitInfo = activeTab?.item ? await GitMetaProvider.getGitInfoForFolder(activeTab.item) : null;
        const isHtml = activeTab?.item?.name?.toLowerCase()?.endsWith('.html');

        // B"H - Mapping the menu structure
        const menuItems = [
            { label: "New File", action: "new-temp-file", icon: "file" },
            { label: "Open File...", action: "open-file", icon: "folder" },
            { isSeparator: true }
        ];

        // Context-aware Branching
        if (isHtml) {
            menuItems.push({ label: "Preview HTML", action: "view-html", icon: "eye" });
        }

        if (gitInfo) {
            menuItems.push({ label: "Commit Changes", action: "commit-changes", icon: "git-branch" });
        }

        menuItems.push(
            { isSeparator: true },
            { label: "Beautify Code", action: "beautify", icon: "brain" },
            { label: "Save File", action: "save", icon: "save", disabled: !activeTab || !activeTab.isDirty },
            { isSeparator: true },
            { label: "Select All", action: "select-all", icon: "select-all", disabled: !activeTab },
            { label: "Copy All", action: "copy-all", icon: "copy", disabled: !activeTab },
            { label: "Copy as Markdown", action: "copy-all-contents", icon: "clipboard", disabled: !activeTab },
            { label: "Download Context", action: "download-all-contents", icon: "download", disabled: !activeTab },
            { isSeparator: true },
            { label: "Find / Replace", action: "find-replace", icon: "search" },
            { label: "Visual Settings", action: "visual-settings", icon: "eye" },
            { label: "App Settings", action: "settings", icon: "settings" },
            { isSeparator: true },
            { label: "Help & Docs", action: "show-docs", icon: "brain" }
        );

        const btnRect = DOM.hamburgerMenuBtn.getBoundingClientRect();
        MenuUI.renderMenu(DOM.mainMenu, menuItems, { 
            clientX: btnRect.left, 
            clientY: btnRect.bottom + 8 
        });

        setTimeout(() => {
            document.addEventListener("click", MenuUI.handleDocumentClick, { once: true });
        }, 10);
    }
};
