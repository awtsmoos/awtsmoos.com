
// B"H
// FILE: js/menus/tabs.js

import { State, DOM } from '../state.js';
import { Menus } from './index.js';
import { MenuUI } from './ui.js';
import { getItemUniquePath, Workspaces } from '../workspaces.js';
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

        // Helper: Robust wait for element creation
        const waitForElement = async (uniquePath) => {
            let attempts = 0;
            return new Promise((resolve) => {
                const check = () => {
                    const entry = State.domItemMap.get(uniquePath);
                    // Check if entry exists AND if the element is actually in the document body
                    if (entry && entry.el && document.body.contains(entry.el)) {
                        resolve(entry.el);
                    } else {
                        attempts++;
                        if (attempts > 40) { // 2 seconds approx
                            resolve(null);
                        } else {
                            requestAnimationFrame(check);
                        }
                    }
                };
                check();
            });
        };

        // 1. Ensure Workspace Root is Expanded and Refreshed
        const rootItem = { ...workspace, path: '/', kind: 'directory', workspaceId: workspace.id };
        const rootUniquePath = getItemUniquePath(rootItem);
        
        if (!State.expandedFolders.has(rootUniquePath)) {
            State.expandedFolders.add(rootUniquePath);
            await Workspaces.refreshNode(rootItem);
        }
        
        // Wait for root to appear
        const rootEl = await waitForElement(rootUniquePath);
        if (rootEl) rootEl.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });

        // 2. Recursively Expand Path Segments
        // Clean path: remove leading slash for splitting
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const pathSegments = cleanPath.split('/').filter(Boolean);
        let currentAccum = '';
        
        // Iterate up to the parent folder of the item
        for (let i = 0; i < pathSegments.length - 1; i++) {
            currentAccum += '/' + pathSegments[i];
            
            const segmentItem = { 
                ...tab.item, 
                path: currentAccum, 
                kind: 'directory', 
                workspaceId: workspace.id 
            };
            
            const uniquePath = getItemUniquePath(segmentItem);
            
            // Expand
            if (!State.expandedFolders.has(uniquePath)) {
                State.expandedFolders.add(uniquePath);
                // We MUST await the refresh to ensure children are rendered before next loop
                await Workspaces.refreshNode(segmentItem);
            }
            
            // Wait for this specific folder element to verify it exists before continuing
            const el = await waitForElement(uniquePath);
            if (el) {
                // Keep it in view during traversal, now centering horizontally too
                el.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
            } else {
                console.warn("Reveal halted: Segment not found", uniquePath);
                return;
            }
        }

        // 3. Locate and Flash the Element (The final target)
        // Ensure parent is refreshed one last time to show the file
        const finalUniquePath = getItemUniquePath(tab.item);
        
        const finalEl = await waitForElement(finalUniquePath);
        
        if (finalEl) {
            // Final scroll with horizontal centering
            finalEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            finalEl.classList.remove('reveal-flash');
            void finalEl.offsetWidth; // Trigger reflow
            finalEl.classList.add('reveal-flash');
            setTimeout(() => finalEl.classList.remove('reveal-flash'), 2500);
        } else {
            // Fallback: If not found, try refreshing the immediate parent once more
            const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
            const parentItem = { ...tab.item, path: parentPath, kind: 'directory', workspaceId };
            await Workspaces.refreshNode(parentItem);
            
            const retryEl = await waitForElement(finalUniquePath);
            if (retryEl) {
                retryEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                retryEl.classList.add('reveal-flash');
            }
        }
    }
};