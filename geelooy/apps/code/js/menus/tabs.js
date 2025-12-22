
// B"H
// FILE: js/menus/tabs.js

import { State, DOM } from '../state.js';
import { Menus } from './index.js';
import { MenuUI } from './ui.js';
import { getItemUniquePath, Workspaces } from '../workspaces.js';
// B"H - Explicitly linking to the index file to bypass the phantom actions.js
import { Actions } from '../actions/index.js';

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

        // Helper: Wait for element to exist in DOM
        const waitForElement = async (uniquePath) => {
            return new Promise((resolve) => {
                const check = () => {
                    const entry = State.domItemMap.get(uniquePath);
                    if (entry && entry.el && document.body.contains(entry.el)) {
                        resolve(entry.el);
                    } else {
                        // Keep checking rapidly
                        requestAnimationFrame(check);
                    }
                };
                // Fallback timeout to prevent infinite wait
                const timer = setTimeout(() => resolve(null), 2000);
                
                check();
            });
        };

        // 1. Ensure Workspace Root is Expanded and Refreshed
        const rootItem = { ...workspace, path: '/', kind: 'directory' };
        const rootUniquePath = getItemUniquePath(rootItem);
        
        let rootEntry = State.domItemMap.get(rootUniquePath);
        if (!State.expandedFolders.has(rootUniquePath)) {
            State.expandedFolders.add(rootUniquePath);
            await Workspaces.refreshNode(rootItem);
        }
        
        // Wait for root
        const rootEl = await waitForElement(rootUniquePath);
        if (rootEl) rootEl.scrollIntoView({ behavior: 'auto', block: 'center' });

        // 2. Recursively Expand Path Segments
        const pathSegments = path.split('/').filter(Boolean);
        let currentAccum = '';
        
        // Iterate up to the parent folder of the item
        for (let i = 0; i < pathSegments.length - 1; i++) {
            currentAccum += '/' + pathSegments[i];
            const segmentItem = { ...tab.item, path: currentAccum, kind: 'directory' };
            const uniquePath = getItemUniquePath(segmentItem);
            
            // Expand
            if (!State.expandedFolders.has(uniquePath)) {
                State.expandedFolders.add(uniquePath);
                await Workspaces.refreshNode(segmentItem);
            }
            
            // Critical: Wait for this folder to render before trying to scroll or find its children
            const el = await waitForElement(uniquePath);
            if (el) {
                el.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
        }

        // 3. Locate and Flash the Element (The final target)
        const finalUniquePath = getItemUniquePath(tab.item);
        
        const finalEl = await waitForElement(finalUniquePath);
        if (finalEl) {
            finalEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            finalEl.classList.remove('reveal-flash');
            void finalEl.offsetWidth; // Trigger reflow
            finalEl.classList.add('reveal-flash');
            setTimeout(() => finalEl.classList.remove('reveal-flash'), 2500);
        }
    }
};
