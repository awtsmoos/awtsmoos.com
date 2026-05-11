
// B"H
// FILE: js/menus/main.js

import { State, DOM } from '../state.js';
import { MenuUI } from './ui.js';
import { Menus } from './index.js';
import { GitMetaProvider } from '../git/meta.js';

export const MainMenu = {
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
        const isPreview = activeTab?.fileType === 'html-preview';

        const menuItems =[
            { label: "New File", action: "new-temp-file", icon: "file" },
            { label: "Open File...", action: "open-file", icon: "folder" },
            { label: "Open Local Browser", action: "open-browser-tab", icon: "globe" }, // B"H - Added Browser Gateway
            { isSeparator: true }
        ];

        if (isHtml && !isPreview) {
            menuItems.push({ label: "Preview HTML", action: "view-html", icon: "eye" });
        }
        
        if (isPreview) {
            menuItems.push({ label: "Open DevTools", action: "open-devtools", icon: "laptop" });
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
