// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';

// --- Helper Functions ---
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

// --- The Message Handler (Lives on the main editor window) ---
// This single, powerful handler processes all requests from the iframe.
async function handleWorkerRequest(event, baseItem) {
    const { type, path: relativePath, id, basePath } = event.data;
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
            
            // Prepend the importScripts polyfill to the worker's code.
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
        try {
            const assetItem = { ...workspace, path: resolvedPath, name: resolvedPath.split('/').pop() };
             if (workspace.type === 'github') {
                const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                assetItem.sha = fileMeta.sha;
            }
            let scriptContent = await FileSystemProvider.read(assetItem);
            if (scriptContent instanceof Blob) scriptContent = await scriptContent.text();
            else if (scriptContent.isBinary) scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);

            // Send the content back to the waiting XHR in the worker.
            event.source.postMessage({ type: 'import-scripts-response', id, content: scriptContent }, '*');
        } catch (e) {
            console.error(`Failed to fetch script for importScripts '${relativePath}':`, e);
            event.source.postMessage({ type: 'import-scripts-response', id, error: e.message }, '*');
        }
    }
}

// These two functions manage the global listener to avoid conflicts.
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

        window.addEventListener('message', (event) => {
            const { type, id, blobUrl, error } = event.data;
            if (type === 'worker-script-response' && pendingWorkers.has(id)) {
                const { proxy, options } = pendingWorkers.get(id);
                pendingWorkers.delete(id);
                if (error) {
                    console.error('Editor failed to load worker script:', error);
                    if (typeof proxy.onerror === 'function') {
                        proxy.onerror(new ErrorEvent('error', { message: error }));
                    }
                    return;
                }
                const realWorker = new OriginalWorker(blobUrl, options);
                proxy._connect(realWorker);
            }
        });

        window.Worker = function(path, options) {
            if (/^(?:[a-z]+:|\\/|blob:)/.test(path)) {
                return new OriginalWorker(path, options);
            }

            const requestId = requestIdCounter++;
            
            const proxyWorker = {
                _realWorker: null,
                _messageQueue: [],
                _onmessage: null,
                _onerror: null,
                _connect: function(real) {
                    this._realWorker = real;
                    real.onmessage = this._onmessage;
                    real.onerror = this._onerror;
                    this._messageQueue.forEach(msg => real.postMessage(...msg));
                    this._messageQueue = [];
                },
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
            };
            Object.defineProperty(proxyWorker, 'onmessage', {
                get: () => proxyWorker._onmessage,
                set: (handler) => {
                    proxyWorker._onmessage = handler;
                    if (proxyWorker._realWorker) proxyWorker._realWorker.onmessage = handler;
                }
            });
            Object.defineProperty(proxyWorker, 'onerror', {
                get: () => proxyWorker._onerror,
                set: (handler) => {
                    proxyWorker._onerror = handler;
                    if (proxyWorker._realWorker) proxyWorker._realWorker.onerror = handler;
                }
            });

            pendingWorkers.set(requestId, { proxy: proxyWorker, options });
            window.parent.postMessage({ type: 'fetch-worker-script', path, id: requestId }, '*');
            
            return proxyWorker;
        };
    })();
`;

// --- The code to be injected into the worker itself (using Sync XHR) ---
const importScriptsPolyfill = (workerPath) => `
    (function() {
        const workerBasePath = '${workerPath}';
        let requestIdCounter = 0;
        const pendingRequests = new Map();

        // This listener receives the script content from the main thread.
        self.addEventListener('message', (event) => {
            const { type, id, content, error } = event.data;
            if (type === 'import-scripts-response' && pendingRequests.has(id)) {
                const request = pendingRequests.get(id);
                pendingRequests.delete(id);
                // We fake the XHR response properties.
                if (error) {
                    request.status = 500;
                    request.responseText = error;
                } else {
                    request.status = 200;
                    request.responseText = content;
                }
                // Setting readyState to 4 is the signal that unblocks the synchronous xhr.send() call.
                request.readyState = 4; 
                // We must manually trigger the event handler if it exists.
                if (request.onreadystatechange) {
                    request.onreadystatechange();
                }
            }
        });

        self.importScripts = (...paths) => {
            for (const relativePath of paths) {
                const requestId = requestIdCounter++;
                const xhr = new XMLHttpRequest();
                
                // The URL here is just a placeholder for the browser's internal state.
                // It's not actually fetched over the network.
                xhr.open('GET', relativePath, false); // false === synchronous

                // We override the native 'send' method.
                const originalSend = xhr.send;
                xhr.send = () => {
                    pendingRequests.set(requestId, xhr);
                    // Instead of a network request, we post a message to the editor.
                    self.postMessage({ type: 'import-scripts-request', path: relativePath, basePath: workerBasePath, id: requestId });
                };

                // This call now triggers our custom send, and the worker will BLOCK here
                // until the onmessage listener above sets readyState to 4.
                originalSend.call(xhr, null);

                if (xhr.status === 200) {
                    try { self.eval(xhr.responseText); } 
                    catch (e) { 
                        console.error('Profound Editor: Error executing imported script:', relativePath, e);
                        // Re-throw the error to behave like the native importScripts.
                        throw e;
                    }
                } else {
                    throw new Error('Profound Editor: Failed to load script for importScripts: ' + (xhr.responseText || relativePath));
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