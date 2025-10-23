// B"H
// FILE: js/menus.js
// B"H - IN: js/menus.js
import { SelectionManager } from './selection-manager.js';
import { getItemUniquePath } from './workspaces.js'; // Use the new export

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { App } from './app.js';
import { Tabs } from './tabs.js';
import { Workspaces } from './workspaces.js';
import { FindReplace } from './find-replace.js';
import { Clipboard } from './clipboard.js';
import { FileSystemProvider } from './fs-provider.js';
import { Editor } from './editor.js';
import { processHtmlForPreview, attachWorkerRequestHandler, detachWorkerRequestHandler } from './html-preview-processor.js';

import { FileOperations } from './file-operations.js';

export const Menus = {
    handleDocumentClick: (e) => {
        if (!DOM.contextMenu.contains(e.target) && !DOM.mainMenu.contains(e.target)) {
            Menus.hideAll();
        }
    },
    // B"H
// FILE: js/menus.js

// REPLACE your existing show function with this one.
    show(e, item) {
        e.preventDefault(); 
        if (State.isSelectionModeActive) {
            e.preventDefault(); e.stopPropagation(); return;
        }
        e.stopPropagation();
        State.contextTarget = item;
        this.hideAll();
        setTimeout(() => document.addEventListener('click', this.handleDocumentClick), 0);
        
        const mapKey = getItemUniquePath(item);
        const targetEl = State.domItemMap.get(mapKey)?.el;
        if(targetEl) targetEl.classList.add('context-active');

        const isDir = item.kind === 'directory';
        const isWorkspaceRoot = item.path === '/';
        const isGithubRepoRoot = item.type === 'github' && isWorkspaceRoot;

        // --- NEW: Smart Menu Logic ---
        const menuItems = [];

        // 1. Smart Copy Button
        if (isGithubRepoRoot) {
            menuItems.push({ label: `Copy / Clone "${item.repoInfo.repo}"`, action: 'copy-single', icon: 'copy' });
        } else {
            menuItems.push({ label: `Copy "${item.name}"`, action: 'copy-single', icon: 'copy' });
        }
        
        menuItems.push({ label: 'Select', action: 'start-selection', icon: 'select-all' });
        menuItems.push({ isSeparator: true });

        // 2. Smart Paste Button
        const clipboardItemUniquePath = State.fileClipboard?.[0];
        const clipboardItem = clipboardItemUniquePath ? State.domItemMap.get(clipboardItemUniquePath)?.item : null;
        if (isDir && clipboardItem) {
            if (clipboardItem.type === 'github' && clipboardItem.path === '/') {
                menuItems.push({ label: `Paste / Clone "${clipboardItem.repoInfo.repo}" here`, action: 'paste', icon: 'download' }); // Use a download/clone icon
            } else {
                menuItems.push({ label: `Paste item(s) here`, action: 'paste', icon: 'clipboard' });
            }
            menuItems.push({ isSeparator: true });
        }
        
        // 3. Standard Buttons (your existing logic)
        if (isDir) {
            menuItems.push({ label: 'New File', action: 'new-file', icon: 'file' });
            menuItems.push({ label: 'New Folder', action: 'new-folder', icon: 'folder' });
            menuItems.push({ isSeparator: true });
        }

        if (!isWorkspaceRoot) {
            menuItems.push({ label: 'Delete', action: 'delete', icon: 'x', danger: true });
        } else {
            menuItems.push({ label: 'Remove Workspace', action: 'delete-workspace', icon: 'x', danger: true });
        }

        DOM.contextMenu.innerHTML = menuItems.filter(Boolean).map(i => i.isSeparator ? `<hr class="menu-separator">` :
            `<button class="menu-button" data-action="${i.action}" ${i.danger ? 'style="color: var(--color-accent-danger);"' : ''}>
                <svg class="svg-icon"><use href="#icon-${i.icon}"/></svg> ${i.label}
             </button>`
        ).join('');
        this.positionAndDisplay(DOM.contextMenu, e);
    },
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
        DOM.mainMenu.innerHTML = menuItems.map(i => i.isSeparator ? `<hr class="menu-separator">` :
            `<button class="menu-button" data-action="${i.action}" ${i.disabled ? 'disabled' : ''}>
                <svg class="svg-icon"><use href="#icon-${i.icon}"/></svg> ${i.label}
             </button>`
        ).join('');
        const btnRect = DOM.hamburgerMenuBtn.getBoundingClientRect();
        this.positionAndDisplay(DOM.mainMenu, { clientX: btnRect.left, clientY: btnRect.bottom + 5 });
    },
    hideAll() {
        DOM.contextMenu.style.display = 'none';
        DOM.mainMenu.style.display = 'none';
        document.querySelectorAll('.context-active').forEach(el => el.classList.remove('context-active'));
        document.removeEventListener('click', this.handleDocumentClick);
    },
    
    // B"H
// FILE: js/menus.js
// ACTION: Replace the entire positionAndDisplay function with this one.

