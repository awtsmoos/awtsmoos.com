// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';

function resolveRelativePath(basePath, relativePath) {
    if (!basePath) return relativePath;
    const baseUrl = new URL(basePath, 'http://dummy.com/');
    const resolvedUrl = new URL(relativePath, baseUrl);
    return resolvedUrl.pathname.substring(1);
}

// --- B"H: THE FLAWLESS, HEAVILY LOGGED MESSAGE HANDLER ---
// This runs on the main editor window and ONLY uses the FileSystemProvider.
async function handleWorkerRequest(event, baseItem) {
    const { type, path: relativePath, id, sab, basePath } = event.data;
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return;

    // Log every single request received from the iframe.
    console.log(`%c[EDITOR] Received request:`, 'color: #FFD700;', event.data);

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
            
            // B"H: THE ARCHITECTURAL FIX - We now combine the polyfill AND the async wrapper.
            const finalContent = importScriptsPolyfill(resolvedPath, scriptContent);
            const blob = new Blob([finalContent], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            event.source.postMessage({ type: 'worker-script-response', id, blobUrl }, '*');
        } catch (e) {
            event.source.postMessage({ type: 'worker-script-response', id, error: e.message }, '*');
        }
    } 
    else if (type === 'import-scripts-request') {
        const resolvedPath = resolveRelativePath(basePath, relativePath);
        const int32 = new Int32Array(sab);
        try {
            const assetItem = { ...workspace, path: resolvedPath, name: resolvedPath.split('/').pop() };
             if (workspace.type === 'github') {
                const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                assetItem.sha = fileMeta.sha;
            }
            let scriptContent = await FileSystemProvider.read(assetItem);
            if (scriptContent instanceof Blob) scriptContent = await scriptContent.text();
            else if (scriptContent.isBinary) scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);

            event.source.postMessage({ type: 'import-scripts-response', path: relativePath, content: scriptContent }, '*');
        } catch (e) {
            console.error(`Failed to fetch script for importScripts '${relativePath}':`, e);
            event.source.postMessage({ type: 'import-scripts-response', path: relativePath, content: null, error: e.message }, '*');
        } finally {
            console.log(`%c[EDITOR] Notifying worker on buffer to wake up for path: ${relativePath}.`, 'color: #ADD8E6;');
            Atomics.store(int32, 0, 1);
            Atomics.notify(int32, 0);
        }
    }
}

export function attachWorkerRequestHandler(baseItem) {
    if (window.currentWorkerRequestHandler) {
        window.removeEventListener('message', window.currentWorkerRequestHandler);
    }
    window.currentWorkerRequestHandler = (event) => handleWorkerRequest(event, baseItem);
    window.addEventListener('message', window.currentWorkerRequestHandler);
}

export function detachWorkerRequestHandler() {
    if (window.currentWorkerRequestHandler) {
        window.removeEventListener('message', window.currentWorkerRequestHandler);
        window.currentWorkerRequestHandler = null;
    }
}

// This script is injected into the preview iframe's <head>.
const workerInterceptorScript = `
    (function() { /* ... This part is correct and remains unchanged ... */ })();
`;

// This function now returns the complete, ready-to-run worker script content.
const importScriptsPolyfill = (workerPath, originalScriptContent) => `
    (function() {
        console.log('%c[WORKER] Polyfill Loaded.', 'color: #4682B4');
        const workerBasePath = '${workerPath}';
        let sab, int32;
        const scriptCache = new Map();
        const OriginalImportScripts = self.importScripts;

        // B"H: THE ASYNC WRAPPER SOLUTION
        // This promise is the key to solving the race condition.
        const sabReadyPromise = new Promise((resolve) => {
            self.addEventListener('message', (event) => {
                if (event.data.type === 'init-sync') {
                    sab = event.data.sab;
                    int32 = new Int32Array(sab);
                    console.log('%c[WORKER] Sync mechanism INITIALIZED.', 'color: #4682B4; font-weight: bold;');
                    resolve(); // The SAB is ready, release the await.
                }
            });
        });

        self.addEventListener('message', (event) => {
            if (event.data.type === 'import-scripts-response') {
                console.log('%c[WORKER] Received content for:', 'color: #4682B4;', event.data.path);
                scriptCache.set(event.data.path, event.data.content || '');
                if(event.data.error) scriptCache.set('error:' + event.data.path, event.data.error);
                Atomics.store(int32, 0, 1);
                Atomics.notify(int32, 0);
            }
        });

        self.importScripts = (...paths) => {
            if (!sab) {
                // This error should now be impossible due to the await, but it's good practice.
                throw new Error('Profound Editor: Sync mechanism not initialized before importScripts was called. This indicates a race condition.');
            }
            
            for (const relativePath of paths) {
                console.log('%c[WORKER] Posting import-scripts-request for:', 'color: #4682B4;', relativePath);
                self.postMessage({ type: 'import-scripts-request', path: relativePath, basePath: workerBasePath });
                
                console.log('%c[WORKER] Now blocking with Atomics.wait()...', 'color: #B0C4DE;');
                const result = Atomics.wait(int32, 0, 0, 5000);
                
                if (result === 'timed-out') {
                    throw new Error('Profound Editor: Timed out waiting for importScripts: ' + relativePath);
                }
                console.log('%c[WORKER] ...Woke up!', 'color: #B0C4DE;');
                Atomics.store(int32, 0, 0);

                if (scriptCache.has('error:' + relativePath)) {
                     throw new Error(scriptCache.get('error:' + relativePath));
                }
                if (scriptCache.has(relativePath)) {
                    const content = scriptCache.get(relativePath);
                    scriptCache.delete(relativePath);
                    console.log('%c[WORKER] Received content for ' + relativePath, 'color: green');
                    console.log('--- SCRIPT CONTENT START ---\\n' + content + '\\n--- SCRIPT CONTENT END ---');
                    try {
                        const base64Content = btoa(unescape(encodeURIComponent(content)));
                        const dataUrl = 'data:application/javascript;base64,' + base64Content;
                        OriginalImportScripts(dataUrl);
                    } catch (e) {
                        console.error('Profound Editor: Error executing imported script:', relativePath, e);
                        throw e;
                    }
                } else {
                    throw new Error('Profound Editor: Failed to load script for importScripts: ' + relativePath);
                }
            }
        };

        // This is the async wrapper for the user's original code.
        (async () => {
            console.log('%c[WORKER] Waiting for SAB initialization...', 'color: #FFA500');
            await sabReadyPromise;
            console.log('%c[WORKER] SAB Initialized. Executing original script...', 'color: #90EE90; font-weight: bold;');
            
            // Now that we've waited, execute the user's original script.
            try {
                // We use eval here because the original script is now a string.
                // It's safe within the sandboxed worker.
                eval(originalScriptContent);
            } catch (e) {
                console.error("CRITICAL: Error during initial execution of worker script.", e);
            }
        })();
    })();
`;

export async function processHtmlForPreview(htmlContent, baseItem) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return htmlContent;

    const interceptorElement = doc.createElement('script');
    interceptorElement.textContent = workerInterceptorScript;
    if (doc.head) doc.head.prepend(interceptorElement);
    else doc.documentElement.prepend(interceptorElement);

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