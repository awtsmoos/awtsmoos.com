
// B"H
// FILE: js/app/listeners/core.js

import { State, DOM } from '../../state.js';
import { Workspaces } from '../../workspaces/index.js';
import { Tabs } from '../../tabs/index.js';
import { Menus } from '../../menus/index.js';
import { SelectionManager } from '../../selection-manager.js';
import { VisualEngine } from '../../visuals/index.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { CustomMenu } from '../../custom-menu.js';
import { WorkspaceAddition } from '../../features/workspace-addition.js';

/**
 * @function setupCoreListeners
 * @description B"H. This vessel is the nervous system of the application. 
 * It binds the physical interactions—resizing the world, toggling 
 * visibility, and clicking upon elements—to their spiritual logic.
 * Every line here is a manifestation of the will to provide a stable,
 * responsive environment for the user's creativity.
 */
export function setupCoreListeners() {
    const appContainer = document.querySelector('.app-container');

    // --- SIDEBAR TOGGLE & COLLAPSE ---
    const toggleSidebar = (e) => {
        if (e) e.stopPropagation();
        if (appContainer) {
            appContainer.classList.toggle('sidebar-collapsed');
        }
    };

    if (DOM.mobileSidebarToggle) DOM.mobileSidebarToggle.onclick = toggleSidebar;
    if (DOM.sidebarCollapseBtn) DOM.sidebarCollapseBtn.onclick = toggleSidebar;

    // --- MAIN MENU & WORKSPACE ADDITION ---
    if (DOM.hamburgerMenuBtn) {
        DOM.hamburgerMenuBtn.onclick = (e) => {
            e.stopPropagation();
            Menus.showMainMenu(e);
        };
    }

    if (DOM.addWorkspaceBtn) {
        DOM.addWorkspaceBtn.onclick = () => WorkspaceAddition.showDialog();
    }

    // --- SIDEBAR RESIZER LOGIC (RESTORED) ---
    const resizer = document.getElementById('sidebar-resizer');
    if (resizer && appContainer) {
        const handleMove = (e) => {
            if (appContainer.classList.contains('sidebar-collapsed')) return;
            const clientX = e.clientX ?? e.touches?.[0]?.clientX;
            if (clientX === undefined) return;
            // Constrain the expansion of the world between 50 and 800 units
            const newWidth = Math.max(50, Math.min(clientX, 800));
            appContainer.style.gridTemplateColumns = `${newWidth}px 1fr`;
            localStorage.awtsmoosSidebarWidth = newWidth;
        };

        const handleEnd = () => {
            document.body.classList.remove('is-resizing');
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
        };

        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            document.body.classList.add('is-resizing');
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
        });
    }

    // --- GLOBAL CLICK & WINDOW MANAGEMENT ---
    window.addEventListener('message', async (event) => {
        const { type, payload, requestId, error } = event.data;
        if (State.postMessagePendingRequests.has(requestId)) {
            const { resolve, reject } = State.postMessagePendingRequests.get(requestId);
            State.postMessagePendingRequests.delete(requestId);
            if (error) reject(new Error(error)); else resolve(payload);
            return;
        }
        if(type === 'loadFile') {
            const { fileName, content, saveContext } = payload;
            const wsId = State.nextWorkspaceId++;
            Workspaces.add({ id: wsId, name: 'External Vessel', type: 'postmessage' }, false);
            await Tabs.create({ name: fileName, path: fileName, kind: 'file', type: 'postmessage', workspaceId: wsId, saveContext, _initialContent: content });
        } else if (type === 'registerMenus') {
            CustomMenu.createFromConfig(payload);
        }
    });

    document.addEventListener('click', (e) => {
        if (State.isSelectionModeActive && !e.target.closest('#sidebar') && !e.target.closest('#selection-menu')) {
            SelectionManager.end();
        }
        VisualEngine.onCaretMove();
    });

    window.addEventListener('beforeunload', () => {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && !DOM.editorWrapper.classList.contains('hidden')) {
            activeTab.scrollPos = DOM.editor.scrollTop;
        }
        import('../../app/index.js').then(m => m.App.saveSession());
    });
}
