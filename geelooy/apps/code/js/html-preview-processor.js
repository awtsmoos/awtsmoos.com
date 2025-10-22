// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import workerInterceptorScript from "./worker-intercept.js";
import importScriptsPolyfill from "./importScriptsHack.js";

// Helper function remains necessary for path resolution.
function resolveRelativePath(basePath, relativePath) {
    if (!basePath) return relativePath;
    const baseUrl = new URL(basePath, 'http://dummy.com/');
    const resolvedUrl = new URL(relativePath, baseUrl);
    return resolvedUrl.pathname.substring(1);
}

// The request handler is now extremely simple.
async function handleIncomingRequest(event, baseItem) {
    const { type, path: relativePath, id } = event.data;
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return;

    // This handles the initial fetch of the top-level worker script's source code.
    if (type === 'fetch-worker-script') {
        const resolvedPath = resolveRelativePath(baseItem.path, relativePath);
        try {
            const assetItem = { ...workspace, path: resolvedPath };
            if (workspace.type === 'github') {
                const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                assetItem.sha = fileMeta.sha;
            }
            let scriptContent = await FileSystemProvider.read(assetItem);
            if (scriptContent instanceof Blob) scriptContent = await scriptContent.text();
            else if (scriptContent.isBinary) scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);
            
            // The polyfill is prepended before sending the blob URL.
            const finalContent = importScriptsPolyfill(resolvedPath, scriptContent);
            const blob = new Blob([finalContent], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            event.source.postMessage({ type: 'worker-script-response', id, blobUrl }, '*');
        } catch (e) {
            event.source.postMessage({ type: 'worker-script-response', id, error: e.message }, '*');
        }
    } 
    // This handles subsequent requests for script CONTENT from the iframe coordinator.
    else if (type === 'fetch-script-content') {
        const resolvedPath = resolveRelativePath(event.data.basePath, relativePath);
        try {
            const assetItem = { ...workspace, path: resolvedPath };
            if (workspace.type === 'github') {
                const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                assetItem.sha = fileMeta.sha;
            }
            let scriptContent = await FileSystemProvider.read(assetItem);
            if (scriptContent instanceof Blob) scriptContent = await scriptContent.text();
            else if (scriptContent.isBinary) scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);
            
            console. log("got content for",resolvedPath,"which is",scriptContent.substring(0,20),"...")

            // Simply send the raw string content back to the iframe.
            event.source.postMessage({ type: 'script-content-response', id, content: scriptContent }, '*');

        } catch (err) {
            event.source.postMessage({ type: 'script-content-response', id, error: err.message }, '*');
        }
    }
}

export function attachWorkerRequestHandler(baseItem) {
    if (window.currentWorkerRequestHandler) {
        window.removeEventListener('message', window.currentWorkerRequestHandler);
    }
    // The router is now stateless. It just passes all requests to the handler.
    window.currentWorkerRequestHandler = (event) => handleIncomingRequest(event, baseItem);
    window.addEventListener('message', window.currentWorkerRequestHandler);
}


















export function detachWorkerRequestHandler() {
    if (window.currentWorkerRequestHandler) {
        window.removeEventListener('message', window.currentWorkerRequestHandler);
        window.currentWorkerRequestHandler = null;
    }
}

// B"H
// FILE: html-preview-processor.js

// ... All the imports and top-level functions (waitForAck, sendChunks, etc.) are correct. ...
// ... The handleIncomingRequest and attach/detach functions are also correct. ...
// The ONLY function that needs to be fixed is processHtmlForPreview.

// --- THE FOOLPROOF AND CORRECTED VERSION ---
export async function processHtmlForPreview(htmlContent, baseItem) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return htmlContent;

    // First, inject the worker interceptor script. This is correct.
    const interceptorElement = doc.createElement('script');
    interceptorElement.textContent = workerInterceptorScript;
    if (doc.head) doc.head.prepend(interceptorElement);
    else doc.documentElement.prepend(interceptorElement);

    // Now, find all relative CSS and JS assets to inline.
    const assetElements = Array.from(doc.querySelectorAll('link[rel="stylesheet"][href], script[src]'));
    
    // We will process them one by one to avoid any potential race conditions.
    for (const el of assetElements) {
        // Skip absolute URLs.
        const pathAttr = el.getAttribute('href') || el.getAttribute('src');
        if (/^(?:[a-z]+:|\/)/.test(pathAttr)) {
            continue;
        }

        const isLink = el.tagName === 'LINK';
        const resolvedPath = resolveRelativePath(baseItem.path, pathAttr);

        try {
            console.log(`[PROCESSOR] Inlining asset: ${resolvedPath}`);
            
            const assetItem = { ...workspace, path: resolvedPath };
            if (workspace.type === 'github') {
                const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                assetItem.sha = fileMeta.sha;
            }
            
            let content = await FileSystemProvider.read(assetItem);
            
            // This is the crucial logic you had before, which I mistakenly removed.
            if (content instanceof Blob) {
                content = await content.text();
            } else if (content.isBinary) {
                content = FileSystemProvider.GitHub.b64_to_utf8(content.base64Content);
            }

            if (typeof content !== 'string') {
                throw new Error("Failed to read asset content as a string.");
            }

            if (isLink) {
                // This part works, so we keep it.
                const style = doc.createElement('style');
                style.textContent = content;
                el.parentNode.replaceChild(style, el);
                console.log(`[PROCESSOR] Successfully inlined CSS: ${resolvedPath}`);
            } else {
                // --- THIS IS THE FIX ---
                // The previous logic was flawed. This is direct and simple.
                const script = doc.createElement('script');
                script.textContent = content;
                // Replace the original <script src="..."> with the new <script>...</script>
                el.parentNode.replaceChild(script, el);
                console.log(`[PROCESSOR] Successfully inlined JS: ${resolvedPath}`);
            }
        } catch (e) { 
            console.error(`[PROCESSOR] Could not inline asset: ${resolvedPath}`, e); 
        }
    }

    return doc.documentElement.outerHTML;
}

// All other functions in this file remain the same. I am omitting them for brevity
// as they are part of the worker logic, which is not what's failing here.