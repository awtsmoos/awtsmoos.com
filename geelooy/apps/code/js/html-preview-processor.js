// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';

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

async function handleWorkerRequest(event, baseItem) {
    const { type, path: relativePath, id, basePath } = event.data;
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return;

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

// --- B"H: THE CORRECTED INTERCEPTOR AND POLYFILL ---

const workerInterceptorScript = `
    (function() {
        const OriginalWorker = window.Worker;
        const pendingWorkers = new Map();
        let requestIdCounter = 0;
        let activeWorkers = []; // Keep track of all active workers

        // This is the master listener for the iframe. It handles all communication.
        window.addEventListener('message', (event) => {
            const { type, id } = event.data;

            // Message FROM the main editor TO the iframe (providing the main worker script)
            if (type === 'worker-script-response' && pendingWorkers.has(id)) {
                const { proxy, options } = pendingWorkers.get(id);
                pendingWorkers.delete(id);

                if (event.data.error) {
                    console.error('Editor failed to load worker script:', event.data.error);
                    if (typeof proxy.onerror === 'function') proxy.onerror(new ErrorEvent('error', { message: event.data.error }));
                    return;
                }

                const realWorker = new OriginalWorker(event.data.blobUrl, options);
                
                // Add this new worker to our list for message relaying
                activeWorkers.push(realWorker);
                realWorker.addEventListener('terminate', () => {
                    activeWorkers = activeWorkers.filter(w => w !== realWorker);
                });

                // RELAY 1: Listen for requests FROM this worker and send them UP to the editor.
                realWorker.addEventListener('message', (workerEvent) => {
                    if (workerEvent.data && workerEvent.data.type === 'import-scripts-request') {
                        window.parent.postMessage(workerEvent.data, '*');
                    }
                });
                
                proxy._connect(realWorker);
            }

            // RELAY 2: Message FROM the main editor TO the iframe (providing the imported script content)
            if (type === 'import-scripts-response') {
                // Broadcast the response to ALL active workers.
                // The polyfill inside each worker is smart enough to only accept the message with the correct ID.
                activeWorkers.forEach(w => w.postMessage(event.data));
            }
        });

        // Redefine the Worker constructor
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
                    // Connect user's event handlers to the real worker
                    real.onmessage = this._onmessage;
                    real.onerror = this._onerror;
                    // Forward any queued messages
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

const importScriptsPolyfill = (workerPath) => `
    (function() {
        const workerBasePath = '${workerPath}';
        let requestIdCounter = 0;
        const scriptResponses = new Map();

        // This listener only cares about messages relayed from the iframe.
        self.addEventListener('message', (event) => {
            const { type, id, content, error } = event.data;
            if (type === 'import-scripts-response') {
                scriptResponses.set(id, { content, error });
            }
        });

        self.importScripts = (...paths) => {
            for (const relativePath of paths) {
                const requestId = requestIdCounter++;
                
                // Ask the iframe (which will ask the editor) for the script.
                self.postMessage({ type: 'import-scripts-request', path: relativePath, basePath: workerBasePath, id: requestId });

                // Synchronously wait for the response to be populated by the listener.
                let timeout = 5000;
                while (!scriptResponses.has(requestId) && timeout > 0) {
                    // This is a simple form of busy-waiting that is acceptable inside a worker.
                    // A more advanced implementation could use Atomics if SharedArrayBuffer was available.
                    for (let i = 0; i < 1000; i++) {} // Small delay
                    timeout--;
                }

                if (!scriptResponses.has(requestId)) {
                    throw new Error('Profound Editor: Timed out waiting for importScripts: ' + relativePath);
                }

                const response = scriptResponses.get(requestId);
                scriptResponses.delete(requestId);

                if (response.error) {
                    throw new Error('Profound Editor: Failed to load script for importScripts: ' + (response.error || relativePath));
                }

                try { self.eval(response.content); } 
                catch (e) { console.error('Profound Editor: Error executing imported script:', relativePath, e); throw e; }
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