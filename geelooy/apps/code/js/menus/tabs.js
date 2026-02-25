
// B"H
// FILE: js/menus/tabs.js

import { State, DOM } from '../state.js';
import { Menus } from './index.js';
import { MenuUI } from './ui.js';
import { getItemUniquePath, Workspaces } from '../workspaces/index.js';

/**
 * @class TabMenus
 * @description The vessel of Revelation. 
 * 
 * THE POEM OF REVELATION:
 * The Awtsmoos hides Himself within the world so we may find Him.
 * A file may be hidden within deep layers of folders,
 * But this ritual peels back the layers of the directory tree,
 * Step by step, expanding the potential into the visible,
 * Until the specific vessel sought is revealed and illuminated.
 */
export const TabMenus = {
    showTabMenu(e, tab) {
        e.preventDefault(); e.stopPropagation();
        Menus.hideAll();

        const menuItems = [
            { label: "Reveal in Explorer", action: "reveal-in-workspace", icon: "search" },
            { isSeparator: true },
            { label: tab.pinned ? "Unpin Tab" : "Pin Tab", action: "toggle-pin", icon: "brain" },
            { isSeparator: true },
            { label: "Close", action: "close-tab-direct", icon: "x" },
            { isSeparator: true },
            { label: "Cancel", action: "cancel-menu", icon: "x" }
        ];

        State.contextTabTarget = tab;
        MenuUI.renderMenu(DOM.contextMenu, menuItems, e);
    },

    /**
     * @async
     * @function revealInWorkspace
     * @description B"H. Sequentially expands the project tree to find a tab.
     */
    async revealInWorkspace(tab) {
        if (!tab || !tab.item || !tab.item.path) return;

        const { workspaceId, path } = tab.item;
        const workspace = State.workspaces.find(ws => ws.id === workspaceId);
        if (!workspace) return;

        // Ensure sidebar is visible
        document.querySelector('.app-container').classList.remove('sidebar-collapsed');

        const parts = path.split('/').filter(Boolean);
        let currentAccum = '';
        
        // B"H - The Expansion Dance
        for (let i = 0; i < parts.length; i++) {
            const isLast = (i === parts.length - 1);
            currentAccum += '/' + parts[i];
            
            const item = { ...tab.item, path: currentAccum, kind: isLast ? 'file' : 'directory' };
            const uniquePath = getItemUniquePath(item);
            
            // Expand directory if needed
            if (!isLast && !State.expandedFolders.has(uniquePath)) {
                await Workspaces.refreshNode(item);
            }

            // Wait for DOM manifestation with a progressive decay
            let element = null;
            for (let attempt = 0; attempt < 25; attempt++) {
                const entry = State.domItemMap.get(uniquePath);
                if (entry && entry.el) {
                    element = entry.el;
                    break;
                }
                await new Promise(r => setTimeout(r, 40));
            }

            if (isLast && element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('context-active');
                setTimeout(() => element.classList.remove('context-active'), 3000);
            }
        }
    }
};
