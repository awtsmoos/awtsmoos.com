// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import workerInterceptorScript from "./worker-intercept.js";
import importScriptsPolyfill from "./importScriptsHack.js";

const CHUNK_SIZE = 64 * 1024; // 64 KiB

// This will hold the promise resolver for the current chunk's ACK.
let _ackResolver = null;

// This function now waits for the iframe interceptor to receive an 'ack' and call the resolver.
function waitForAckFromWorker() {
    return new Promise((resolve) => {
        _ackResolver = resolve;
    });
}

// Utility to send data (name or content) in chunks.
async function sendChunks(bytes, isNamePhase, controlView, dataBytes) {
    const total = bytes.length;
    let offset = 0;

    while (offset < total) {
        const chunkLen = Math.min(total - offset, CHUNK_SIZE);
        
        // 1. Copy chunk data into the shared data buffer.
        dataBytes.set(bytes.subarray(offset, offset + chunkLen), 0);

        // 2. Set control metadata for the worker to read.
        Atomics.store(controlView, 1, chunkLen); // chunkLen
        Atomics.store(controlView, 2, isNamePhase ? 1 : 0); // isNamePhase
        Atomics.store(controlView, 3, ((offset + chunkLen) >= total) ? 1 : 0); // isLastChunk
        Atomics.store(controlView, 4, 0); // errorCode

        // 3. Signal to the worker that a chunk is ready.
        Atomics.store(controlView, 0, 1); // state = ready
        Atomics.notify(controlView, 0);

        // 4. Wait for the worker to send back an 'ack' message confirming it has read the chunk.
        await waitForAckFromWorker();
        
        offset += chunkLen;
    }
}

async function handleWorkerRequest(event, baseItem) {
    const { type, path: relativePath, controlSAB, dataSAB } = event.data;

    if (type === 'fetch-worker-script') {
        // ... This part is unchanged and works as before ...
    } 
    else if (type === 'import-scripts-request') {
        const controlView = new Int32Array(controlSAB);
        const dataBytes = new Uint8Array(dataSAB);
        const resolvedPath = resolveRelativePath(event.data.basePath, relativePath);

        try {
            // 1. Fetch the script content from the file system.
            const assetItem = { /* ... your file system logic ... */ path: resolvedPath };
            let scriptContent = await FileSystemProvider.read(assetItem);
            // ... (handle Blob or binary content as before) ...
            if (typeof scriptContent !== 'string') {
                 scriptContent = await (scriptContent.text ? scriptContent.text() : new TextDecoder().decode(scriptContent));
            }

            // 2. Prepare the name and script content as bytes.
            const encoder = new TextEncoder();
            const nameBytes = encoder.encode(relativePath);
            const scriptBytes = encoder.encode(scriptContent);
            
            // 3. Send the name in chunks.
            await sendChunks(nameBytes, true, controlView, dataBytes);
            
            // 4. Send the script content in chunks.
            await sendChunks(scriptBytes, false, controlView, dataBytes);

        } catch (err) {
            console.error(`[EDITOR] Error during chunked send for '${relativePath}':`, err);
            // Notify the worker of the error so it doesn't wait forever.
            Atomics.store(controlView, 4, 1); // errorCode = 1
            Atomics.store(controlView, 3, 1); // isLastChunk = true
            Atomics.store(controlView, 0, 1); // state = ready
            Atomics.notify(controlView, 0);
        }
    }
}

// This function now needs to handle the ACK resolver.
export function attachWorkerRequestHandler(baseItem) {
    if (window.currentWorkerRequestHandler) {
        window.removeEventListener('message', window.currentWorkerRequestHandler);
    }
    // This handler listens for messages from the iframe (which relays from the worker).
    window.currentWorkerRequestHandler = (event) => {
        // The ACK is resolved here, where we have scope to the resolver function.
        if (event.data.type === 'ack-resolver') {
            if (_ackResolver) {
                _ackResolver();
                _ackResolver = null;
            }
        } else {
            handleWorkerRequest(event, baseItem);
        }
    };
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