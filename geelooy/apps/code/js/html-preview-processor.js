// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import workerInterceptorScript from "./worker-intercept.js";
import importScriptsPolyfill from "./importScriptsHack.js";

const CHUNK_SIZE = 64 * 1024;

let _ackResolver = null;

function waitForAck() {
    return new Promise((resolve) => {
        _ackResolver = resolve;
    });
}

async function sendChunks(bytes, isNamePhase, controlView, dataBytes) {
    const total = bytes.length;
    let offset = 0;

    while (offset < total) {
        const chunkLen = Math.min(total - offset, CHUNK_SIZE);
        dataBytes.set(bytes.subarray(offset, offset + chunkLen), 0);

        Atomics.store(controlView, 1, chunkLen);
        Atomics.store(controlView, 2, isNamePhase ? 1 : 0);
        Atomics.store(controlView, 3, ((offset + chunkLen) >= total) ? 1 : 0);
        Atomics.store(controlView, 4, 0);

        Atomics.store(controlView, 0, 1);
        Atomics.notify(controlView, 0);

        await waitForAck();
        offset += chunkLen;
    }
}

function resolveRelativePath(basePath, relativePath) {
    if (!basePath) return relativePath;
    const baseUrl = new URL(basePath, 'http://dummy.com/');
    const resolvedUrl = new URL(relativePath, baseUrl);
    return resolvedUrl.pathname.substring(1);
}

async function handleIncomingRequest(event, baseItem) {
    const { type, path: relativePath, controlSAB, dataSAB, basePath } = event.data;
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return;

    if (type === 'fetch-worker-script') {
        const resolvedPath = resolveRelativePath(baseItem.path, relativePath);
        try {
            const assetItem = { ...workspace, path: resolvedPath };
            if (workspace.type === 'github') {
                const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                assetItem.sha = fileMeta.sha;
            }
            let scriptContent = await FileSystemProvider.read(assetItem);
            // --- CRITICAL LOGIC RESTORED ---
            if (scriptContent instanceof Blob) {
                scriptContent = await scriptContent.text();
            } else if (scriptContent.isBinary) {
                scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);
            }
            
            const finalContent = importScriptsPolyfill(resolvedPath, scriptContent);
            const blob = new Blob([finalContent], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            event.source.postMessage({ type: 'worker-script-response', id: event.data.id, blobUrl }, '*');
        } catch (e) {
            event.source.postMessage({ type: 'worker-script-response', id: event.data.id, error: e.message }, '*');
        }
    } 
    else if (type === 'import-scripts-request') {
        const controlView = new Int32Array(controlSAB);
        const dataBytes = new Uint8Array(dataSAB);
        const resolvedPath = resolveRelativePath(basePath, relativePath);

        try {
            const assetItem = { ...workspace, path: resolvedPath };
            if (workspace.type === 'github') {
                const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                assetItem.sha = fileMeta.sha;
            }
            let scriptContent = await FileSystemProvider.read(assetItem);
            // --- CRITICAL LOGIC RESTORED ---
            if (scriptContent instanceof Blob) {
                scriptContent = await scriptContent.text();
            } else if (scriptContent.isBinary) {
                scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);
            }
            
            const encoder = new TextEncoder();
            const nameBytes = encoder.encode(relativePath);
            const scriptBytes = encoder.encode(scriptContent);

            await sendChunks(nameBytes, true, controlView, dataBytes);
            await sendChunks(scriptBytes, false, controlView, dataBytes);

        } catch (err) {
            console.error(`[EDITOR] Error during chunked send for '${relativePath}':`, err);
            Atomics.store(controlView, 4, 1);
            Atomics.store(controlView, 3, 1);
            Atomics.store(controlView, 0, 1);
            Atomics.notify(controlView, 0);
        }
    }
}

export function attachWorkerRequestHandler(baseItem) {
    if (window.currentWorkerRequestHandler) {
        window.removeEventListener('message', window.currentWorkerRequestHandler);
    }
    
    const messageRouter = (event) => {
        if (event.data && event.data.type === 'ack') {
            if (_ackResolver) { _ackResolver(); _ackResolver = null; }
        } else {
            handleIncomingRequest(event, baseItem);
        }
    };
    
    window.currentWorkerRequestHandler = messageRouter;
    window.addEventListener('message', window.currentWorkerRequestHandler);
}

export function detachWorkerRequestHandler() {
    if (window.currentWorkerRequestHandler) {
        window.removeEventListener('message', window.currentWorkerRequestHandler);
        window.currentWorkerRequestHandler = null;
    }
}

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
                const assetItem = { ...workspace, path: resolvedPath };
                if (workspace.type === 'github') {
                    const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                    assetItem.sha = fileMeta.sha;
                }
                let content = await FileSystemProvider.read(assetItem);
                // --- CRITICAL LOGIC RESTORED ---
                if (content instanceof Blob) {
                    content = await content.text();
                } else if (content.isBinary) {
                    content = FileSystemProvider.GitHub.b64_to_utf8(content.base64Content);
                }
                
                if (isLink) {
                    const style = doc.createElement('style');
                    style.textContent = content;
                    el.parentNode.replaceChild(style, el);
                } else {
                    el.removeAttribute('src');
                    el.textContent = content;
                }
            } catch (e) { 
                console.error(`Could not inline asset: ${resolvedPath}`, e); 
            }
        });
    await Promise.all(assetPromises);

    return doc.documentElement.outerHTML;
}