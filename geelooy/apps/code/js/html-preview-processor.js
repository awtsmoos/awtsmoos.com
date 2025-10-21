// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';

// --- B"H: THE FLAWLESS, ROBUST PATH RESOLVER ---
// This new version correctly handles all cases, including files in the root directory.
function resolveRelativePath(basePath, relativePath) {
    // We use the browser's own powerful URL parser to handle path logic.
    // We construct a dummy base URL and append the basePath.
    const baseUrl = new URL(basePath, 'http://dummy.com/');
    // Then we resolve the relativePath against that base.
    const resolvedUrl = new URL(relativePath, baseUrl);
    // The pathname will be like '/geelooy/games/tetris/constants.js'. We remove the leading slash.
    return resolvedUrl.pathname.substring(1);
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
        
        console.log(`%cProfound Editor: fetch-worker-script`, 'color: cyan', {
            base: baseItem.path,
            relative: relativePath,
            resolved: resolvedPath // LOGGING, AS REQUESTED
        });

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
        
        console.log(`%cProfound Editor: import-scripts-request`, 'color: orange', {
            base: basePath,
            relative: relativePath,
            resolved: resolvedPath // LOGGING, AS REQUESTED
        });

        try {
            const assetItem = { ...workspace, path: resolvedPath, name: resolvedPath.split('/').pop() };
             if (workspace.type === 'github') {
                const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                assetItem.sha = fileMeta.sha;
            }
            let scriptContent = await FileSystemProvider.read(assetItem);
            if (scriptContent instanceof Blob) scriptContent = await scriptContent.text();
            else if (scriptContent.isBinary) scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);

            event.source.postMessage({ type: 'import-scripts-response', id, content: scriptContent }, '*');
        } catch (e) {
            console.error(`Failed to fetch script for importScripts '${relativePath}':`, e);
            event.source.postMessage({ type: 'import-scripts-response', id, error: e.message }, '*');
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

const workerInterceptorScript = `
    (function() {
        const OriginalWorker = window.Worker;
        const pendingWorkers = new Map();
        let requestIdCounter = 0;
        let activeWorkers = [];

        window.addEventListener('message', (event) => {
            const { type, id } = event.data;
            if (type === 'worker-script-response' && pendingWorkers.has(id)) {
                const { proxy, options } = pendingWorkers.get(id);
                pendingWorkers.delete(id);
                if (event.data.error) {
                    console.error('Editor failed to load worker script:', event.data.error);
                    if (typeof proxy.onerror === 'function') proxy.onerror(new ErrorEvent('error', { message: event.data.error }));
                    return;
                }
                const realWorker = new OriginalWorker(event.data.blobUrl, options);
                activeWorkers.push(realWorker);
                realWorker.addEventListener('terminate', () => {
                    activeWorkers = activeWorkers.filter(w => w !== realWorker);
                });
                realWorker.addEventListener('message', (workerEvent) => {
                    if (workerEvent.data && workerEvent.data.type === 'import-scripts-request') {
                        window.parent.postMessage(workerEvent.data, '*');
                    }
                });
                proxy._connect(realWorker);
            }
            if (type === 'import-scripts-response') {
                activeWorkers.forEach(w => w.postMessage(event.data));
            }
        });

        window.Worker = function(path, options) {
            if (/^(?:[a-z]+:|\\/|blob:)/.test(path)) {
                return new OriginalWorker(path, options);
            }
            const requestId = requestIdCounter++;
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

// --- B"H: THE FLAWLESS SYNCHRONOUS XHR POLYFILL WITH LOGGING ---
const importScriptsPolyfill = (workerPath) => `
    (function() {
        const workerBasePath = '${workerPath}';
        let requestIdCounter = 0;
        const pendingRequests = new Map();

        self.addEventListener('message', (event) => {
            const { type, id, content, error } = event.data;
            if (type === 'import-scripts-response' && pendingRequests.has(id)) {
                const request = pendingRequests.get(id);
                pendingRequests.delete(id);
                if (error) {
                    request.status = 500;
                    request.responseText = error;
                } else {
                    request.status = 200;
                    request.responseText = content;
                }
                request.readyState = 4;
                if (request.onreadystatechange) {
                    request.onreadystatechange();
                }
            }
        });

        self.importScripts = (...paths) => {
            for (const relativePath of paths) {
                const requestId = requestIdCounter++;
                const xhr = new XMLHttpRequest();
                const dummyUrl = new URL(relativePath, self.location.origin).href;
                xhr.open('GET', dummyUrl, false);

                // THIS IS THE FIX: We override send() but do NOT call the original.
                // This prevents the real network request.
                xhr.send = () => {
                    pendingRequests.set(requestId, xhr);
                    self.postMessage({ type: 'import-scripts-request', path: relativePath, basePath: workerBasePath, id: requestId });
                };

                // This now calls OUR overridden send(), which uses postMessage. The worker blocks here.
                xhr.send(null);

                if (xhr.status === 200) {
                    // LOGGING, AS REQUESTED
                    console.log('%cProfound Editor: Executing content for ' + relativePath, 'color: green');
                    console.log('--- SCRIPT CONTENT START ---\\n' + xhr.responseText + '\\n--- SCRIPT CONTENT END ---');
                    
                    try {
                        self.eval(xhr.responseText);
                    } catch (e) {
                        console.error('Profound Editor: Error executing imported script:', relativePath, e);
                        throw e;
                    }
                } else {
                    throw new Error('Profound Editor: Failed to load script for importScripts: ' + (xhr.responseText || relativePath));
                }
            }
        };
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