// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';

// This path resolver is robust and uses the browser's URL API.
function resolveRelativePath(basePath, relativePath) {
    if (!basePath) return relativePath;
    // We create a dummy base URL to safely resolve paths like '.' and '..'
    const baseUrl = new URL(basePath, 'http://dummy.com/');
    const resolvedUrl = new URL(relativePath, baseUrl);
    // The pathname will be like '/path/to/file.js'. We remove the leading slash.
    return resolvedUrl.pathname.substring(1);
}

// --- B"H: THIS IS THE CORRECT, FLAWLESS MESSAGE HANDLER ---
// It ONLY uses our internal FileSystemProvider, never a real network request.
async function handleWorkerRequest(event, baseItem) {
    const { type, path: relativePath, id, basePath } = event.data;
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return;

    // Determine the correct path to fetch based on the request type
    const resolvedPath = (type === 'fetch-worker-script') 
        ? resolveRelativePath(baseItem.path, relativePath)
        : resolveRelativePath(basePath, relativePath);

    console.log(`%cProfound Editor: Requesting '${resolvedPath}'`, 'color: orange');

    try {
        // --- THIS IS THE CORE LOGIC ---
        // 1. Create a temporary item representing the file we need.
        const assetItem = { ...workspace, path: resolvedPath, name: resolvedPath.split('/').pop() };
        
        // 2. For GitHub, we MUST get the file's metadata (its SHA) first.
        if (workspace.type === 'github') {
            const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
            assetItem.sha = fileMeta.sha;
        }

        // 3. Use our internal FileSystemProvider.read() to get the content.
        //    This works for Local, IndexedDB, and GitHub, and NEVER makes a direct fetch.
        let scriptContent = await FileSystemProvider.read(assetItem);
        
        // 4. Process the content into plain text.
        if (scriptContent instanceof Blob) {
            scriptContent = await scriptContent.text();
        } else if (scriptContent.isBinary) { // Handle GitHub's base64 response
            scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);
        }
        console.log("i think i got content maybe",scriptContent)

        // 5. Send the correct response back to the iframe.
        if (type === 'fetch-worker-script') {
            const finalContent = importScriptsPolyfill(resolvedPath) + '\n\n' + scriptContent;
            const blob = new Blob([finalContent], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            event.source.postMessage({ type: 'worker-script-response', id, blobUrl }, '*');
        } else { // 'import-scripts-request'
            event.source.postMessage({ type: 'import-scripts-response', id, content: scriptContent }, '*');
        }

    } catch (e) {
        console.error(`Profound Editor: Failed to get content for '${resolvedPath}':`, e);
        const errorMessage = e.message || 'File not found';
        if (type === 'fetch-worker-script') {
            event.source.postMessage({ type: 'worker-script-response', id, error: errorMessage }, '*');
        } else {
            event.source.postMessage({ type: 'import-scripts-response', id, error: errorMessage }, '*');
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
            console.log("LOL cool data X",event.data)
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
                    console .log("sending import request",workerEvent)
                    if (workerEvent.data && workerEvent.data.type === 'import-scripts-request') {
                        window.parent.postMessage(workerEvent.data, '*');
                    }
                });
                proxy._connect(realWorker);
            }
            if (type === 'import-scripts-response') {
                console.log("sending to post",activeWorkers,event.data)
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

const importScriptsPolyfill = (workerPath) => `
    (function() {
    try {
        const workerBasePath = '${workerPath}';
        let requestIdCounter = 0;
        const pendingRequests = new Map();
        const OriginalImportScripts = self.importScripts;

        self.addEventListener('message', (event) => {
            const { type, id, content, error } = event.data;
            console.log("got weird message",event.data)
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
           console.log("CALLED import", paths)
            for (const relativePath of paths) {
                const requestId = requestIdCounter++;
                const xhr = new XMLHttpRequest();
                const dummyUrl = new URL(relativePath, self.location.origin).href;
                xhr.open('GET', dummyUrl, false);

                xhr.send = () => {
                    pendingRequests.set(requestId, xhr);
                    self.postMessage({ type: 'import-scripts-request', path: relativePath, basePath: workerBasePath, id: requestId });
                    console.log("in xhr send")
                
                };

                xhr.send(null); // Worker blocks here.
                console log("past block",xhr)

                if (xhr.status === 200) {
                    console.log('%cProfound Editor: Received content for ' + relativePath, 'color: green');
                    console.log('--- SCRIPT CONTENT START ---\\n' + xhr.responseText + '\\n--- SCRIPT CONTENT END ---');
                    try {
                    
                        const base64Content = btoa(unescape(encodeURIComponent(xhr.responseText)));
                        const dataUrl = 'data:application/javascript;base64,' + base64Content;
                        OriginalImportScripts(dataUrl);
                    } catch (e) {
                        console.error('Profound Editor: Error executing imported script:', relativePath, e);
                        throw e;
                    }
                } else {
                    throw new Error('Profound Editor: Failed to load script for importScripts: ' + (xhr.responseText || relativePath));
                }
            }
        };
        
        } catch(e) {
        consple.log("LOL right get it",e)
        
        }
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