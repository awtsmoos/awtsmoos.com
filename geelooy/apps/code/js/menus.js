// B"H
// FILE: js/menus.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { App } from './app.js';
import { Tabs } from './tabs.js';
import { Workspaces } from './workspaces.js';
import { FindReplace } from './find-replace.js';
import { Clipboard } from './clipboard.js';
import { FileSystemProvider } from './fs-provider.js';
import { Editor } from './editor.js';

const getItemUniquePath = (item) => `${item.workspaceId ?? item.id}::${item.path ?? '/'}`;

function resolveRelativePath(basePath, relativePath) {
    if (!basePath) return relativePath;
    const baseDirectory = basePath.substring(0, basePath.lastIndexOf('/'));
    const pathParts = (baseDirectory + '/' + relativePath).split('/');
    const resolvedParts = [];
    for (const part of pathParts) {
        if (part === '.' || part === '') continue;
        if (part === '..') {
            resolvedParts.pop();
        } else {
            resolvedParts.push(part);
        }
    }
    return resolvedParts.join('/');
}

// --- B"H: REWRITTEN HTML PRE-PROCESSOR WITH ADVANCED WORKER & IMPORTSCRIPTS INTERCEPTION ---
async function processHtmlForPreview(htmlContent, baseItem) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return htmlContent;

    // --- Part A: The Interceptor Script (injected into the iframe's <head>) ---
    // This script redefines `window.Worker` before any other code runs.
    const workerInterceptorScript = `
        (function() {
            const OriginalWorker = window.Worker;
            window.pendingWorkers = new Map(); // Global map to track promises
            let requestIdCounter = 0;

            // Listens for responses FROM the main editor window
            window.addEventListener('message', (event) => {
                const { type, id, blobUrl, error } = event.data;
                if (type === 'worker-script-response' && window.pendingWorkers.has(id)) {
                    const { resolve, reject, sab } = window.pendingWorkers.get(id);
                    window.pendingWorkers.delete(id);
                    if (error) {
                        console.error('Editor failed to load worker script:', error);
                        reject(new Error(error));
                        return;
                    }
                    // Create the REAL worker with the Blob URL and give it the SharedArrayBuffer
                    const realWorker = new OriginalWorker(blobUrl, { type: 'module' });
                    realWorker.postMessage({ type: 'init-sync', sab });
                    resolve(realWorker);
                }
            });

            // Redefine the Worker constructor
            window.Worker = function(path, options) {
                if (/^(?:[a-z]+:|\\/|blob:)/.test(path)) {
                    return new OriginalWorker(path, options);
                }
                return new Promise((resolve, reject) => {
                    const requestId = requestIdCounter++;
                    const sab = new SharedArrayBuffer(4); // 4 bytes for one Int32
                    window.pendingWorkers.set(requestId, { resolve, reject, sab });
                    // Ask the editor to fetch the worker script for us
                    window.parent.postMessage({ type: 'fetch-worker-script', path, id: requestId, sab }, '*');
                });
            };
        })();
    `;

    // --- Part B: The Polyfill Script (injected into the actual worker code) ---
    // This script redefines `self.importScripts` inside the worker.
    const importScriptsPolyfill = (workerPath) => `
        let sab, int32;
        const scriptCache = new Map();
        const workerBasePath = '${workerPath}'; // The worker's own path, for resolving its imports

        self.addEventListener('message', (event) => {
            if (event.data.type === 'init-sync') {
                sab = event.data.sab;
                int32 = new Int32Array(sab);
            }
            if (event.data.type === 'import-scripts-response') {
                scriptCache.set(event.data.path, event.data.content);
                Atomics.store(int32, 0, 1); // Signal that the script is ready
                Atomics.notify(int32, 0);   // Wake up the worker
            }
        });

        self.importScripts = (...paths) => {
            if (!sab) {
                console.error('Sync mechanism not initialized for importScripts.');
                return;
            }
            for (const relativePath of paths) {
                // Ask the editor for the script content
                self.postMessage({ type: 'import-scripts-request', path: relativePath, basePath: workerBasePath });
                // Synchronously block the worker until the editor responds
                const result = Atomics.wait(int32, 0, 0, 5000); // Wait for flag at index 0 to be 0, with a 5s timeout
                
                if (result === 'timed-out') {
                    console.error('Timed out waiting for importScripts:', relativePath);
                    continue;
                }

                Atomics.store(int32, 0, 0); // Reset the flag

                if (scriptCache.has(relativePath)) {
                    const content = scriptCache.get(relativePath);
                    scriptCache.delete(relativePath);
                    // This is safer than eval(). It executes the script in the worker's global scope.
                    try {
                        self.eval(content);
                    } catch (e) {
                        console.error('Error executing imported script:', relativePath, e);
                        throw e; // Re-throw to halt the worker as native importScripts would
                    }
                } else {
                    throw new Error('Failed to load script for importScripts: ' + relativePath);
                }
            }
        };
    `;

    // --- Part C: The Message Handler (lives on the main editor window) ---
    // We create a single, unified handler for all requests from the iframe.
    window.handleWorkerRequest = async (event, baseItem) => {
        const { type, path: relativePath, id, sab, basePath } = event.data;
        const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
        if (!workspace) return;

        // The iframe wants the main worker script
        if (type === 'fetch-worker-script') {
            const resolvedPath = resolveRelativePath(baseItem.path, relativePath);
            try {
                const assetItem = { ...workspace, path: resolvedPath, name: resolvedPath.split('/').pop() };
                if (workspace.type === 'github') {
                    const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                    assetItem.sha = fileMeta.sha;
                }
                let scriptContent = await FileSystemProvider.read(assetItem);
                if (scriptContent instanceof Blob) scriptContent = await scriptContent.text();
                else if (scriptContent.isBinary) scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);
                
                // Prepend the importScripts polyfill to the worker's code
                const finalContent = importScriptsPolyfill(resolvedPath) + '\n\n' + scriptContent;
                const blob = new Blob([finalContent], { type: 'application/javascript' });
                const blobUrl = URL.createObjectURL(blob);
                event.source.postMessage({ type: 'worker-script-response', id, blobUrl }, '*');
            } catch (e) {
                event.source.postMessage({ type: 'worker-script-response', id, error: e.message }, '*');
            }
        } 
        // A worker wants to import another script
        else if (type === 'import-scripts-request') {
            const resolvedPath = resolveRelativePath(basePath, relativePath);
            try {
                const assetItem = { ...workspace, path: resolvedPath, name: resolvedPath.split('/').pop() };
                 if (workspace.type === 'github') {
                    const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                    assetItem.sha = fileMeta.sha;
                }
                let scriptContent = await FileSystemProvider.read(assetItem);
                if (scriptContent instanceof Blob) scriptContent = await scriptContent.text();
                else if (scriptContent.isBinary) scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);
                
                // Send the content back and notify the worker to wake up
                event.source.postMessage({ type: 'import-scripts-response', path: relativePath, content: scriptContent }, '*');
            } catch (e) {
                console.error(`Failed to fetch script for importScripts '${relativePath}':`, e);
                event.source.postMessage({ type: 'import-scripts-response', path: relativePath, content: null }, '*');
            }
        }
    };

    // --- Part D: Inject the interceptor into the document head ---
    const interceptorElement = doc.createElement('script');
    interceptorElement.textContent = workerInterceptorScript;
    if (doc.head) doc.head.prepend(interceptorElement);
    else doc.documentElement.prepend(interceptorElement);

    // --- Part E: Inline CSS and external non-worker scripts (unchanged) ---
    const assetPromises = Array.from(doc.querySelectorAll('link[rel="stylesheet"][href], script[src]'))
        .filter(el => !/^(?:[a-z]+:|\/)/.test(el.getAttribute('href') || el.getAttribute('src')))
        .map(async (el) => {
            const isLink = el.tagName === 'LINK';
            const pathAttr = isLink ? 'href' : 'src';
            const relativePath = el.getAttribute(pathAttr);
            const resolvedPath = resolveRelativePath(baseItem.path, relativePath);
            try {
                const assetItem = { ...workspace, path: resolvedPath, name: resolvedPath.split('/').pop() };
                 if (workspace.type === 'github') {
                    const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                    assetItem.sha = fileMeta.sha;
                }
                let content = await FileSystemProvider.read(assetItem);
                if (content instanceof Blob) content = await content.text();
                else if (content.isBinary) content = FileSystemProvider.GitHub.b64_to_utf8(content.base64Content);
                if (isLink) {
                    const style = doc.createElement('style');
                    style.textContent = content;
                    el.parentNode.replaceChild(style, el);
                } else {
                    el.removeAttribute('src');
                    el.textContent = content;
                }
            } catch (e) { console.error(`Could not inline asset: ${resolvedPath}`, e); }
        });
    await Promise.all(assetPromises);

    return doc.documentElement.outerHTML;
}


