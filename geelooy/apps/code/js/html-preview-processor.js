// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
// These imports are correct and don't need to change.
import workerInterceptorScript from "./worker-intercept.js";
import importScriptsPolyfill from "./importScriptsHack.js";

// Helper function remains unchanged.
function resolveRelativePath(basePath, relativePath) {
    if (!basePath) return relativePath;
    const baseUrl = new URL(basePath, 'http://dummy.com/');
    const resolvedUrl = new URL(relativePath, baseUrl);
    return resolvedUrl.pathname.substring(1);
}

async function handleWorkerRequest(event, baseItem) {
    // We destructure the new 'signalSAB' which is our notification channel.
    const { type, path: relativePath, id, signalSAB, basePath } = event.data;
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return;

    console.log(`%c[EDITOR] Received request:`, 'color: #FFD700;', event.data);

    // This part for fetching the initial worker script is fine and remains unchanged.
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
            
            const finalContent = importScriptsPolyfill(resolvedPath, scriptContent);
            const blob = new Blob([finalContent], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            event.source.postMessage({ type: 'worker-script-response', id, blobUrl }, '*');
        } catch (e) {
            event.source.postMessage({ type: 'worker-script-response', id, error: e.message }, '*');
        }
    } 
    // --- B"H: REVISED LOGIC FOR SHARING SCRIPT CONTENT VIA SAB ---
    else if (type === 'import-scripts-request') {
        const resolvedPath = resolveRelativePath(basePath, relativePath);
        // The signalSAB is what we use to notify. It's a small, 4-byte buffer.
        const int32 = new Int32Array(signalSAB);
        try {
            const assetItem = { ...workspace, path: resolvedPath, name: resolvedPath.split('/').pop() };
             if (workspace.type === 'github') {
                const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                assetItem.sha = fileMeta.sha;
            }
            let scriptContent = await FileSystemProvider.read(assetItem);
            if (scriptContent instanceof Blob) scriptContent = await scriptContent.text();
            else if (scriptContent.isBinary) scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);
            
            console.log(`[EDITOR] Fetched content for ${relativePath}, encoding to SAB...`);

            // 1. Encode the string to UTF-8 bytes.
            const encoder = new TextEncoder();
            const encodedString = encoder.encode(scriptContent);

            // 2. Create a new SharedArrayBuffer to hold the content.
            const contentSAB = new SharedArrayBuffer(encodedString.length);
            const sabView = new Uint8Array(contentSAB);

            // 3. Copy the encoded string data into the SAB.
            sabView.set(encodedString);
            
            // 4. Post the content SAB back. The worker will be waiting for this.
            event.source.postMessage({ 
                type: 'import-scripts-response', 
                path: relativePath, 
                contentSAB: contentSAB // Send the buffer with the data
            }, '*');

        } catch (e) {
            console.error(`[EDITOR] Failed to fetch script for importScripts '${relativePath}':`, e);
            // In case of error, send an empty response so the worker doesn't wait forever.
            event.source.postMessage({ 
                type: 'import-scripts-response', 
                path: relativePath, 
                contentSAB: null, 
                error: e.message 
            }, '*');
        } finally {
            // 5. IMPORTANT: Now notify the worker on the original signal buffer.
            // This tells the waiting worker that the contentSAB (or an error) has been sent.
            console.log(`%c[EDITOR] Notifying worker on signal buffer for path: ${relativePath}.`, 'color: #ADD8E6;');
            Atomics.store(int32, 0, 1);
            Atomics.notify(int32, 0, 1); // Notify one waiting thread.
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