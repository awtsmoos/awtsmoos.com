
// B"H
/**
 * @file core.js
 * @brief The nervous system of the application.
 */

import { State, DOM } from '../../state.js';
import { Menus } from '../../menus/index.js';
import { WorkspaceAddition } from '../../features/workspace-addition.js';
import { FileCommander } from '../../file-commander.js';
import { Actions } from '../../actions/index.js';

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

    // --- B"H - THE GLOBAL CONSOLE & REFRESH GATEWAYS ---
    const menuBar = document.querySelector('.menu-bar');
    if (menuBar) {
        // Console Button
        let consoleBtn = document.getElementById('global-console-btn');
        if (!consoleBtn) {
            consoleBtn = document.createElement('button');
            consoleBtn.id = 'global-console-btn';
            consoleBtn.className = 'icon-button hidden';
            consoleBtn.title = 'Open JavaScript Console';
            consoleBtn.style.color = 'var(--neon-cyan)';
            consoleBtn.innerHTML = '<svg class="svg-icon"><use href="#icon-laptop"></use></svg>';
            menuBar.appendChild(consoleBtn);
        }
        
        consoleBtn.onclick = (e) => {
            e.stopPropagation();
            const activeTab = State.tabs.find(t => t.id === State.activeTabId);
            if (activeTab) {
                Actions.handle('open-devtools', activeTab);
            }
        };

        // B"H - Refresh Preview Button
        let refreshBtn = document.getElementById('global-refresh-preview-btn');
        if (!refreshBtn) {
            refreshBtn = document.createElement('button');
            refreshBtn.id = 'global-refresh-preview-btn';
            refreshBtn.className = 'icon-button hidden';
            refreshBtn.title = 'Refresh Preview';
            refreshBtn.style.color = 'var(--neon-lime)';
            refreshBtn.innerHTML = '<svg class="svg-icon"><use href="#icon-refresh"></use></svg>';
            menuBar.appendChild(refreshBtn);
        }

        refreshBtn.onclick = (e) => {
            e.stopPropagation();
            const activeTab = State.tabs.find(t => t.id === State.activeTabId);
            if (activeTab && (activeTab.isPreview || activeTab.fileType === 'html-preview')) {
                import('../../editor/preview-manager.js').then(m => {
                    m.PreviewManager.show(activeTab.id, activeTab.item, activeTab.content, true);
                });
            }
        };

        const updateBtnVisibility = () => {
            const tab = State.tabs.find(t => t.id === State.activeTabId);
            const isInspectable = tab && (tab.isPreview || tab.fileType === 'html-preview' || tab.item.type === 'browser');
            consoleBtn.classList.toggle('hidden', !isInspectable);
            refreshBtn.classList.toggle('hidden', !isInspectable);
        };

        window.addEventListener('awtsmoos-tab-activated', updateBtnVisibility);
        setTimeout(updateBtnVisibility, 500);
    }

    const resizer = document.getElementById('sidebar-resizer');
    if (resizer) {
        const handleMove = (e) => {
            const clientX = (e.type === 'touchmove') ? e.touches[0].clientX : e.clientX;
            if (clientX === undefined) return;
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
            document.body.classList.add('is-resizing');
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleMove, { passive: false });
            document.addEventListener('touchend', handleEnd);
        };
        resizer.addEventListener('mousedown', handleStart);
        resizer.addEventListener('touchstart', handleStart, { passive: false });
    }
}