export const Menus = {
    handleDocumentClick: (e) => {
        if (!DOM.contextMenu.contains(e.target) && !DOM.mainMenu.contains(e.target)) {
            Menus.hideAll();
        }
    },
    show(e, item) {
        e.preventDefault(); 
        e.stopPropagation();
        State.contextTarget = item;
        this.hideAll();
        setTimeout(() => document.addEventListener('click', this.handleDocumentClick), 0);
        const mapKey = getItemUniquePath(item);
        const targetEl = State.domItemMap.get(mapKey)?.el;
        if(targetEl) targetEl.classList.add('context-active');
        const isDir = item.kind === 'directory';
        const isWorkspaceRoot = item.path === '/';
        const menuItems = [
            isDir ? { label: 'New File', action: 'new-file', icon: 'file' } : null,
            isDir ? { label: 'New Folder', action: 'new-folder', icon: 'folder' } : null,
            isDir ? { isSeparator: true } : null,
            !isWorkspaceRoot ? { label: 'Delete', action: 'delete', icon: 'x', danger: true } : null,
            isWorkspaceRoot ? { label: 'Remove Workspace', action: 'delete-workspace', icon: 'x', danger: true } : null
        ].filter(Boolean);
        DOM.contextMenu.innerHTML = menuItems.map(i => i.isSeparator ? `<hr class="menu-separator">` :
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
    positionAndDisplay(menu, coords) {
        const { clientX: x, clientY: y } = coords;
        menu.style.display = 'block';
        const menuRect = menu.getBoundingClientRect();
        const adjustedX = (x + menuRect.width > window.innerWidth) ? window.innerWidth - menuRect.width - 5 : x;
        const adjustedY = (y + menuRect.height > window.innerHeight) ? window.innerHeight - menuRect.height - 5 : y;
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
                    
                    if (window.currentWorkerRequestHandler) {
                        window.removeEventListener('message', window.currentWorkerRequestHandler);
                    }
                    window.currentWorkerRequestHandler = (event) => window.handleWorkerRequest(event, activeTab.item);
                    
                    try {
                        window.addEventListener('message', window.currentWorkerRequestHandler);
                        const processedContent = await processHtmlForPreview(content, activeTab.item);
                        Tabs.createPreview(activeTab.item, processedContent, window.currentWorkerRequestHandler);
                    } catch (e) {
                        UI.showToast("Failed to process HTML.", "error");
                        console.error(e);
                        window.removeEventListener('message', window.currentWorkerRequestHandler);
                    } finally {
                        UI.hideLoading();
                    }
                    break;
                }
                
                case 'find-replace': FindReplace.show(); break;
                case 'settings': App.showSettings(); break;
                case 'toggle-keyboard-helper': DOM.keyboardHelper.classList.toggle('is-visible'); break;
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
                case 'new-file':
                case 'new-folder': {
                    if (!item) break;
                    const kind = action.split('-')[1];
                    const name = await UI.showDialog({ title: `Create New ${kind}`, hasInput: true, placeholder: `Enter ${kind} name...` });
                    if (name) {
                        UI.showLoading(`Creating ${kind}...`);
                        const parentUniquePath = getItemUniquePath(item);
                        if (kind === 'folder') {
                            State.expandedFolders.add(parentUniquePath);
                        }
                        await FileSystemProvider.create(item, name, kind);
                        UI.showToast(`${kind} '${name}' created.`, 'success');
                        const parentWorkspaceId = item.workspaceId ?? item.id;
                        const workspace = State.workspaces.find(ws => ws.id === parentWorkspaceId);
                        if (!workspace) throw new Error("Could not find parent workspace.");
                        await Workspaces.refreshNode(item);
                        if (kind === 'file') {
                            const newPath = item.path === '/' ? name : `${item.path}/${name}`;
                            const newFileItem = { ...workspace, name, path: newPath, kind: 'file', workspaceId: workspace.id, content: '' };
                            Tabs.create(newFileItem, true);
                        }
                    }
                    break;
                }
                case 'delete-workspace': {
                    if (!item || item.path !== '/') break;
                    const confirmed = await UI.showDialog({ title: 'Remove Workspace', message: `Remove '${item.name}'? This does not delete files.`, okText: 'Remove', cancelText: 'Cancel' });
                    if(confirmed) {
                        UI.showLoading('Removing workspace...');
                        const wsId = item.workspaceId ?? item.id;
                        const tabsToClose = State.tabs.filter(t => t.item.workspaceId === wsId);
                        for(const tab of tabsToClose) await Tabs.close(tab.id, true);
                        State.workspaces = State.workspaces.filter(ws => ws.id !== wsId);
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
    }
};