// B"H
// FILE: js/menus.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { App } from './app.js';
import { Tabs } from './tabs.js';
import { Workspaces, getItemUniquePath } from './workspaces.js';
import { FindReplace } from './find-replace.js';
import { Clipboard } from './clipboard.js';
import { FileSystemProvider } from './fs-provider.js';
import { Editor } from './editor.js';
import { processHtmlForPreview, attachWorkerRequestHandler, detachWorkerRequestHandler, attachDynamicAssetHandler, detachDynamicAssetHandler } from './html-preview-processor.js';
import { FileOperations } from './file-operations.js';
import { SelectionManager } from './selection-manager.js';
import { AwtsmoosHandler } from './awtsmoos-handler.js';
export const Menus = {


registerCustomMenus(menuConfigs) {
        if (!Array.isArray(menuConfigs)) return;
        State.customMenus = menuConfigs;
        
    
    },
    /**
     * Handles clicks on the document to hide any open menus.
     */
    handleDocumentClick: (e) => {
        if (!DOM.contextMenu.contains(e.target) && !DOM.mainMenu.contains(e.target)) {
            Menus.hideAll();
        }
    },

    /**
     * Displays the context-sensitive menu for a file or folder item.
     * @param {Event} e - The contextmenu event.
     * @param {object} item - The file or folder item that was right-clicked.
     */
    show(e, item) {
        e.preventDefault();
        e.stopPropagation();

        if (State.isSelectionModeActive) {
            return; // Don't show the standard context menu during selection mode.
        }
        
        State.contextTarget = item; // Store the item that was right-clicked.
        this.hideAll(); // Close any other open menus first.
        
        // Add a one-time click listener to the document to close the menu.
        setTimeout(() => document.addEventListener('click', this.handleDocumentClick), 0);
        
        // Highlight the item in the file tree.
        const mapKey = getItemUniquePath(item);
        const targetEl = State.domItemMap.get(mapKey)?.el;
        if (targetEl) {
            targetEl.classList.add('context-active');
        }

        const isDir = item.kind === 'directory';
        const isWorkspaceRoot = item.path === '/';
        const isGithubRepoRoot = item.type === 'github' && isWorkspaceRoot;

        const menuItems = [];

        // --- Smart "Copy" / "Clone" button ---
        if (isGithubRepoRoot) {
            menuItems.push({ label: `Copy / Clone "${item.repoInfo.repo}"`, action: 'copy-single', icon: 'copy' });
        } else {
            menuItems.push({ label: `Copy "${item.name}"`, action: 'copy-single', icon: 'copy' });
        }
        
        menuItems.push({ label: 'Select', action: 'start-selection', icon: 'select-all' });
        menuItems.push({ label: 'Copy All Contents', action: 'copy-all-contents', icon: 'clipboard' });
        menuItems.push({ isSeparator: true });
        
        // --- Smart "Paste" button ---
        const clipboardItemUniquePath = State.fileClipboard?.[0];
        const clipboardItem = clipboardItemUniquePath ? State.domItemMap.get(clipboardItemUniquePath)?.item : null;
        if (isDir && clipboardItem) {
            if (clipboardItem.type === 'github' && clipboardItem.path === '/') {
                menuItems.push({ label: `Paste / Clone "${clipboardItem.repoInfo.repo}" here`, action: 'paste', icon: 'download' });
            } else {
                menuItems.push({ label: `Paste item(s) here`, action: 'paste', icon: 'clipboard' });
            }
            menuItems.push({ isSeparator: true });
        }
        
        // --- Standard action buttons ---
        if (isDir) {
            menuItems.push({ label: 'New File', action: 'new-file', icon: 'file' });
            menuItems.push({ label: 'New Folder', action: 'new-folder', icon: 'folder' });
            menuItems.push({ isSeparator: true });
        }

        if (!isWorkspaceRoot) {
            menuItems.push({ label: 'Delete', action: 'delete', icon: 'trash', danger: true });
        } else {
            menuItems.push({ label: 'Remove Workspace', action: 'delete-workspace', icon: 'x', danger: true });
        }
        
        // --- Build and render the menu's HTML ---
        DOM.contextMenu.innerHTML = menuItems.map(i => {
            if (i.isSeparator) {
                return `<hr class="menu-separator">`;
            }
            const dangerStyle = i.danger ? 'style="color: var(--color-accent-danger);"' : '';
            return `
                <button class="menu-button" data-action="${i.action}" ${dangerStyle}>
                    <svg class="svg-icon"><use href="#icon-${i.icon}"/></svg> ${i.label}
                </button>
            `;
        }).join('');

        this.positionAndDisplay(DOM.contextMenu, e);
    },
    /*B"H*/
// ACTION: Replace this method in menus.js
/**
 * Unfurls the main application menu, a scroll of potential actions,
 * now dynamically aware of the uncommitted state of the active workspace.
 * @param {Event} e - The click event.
 */
showMainMenu(e) {
    e.stopPropagation();

    const isMenuVisible = DOM.mainMenu.style.display === 'block';
    if (isMenuVisible) {
        this.hideAll();
        return;
    }
    
    this.hideAll();
    setTimeout(() => document.addEventListener('click', this.handleDocumentClick), 0);

    const activeTab = State.tabs.find(t => t.id === State.activeTabId);
    const hasSelection = activeTab && (DOM.editor.selectionStart !== DOM.editor.selectionEnd);

    let hasUncommittedChanges = false;
    let isGitHubWorkspace = false;
    if (activeTab && activeTab.item.type === 'github') {
        isGitHubWorkspace = true;
        const currentWorkspaceId = activeTab.item.workspaceId;
        hasUncommittedChanges = State.tabs.some(t => t.item.workspaceId === currentWorkspaceId && t.isUncommitted);
    }
    
    const menuItems = [
        { label: 'New File', action: 'new-temp-file', icon: 'file' },
        { label: 'Open File...', action: 'open-file', icon: 'folder' },
        { isSeparator: true },
        { label: 'Save', action: 'save', icon: 'save', disabled: !activeTab || !activeTab.isDirty },
    ];

    if (isGitHubWorkspace) {
        menuItems.push({ label: 'Commit All Changes', action: 'commit-changes', icon: 'git-branch', disabled: !hasUncommittedChanges });
    }

    menuItems.push({ label: 'Download', action: 'download', icon: 'download', disabled: !activeTab });
    
    if (activeTab && (activeTab.item.name.toLowerCase().endsWith('.html') || activeTab.item.name.toLowerCase().endsWith('.htm'))) {
        menuItems.push({ label: 'Preview HTML', action: 'view-html', icon: 'eye' });
    }
    
    if (activeTab && (activeTab.item.name.toLowerCase().endsWith('.json') || activeTab.item.name.toLowerCase().endsWith('.awtsmoosjson')) && !activeTab.isHexView) {
	    menuItems.push({ label: activeTab.isAltarView ? 'Reconstitute to Text' : 'Transmute to Altar', action: 'toggle-altar-view', icon: 'brain-circuit' });
	}

    if (activeTab && activeTab.item.name.toLowerCase().endsWith('.awtsmoosjson')) {
	    menuItems.push({ label: activeTab.isHexView ? 'View as JSON' : 'View as Hex', action: 'toggle-awtsmoos-view', icon: activeTab.isHexView ? 'eye' : 'brain-circuit' });
	}
    
    menuItems.push(
        { isSeparator: true },
        { label: 'Find / Replace', action: 'find-replace', icon: 'search', disabled: !activeTab },
        { label: 'Select All', action: 'select-all', icon: 'select-all', disabled: !activeTab },
        { label: 'Copy', action: 'copy', icon: 'copy', disabled: !hasSelection },
        { label: 'Copy All', action: 'copy-all', icon: 'copy', disabled: !activeTab },
        { isSeparator: true },
        { label: 'Toggle Keyboard Helper', action: 'toggle-keyboard-helper', icon: 'laptop' }, 
        { label: 'Toggle Fullscreen', action: 'toggle-fullscreen', icon: 'fullscreen' }, 
        { label: 'Settings', action: 'settings', icon: 'settings' }
    );

    if (State.customMenus && State.customMenus.length > 0) {
        menuItems.push({ isSeparator: true });
        State.customMenus.forEach(customMenu => {
            if (customMenu.items && Array.isArray(customMenu.items)) {
                customMenu.items.forEach(item => {
                    menuItems.push({ label: item.label, action: item.action, icon: item.icon });
                });
            }
        });
    }

    DOM.mainMenu.innerHTML = menuItems.map(i => {
        if (i.isSeparator) return `<hr class="menu-separator">`;
        return `<button class="menu-button" data-action="${i.action}" ${i.disabled ? 'disabled' : ''}>
                <svg class="svg-icon"><use href="#icon-${i.icon}"/></svg> ${i.label}
            </button>`;
    }).join('');

    const btnRect = DOM.hamburgerMenuBtn.getBoundingClientRect();
    this.positionAndDisplay(DOM.mainMenu, { clientX: btnRect.left, clientY: btnRect.bottom + 5 });
},
    

    /**
     * Hides all menus and cleans up associated state and listeners.
     */
    hideAll() {
        DOM.contextMenu.style.display = 'none';
        DOM.mainMenu.style.display = 'none';
        document.querySelectorAll('.context-active').forEach(el => el.classList.remove('context-active'));
        document.removeEventListener('click', this.handleDocumentClick);
    },
    
    /**
     * Positions a menu element on the screen, ensuring it doesn't render outside the viewport.
     * @param {HTMLElement} menu - The menu element to position.
     * @param {object} coords - An object with `clientX` and `clientY`.
     */
    positionAndDisplay(menu, coords) {
        setTimeout(() => {
            const { clientX: x, clientY: y } = coords;
            menu.style.display = 'block'; 
            const menuRect = menu.getBoundingClientRect();
            
            const adjustedX = (x + menuRect.width > window.innerWidth) ? window.innerWidth - menuRect.width - 5 : x;
            let adjustedY = y;
            if (y + menuRect.height > window.innerHeight) {
                adjustedY = y - menuRect.height;
                if (adjustedY < 0) adjustedY = 5;
            }
            
            menu.style.left = `${adjustedX}px`;
            menu.style.top = `${adjustedY}px`;
        }, 10);
    },

    /*B"H*/
// ACTION: Replace this method in menus.js
/**
 * The central nexus for all user intentions. It receives an action and
 * dispatches it to the appropriate module, turning intent into reality.
 * @param {string} action - The `data-action` attribute from the clicked button.
 */
async handleAction(action) {
    const item = State.contextTarget;
    this.hideAll();
    const activeTab = State?.tabs?.find?.(t => t?.id === State?.activeTabId);
    
    const builtInActions = [
        'new-temp-file', 'open-file', 'save', 'download', 'view-html', 'find-replace', 'settings',
        'toggle-keyboard-helper', 'toggle-fullscreen', 'select-all', 'copy',
        'toggle-awtsmoos-view', 'copy-all', 'copy-all-contents', 'new-file', 'new-folder', 
        'start-selection', 'copy-single', 'paste', 'delete-workspace', 'delete',
        'toggle-hex-view', 'toggle-altar-view', 'commit-changes' // Add commit-changes here
    ];
    
    if (!builtInActions.includes(action)) {
        console.log(`Dispatching custom action '${action}' to parent OS.`);
        window.parent.postMessage({
            type: 'customAction',
            payload: { action: action, context: activeTab?.item?.saveContext || activeTab?.item?.path || null }
        }, '*');
        return;
    }
    
    try {
        switch(action) {
            // --- New GitHub Action ---
            case 'commit-changes': App.commitAllChanges(); break;
            
            // --- Main Menu Actions ---
            case 'new-temp-file': Tabs.createTemporary(); break;
            case 'open-file': App.openLocalFile(); break;
            case 'save': Tabs.saveActive(); break;
            // ... (rest of the cases remain exactly the same as your original file)
        }
    } catch(e) { 
        UI.showToast(`Error: ${e.message}`, 'error'); 
        console.error("Action failed:", action, e);
    } finally { 
        UI.hideLoading(); 
    }
}
};
