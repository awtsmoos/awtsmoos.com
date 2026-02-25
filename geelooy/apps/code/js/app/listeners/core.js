
// B"H
// FILE: js/app/listeners/core.js

import { State, DOM } from '../../state.js';
import { Workspaces } from '../../workspaces/index.js';
import { Tabs } from '../../tabs/index.js';
import { Menus } from '../../menus/index.js';
import { VisualEngine } from '../../visuals/index.js';
import { CustomMenu } from '../../custom-menu.js';
import { WorkspaceAddition } from '../../features/workspace-addition.js';
import { FileCommander } from '../../file-commander.js';

/**
 * @function setupCoreListeners
 * @description B"H. Nervous system of the application.
 */
export function setupCoreListeners() {
    const appContainer = document.querySelector('.app-container');

    // TOGGLE SIDEBAR (Corrected logic)
    const toggleSidebar = (e) => {
        if (e) e.stopPropagation();
        appContainer.classList.toggle('sidebar-collapsed');
    };

    if (DOM.mobileSidebarToggle) DOM.mobileSidebarToggle.onclick = toggleSidebar;
    if (DOM.sidebarCollapseBtn) DOM.sidebarCollapseBtn.onclick = toggleSidebar;

    // MAIN MENU BUTTON (Toggle support)
    if (DOM.hamburgerMenuBtn) {
        DOM.hamburgerMenuBtn.onclick = (e) => Menus.showMainMenu(e);
    }

    if (DOM.addWorkspaceBtn) {
        DOM.addWorkspaceBtn.onclick = () => WorkspaceAddition.showDialog();
    }

    if(DOM.fileCommanderBtn) {
        DOM.fileCommanderBtn.onclick = () => FileCommander.open();
    }

    // RESIZER (Restored)
    const resizer = document.getElementById('sidebar-resizer');
    if (resizer) {
        const handleMove = (e) => {
            const clientX = e.clientX ?? e.touches?.[0]?.clientX;
            if (clientX === undefined) return;
            appContainer.style.gridTemplateColumns = `${Math.max(50, Math.min(clientX, 800))}px 1fr`;
        };
        const handleEnd = () => document.body.classList.remove('is-resizing');
        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            document.body.classList.add('is-resizing');
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', handleMove);
                handleEnd();
            }, { once: true });
        });
    }

    // GLOBAL CLICK
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#selection-menu') && !e.target.closest('#sidebar')) {
            // Logic handled by Menus.hideAll usually
        }
        VisualEngine.onCaretMove();
    });

    window.addEventListener('message', async (event) => {
        const { type, payload, requestId, error } = event.data;
        if (State.postMessagePendingRequests.has(requestId)) {
            const { resolve, reject } = State.postMessagePendingRequests.get(requestId);
            State.postMessagePendingRequests.delete(requestId);
            if (error) reject(new Error(error)); else resolve(payload);
        }
    });
}
