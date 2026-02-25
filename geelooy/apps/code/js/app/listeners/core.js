
// B"H
// FILE: js/app/listeners/core.js

import { State, DOM } from '../../state.js';
import { Menus } from '../../menus/index.js';
import { WorkspaceAddition } from '../../features/workspace-addition.js';
import { FileCommander } from '../../file-commander.js';

/**
 * @function setupCoreListeners
 * @description The nervous system of the application.
 * B"H - Updated with mobile-optimized resizing logic.
 */
export function setupCoreListeners() {
    const appContainer = document.querySelector('.app-container');

    const toggleSidebar = (e) => {
        if (e) e.stopPropagation();
        appContainer.classList.toggle('sidebar-collapsed');
    };

    if (DOM.mobileSidebarToggle) DOM.mobileSidebarToggle.onclick = toggleSidebar;
    if (DOM.sidebarCollapseBtn) DOM.sidebarCollapseBtn.onclick = toggleSidebar;

    if (DOM.hamburgerMenuBtn) {
        DOM.hamburgerMenuBtn.onclick = (e) => Menus.showMainMenu(e);
    }

    if (DOM.addWorkspaceBtn) {
        DOM.addWorkspaceBtn.onclick = () => WorkspaceAddition.showDialog();
    }

    if(DOM.fileCommanderBtn) {
        DOM.fileCommanderBtn.onclick = () => FileCommander.open();
    }

    // --- B"H - RE-FORGED RESIZER (Touch + Mouse) ---
    const resizer = document.getElementById('sidebar-resizer');
    if (resizer) {
        const handleMove = (e) => {
            // Unify mouse and touch coordinates
            const clientX = (e.type === 'touchmove') ? e.touches[0].clientX : e.clientX;
            if (clientX === undefined) return;

            // B"H - Absolute coordinate mapping
            const newWidth = Math.max(50, Math.min(clientX, window.innerWidth * 0.8));
            appContainer.style.gridTemplateColumns = `${newWidth}px 1fr`;
        };

        const handleEnd = () => {
            document.body.classList.remove('is-resizing');
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
        };

        const handleStart = (e) => {
            // Prevent scrolling when resizing on mobile
            if (e.type === 'touchstart') {
                // e.preventDefault(); // Might interfere with UI, use carefully
            }
            document.body.classList.add('is-resizing');
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleMove, { passive: false });
            document.addEventListener('touchend', handleEnd);
        };

        resizer.addEventListener('mousedown', handleStart);
        resizer.addEventListener('touchstart', handleStart, { passive: false });
    }

    // Global interaction cleanup
    document.addEventListener('click', (e) => {
        // Intelligence to close floating menus
    });
}
