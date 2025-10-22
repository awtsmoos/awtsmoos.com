// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import workerInterceptorScript from "./worker-intercept.js";
import importScriptsPolyfill from "./importScriptsHack.js";

const CHUNK_SIZE = 64 * 1024; // 64 KiB

// This is a module-scoped variable to hold the promise resolver for the ACK.
let _ackResolver = null;

// This function pauses the main thread's logic until an 'ack' message is received.
function waitForAck() {
    return new Promise((resolve) => {
        _ackResolver = resolve;
    });
}

// Utility to send data (name or content) in chunks. It is guaranteed to wait for an ACK after each chunk.
async function sendChunks(bytes, isNamePhase, controlView, dataBytes) {
    const total = bytes.length;
    let offset = 0;

    while (offset < total) {
        const chunkLen = Math.min(total - offset, CHUNK_SIZE);
        dataBytes.set(bytes.subarray(offset, offset + chunkLen), 0);

        // Set control metadata
        Atomics.store(controlView, 1, chunkLen);
        Atomics.store(controlView, 2, isNamePhase ? 1 : 0);
        Atomics.store(controlView, 3, ((offset + chunkLen) >= total) ? 1 : 0);
        Atomics.store(controlView, 4, 0);

        // Signal worker that a chunk is ready
        Atomics.store(controlView, 0, 1);
        Atomics.notify(controlView, 0);

        // Wait for the worker to acknowledge it has processed the chunk.
        await waitForAck();
        
        offset += chunkLen;
    }
}

// This function handles requests that have been relayed from the iframe.
async function handleIncomingRequest(event, baseItem) {
    const { type, path: relativePath, controlSAB, dataSAB, basePath } = event.data;

    // This handles the initial fetch of the top-level worker script.
    if (type === 'fetch-worker-script') {
        const resolvedPath = resolveRelativePath(baseItem.path, relativePath);
        try {
            let scriptContent = await FileSystemProvider.read({ ...baseItem, path: resolvedPath });
            if (scriptContent instanceof Blob) scriptContent = await scriptContent.text();
            
            // The polyfill is prepended to the user's worker code.
            const finalContent = importScriptsPolyfill(resolvedPath, scriptContent);
            const blob = new Blob([finalContent], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            event.source.postMessage({ type: 'worker-script-response', id: event.data.id, blobUrl }, '*');
        } catch (e) {
            event.source.postMessage({ type: 'worker-script-response', id: event.data.id, error: e.message }, '*');
        }
    } 
    // This handles an importScripts request using the chunking protocol.
    else if (type === 'import-scripts-request') {
        const controlView = new Int32Array(controlSAB);
        const dataBytes = new Uint8Array(dataSAB);
        const resolvedPath = resolveRelativePath(basePath, relativePath);

        try {
            let scriptContent = await FileSystemProvider.read({ ...baseItem, path: resolvedPath });
            if (scriptContent instanceof Blob) scriptContent = await scriptContent.text();

            const encoder = new TextEncoder();
            const nameBytes = encoder.encode(relativePath);
            const scriptBytes = encoder.encode(scriptContent);

            // Send name, then content, waiting for ACK between each chunk.
            await sendChunks(nameBytes, true, controlView, dataBytes);
            await sendChunks(scriptBytes, false, controlView, dataBytes);

        } catch (err) {
            console.error(`[EDITOR] Error during chunked send for '${relativePath}':`, err);
            // Notify the worker of an error so it stops waiting.
            Atomics.store(controlView, 4, 1); // errorCode = 1
            Atomics.store(controlView, 3, 1); // isLastChunk = true
            Atomics.store(controlView, 0, 1); // state = ready
            Atomics.notify(controlView, 0);
        }
    }
}

// This function sets up the ONE message listener for the main editor window.
export function attachWorkerRequestHandler(baseItem) {
    if (window.currentWorkerRequestHandler) {
        window.removeEventListener('message', window.currentWorkerRequestHandler);
    }
    
    const messageRouter = (event) => {
        // If the message is an ACK from the iframe, resolve the pending promise.
        if (event.data && event.data.type === 'ack') {
            if (_ackResolver) {
                _ackResolver();
                _ackResolver = null;
            }
        } 
        // Otherwise, treat it as a request to be handled.
        else {
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








// This function processes the initial HTML, inlining assets and injecting the interceptor script.
export async function processHtmlForPreview(htmlContent, baseItem) {
    // ... This function's internal logic remains the same as in your original code ...
    // It is correct and does not need changes for the worker logic to function.
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