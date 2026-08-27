
// B"H
// FILE: js/menus/tabs.js

import { State, DOM } from '../state.js';
import { Menus } from './index.js';
import { MenuUI } from './ui.js';
import { getItemUniquePath, Workspaces } from '../workspaces.js';

export const TabMenus = {
    showTabMenu(e, tab) {
        e.preventDefault(); e.stopPropagation();
        Menus.hideAll();

        const menuItems =[
            { label: "Reveal in Explorer", action: "reveal-in-workspace", icon: "search" },
            { label: "Fullscreen Tab", action: "fullscreen-tab", icon: "fullscreen" }, // B"H
            { isSeparator: true },
            { label: tab.pinned ? "Unpin Tab" : "Pin Tab", action: "toggle-pin", icon: "brain" },
            { isSeparator: true },
            { label: "Close", action: "close-tab-direct", icon: "x" },
            { isSeparator: true },
            { label: "Cancel", action: "cancel-menu", icon: "x" }
        ];

        // B"H - Set the specific tab target AND purify the general target to prevent confusion.
        State.contextTabTarget = tab;
        State.contextTarget = null;
        
        MenuUI.renderMenu(DOM.contextMenu, menuItems, e);
    },

    async revealInWorkspace(tab) {
        if (!tab || !tab.item || !tab.item.path) return;

        const { workspaceId, path } = tab.item;
        const workspace = State.workspaces.find(ws => ws.id === workspaceId);
        if (!workspace) return;

        document.querySelector('.app-container').classList.remove('sidebar-collapsed');

        const parts = path.split('/').filter(Boolean);
        let currentAccum = '';
        
        for (let i = 0; i < parts.length; i++) {
            const isLast = (i === parts.length - 1);
            currentAccum += '/' + parts[i];
            
            const item = { ...tab.item, path: currentAccum, kind: isLast ? 'file' : 'directory' };
            const uniquePath = getItemUniquePath(item);
            
            if (!isLast && !State.expandedFolders.has(uniquePath)) {
                await Workspaces.refreshNode(item);
            }

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
