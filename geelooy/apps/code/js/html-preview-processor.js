// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import workerInterceptorScript from "./worker-intercept.js";
import importScriptsPolyfill from "./importScriptsHack.js";
import interceptorScriptContent from "./console-interceptor.js";
// Helper function remains necessary for path resolution.
// In: js/html-preview-processor.js





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


async function handleIncomingRequest(event, baseItem) {
    const { type, path: relativePath, basePath } = event.data;
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    if (!workspace) return;

    if (type === 'fetch-worker-script' || type === 'fetch-script-content') {
        const id = event.data.id;
        let resolvedPath;
        if (type === 'fetch-script-content') {
            resolvedPath = resolveRelativePath(basePath, relativePath);
        } else {
            resolvedPath = resolveRelativePath(baseItem.path, relativePath);
        }

        try {
            const assetItem = { ...workspace, path: resolvedPath };
            // We no longer need to fetch GitHub metadata here just to read.
            // FileSystemProvider.read will handle it.
            
            let scriptContent = await FileSystemProvider.read(assetItem);
            
            // This logic correctly handles all data types from your FS Provider.
            if (scriptContent instanceof Blob) {
                scriptContent = await scriptContent.text();
            } else if (scriptContent && scriptContent.isBinary) {
                scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);
            }

            if (type === 'fetch-worker-script') {
                const polyfillWithContext = importScriptsPolyfill.replace('%%WORKER_BASE_PATH%%', resolvedPath);
                const finalContent = polyfillWithContext + '\n' + scriptContent;
                const blob = new Blob([finalContent], { type: 'application/javascript' });
                const blobUrl = URL.createObjectURL(blob);
                event.source.postMessage({ type: 'worker-script-response', id, blobUrl }, '*');

            } else { // 'fetch-script-content'
                event.source.postMessage({ type: 'script-content-response', id, content: scriptContent, path: resolvedPath }, '*');
            }
        } catch (e) {
            // --- THIS IS THE ROBUST ERROR HANDLING ---
            const errorMessage = `File not found or could not be read: ${resolvedPath}. Error: ${e.message}`;
            console.error(`[FS_PROVIDER_ERROR] ${errorMessage}`);
            
            if (type === 'fetch-worker-script') {
                event.source.postMessage({ type: 'worker-script-response', id, error: errorMessage }, '*');
            } else {
                event.source.postMessage({ type: 'script-content-response', id, error: errorMessage }, '*');
            }
        }
    }
}

export async function processHtmlForPreview(htmlContent, baseItem) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    
    // This helper function is now enhanced to display full stack traces.
    const renderErrorOnPage = (message, error) => {
        const errorDiv = doc.createElement('div');
        errorDiv.style.background = '#280000';
        errorDiv.style.border = '2px solid #ff5555';
        errorDiv.style.color = '#ffc8c8';
        errorDiv.style.padding = '20px';
        errorDiv.style.margin = '15px';
        errorDiv.style.fontFamily = 'monospace';
        errorDiv.style.whiteSpace = 'pre-wrap'; // Preserves formatting of the stack trace
        errorDiv.style.fontSize = '14px';
        errorDiv.style.lineHeight = '1.6';
        errorDiv.style.zIndex = '999999';
        errorDiv.style.position = 'relative';

        let errorText = `B"H - FATAL PREVIEW ERROR:\n\n${message}`;
        if (error && error.stack) {
            // Append the full stack trace for complete debugging information.
            errorText += `\n\n--- STACK TRACE ---\n${error.stack}`;
        }
        errorDiv.textContent = errorText;

        if (doc.body) {
            doc.body.prepend(errorDiv);
        } else {
            // Fallback for documents without a body tag yet
            doc.documentElement.prepend(errorDiv);
        }
    };

    if (!workspace) {
        renderErrorOnPage("Could not find the current workspace in the application's state.", new Error("Workspace is null or undefined."));
        return doc.documentElement.outerHTML;
    }
    
    const interceptorConsoleElement = doc.createElement('script');
        interceptorConsoleElement.textContent = interceptorScriptContent;
        if (doc.head) doc.head.prepend(interceptorConsoleElement);
        else doc.documentElement.prepend(interceptorConsoleElement);

    const interceptorElement = doc.createElement('script');
    interceptorElement.textContent = workerInterceptorScript;
    if (doc.head) doc.head.prepend(interceptorElement);
    else doc.documentElement.prepend(interceptorElement);

    const assetElements = Array.from(doc.querySelectorAll('link[rel="stylesheet"][href], script[src]'));
    
    for (const el of assetElements) {
        const pathAttr = el.getAttribute('href') || el.getAttribute('src');
        
        // --- THE CORRECTED LOGIC ---
        // This condition now correctly processes root-relative paths (e.g., "/style.css")
        // and only skips fully qualified URLs (e.g., "https://...").
        if (/^(?:[a-z]+:)/.test(pathAttr)) continue;

        const isLink = el.tagName === 'LINK';
        const resolvedPath = resolveRelativePath(baseItem.path, pathAttr);

        try {
            const assetItem = { ...workspace, path: resolvedPath };
            
            if (assetItem.type === 'github') {
                const fileMeta = await FileSystemProvider.GitHub.api(`/repos/${assetItem.repoInfo.owner}/${assetItem.repoInfo.repo}/contents/${resolvedPath}?ref=${assetItem.branch}`);
                assetItem.sha = fileMeta.sha;
            }
            
            let content = await FileSystemProvider.read(assetItem);
            
            if (content instanceof Blob) {
                content = await content.text();
            } else if (content && content.isBinary) {
                content = FileSystemProvider.GitHub.b64_to_utf8(content.base64Content);
            }

            if (typeof content !== 'string') {
                throw new Error(`Asset content for '${resolvedPath}' could not be read as a string. Received type: ${typeof content}`);
            }
            
            const newEl = isLink ? doc.createElement('style') : doc.createElement('script');
            
            // Preserve all original attributes (like type="module", async, etc.) except for src/href
            for (const attr of el.attributes) {
            	if (attr.name !== "src" && attr.name !== "href") {
            		newEl.setAttribute(attr.name, attr.value);
            	}
            }
            
            newEl.textContent = content;
            el.parentNode.replaceChild(newEl, el);
            
        } catch (e) { 
            renderErrorOnPage(`Could not inline asset: ${resolvedPath}`, e);
        }
    }

    return doc.documentElement.outerHTML;
}


function resolveRelativePath(basePath, relativePath) {
    // If the base path is the root, the absolute path is simply the relative path with a leading slash.
    // This also handles cases where the base path might not be provided.
    if (!basePath || basePath === '/') {
        return `/${relativePath.replace(/^\//, '')}`;
    }

    // The core logic for resolving paths within subdirectories using the URL constructor.
    const baseUrl = new URL(basePath, 'http://dummy.com/');
    const resolvedUrl = new URL(relativePath, baseUrl);
    
    // THE FIX: Return the full pathname directly. It correctly includes the leading slash.
    // The previous version had a .substring(1) here, which was the source of the bug.
    return resolvedUrl.pathname;
}

// All other functions in this file (attach/detach, handleIncomingRequest, etc.) are for the worker
// logic. They are correct and do not need to be changed.