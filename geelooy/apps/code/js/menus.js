// B"H
// FILE: js/menus.js

import { State } from './state.js';
import { UI } from './ui.js';
import { App } from './app.js';
import { Tabs } from './tabs.js';
import { Workspaces } from './workspaces.js';
import { FindReplace } from './find-replace.js';
import { Clipboard } from './clipboard.js';
import { FileSystemProvider } from './fs-provider.js';
import { Editor } from './editor.js';

const getItemUniquePath = (item) => `${item.workspaceId ?? item.id}::${item.path ?? '/'}`;

// --- B"H: NEW HELPER FUNCTION 1: PATH RESOLUTION ---
/**
 * Resolves a relative path against a base file path.
 * e.g., resolveRelativePath('path/to/file.html', '../styles/main.css') returns 'path/styles/main.css'
 * @param {string} basePath - The path of the file containing the link.
 * @param {string} relativePath - The relative href or src value.
 * @returns {string} The resolved absolute path within the workspace.
 */
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


// --- B"H: NEW HELPER FUNCTION 2: HTML PRE-PROCESSOR ---
/**
 * Parses an HTML string, finds relative stylesheets and scripts,
 * fetches their content, and inlines them.
 * @param {string} htmlContent - The raw HTML from the editor.
 * @param {object} baseItem - The file item object for the HTML file.
 * @returns {Promise<string>} A promise that resolves to the processed HTML string.
 */
async function processHtmlForPreview(htmlContent, baseItem) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return htmlContent; // Cannot proceed without workspace info

    // Find all stylesheet links and script sources that have a relative path
    const linkPromises = Array.from(doc.querySelectorAll('link[rel="stylesheet"][href]'))
        .filter(link => !/^(?:[a-z]+:|\/)/.test(link.getAttribute('href'))) // Filter for relative paths
        .map(async (link) => {
            const relativePath = link.getAttribute('href');
            const resolvedPath = resolveRelativePath(baseItem.path, relativePath);
            try {
                // Construct a temporary item to read the file
                const assetItem = { ...workspace, path: resolvedPath, name: resolvedPath.split('/').pop() };
                let content = await FileSystemProvider.read(assetItem);
                // The content might be a Blob, so we must convert it to text
                if (content instanceof Blob) {
                    content = await content.text();
                }

                // Create a <style> element and replace the <link> element with it
                const style = doc.createElement('style');
                style.textContent = content;
                link.parentNode.replaceChild(style, link);
            } catch (e) {
                console.error(`Could not inline stylesheet: ${resolvedPath}`, e);
            }
        });

    const scriptPromises = Array.from(doc.querySelectorAll('script[src]'))
        .filter(script => !/^(?:[a-z]+:|\/)/.test(script.getAttribute('src'))) // Filter for relative paths
        .map(async (script) => {
            const relativePath = script.getAttribute('src');
            const resolvedPath = resolveRelativePath(baseItem.path, relativePath);
            try {
                const assetItem = { ...workspace, path: resolvedPath, name: resolvedPath.split('/').pop() };
                let content = await FileSystemProvider.read(assetItem);
                if (content instanceof Blob) {
                    content = await content.text();
                }

                // Create a new <script> element without a src, fill its content, and replace the old one
                const newScript = doc.createElement('script');
                newScript.textContent = content;
                script.parentNode.replaceChild(newScript, script);
            } catch (e) {
                console.error(`Could not inline script: ${resolvedPath}`, e);
            }
        });

    // Wait for all files to be fetched and inlined
    await Promise.all([...linkPromises, ...scriptPromises]);

    // Return the modified HTML as a string
    return doc.documentElement.outerHTML;
}


export const Menus = {
    // ... (handleDocumentClick, show, showMainMenu, hideAll, positionAndDisplay are unchanged)
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

                // --- B"H: UPDATED ACTION HANDLER ---
                case 'view-html': {
                    const activeTab = State.tabs.find(t => t.id === State.activeTabId);
                    if (activeTab) {
                        UI.showLoading("Processing HTML for preview...");
                        const content = Editor.getContent();
                        try {
                            // Call our new pre-processor before creating the preview tab
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
                }
                // --- END UPDATED ACTION ---

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
                            const newFileItem = {
                                ...workspace, name, path: newPath, kind: 'file', workspaceId: workspace.id, content: ''
                            };
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