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

// --- B"H: REWRITTEN HTML PRE-PROCESSOR ---
/**
 * Inlines CSS/Scripts and injects a Worker interceptor script.
 * @param {string} htmlContent - The raw HTML from the editor.
 * @returns {Promise<string>} A promise that resolves to the processed HTML string.
 */
async function processHtmlForPreview(htmlContent, baseItem) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return htmlContent;

    // --- Step 1: Create the powerful Worker Interceptor Script ---
    const interceptorScriptContent = `
        (function() {
            const OriginalWorker = window.Worker;
            const pendingWorkers = new Map();
            let workerIdCounter = 0;

            // This listener waits for the main editor to send back the Blob URL
            window.addEventListener('message', (event) => {
                const { type, id, blobUrl, error } = event.data;
                if (type === 'worker-script-response' && pendingWorkers.has(id)) {
                    const { proxy, options } = pendingWorkers.get(id);
                    pendingWorkers.delete(id);
                    if (error) {
                        console.error('Failed to load worker script:', error);
                        if (proxy._onerror) proxy._onerror(new ErrorEvent('error', { message: error }));
                        return;
                    }
                    // Create the REAL worker and connect it to the proxy
                    const realWorker = new OriginalWorker(blobUrl, options);
                    proxy._realWorker = realWorker;
                    realWorker.onmessage = (e) => proxy._onmessage ? proxy._onmessage(e) : null;
                    realWorker.onerror = (e) => proxy._onerror ? proxy._onerror(e) : null;
                    // Send any messages that were queued while we were waiting
                    proxy._messageQueue.forEach(msg => realWorker.postMessage(...msg));
                }
            });

            // Redefine the global Worker constructor
            window.Worker = function(path, options) {
                // If it's not a relative path, let the original constructor handle it
                if (/^(?:[a-z]+:|\\/|blob:)/.test(path)) {
                    return new OriginalWorker(path, options);
                }

                const workerId = workerIdCounter++;
                
                // Create a "Proxy Worker" object that looks and feels like a real worker.
                // It will queue messages until the real worker is ready.
                const proxyWorker = {
                    _realWorker: null,
                    _messageQueue: [],
                    _onmessage: null,
                    _onerror: null,
                    postMessage: function(...args) {
                        if (this._realWorker) {
                            this._realWorker.postMessage(...args);
                        } else {
                            this._messageQueue.push(args);
                        }
                    },
                    terminate: function() {
                        if (this._realWorker) this._realWorker.terminate();
                    },
                    get onmessage() { return this._onmessage; },
                    set onmessage(handler) {
                        this._onmessage = handler;
                        if (this._realWorker) this._realWorker.onmessage = handler;
                    },
                    get onerror() { return this._onerror; },
                    set onerror(handler) {
                        this._onerror = handler;
                        if (this._realWorker) this._realWorker.onerror = handler;
                    }
                };

                pendingWorkers.set(workerId, { proxy: proxyWorker, options });
                
                // Ask the parent (the editor) to fetch the script for us
                window.parent.postMessage({ type: 'fetch-worker-script', path: path, id: workerId }, '*');

                return proxyWorker;
            };
        })();
    `;

    // --- Step 2: Inject the interceptor at the top of the <head> ---
    const interceptorElement = doc.createElement('script');
    interceptorElement.textContent = interceptorScriptContent;
    if (doc.head) {
        doc.head.prepend(interceptorElement);
    } else {
        doc.documentElement.prepend(interceptorElement);
    }

    // --- Step 3: Continue with the original inlining logic for CSS and external Scripts ---
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
    // ... (other functions are unchanged)
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
                // ... (other cases are unchanged)
                case 'new-temp-file': Tabs.createTemporary(); break;
                case 'open-file': App.openLocalFile(); break;
                case 'save': Tabs.saveActive(); break;
                case 'download': Tabs.downloadActive(); break;
                
                // --- B"H: UPDATED ACTION HANDLER FOR 'view-html' ---
                case 'view-html': {
                    const activeTab = State.tabs.find(t => t.id === State.activeTabId);
                    if (!activeTab) break;

                    UI.showLoading("Processing HTML for preview...");
                    const content = Editor.getContent();
                    const baseItem = activeTab.item;
                    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);

                    // This handler will listen for messages from the iframe
                    const workerRequestHandler = async (event) => {
                        // We only care about messages from our iframe and our specific request type
                        if (event.source !== DOM.previewer.querySelector('iframe')?.contentWindow || event.data.type !== 'fetch-worker-script') {
                            return;
                        }

                        const { path: relativePath, id } = event.data;
                        try {
                            const resolvedPath = resolveRelativePath(baseItem.path, relativePath);
                            const assetItem = { ...workspace, path: resolvedPath, name: resolvedPath.split('/').pop() };
                            if (workspace.type === 'github') {
                                const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                                assetItem.sha = fileMeta.sha;
                            }
                            let scriptContent = await FileSystemProvider.read(assetItem);
                            if (!(scriptContent instanceof Blob)) {
                                if (scriptContent.isBinary) scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);
                                scriptContent = new Blob([scriptContent], { type: 'application/javascript' });
                            }
                            const blobUrl = URL.createObjectURL(scriptContent);
                            // Send the successful response back to the iframe
                            event.source.postMessage({ type: 'worker-script-response', id, blobUrl }, '*');
                        } catch (e) {
                            console.error(`Failed to fetch worker script '${relativePath}':`, e);
                            event.source.postMessage({ type: 'worker-script-response', id, error: e.message }, '*');
                        }
                    };

                    try {
                        window.addEventListener('message', workerRequestHandler);
                        const processedContent = await processHtmlForPreview(content, baseItem);
                        Tabs.createPreview(activeTab.item, processedContent, workerRequestHandler); // Pass the handler to the tab
                    } catch (e) {
                        UI.showToast("Failed to process HTML.", "error");
                        console.error(e);
                        window.removeEventListener('message', workerRequestHandler); // Cleanup on failure
                    } finally {
                        UI.hideLoading();
                    }
                    break;
                }
                
                // ... (rest of the switch statement is unchanged)
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