positionAndDisplay(menu, coords) {
    const { clientX: x, clientY: y } = coords;

    // --- Step 1: Hide the menu and move it off-screen to measure it ---
    // This prevents any flicker while the browser calculates its size.
    menu.style.left = '-9999px';
    menu.style.top = '-9999px';
    menu.style.display = 'block'; 
    const menuRect = menu.getBoundingClientRect(); // Get its true width and height

    // --- Step 2: Calculate Horizontal Position ---
    // This logic is already good and remains the same.
    const adjustedX = (x + menuRect.width > window.innerWidth)
        ? window.innerWidth - menuRect.width - 5 // If off-screen right, align to right edge
        : x;                                       // Otherwise, align to cursor

    // --- Step 3: THE NEW, SMARTER VERTICAL POSITIONING ---
    let adjustedY;
    if (y + menuRect.height > window.innerHeight) {
        // CASE A: NOT enough space below the cursor.
        // So, we FLIP the menu to appear ABOVE the cursor.
        // The top of the menu will be the cursor's Y position MINUS the menu's height.
        adjustedY = y - menuRect.height;
        
        // Add a safety check to prevent it from going off the TOP of the screen
        // if the menu is very tall or the click is very high.
        if (adjustedY < 0) {
            adjustedY = 5; // Position it 5px from the top edge as a last resort.
        }
    } else {
        // CASE B: PLENTY of space below the cursor.
        // This is the default, normal behavior.
        // The top of the menu aligns with the cursor's Y position.
        adjustedY = y;
    }

    // --- Step 4: Apply the final, calculated positions ---
    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;
},

    async handleAction(action) {
        const item = State.contextTarget;
        this.hideAll();
        

        try {
            switch(action) {
                case 'new-temp-file': Tabs.createTemporary(); break;
                case 'open-file': App.openLocalFile(); break;
                case 'save': Tabs.saveActive(); break;
                case 'download': Tabs.downloadActive(); break;
                
                case 'view-html': {
                    const activeTab = State.tabs.find(t => t.id === State.activeTabId);
                    if (!activeTab) break;
                    UI.showLoading("Processing HTML for preview...");
                    const content = Editor.getContent();
                    
                    detachWorkerRequestHandler();
                    attachWorkerRequestHandler(activeTab.item);
                    
                    try {
                        const processedContent = await processHtmlForPreview(content, activeTab.item);
                        Tabs.createPreview(activeTab.item, processedContent);
                    } catch (e) {
                        UI.showToast("Failed to process HTML.", "error");
                        console.error(e);
                        detachWorkerRequestHandler();
                    } finally {
                        UI.hideLoading();
                    }
                    break;
                }
                
                case 'find-replace': FindReplace.show(); break;
                case 'settings': App.showSettings(); break;
                case 'toggle-keyboard-helper': DOM.keyboardHelper.classList.toggle('is-visible'); break;
                
                case 'toggle-fullscreen':
                App.toggleFullscreen()
                
                
                break;
                
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
                // B"H
// FILE: js/menus.js (inside handleAction)

                case 'new-file':
                case 'new-folder': {
                    if (!item) break;
                    
                    // --- THE FIX IS HERE ---
                    // We now correctly translate the action into the 'kind' that the FileSystemProvider expects.
                    const kind = action === 'new-folder' ? 'directory' : 'file';
                    const kindLabel = kind === 'directory' ? 'Folder' : 'File';
                    // --- END FIX ---

                    const name = await UI.showDialog({ title: `Create New ${kindLabel}`, hasInput: true, placeholder: `Enter ${kindLabel} name...` });
                    if (name) {
                        UI.showLoading(`Creating ${kindLabel}...`);
                        const parentUniquePath = getItemUniquePath(item);
                        if (kind === 'directory') { // This check now works correctly
                            State.expandedFolders.add(parentUniquePath);
                        }
                        await FileSystemProvider.create(item, name, kind); // This now passes the correct 'kind'
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
        // We pass the event `e` to position the new menu correctly
        SelectionManager.start(item, State.contextEvent); // We need to store 'e' in state.
        break;
        
        /*
        case 'copy-single': {
        if (!item) break;
        // The item is the one that was right-clicked (State.contextTarget)
        const uniquePath = getItemUniquePath(item);
        State.fileClipboard = [uniquePath]; // Clipboard now contains just this one item
        UI.showToast(`Copied "${item.name}" to clipboard.`, 'success');
        break;
    }*/
    
    
    case 'copy-single': {
                    if (!item) break;
                    // It simply puts the right-clicked item's reference onto the clipboard.
                    const uniquePath = getItemUniquePath(item);
                    State.fileClipboard = [uniquePath]; 
                    
                    // The menu already displays the correct "Copy / Clone" label.
                    // This toast confirms the action.
                    if (item.type === 'github' && item.path === '/') {
                        UI.showToast(`Ready to clone "${item.repoInfo.repo}". Paste in a new location.`, 'success');
                    } else {
                        UI.showToast(`Copied "${item.name}" to clipboard.`, 'success');
                    }
                    break;
                }
                
    case 'paste':
    
    
                // You have all this great safety logic already. Keep it.
                if (!FileOperations) {
                    UI.showToast("CRITICAL: FileOperations is not loaded.", 'error');
                    return;
                }
                if (!item || item.kind !== 'directory') {
                     UI.showToast("Target is not a directory.", "warning");
                     return;
                }
    
        FileOperations.paste(item); // This will call the advanced paste logic
        break;
                
                
                case 'delete-workspace': {
                    if (!item || item.path !== '/') break;
                    const confirmed = await UI.showDialog({ title: 'Remove Workspace', message: `Remove '${item.name}'? This does not delete files.`, okText: 'Remove', cancelText: 'Cancel' });
                    if(confirmed) {
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
                    const confirmed = await UI.showDialog({ title: 'Confirm Deletion', message: `Permanently delete '${item.name}'?`, okText: 'Delete', cancelText: 'Cancel' });
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
        } catch(e) { UI.showToast(`Error: ${e.message}`, 'error'); } 
          finally { UI.hideLoading(); }
          
          
          
          

// Example of how to use it (e.g., attach it to a button click):
// document.getElementById('toggleButton').addEventListener('click', toggleFullscreen);
    }
};