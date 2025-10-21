// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';

// --- Helper Functions ---
function resolveRelativePath(basePath, relativePath) {
    if (!basePath) return relativePath;
    const baseUrl = new URL(basePath, 'http://dummy.com/');
    const resolvedUrl = new URL(relativePath, baseUrl);
    return resolvedUrl.pathname.substring(1);
}

// --- The Message Handler (Lives on the main editor window) ---
// This single, powerful handler processes all requests from the iframe.
async function handleWorkerRequest(event, baseItem) {
    const { type, path: relativePath, id, sab, basePath } = event.data;
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return;

    // A. The iframe's main script wants to create a new Worker.
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
            
            const finalContent = importScriptsPolyfill(resolvedPath) + '\n\n' + scriptContent;
            const blob = new Blob([finalContent], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            event.source.postMessage({ type: 'worker-script-response', id, blobUrl }, '*');
        } catch (e) {
            event.source.postMessage({ type: 'worker-script-response', id, error: e.message }, '*');
        }
    } 
    // B. A worker, already running, wants to import another script via importScripts.
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
            // This is the critical step: wake up the sleeping worker.
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

// --- The code to be injected into the iframe's <head> ---
const workerInterceptorScript = `
    (function() {
        const OriginalWorker = window.Worker;
        const pendingWorkers = new Map();
        let requestIdCounter = 0;
        let activeWorkers = [];

        window.addEventListener('message', (event) => {
            const { type, id } = event.data;
            if (type === 'worker-script-response' && pendingWorkers.has(id)) {
                const { proxy, options, sab } = pendingWorkers.get(id);
                pendingWorkers.delete(id);
                if (event.data.error) {
                    console.error('Editor failed to load worker script:', event.data.error);
                    if (typeof proxy.onerror === 'function') proxy.onerror(new ErrorEvent('error', { message: event.data.error }));
                    return;
                }
                const realWorker = new OriginalWorker(event.data.blobUrl, options);
                activeWorkers.push(realWorker);
                realWorker.addEventListener('terminate', () => { activeWorkers = activeWorkers.filter(w => w !== realWorker); });
                
                // This is the relay: messages from the worker go up to the editor
                realWorker.addEventListener('message', (workerEvent) => {
                    if (workerEvent.data && workerEvent.data.type === 'import-scripts-request') {
                        // Pass the SharedArrayBuffer along with the request
                        workerEvent.data.sab = sab;
                        window.parent.postMessage(workerEvent.data, '*');
                    }
                });
                
                proxy._connect(realWorker);
                // The first message to the worker initializes its own sync mechanism
                realWorker.postMessage({ type: 'init-sync', sab });
            }
            // This is the relay: responses for importScripts go down to the workers
            if (type === 'import-scripts-response') {
                activeWorkers.forEach(w => w.postMessage(event.data));
            }
        });

        window.Worker = function(path, options) {
            if (/^(?:[a-z]+:|\\/|blob:)/.test(path)) {
                return new OriginalWorker(path, options);
            }
            const requestId = requestIdCounter++;
            const sab = new SharedArrayBuffer(4);
            
            const proxyWorker = {
                _realWorker: null, _messageQueue: [], _onmessage: null, _onerror: null,
                _connect: function(real) {
                    this._realWorker = real;
                    real.onmessage = this._onmessage;
                    real.onerror = this._onerror;
                    this._messageQueue.forEach(msg => real.postMessage(...msg));
                    this._messageQueue = [];
                },
                postMessage: function(...args) {
                    if (this._realWorker) { this._realWorker.postMessage(...args); } 
                    else { this._messageQueue.push(args); }
                },
                terminate: function() { if (this._realWorker) this._realWorker.terminate(); },
            };
            Object.defineProperty(proxyWorker, 'onmessage', { get: () => proxyWorker._onmessage, set: (h) => { proxyWorker._onmessage = h; if(proxyWorker._realWorker) proxyWorker._realWorker.onmessage = h; } });
            Object.defineProperty(proxyWorker, 'onerror', { get: () => proxyWorker._onerror, set: (h) => { proxyWorker._onerror = h; if(proxyWorker._realWorker) proxyWorker._realWorker.onerror = h; } });

            pendingWorkers.set(requestId, { proxy: proxyWorker, options, sab });
            window.parent.postMessage({ type: 'fetch-worker-script', path, id: requestId }, '*');
            return proxyWorker;
        };
    })();
`;

// --- The code to be injected into the worker itself (using Atomics) ---
const importScriptsPolyfill = (workerPath) => `
    (function() {
        const workerBasePath = '${workerPath}';
        let sab, int32;
        const scriptCache = new Map();
        const OriginalImportScripts = self.importScripts;

        self.addEventListener('message', (event) => {
            if (event.data.type === 'init-sync') {
                sab = event.data.sab;
                int32 = new Int32Array(sab);
            }
            if (event.data.type === 'import-scripts-response') {
                scriptCache.set(event.data.path, event.data.content || '');
                if(event.data.error) scriptCache.set('error:' + event.data.path, event.data.error);
                Atomics.store(int32, 0, 1);
                Atomics.notify(int32, 0);
            }
        });

        self.importScripts = (...paths) => {
            if (!sab) {
                console.error('Profound Editor: Sync mechanism not initialized for importScripts.');
                return;
            }
            for (const relativePath of paths) {
                self.postMessage({ type: 'import-scripts-request', path: relativePath, basePath: workerBasePath });
                
                const result = Atomics.wait(int32, 0, 0, 5000); // Wait on index 0 if value is 0, timeout 5s
                
                if (result === 'timed-out') {
                    throw new Error('Profound Editor: Timed out waiting for importScripts: ' + relativePath);
                }
                Atomics.store(int32, 0, 0); // Reset the flag for the next import

                if (scriptCache.has('error:' + relativePath)) {
                     throw new Error(scriptCache.get('error:' + relativePath));
                }
                if (scriptCache.has(relativePath)) {
                    const content = scriptCache.get(relativePath);
                    scriptCache.delete(relativePath);
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
    })();
`;

// --- The main export function ---
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