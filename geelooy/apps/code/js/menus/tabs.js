// B"H
// FILE: js/menus/tabs.js

import { State, DOM } from '../state.js';
import { Menus } from './index.js';
import { MenuUI } from './ui.js';
import { getItemUniquePath, Workspaces } from '../workspaces.js';
import { Actions } from '../actions/index.js'; // B"H - Updated Import

export const TabMenus = {
    showTabMenu(e, tab) {
        e.preventDefault();
        e.stopPropagation();
        Menus.hideAll();

        const menuItems = [
            { label: "Show in Workspace", action: "reveal-in-workspace", icon: "search" },
            { isSeparator: true },
            { label: "Close", action: "close-tab-direct", icon: "x" },
            { label: "Close Others", action: "close-other-tabs", icon: "x-circle" }
        ];

        // Store the target tab for the action handler
        State.contextTabTarget = tab;

        MenuUI.renderMenu(DOM.contextMenu, menuItems, { clientX: e.clientX, clientY: e.clientY });
    },

    /**
     * B"H - Reveal ritual. Recursively opens folders to find a file.
     * Updated to scroll progressively and handle already-open directories gracefully.
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
        
        let rootEntry = State.domItemMap.get(rootUniquePath);
        if (!State.expandedFolders.has(rootUniquePath)) {
            State.expandedFolders.add(rootUniquePath);
            await Workspaces.refreshNode(rootItem);
        }
        
        // Scroll Root into view if needed
        rootEntry = State.domItemMap.get(rootUniquePath); // Re-get in case it was refreshed
        if (rootEntry?.el) {
            rootEntry.el.scrollIntoView({ behavior: 'auto', block: 'center' });
        }

        // 2. Recursively Expand and Refresh Path Segments
        const pathSegments = path.split('/').filter(Boolean);
        let currentAccum = '';
        
        // Iterate up to the parent folder of the item
        for (let i = 0; i < pathSegments.length - 1; i++) {
            currentAccum += '/' + pathSegments[i];
            const segmentItem = { ...tab.item, path: currentAccum, kind: 'directory' };
            const uniquePath = getItemUniquePath(segmentItem);
            
            // Check if already open
            if (!State.expandedFolders.has(uniquePath)) {
                State.expandedFolders.add(uniquePath);
                // Only refresh if we just opened it (to load children)
                await Workspaces.refreshNode(segmentItem);
            } else {
                // Even if open, ensure DOM logic (like sub-uls) is intact. 
                // Workspaces.refreshNode handles this check internally usually, 
                // but let's call it to be safe or just find the DOM.
                // Actually, if it's open, we just want to scroll to it.
            }
            
            // Find DOM and Scroll
            const entry = State.domItemMap.get(uniquePath);
            if (entry?.el) {
                entry.el.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
        }

        // 3. Locate and Flash the Element (The final target)
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
    }
};