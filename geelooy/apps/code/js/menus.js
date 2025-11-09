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
    // B"H

    /**
     * Displays the main application menu (hamburger menu).
     * @param {Event} e - The click event.
     */
    showMainMenu(e) {
        e.stopPropagation();
        this.hideAll();
        setTimeout(() => document.addEventListener('click', this.handleDocumentClick), 0);

        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        const hasSelection = activeTab && (DOM.editor.selectionStart !== DOM.editor.selectionEnd);
        
        const menuItems = [
            { label: 'New File', action: 'new-temp-file', icon: 'file' },
            { label: 'Open File...', action: 'open-file', icon: 'folder' },
            { isSeparator: true },
            { label: 'Save', action: 'save', icon: 'save', disabled: !activeTab || !activeTab.isDirty },
            { label: 'Download', action: 'download', icon: 'download', disabled: !activeTab },
        ];
        
        if (activeTab && (activeTab.item.name.endsWith('.html') || activeTab.item.name.endsWith('.htm'))) {
            menuItems.push({ label: 'Preview HTML', action: 'view-html', icon: 'eye' });
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

        // --- THIS IS THE FIX FOR THE MENU ---
        // Check for and add custom menus from the OS state
        if (State.customMenus && State.customMenus.length > 0) {
            menuItems.push({ isSeparator: true });

            State.customMenus.forEach(customMenu => {
                if (customMenu.items && Array.isArray(customMenu.items)) {
                    customMenu.items.forEach(item => {
                        menuItems.push({
                            label: item.label,
                            action: item.action, // Custom actions will be handled by the dispatcher
                            icon: item.icon
                        });
                    });
                }
            });
        }
        // --- END FIX ---

        DOM.mainMenu.innerHTML = menuItems.map(i => {
            if (i.isSeparator) {
                return `<hr class="menu-separator">`;
            }
            return `
                <button class="menu-button" data-action="${i.action}" ${i.disabled ? 'disabled' : ''}>
                    <svg class="svg-icon"><use href="#icon-${i.icon}"/></svg> ${i.label}
                </button>
            `;
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

    /**
     * Central action handler that dispatches all menu button clicks to the appropriate modules.
     * @param {string} action - The `data-action` attribute from the clicked button.
     */
    async handleAction(action) {
        const item = State.contextTarget;
        this.hideAll();
        
        
        const activeTab = State?.tabs?.find?.(t => t?.id === State?.activeTabId);
                    
        
        
        // Check if the action is one of our custom, parent-defined actions.
    // We can identify them because they are not part of the editor's built-in set.
    const builtInActions = [
        'new-temp-file', 'open-file', 'save', 'download', 'view-html', 'find-replace', 'settings',
        'toggle-keyboard-helper', 'toggle-fullscreen', 'select-all', 'copy', 'copy-all', 'copy-all-contents',
        'new-file', 'new-folder', 'start-selection', 'copy-single', 'paste', 'delete-workspace', 'delete'
    ];
    
    if (!builtInActions.includes(action)) {
        // If it's not a built-in action, it must be a custom one from the parent.
        // Send a message to the OS to handle it.
        console.log(`Dispatching custom action '${action}' to parent OS.`);
        window.parent.postMessage({
            type: 'customAction',
            payload: {
                action: action,
                // Provide the context of the active file for the OS to work with
                context: activeTab?.item?.saveContext || activeTab?.item?.path || null
            }
        }, '*');
        return; // Stop processing here.
    }
        
        try {
            switch(action) {
                // --- Main Menu Actions ---
                case 'new-temp-file': Tabs.createTemporary(); break;
                case 'open-file': App.openLocalFile(); break;
                case 'save': Tabs.saveActive(); break;
                case 'download': Tabs.downloadActive(); break;
                
                case 'view-html': {
                    
                    if (!activeTab) break;
                    UI.showLoading("Processing HTML for preview...");
                    const content = Editor.getContent();
                    
                    detachWorkerRequestHandler();
                    detachDynamicAssetHandler();
                    attachWorkerRequestHandler(activeTab.item);
                    attachDynamicAssetHandler(activeTab.item);
                    
                    try {
                        const processedContent = await processHtmlForPreview(content, activeTab.item);
                        Tabs.createPreview(activeTab.item, processedContent);
                    } catch (e) {
                        UI.showToast("Failed to process HTML.", "error");
                        console.error(e);
                        detachWorkerRequestHandler();
                        detachDynamicAssetHandler();
                    } finally {
                        UI.hideLoading();
                    }
                    break;
                }
                
                case 'find-replace': FindReplace.show(); break;
                case 'settings': App.showSettings(); break;
                case 'toggle-keyboard-helper': DOM.keyboardHelper.classList.toggle('is-visible'); break;
                case 'toggle-fullscreen': App.toggleFullscreen(); break;
                
                // --- Editor Actions ---
                case 'select-all': 
                    if (State.activeTabId !== null) { DOM.editor.focus(); DOM.editor.select(); }
                    break;
                case 'copy': {
                    const selectedText = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd);
                    if (selectedText) {
                        const success = await Clipboard.write(selectedText);
                        UI.showToast(success ? 'Selection copied!' : 'Copy failed!', success ? 'success' : 'error');
                    }
                    break;
                }
                case 'copy-all': {
                    if (State.activeTabId !== null && DOM.editor.value) {
                        const success = await Clipboard.write(DOM.editor.value);
                        UI.showToast(success ? 'All content copied!' : 'Copy failed!', success ? 'success' : 'error');
                    }
                    break;
                }

                // --- Context Menu / File Actions ---
                case 'copy-all-contents':
                    if (item) FileOperations.copyAllContents([item]);
                    break;

                case 'new-file':
                case 'new-folder': {
                    if (!item) break;
                    const kind = action === 'new-folder' ? 'directory' : 'file';
                    const kindLabel = kind.charAt(0).toUpperCase() + kind.slice(1);
                    const name = await UI.showDialog({ title: `Create New ${kindLabel}`, hasInput: true, placeholder: `Enter ${kindLabel} name...` });

                    if (name) {
                        UI.showLoading(`Creating ${kindLabel}...`);
                        const parentUniquePath = getItemUniquePath(item);
                        if (kind === 'directory') State.expandedFolders.add(parentUniquePath);
                        
                        await FileSystemProvider.create(item, name, kind);
                        UI.showToast(`${kindLabel} '${name}' created.`, 'success');
                        
                        const parentWorkspaceId = item.workspaceId ?? item.id;
                        const workspace = State.workspaces.find(ws => ws.id === parentWorkspaceId);
                        if (!workspace) throw new Error("Could not find parent workspace.");
                        
                        await Workspaces.refreshNode(item);
                        
                        if (kind === 'file') {
                            const newPath = item.path === '/' ? `/${name}` : `${item.path}/${name}`;
                            const newFileItem = { ...workspace, name, path: newPath, kind: 'file', workspaceId: workspace.id, content: '' };
                            Tabs.create(newFileItem, true);
                        }
                    }
                    break;
                }
                
                case 'start-selection':
                    State.contextEvent = event; // Store the event for positioning the selection menu.
                    SelectionManager.start(item, State.contextEvent);
                    break;
        
                case 'copy-single': {
                    if (!item) break;
                    const uniquePath = getItemUniquePath(item);
                    State.fileClipboard = [uniquePath];
                    
                    const isCloneable = item.type === 'github' && item.path === '/';
                    const message = isCloneable
                        ? `Ready to clone "${item.repoInfo.repo}". Paste in a new location.`
                        : `Copied "${item.name}" to clipboard.`;
                    UI.showToast(message, 'success');
                    break;
                }
    
                case 'paste':
                    if (!item || item.kind !== 'directory') {
                         UI.showToast("Paste target must be a directory.", "warning");
                         return;
                    }
                    FileOperations.paste(item);
                    break;
                
                case 'delete-workspace': {
                    if (!item || item.path !== '/') break;
                    const confirmed = await UI.showDialog({ title: 'Remove Workspace', message: `Remove '${item.name}'? This does not delete any files.`, okText: 'Remove', cancelText: 'Cancel' });
                    if (confirmed) {
                        UI.showLoading('Removing workspace...');
                        const wsId = item.workspaceId ?? item.id;
                        const tabsToClose = State.tabs.filter(t => t.item.workspaceId === wsId);
                        for(const tab of tabsToClose) await Tabs.close(tab.id, true);
                        State.workspaces = State.workspaces.filter(ws => ws.id !== wsId);
                        
                        App.saveSession();
                        Workspaces.render();
                        UI.showToast(`Workspace removed.`, 'success');
                    }
                    break;
                }

                case 'delete': {
                    if (!item) break;
                    const confirmed = await UI.showDialog({ title: 'Confirm Deletion', message: `Are you sure you want to permanently delete '${item.name}'?`, okText: 'Delete', cancelText: 'Cancel' });
                    if (confirmed) {
                        UI.showLoading('Deleting...');
                        const tab = State.tabs.find(t => t.uniquePath === Tabs.getUniquePath(item));
                        if (tab) await Tabs.close(tab.id, true);
                        
                        await FileSystemProvider.delete(item);
                        UI.showToast(`'${item.name}' deleted.`, 'success');
                        
                        const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
                        const parentItem = { ...item, path: parentPath, kind: 'directory' };
                        await Workspaces.refreshNode(parentItem);
                    }
                    break;
                }
            }
        } catch(e) { 
            UI.showToast(`Error: ${e.message}`, 'error'); 
            console.error("Action failed:", action, e);
        } finally { 
            UI.hideLoading(); 
        }
    }
};
