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

import {GitManager} from "./git-manager.js";

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

/*B"H*/

/**
 * Unfurls the context menu, a scroll of potential actions. This corrected version
 * properly identifies ANY writable local directory, even nested ones, as a candidate
 * for repository initialization, fulfilling the true potential of creation anywhere.
 * @param {Event} e - The contextmenu event, the spark of user intent.
 * @param {object} item - The file or folder item, a vessel of data upon which to act.
 */
show(e, item) {
    e.preventDefault();
    e.stopPropagation();

    if (State.isSelectionModeActive) return;
    
    State.contextTarget = item;
    this.hideAll();
    
    setTimeout(() => document.addEventListener('click', this.handleDocumentClick), 0);
    
    const mapKey = getItemUniquePath(item);
    const targetEl = State.domItemMap.get(mapKey)?.el;
    if (targetEl) targetEl.classList.add('context-active');

    const isDir = item.kind === 'directory';
    const isWorkspaceRoot = item.path === '/';
    const workspace = State.workspaces.find(ws => ws.id === (item.workspaceId || item.id));
    const isReadOnly = workspace?.readOnly || false;
    const isGitClone = item.isGitClone;

    // THIS IS THE KEY CHANGE: A folder is a candidate for initialization if it's a directory,
    // not part of a read-only workspace, and not part of a direct GitHub workspace view.
    const isCandidateForInit = isDir && !isReadOnly && item.type !== 'github';

    const menuItems = [];

    // --- Standard Actions ---
    menuItems.push({ label: `Copy "${item.name}"`, action: 'copy-single', icon: 'copy' });
    menuItems.push({ label: 'Select', action: 'start-selection', icon: 'select-all' });
    menuItems.push({ label: 'Copy All Contents', action: 'copy-all-contents', icon: 'clipboard' });
    menuItems.push({ isSeparator: true });

    // --- Git Actions (Conditional) ---
    if (isDir && !isReadOnly) {
        if (isGitClone) {
            menuItems.push({ label: 'Git Actions...', action: 'git-actions', icon: 'git-branch' });
        } else if (isCandidateForInit) {
            // Only show init if it's not already a git clone.
            menuItems.push({ label: 'Initialize as GitHub Repo...', action: 'git-init', icon: 'github' });
        }
    }

    // --- Mutable Actions (Conditional) ---
    if (!isReadOnly) {
        const clipboardItemUniquePath = State.fileClipboard?.[0];
        const clipboardItem = clipboardItemUniquePath ? State.domItemMap.get(clipboardItemUniquePath)?.item : null;
        if (isDir && clipboardItem) {
            menuItems.push({ isSeparator: true });
            menuItems.push({ label: `Paste item(s) here`, action: 'paste', icon: 'clipboard' });
        }
        
        if (isDir) {
            menuItems.push({ isSeparator: true });
            menuItems.push({ label: 'New File', action: 'new-file', icon: 'file' });
            menuItems.push({ label: 'New Folder', action: 'new-folder', icon: 'folder' });
        }
    }

    menuItems.push({ isSeparator: true });

    // --- Destructive/Final Actions ---
    if (!isReadOnly && !isWorkspaceRoot) {
        menuItems.push({ label: 'Delete', action: 'delete', icon: 'trash', danger: true });
    }
    if (isWorkspaceRoot) {
        menuItems.push({ label: 'Remove Workspace', action: 'delete-workspace', icon: 'x', danger: true });
    }
    
    menuItems.push({ isSeparator: true });
    menuItems.push({ label: 'Cancel', action: 'cancel-menu', icon: 'x' });
    
    DOM.contextMenu.innerHTML = menuItems.map(i => {
        if (i.isSeparator) return `<hr class="menu-separator">`;
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

/**
 * Unfurls the main application menu. This perfected version builds the menu
 * in distinct stages, using a single, clear conditional block to ensure that
 * mutable actions like "Save" and "Commit" VANISH COMPLETELY when the
 * active file is in a read-only workspace.
 * @param {Event} e - The click event.
 */
showMainMenu(e) {
    e.stopPropagation();
    if (DOM.mainMenu.style.display === 'block') {
        this.hideAll();
        return;
    }
    this.hideAll();
    setTimeout(() => document.addEventListener('click', this.handleDocumentClick), 0);

    const activeTab = State.tabs.find(t => t.id === State.activeTabId);
    let isReadOnly = true; // Default to read-only for safety if no tab is active.
    let isGitHubWorkspace = false;
    let hasUncommittedChanges = false;
    const hasSelection = activeTab && (DOM.editor.selectionStart !== DOM.editor.selectionEnd);
    
    let totalChanges = 0;

    if (activeTab) {
        const workspace = State.workspaces.find(ws => ws.id === activeTab.item.workspaceId);
        isReadOnly = workspace?.readOnly || false; // The crucial check.

        if (activeTab.item.type === 'github') {
            isGitHubWorkspace = true;
            const dirtyFiles = State.tabs.filter(t => t.item.workspaceId === activeTab.item.workspaceId && t.isDirty);
            const uncommittedFiles = State.tabs.filter(t => t.item.workspaceId === activeTab.item.workspaceId && t.isUncommitted);
            totalChanges = dirtyFiles.length + uncommittedFiles.length;
            
            
            
        
        
        }
    }
    
    // --- Stage 1: Define universal, non-mutable starting actions ---
    const menuItems = [
        { label: 'New File', action: 'new-temp-file', icon: 'file' },
        { label: 'Open File...', action: 'open-file', icon: 'folder' },
    ];

    // --- Stage 2: The Chamber of Creation (Only enter if not read-only) ---
    // If the realm is mutable, we reveal the tools of creation and finalization.
    if (!isReadOnly) {
        menuItems.push({ isSeparator: true });
        menuItems.push({ label: 'Save', action: 'save', icon: 'save', disabled: !activeTab || !activeTab.isDirty });
        
        if (isGitHubWorkspace) {
            menuItems.push({
            label: 'Commit All Changes', action: 'commit-changes', 
            icon: 'git-branch', disabled: totalChanges === 0  });
        }
    }

    // --- Stage 3: Universal tools of observation and transport ---
    menuItems.push(
        { isSeparator: true },
        { label: 'Download', action: 'download', icon: 'download', disabled: !activeTab }
    );
    
    if (activeTab && (activeTab.item.name.toLowerCase().endsWith('.html') || activeTab.item.name.toLowerCase().endsWith('.htm'))) {
        menuItems.push({ label: 'Preview HTML', action: 'view-html', icon: 'eye' });
    }
    if (activeTab && (activeTab.item.name.toLowerCase().endsWith('.json') || activeTab.item.name.toLowerCase().endsWith('.awtsmoosjson')) && !activeTab.isHexView) {
	    menuItems.push({ label: activeTab.isAltarView ? 'Reconstitute to Text' : 'Transmute to Altar', action: 'toggle-altar-view', icon: 'brain-circuit' });
	}
    if (activeTab && activeTab.item.name.toLowerCase().endsWith('.awtsmoosjson')) {
	    menuItems.push({ label: activeTab.isHexView ? 'View as JSON' : 'View as Hex', action: 'toggle-awtsmoos-view', icon: activeTab.isHexView ? 'eye' : 'brain-circuit' });
	}
    
    // --- Stage 4: The final set of universal editor utilities ---
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

    // --- Final Rendering ---
    DOM.mainMenu.innerHTML = menuItems.map(i => {
        if (i.isSeparator) return `<hr class="menu-separator">`;
        return `<button class="menu-button" data-action="${i.action}" ${i.disabled ? 'disabled' : ''}>
                <svg class="svg-icon"><use href="#icon-${i.icon}"/></svg> ${i.label}
            </button>`;
    }).join('');

    const btnRect = DOM.hamburgerMenuBtn.getBoundingClientRect();
    this.positionAndDisplay(DOM.mainMenu, { clientX: btnRect.left, clientY: btnRect.bottom + 5 });
},
    

    /*B"H*/

/**
 * Hides all menus and performs a complete cleansing of the temporary context state,
 * returning the application to a pure and ready state.
 */
hideAll() {
    DOM.contextMenu.style.display = 'none';
    DOM.mainMenu.style.display = 'none';
    document.querySelectorAll('.context-active').forEach(el => el.classList.remove('context-active'));
    document.removeEventListener('click', this.handleDocumentClick);
    
    // The cleansing: We now explicitly return the context state to the void,
    // preventing any stale data from haunting future actions.
    State.contextTarget = null;
    State.contextEvent = null;
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
// ACTION: Replace the 'handleAction' method in js/menus.js with this one.

/**
 * The central nexus for all user intentions. It receives an action and
 * dispatches it to the appropriate module, turning intent into reality.
 * It now understands the call to initialize a repository.
 * @param {string} action - The `data-action` attribute from the clicked button.
 */
async handleAction(action) {
    const item = State.contextTarget;
    
    
    const activeTab = State?.tabs?.find?.(t => t?.id === State?.activeTabId);
    
    try {
        switch (action) {
            
            case 'git-init':
                
                if (item) GitManager.initializeRepository(item);
                break;
            case 'cancel-menu':
                // This action requires no action; its purpose was fulfilled by `hideAll()`.
                break;

            // --- Existing Main Menu Actions ---
            case 'commit-changes': App.commitAllChanges(); break;
            case 'new-temp-file': Tabs.createTemporary(); break;
            case 'open-file': App.openLocalFile(); break;
            case 'save': Tabs.saveActive(); break;
            case 'download': Tabs.downloadActive(); break;
            case 'toggle-awtsmoos-view':
                if (activeTab) {
                    activeTab.isHexView = !activeTab.isHexView;
                    activeTab.forceReload = true;
                    Tabs.activate(activeTab.id);
                }
                break;
            case 'view-html':
                 if (activeTab) {
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
                    } finally {
                        UI.hideLoading();
                    }
                }
                break;
            case 'find-replace': FindReplace.show(); break;
            case 'settings': App.showSettings(); break;
            case 'toggle-keyboard-helper': DOM.keyboardHelper.classList.toggle('is-visible'); break;
            case 'toggle-fullscreen': App.toggleFullscreen(); break;
            case 'toggle-altar-view':
                if (activeTab) {
                    activeTab.isAltarView = !activeTab.isAltarView;
                    Tabs.activate(activeTab.id, true);
                }
                break;

            
            case 'select-all': if (activeTab) DOM.editor.select(); break;
            case 'copy':
                const selectedText = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd);
                if (selectedText) {
                    await Clipboard.write(selectedText);
                    UI.showToast('Selection copied!', 'success');
                }
                break;
            case 'copy-all':
                if (activeTab && DOM.editor.value) {
                    await Clipboard.write(DOM.editor.value);
                    UI.showToast('All content copied!', 'success');
                }
                break;
            case 'copy-all-contents': if (item) FileOperations.copyAllContents([item]); break;
            case 'new-file':
            case 'new-folder':
                if (item) {
                    const kind = action === 'new-folder' ? 'directory' : 'file';
                    const name = await UI.showDialog({ title: `Create New ${kind}`, hasInput: true, placeholder: `Enter ${kind} name...` });
                    if (name) {
                        await FileSystemProvider.create(item, name, kind);
                        UI.showToast(`${kind} '${name}' created.`, 'success');
                        await Workspaces.refreshNode(item);
                        if (kind === 'file') {
                            const newPath = item.path === '/' ? `/${name}` : `${item.path}/${name}`;
                            Tabs.create({ ...item, name, path: newPath, kind: 'file' });
                        }
                    }
                }
                break;
            case 'start-selection':
    // This action is now pure. It no longer knows or cares about an 'event'.
    // It simply commands the SelectionManager to begin its work on the chosen 'item'.
    SelectionManager.start(item);
    break;
            
            case 'copy-single':
                if (item) {
                    State.fileClipboard = [getItemUniquePath(item)];
                    UI.showToast(`Copied "${item.name}" to clipboard.`, 'success');
                }
                break;
            case 'paste':
                if (item && item.kind === 'directory') FileOperations.paste(item);
                else UI.showToast("Paste target must be a directory.", "warning");
                break;
            case 'delete-workspace':
                if (item && item.path === '/') {
                    const confirmed = await UI.showDialog({ title: 'Remove Workspace', message: `Remove '${item.name}'?`, okText: 'Remove' });
                    if (confirmed) {
                        Workspaces.remove(item.id || item.workspaceId);
                        UI.showToast(`Workspace removed.`, 'success');
                    }
                }
                break;
            case 'delete':
                if (item) {
                    const confirmed = await UI.showDialog({ title: 'Confirm Deletion', message: `Delete '${item.name}'?`, okText: 'Delete' });
                    if (confirmed) {
                        const tab = State.tabs.find(t => t.uniquePath === Tabs.getUniquePath(item));
                        if (tab) await Tabs.close(tab.id, true);
                        await FileSystemProvider.delete(item);
                        const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
                        await Workspaces.refreshNode({ ...item, path: parentPath, kind: 'directory' });
                        UI.showToast(`'${item.name}' deleted.`, 'success');
                    }
                }
                break;
        }
    } catch(e) { 
        UI.showToast(`Error: ${e.message}`, 'error'); 
        console.error("Action failed:", action, e);
    } finally { 
        UI.hideLoading(); 
        this.hideAll(); // The first act is always to return to a state of calm.
    
    }
}
};
