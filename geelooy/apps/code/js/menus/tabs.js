// B"H
// FILE: js/menus/tabs.js

import { State, DOM } from '../state.js';
import { Menus } from './index.js';
import { MenuUI } from './ui.js';
import { getItemUniquePath, Workspaces } from '../workspaces.js';
import { Actions } from '../actions/index.js';
import { Tabs } from '../tabs/index.js';

export const TabMenus = {
    showTabMenu(e, tab) {
        e.preventDefault();
        e.stopPropagation();
        Menus.hideAll();

        const menuItems = [
            { label: "Show in Workspace", action: "reveal-in-workspace", icon: "search" },
            { isSeparator: true },
            { label: tab.pinned ? "Unpin Tab" : "Pin Tab", action: "toggle-pin", icon: "brain" },
            { isSeparator: true },
            { label: "Close", action: "close-tab-direct", icon: "x" },
            { label: "Close Others", action: "close-other-tabs", icon: "x-circle" },
            { label: "Close to the Right", action: "close-right", icon: "arrow-right" },
            { label: "Close to the Left", action: "close-left", icon: "arrow-left" },
            { isSeparator: true },
            { label: "Cancel", action: "cancel-menu", icon: "x" }
        ];

        State.contextTabTarget = tab;
        
        // Ensure menu closes on outside click
        setTimeout(() => document.addEventListener("click", MenuUI.handleDocumentClick), 0);
        
        MenuUI.renderMenu(DOM.contextMenu, menuItems, { clientX: e.clientX, clientY: e.clientY });
    },

    async revealInWorkspace(tab) {
        if (!tab || !tab.item || tab.item.path === '/') return;

        const { workspaceId, path } = tab.item;
        const workspace = State.workspaces.find(ws => ws.id === workspaceId);
        if (!workspace) return;

        const appContainer = document.querySelector('.app-container');
        if (appContainer.classList.contains('sidebar-collapsed')) {
             document.getElementById('sidebar-toggle-btn')?.click();
        }

        const waitForElement = async (uniquePath) => {
            let attempts = 0;
            return new Promise((resolve) => {
                const check = () => {
                    const entry = State.domItemMap.get(uniquePath);
                    if (entry && entry.el && document.body.contains(entry.el) && entry.el.offsetParent !== null) {
                        resolve(entry.el);
                    } else {
                        attempts++;
                        if (attempts > 300) { 
                            resolve(null);
                        } else {
                            requestAnimationFrame(check);
                        }
                    }
                };
                check();
            });
        };

        const rootItem = { ...workspace, path: '/', kind: 'directory', workspaceId: workspace.id };
        const rootUniquePath = getItemUniquePath(rootItem);
        
        if (!State.expandedFolders.has(rootUniquePath)) {
            State.expandedFolders.add(rootUniquePath);
            await Workspaces.refreshNode(rootItem);
        }
        
        const rootEl = await waitForElement(rootUniquePath);
        if (rootEl) rootEl.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });

        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const pathSegments = cleanPath.split('/').filter(Boolean);
        let currentAccum = '';
        
        for (let i = 0; i < pathSegments.length - 1; i++) {
            currentAccum += '/' + pathSegments[i];
            const segmentName = pathSegments[i];
            
            const segmentItem = { 
                name: segmentName, 
                path: currentAccum, 
                kind: 'directory', 
                workspaceId: workspace.id,
                type: tab.item.type 
            };
            
            const uniquePath = getItemUniquePath(segmentItem);
            
            if (!State.expandedFolders.has(uniquePath)) {
                State.expandedFolders.add(uniquePath);
                await Workspaces.refreshNode(segmentItem);
            } else {
                const exists = State.domItemMap.has(uniquePath);
                if (!exists) await Workspaces.refreshNode(segmentItem);
            }
            
            const el = await waitForElement(uniquePath);
            if (el) {
                el.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
            } else {
                console.warn("Reveal halted: Segment not found", uniquePath);
                const parentOfSegment = currentAccum.substring(0, currentAccum.lastIndexOf('/')) || '/';
                const parentItem = { ...segmentItem, path: parentOfSegment, name: 'Parent', kind: 'directory' };
                await Workspaces.refreshNode(parentItem);
                const retryEl = await waitForElement(uniquePath);
                if (!retryEl) return; 
            }
        }

        const finalUniquePath = getItemUniquePath(tab.item);
        const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
        const parentItem = { ...tab.item, path: parentPath, kind: 'directory', workspaceId };
        
        if (!State.domItemMap.has(finalUniquePath)) {
             await Workspaces.refreshNode(parentItem);
        }
        
        const finalEl = await waitForElement(finalUniquePath);
        
        if (finalEl) {
            finalEl.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
            setTimeout(() => {
                finalEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                finalEl.classList.remove('reveal-flash');
                void finalEl.offsetWidth; 
                finalEl.classList.add('reveal-flash');
                setTimeout(() => finalEl.classList.remove('reveal-flash'), 2500);
            }, 50);
        } else {
            await Workspaces.refreshNode(parentItem);
            const retryEl = await waitForElement(finalUniquePath);
            if (retryEl) {
                retryEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                retryEl.classList.add('reveal-flash');
                setTimeout(() => retryEl.classList.remove('reveal-flash'), 2500);
            }
        }
    }
};
