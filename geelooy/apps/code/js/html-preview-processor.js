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

// ... All imports and top-level functions (waitForAck, sendChunks, etc.) remain the same. ...



async function handleIncomingRequest(event, baseItem) {
    const { type, path: relativePath, basePath } = event.data;
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return;

    // --- THIS IS THE CRITICAL FIX FOR WORKERS ---
    // This logic must be able to handle the Blob from the Local provider.
    if (type === 'fetch-worker-script' || type === 'fetch-script-content') {
        const id = event.data.id; // Get the request ID
        let resolvedPath;
        // The base path for worker sub-imports comes from the worker itself.
        if (type === 'fetch-script-content') {
            resolvedPath = resolveRelativePath(basePath, relativePath);
        } else { // The base path for the top-level worker comes from the HTML file.
            resolvedPath = resolveRelativePath(baseItem.path, relativePath);
        }

        try {
            const assetItem = { ...workspace, path: resolvedPath };
            if (workspace.type === 'github') {
                const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                assetItem.sha = fileMeta.sha;
            }
            
            let scriptContent = await FileSystemProvider.read(assetItem);
            
            // --- FOOLPROOF CONTENT HANDLING ---
            // This now correctly handles all return types from your FS provider.
            if (scriptContent instanceof Blob) { // This handles the Local FS case
                scriptContent = await scriptContent.text();
            } else if (scriptContent && scriptContent.isBinary) { // This handles the GitHub binary case
                scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);
            }
            // If it's already a string (from GitHub text file), we do nothing.

            if (type === 'fetch-worker-script') {
                const finalContent = importScriptsPolyfill(resolvedPath, scriptContent);
                const blob = new Blob([finalContent], { type: 'application/javascript' });
                const blobUrl = URL.createObjectURL(blob);
                event.source.postMessage({ type: 'worker-script-response', id, blobUrl }, '*');
            } else { // 'fetch-script-content'
                // For the chunking protocol, we respond to the iframe coordinator.
                event.source.postMessage({ type: 'script-content-response', id, content: scriptContent }, '*');
            }
        } catch (e) {
            // Error propagation for both request types
            if (type === 'fetch-worker-script') {
                event.source.postMessage({ type: 'worker-script-response', id, error: e.message }, '*');
            } else {
                event.source.postMessage({ type: 'script-content-response', id, error: e.message }, '*');
            }
        }
    }
}


// --- THE OTHER CRITICAL FIX IS HERE ---
export async function processHtmlForPreview(htmlContent, baseItem) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return htmlContent;

    const interceptorElement = doc.createElement('script');
    interceptorElement.textContent = workerInterceptorScript;
    if (doc.head) doc.head.prepend(interceptorElement);
    else doc.documentElement.prepend(interceptorElement);

    const assetElements = Array.from(doc.querySelectorAll('link[rel="stylesheet"][href], script[src]'));
    
    for (const el of assetElements) {
        const pathAttr = el.getAttribute('href') || el.getAttribute('src');
        if (/^(?:[a-z]+:|\/)/.test(pathAttr)) continue;

        const isLink = el.tagName === 'LINK';
        const resolvedPath = resolveRelativePath(baseItem.path, pathAttr);

        try {
            const assetItem = { ...workspace, path: resolvedPath };
            if (workspace.type === 'github') {
                const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${workspace.repoInfo.owner}/${workspace.repoInfo.repo}/contents/${resolvedPath}?ref=${workspace.branch}`);
                assetItem.sha = fileMeta.sha;
            }
            
            let content = await FileSystemProvider.read(assetItem);
            
            // --- FOOLPROOF CONTENT HANDLING ---
            // This is the same logic as above, now applied to the inliner.
            if (content instanceof Blob) { // This handles the Local FS case
                content = await content.text();
            } else if (content && content.isBinary) { // This handles the GitHub binary case
                content = FileSystemProvider.GitHub.b64_to_utf8(content.base64Content);
            }
            // If it's already a string, we do nothing.

            if (typeof content !== 'string') {
                throw new Error(`Asset content could not be converted to a string for '${resolvedPath}'`);
            }

            if (isLink) {
                const style = doc.createElement('style');
                style.textContent = content;
                el.parentNode.replaceChild(style, el);
            } else { // It's a <script> tag
                const script = doc.createElement('script');
                script.textContent = content;
                el.parentNode.replaceChild(script, el);
            }
        } catch (e) { 
            console.error(`[PROCESSOR] Could not inline asset: ${resolvedPath}`, e); 
        }
    }

    return doc.documentElement.outerHTML;
}

// All other functions (attach/detach) remain correct and unchanged.
// The main editor file server logic is now located inside handleIncomingRequest.
 
 
 