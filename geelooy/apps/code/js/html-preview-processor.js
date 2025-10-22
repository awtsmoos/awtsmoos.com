// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import workerInterceptorScript from "./worker-intercept.js";
import importScriptsPolyfill from "./importScriptsHack.js";

function resolveRelativePath(basePath, relativePath) {
    if (!basePath) return relativePath;
    const baseUrl = new URL(basePath, 'http://dummy.com/');
    const resolvedUrl = new URL(relativePath, baseUrl);
    return resolvedUrl.pathname.substring(1);
}

async function handleWorkerRequest(event, baseItem) {
    // We expect a signalSAB for any script import requests.
    const { type, path: relativePath, id, signalSAB, basePath } = event.data;
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return;

    console.log(`%c[EDITOR] Received request:`, 'color: #FFD700;', event.data);

    // This logic handles fetching the TOP-LEVEL worker script. It doesn't use Atomics.
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
            
            // Wrap the user's worker code with our importScripts polyfill.
            const finalContent = importScriptsPolyfill(resolvedPath, scriptContent);
            const blob = new Blob([finalContent], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            event.source.postMessage({ type: 'worker-script-response', id, blobUrl }, '*');
        } catch (e) {
            console.error(`[EDITOR] Error fetching worker script ${resolvedPath}:`, e);
            event.source.postMessage({ type: 'worker-script-response', id, error: e.message }, '*');
        }
    } 
    // This logic handles synchronous 'importScripts' calls FROM WITHIN a worker.
    else if (type === 'import-scripts-request') {
        const resolvedPath = resolveRelativePath(basePath, relativePath);
        const int32 = new Int32Array(signalSAB);
        let scriptContent = null;
        let errorMessage = null;

        try {
            const assetItem = { ...workspace, path: resolvedPath, name: resolvedPath.split('/').pop() };
             if (workspace.type === 'github') {
                const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                assetItem.sha = fileMeta.sha;
            }
            let content = await FileSystemProvider.read(assetItem);
            if (content instanceof Blob) content = await content.text();
            else if (content.isBinary) content = FileSystemProvider.GitHub.b64_to_utf8(content.base64Content);
            scriptContent = content;
        } catch (e) {
            console.error(`[EDITOR] Failed to fetch script for importScripts '${resolvedPath}':`, e);
            errorMessage = e.message;
        }
        
        // Create the data buffer (contentSAB) only on success.
        let contentSAB = null;
        if (scriptContent !== null) {
            const encoder = new TextEncoder();
            const encodedString = encoder.encode(scriptContent);
            contentSAB = new SharedArrayBuffer(encodedString.length);
            new Uint8Array(contentSAB).set(encodedString);
        }

        // STEP 1: Post the message with the data buffer (or error). The worker is still
        // frozen and cannot process this yet. It will just sit in its message queue.
        event.source.postMessage({ 
            type: 'import-scripts-response', 
            path: relativePath, 
            contentSAB: contentSAB,
            error: errorMessage 
        }, '*');
        
        // STEP 2: Now, notify the worker on its signal buffer to wake it up.
        // As soon as it wakes up, its event loop will be free to process the message above.
        console.log(`%c[EDITOR] Notifying worker to wake up for path: ${relativePath}.`, 'color: #ADD8E6;');
        Atomics.store(int32, 0, 1); // Set the value to 1.
        Atomics.notify(int32, 0, 1); // Notify one waiting thread.
    }
}

// These functions manage the global message listener for the editor window.
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