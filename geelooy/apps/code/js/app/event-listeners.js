
// B"H
// FILE: js/app/event-listeners.js

import { State, DOM } from '../state.js';
import { UI } from '../ui.js';
import { Tabs } from '../tabs/index.js';
import { Menus } from '../menus.js';
import { FindReplace } from '../find-replace.js';
import { Editor } from '../editor.js';
import { SelectionManager } from '../selection-manager.js';
import { CustomMenu } from '../custom-menu.js';
import { Workspaces } from '../workspaces.js';
import { App } from '../app.js';
import { StatusBar } from '../statusbar.js';
import { TabManagerOverlay } from '../tab-manager-overlay.js';
import { FileCommander } from '../file-commander.js';
import { FileSystemProvider } from '../fs-provider.js';
import { WorkspaceAddition } from '../features/workspace-addition.js'; // B"H

export function setupEventListeners() {
    window.addEventListener('message', async (event) => {
        const { type, payload, requestId, error } = event.data;
        
        const handleFileRead = async (workspaceId, path) => {
            // B"H - Stream directly from Workspace (FileSystemProvider)
            // We do NOT check open tabs here, as requested. The Workspace is the source of truth.
            
            const workspace = State.workspaces.find(ws => String(ws.id) === String(workspaceId));
            if (!workspace) throw new Error(`Workspace ${workspaceId} not found`);
            
            const item = { ...workspace, path: path, kind: 'file' };
            let content = await FileSystemProvider.read(item);
            
            // Normalize Content for Transport
            if (content instanceof Blob) content = await content.text();
            else if (content && content.base64Content) content = atob(content.base64Content);
            
            return content;
        };

        // B"H - Unified Handler for Import/Worker Fetch
        if ((type === 'import-request' && event.data.source === 'html-preview-bridge') || 
            type === 'fetch-worker-script' || 
            type === 'fetch-script-content' ||
            (type === 'FETCH_REQ')) { 
            
            const { specifier, referrer, workspaceId, id, path } = event.data;
            const targetPath = specifier || path;
            
            try {
                let content;
                
                // B"H - System Asset Interception
                if (targetPath.includes('MerkavaExecutor') || targetPath.includes('merkava-sdk')) {
                    const cleanPath = targetPath.startsWith('/') ? targetPath : '/' + targetPath;
                    const response = await fetch(cleanPath);
                    if (!response.ok) throw new Error(`System Asset Not Found: ${cleanPath}`);
                    content = await response.text();
                } else {
                    // Workspace File Resolution
                    let absolutePath = targetPath;
                    
                    // B"H - ROBUST RELATIVE PATH RESOLUTION
                    // Handles 'register.js', './register.js', '../lib/script.js' relative to referrer
                    if (referrer && !targetPath.startsWith('/') && !targetPath.match(/^[a-z]+:/)) {
                        const referrerPath = referrer.startsWith('/') ? referrer : '/' + referrer;
                        // Use URL API for standard path resolution
                        // We use a dummy domain 'http://root' to allow the URL constructor to work
                        const baseUrl = new URL(referrerPath, 'http://root'); 
                        const resolvedUrl = new URL(targetPath, baseUrl);
                        absolutePath = resolvedUrl.pathname;
                        absolutePath = decodeURIComponent(absolutePath);
                    }
                    
                    // Ensure leading slash for workspace lookup consistency
                    if (!absolutePath.startsWith('/')) absolutePath = '/' + absolutePath;

                    content = await handleFileRead(workspaceId, absolutePath);
                }
                
                // Respond based on request type
                if (type === 'import-request') {
                    event.source.postMessage({ type: 'import-response', id, content }, '*');
                } else if (type === 'fetch-worker-script') {
                    event.source.postMessage({ type: 'worker-script-response', id, content }, '*');
                } else {
                    event.source.postMessage({ type: 'script-content-response', id, content, path: targetPath }, '*');
                }
            } catch (e) {
                const responseType = type === 'import-request' ? 'import-response' : 
                                     type === 'fetch-worker-script' ? 'worker-script-response' : 'script-content-response';
                // Only post back error if source exists
                if (event.source) {
                    event.source.postMessage({ type: responseType, id, error: e.toString() }, '*');
                }
            }
            return;
        }

        if (State.postMessagePendingRequests.has(requestId)) {
            const { resolve, reject } = State.postMessagePendingRequests.get(requestId);
            State.postMessagePendingRequests.delete(requestId);
            if (error) reject(new Error(error));
            else resolve(payload);
            return;
        }
        
        if (type === 'loadWorkspace') {
            const { name, path, type: wsType } = payload;
            const appContainer = document.querySelector('.app-container');
            const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
            const resizer = document.getElementById('sidebar-resizer');
            if (appContainer) appContainer.classList.remove('sidebar-collapsed');
            if (sidebarCollapseBtn) sidebarCollapseBtn.style.display = 'flex';
            if (resizer) resizer.style.display = 'block';
            Workspaces.add({ name, path, type: wsType }, true);
            return;
        }

        if (type === 'loadFile') {
            const appContainer = document.querySelector('.app-container');
            const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
            const resizer = document.getElementById('sidebar-resizer');
            var tb = document?.querySelector(".tab-bar");
            if (tb) tb.style.display = "none";
            if (appContainer) appContainer.classList.add('sidebar-collapsed');
            if (sidebarCollapseBtn) sidebarCollapseBtn.style.display = 'none';
            if (DOM.mobileSidebarToggle) DOM.mobileSidebarToggle.style.display = 'none';
            if (resizer) resizer.style.display = 'none';

             const { fileName, content, saveContext } = payload;
            const externalWorkspace = { name: `OS File`, type: 'postmessage' };
            Workspaces.add(externalWorkspace, false);
            const wsId = State.workspaces[State.workspaces.length - 1].id;
            const fileItem = {
                name: fileName, path: fileName, kind: 'file',
                type: 'postmessage', workspaceId: wsId,
                saveContext, _initialContent: content
            };
            await Tabs.create(fileItem, false, false);
            return;
        }
        if (type === 'registerMenus') {
            CustomMenu.createFromConfig(payload);
            return;
        }
    });

    if (DOM.viewConsoleBtn) {
        DOM.viewConsoleBtn.onclick = () => {
            const activeTab = State.tabs.find(t => t.id === State.activeTabId);
            if (activeTab && activeTab.fileType === 'html-preview') {
                Tabs.createConsole(activeTab);
            } else {
                UI.showToast("No active preview to attach console.", "error");
            }
        };
    }
    
    const fcBtnMain = document.getElementById('file-commander-btn');
    if (fcBtnMain) fcBtnMain.onclick = () => FileCommander.show();
    
    const fcBtnSidebar = document.getElementById('sidebar-file-commander-btn');
    if (fcBtnSidebar) fcBtnSidebar.onclick = () => FileCommander.show();

    const appContainer = document.querySelector('.app-container');
    const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');

    if (DOM.hamburgerMenuBtn) {
        DOM.hamburgerMenuBtn.onclick = (e) => {
            e.stopPropagation();
            Menus.showMainMenu(e);
        };
    }

    const toggleSidebar = (e) => {
        e.stopPropagation();
        if (appContainer.classList.contains('sidebar-collapsed')) {
            appContainer.classList.remove('sidebar-collapsed');
            const lastWidth = parseInt(localStorage.awtsmoosSidebarWidth, 10) || 300;
            appContainer.style.gridTemplateColumns = `${lastWidth}px 1fr`;
        } else {
            const sidebarRect = DOM.sidebar.getBoundingClientRect();
            if (sidebarRect.width > 0) {
                localStorage.awtsmoosSidebarWidth = sidebarRect.width;
            }
            appContainer.classList.add('sidebar-collapsed');
            appContainer.style.gridTemplateColumns = '';
        }
    };

    if (DOM.mobileSidebarToggle) DOM.mobileSidebarToggle.onclick = toggleSidebar;
    if (sidebarCollapseBtn) sidebarCollapseBtn.onclick = toggleSidebar;

    const resizer = document.getElementById('sidebar-resizer');

    if (resizer) {
        const minManualWidth = 50;
        const maxWidth = 800;

        const handleMove = (e) => {
            if (appContainer.classList.contains('sidebar-collapsed')) return;
            const clientX = e.clientX ?? e.touches?.[0]?.clientX;
            if (clientX === undefined) return;
            let newWidth = Math.max(minManualWidth, Math.min(clientX, maxWidth));
            appContainer.style.gridTemplateColumns = `${newWidth}px 1fr`;
            localStorage.awtsmoosSidebarWidth = newWidth;
        };

        const handleEnd = () => {
            document.body.classList.remove('is-resizing');
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
        };

        const handleStart = (e) => {
            e.preventDefault();
            document.body.classList.add('is-resizing');
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleMove);
            document.addEventListener('touchend', handleEnd);
        };

        resizer.addEventListener('mousedown', handleStart);
        resizer.addEventListener('touchstart', handleStart, { passive: false });
    }

    document.addEventListener('click', (e) => {
        if (State.isSelectionModeActive) {
            const isClickInsideSidebar = DOM.sidebar.contains(e.target);
            const isClickInsideSelectionMenu = DOM.selectionMenu.contains(e.target);
            if (!isClickInsideSidebar && !isClickInsideSelectionMenu) {
                SelectionManager.end();
            }
        }
    });

    DOM.editor.addEventListener('input', () => {
        if (State.isRestoring) return; 
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab) {
            if (!activeTab.isDirty) {
                activeTab.isDirty = true;
                Tabs.render();
            }
            activeTab.content = DOM.editor.value;
            App.saveSessionDebounced();
        }
        UI.updateLineNumbers();
    });

    DOM.editor.addEventListener('scroll', () => {
        UI.syncScroll();
        if (State.isRestoring) return;
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && !DOM.editorWrapper.classList.contains('hidden')) {
            activeTab.scrollPos = DOM.editor.scrollTop;
            App.saveSessionDebounced();
        }
    });

    DOM.editor.addEventListener('keyup', StatusBar.update);
    DOM.editor.addEventListener('click', StatusBar.update);
    new ResizeObserver(UI.updateLineNumbers).observe(DOM.editor);
    DOM.contextMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        const button = e.target.closest('button');
        if (button) Menus.handleAction(button.dataset.action);
    });
    DOM.mainMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        const button = e.target.closest('button');
        if (button && !button.disabled) Menus.handleAction(button.dataset.action);
    });
    
    // B"H - Updated Workspace Addition Logic
    DOM.addWorkspaceBtn.onclick = () => WorkspaceAddition.showDialog();
    
    window.addEventListener('keydown', (e) => {
        const hasModifier = e.ctrlKey || e.metaKey;
        if (hasModifier && e.key.toLowerCase() === 's') {
            e.preventDefault();
            Tabs.saveActive();
        }
        if (hasModifier && e.key.toLowerCase() === 'f') {
            e.preventDefault();
            const selectedText = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd);
            FindReplace.show(selectedText);
        }
        if (e.key === 'Escape') {
            if (State.isSelectionModeActive) {
                e.preventDefault();
                SelectionManager.end();
            } else if (DOM.genericDialog.classList.contains('visible')) {
                const cancelButton = DOM.genericDialog.querySelector('#dialog-cancel-btn');
                if (cancelButton) cancelButton.click();
                return;
            }
            
            if (!DOM.findReplacePanel.style.display || DOM.findReplacePanel.style.display === 'none') {
                 if (TabManagerOverlay.overlay && TabManagerOverlay.overlay.classList.contains('visible')) {
                     TabManagerOverlay.hide();
                 } else if (FileCommander.overlay && FileCommander.overlay.classList.contains('visible')) {
                     FileCommander.hide();
                 } else {
                     Menus.hideAll();
                 }
            } else {
                FindReplace.hide();
            }
        }
    });
    
    const handleTabInInputs = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const input = e.target;
            const start = input.selectionStart;
            const end = input.selectionEnd;
            input.setRangeText(App.getTabString(), start, end, 'end');
        }
    };
    DOM.findInput.addEventListener('keydown', handleTabInInputs);
    DOM.replaceInput.addEventListener('keydown', handleTabInInputs);
    
    DOM.editor.addEventListener('keydown', (e) => {
        if (FindReplace.isFindSelectionActive) {
            return;
        }
        if (e.key === 'Tab') {
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            const editor = DOM.editor;
            const fullText = editor.value;
            const cursorPosition = editor.selectionStart;
            const lineStartPos = fullText.substring(0, cursorPosition).lastIndexOf('\n') + 1;
            const currentLineText = fullText.substring(lineStartPos, cursorPosition);
            const leadingWhitespaceMatch = currentLineText.match(/^\s*/);
            const indent = leadingWhitespaceMatch ? leadingWhitespaceMatch[0] : '';
            const textToInsert = '\n' + indent;
            editor.setRangeText(textToInsert, cursorPosition, editor.selectionEnd, 'end');
            editor.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    
    DOM.keyboardHelper.addEventListener('click', (e) => {
        const button = e.target.closest('button.kh-btn');
        if (!button) return;
        const activeEditorInstance = Editor.currentHighlighter;
        if (!activeEditorInstance) return;
        const editor = DOM.editor;
        const key = button.dataset.key;
        const pair = button.dataset.pair;
        const start = editor.selectionStart; 
        const end = editor.selectionEnd;
        if (pair) {
            const [charStart, charEnd] = pair;
            const selectedText = editor.value.substring(start, end);
            const textToInsert = charStart + selectedText + charEnd;
            editor.setRangeText(textToInsert, start, end, 'select');
            if (start === end) {
                editor.selectionStart = editor.selectionEnd = start + 1;
            }
        } else if (key === 'tab') {
            activeEditorInstance.indentSelection();
        }
        editor.focus();
    });

    window.addEventListener('beforeunload', () => {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && !DOM.editorWrapper.classList.contains('hidden')) {
            activeTab.scrollPos = DOM.editor.scrollTop;
        }
        App.saveSession();
    });
}
