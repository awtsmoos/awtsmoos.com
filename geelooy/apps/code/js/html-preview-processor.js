// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import workerInterceptorScript from "./worker-intercept.js";
import importScriptsPolyfill from "./importScriptsHack.js";
import interceptorScriptContent from "./console-interceptor.js";

// This script gets injected into the iframe to handle dynamically added assets.
const dynamicAssetInterceptorScript = `
(function() {
    'use strict';
    if (window.hasDynamicAssetInterceptor) return;
    window.hasDynamicAssetInterceptor = true;

    const basePath = '%%BASE_PATH%%';
    let assetRequestCounter = 0;
    const pendingAssets = new Map();

    function resolveRelativePath(base, relative) {
        if (relative.startsWith('/')) {
            return relative;
        }
        try {
            // Use URL constructor for robust path resolution.
            const baseUrl = new URL(base, 'http://dummy.com/');
            const resolvedUrl = new URL(relative, baseUrl);
            return resolvedUrl.pathname;
        } catch (e) {
            console.error("[Dynamic Asset Interceptor] Path resolution error:", e);
            return relative;
        }
    }

    // Listens for asset content responses from the main app.
    window.addEventListener('message', (event) => {
        if (event.source !== window.parent || !event.data || event.data.source !== 'vivid-x-dynamic-asset-loader') return;

        const { type, requestId, content, error } = event.data;
        if (type === 'asset-response' && pendingAssets.has(requestId)) {
            const { element, resolve, reject } = pendingAssets.get(requestId);
            pendingAssets.delete(requestId);

            if (error) {
                console.error('[Dynamic Asset Interceptor] Main app failed to load asset:', error);
                element.dataset.loadError = error;
                reject(new Error(error));
                return;
            }

            if (element.tagName === 'SCRIPT') {
                element.textContent = content;
            } else if (element.tagName === 'LINK' && element.rel === 'stylesheet') {
                const style = document.createElement('style');
                for (const attr of element.attributes) {
                    if (attr.name !== 'href' && attr.name !== 'rel') {
                        style.setAttribute(attr.name, attr.value);
                    }
                }
                style.textContent = content;
                element.parentNode.replaceChild(style, element);
            }
            resolve();
        }
    });

    // Intercepts an element, requests its content, and inlines it.
    function fetchAndInline(element, attribute) {
        return new Promise((resolve, reject) => {
            const originalPath = element.getAttribute(attribute);
            if (!originalPath || originalPath.startsWith('data:') || originalPath.startsWith('blob:')) {
                return resolve();
            }
            
            element.removeAttribute(attribute);
            element.dataset.originalSrc = originalPath;

            const resolvedPath = resolveRelativePath(basePath, originalPath);
            
            // --- THIS IS THE FIX ---
            // Correctly use and increment the assetRequestCounter variable.
            const requestId = assetRequestCounter++;
            // --- END FIX ---
            
            pendingAssets.set(requestId, { element, resolve, reject });

            // Ask the main application to fetch the asset for us.
            window.parent.postMessage({
                source: 'html-preview-dynamic-asset-request',
                type: 'fetch-asset',
                path: resolvedPath,
                requestId: requestId
            }, '*');
        });
    }

    // Processes a list of newly added DOM nodes to find and handle assets.
    async function processNodes(nodeList) {
        const promises = [];
        for (const node of nodeList) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            
            if (node.matches('script[src]')) promises.push(fetchAndInline(node, 'src'));
            if (node.matches('link[rel="stylesheet"][href]')) promises.push(fetchAndInline(node, 'href'));
            
            node.querySelectorAll('script[src]').forEach(el => promises.push(fetchAndInline(el, 'src')));
            node.querySelectorAll('link[rel="stylesheet"][href]').forEach(el => promises.push(fetchAndInline(el, 'href')));
        }
        await Promise.all(promises).catch(err => {
            // This will now properly catch the error and log it.
             console.error("[Dynamic Asset Interceptor] Error processing nodes:", err);
        });
    }

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                processNodes(mutation.addedNodes);
            }
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
})();
`;

let currentDynamicAssetHandler = null;

export function attachDynamicAssetHandler(baseItem) {
    if (currentDynamicAssetHandler) {
        window.removeEventListener('message', currentDynamicAssetHandler);
    }

    currentDynamicAssetHandler = async (event) => {
        if (!event.data || event.data.source !== 'html-preview-dynamic-asset-request') return;

        const { type, path, requestId } = event.data;
        if (type === 'fetch-asset') {
            const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
            if (!workspace) {
                const errorMsg = `Workspace (ID: ${baseItem.workspaceId}) not found for dynamic asset request.`;
                event.source.postMessage({ source: 'vivid-x-dynamic-asset-loader', type: 'asset-response', requestId, error: errorMsg }, event.origin);
                return;
            }

            try {
                const assetItem = { ...workspace, path };
                let content = await FileSystemProvider.read(assetItem);

                if (content instanceof Blob) {
                    content = await content.text();
                } else if (content && content.isBinary) {
                    content = FileSystemProvider.GitHub.b64_to_utf8(content.base64Content);
                }

                event.source.postMessage({ source: 'vivid-x-dynamic-asset-loader', type: 'asset-response', requestId, content }, event.origin);
            } catch (e) {
                event.source.postMessage({ source: 'vivid-x-dynamic-asset-loader', type: 'asset-response', requestId, error: `Failed to fetch '${path}': ${e.message}` }, event.origin);
            }
        }
    };
    window.addEventListener('message', currentDynamicAssetHandler);
}

export function detachDynamicAssetHandler() {
    if (currentDynamicAssetHandler) {
        window.removeEventListener('message', currentDynamicAssetHandler);
        currentDynamicAssetHandler = null;
    }
}

export function attachWorkerRequestHandler(baseItem) {
    if (window.currentWorkerRequestHandler) {
        window.removeEventListener('message', window.currentWorkerRequestHandler);
    }
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
        const resolvedPath = (type === 'fetch-script-content')
            ? resolveRelativePath(basePath, relativePath)
            : resolveRelativePath(baseItem.path, relativePath);

        try {
            const assetItem = { ...workspace, path: resolvedPath };
            let scriptContent = await FileSystemProvider.read(assetItem);
            
            if (scriptContent instanceof Blob) scriptContent = await scriptContent.text();
            else if (scriptContent?.isBinary) scriptContent = FileSystemProvider.GitHub.b64_to_utf8(scriptContent.base64Content);

            if (type === 'fetch-worker-script') {
                const polyfillWithContext = importScriptsPolyfill.replace('%%WORKER_BASE_PATH%%', resolvedPath);
                const finalContent = `${polyfillWithContext}\n${scriptContent}`;
                const blob = new Blob([finalContent], { type: 'application/javascript' });
                const blobUrl = URL.createObjectURL(blob);
                event.source.postMessage({ type: 'worker-script-response', id, blobUrl }, '*');
            } else {
                event.source.postMessage({ type: 'script-content-response', id, content: scriptContent, path: resolvedPath }, '*');
            }
        } catch (e) {
            const errorMessage = `File not found or unreadable: ${resolvedPath}. Error: ${e.message}`;
            console.error(`[FS_PROVIDER_ERROR] ${errorMessage}`);
            const errorResponse = { id, error: errorMessage };
            event.source.postMessage({ type: type === 'fetch-worker-script' ? 'worker-script-response' : 'script-content-response', ...errorResponse }, '*');
        }
    }
}

export async function processHtmlForPreview(htmlContent, baseItem) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    
    const renderErrorOnPage = (message, error) => {
        const errorDiv = doc.createElement('div');
        errorDiv.style.cssText = 'background:#280000;border:2px solid #ff5555;color:#ffc8c8;padding:20px;margin:15px;font-family:monospace;white-space:pre-wrap;font-size:14px;line-height:1.6;z-index:999999;position:relative;';
        errorDiv.textContent = `B"H - FATAL PREVIEW ERROR:\n\n${message}\n\n--- STACK TRACE ---\n${error?.stack || 'Not available'}`;
        (doc.body || doc.documentElement).prepend(errorDiv);
    };

    if (!workspace) {
        renderErrorOnPage("Could not find the current workspace.", new Error("Workspace is null or undefined."));
        return doc.documentElement.outerHTML;
    }

    const prependScript = (scriptContent) => {
        const el = doc.createElement('script');
        el.textContent = scriptContent;
        (doc.head || doc.documentElement).prepend(el);
    };
    
    const basePath = baseItem.path;
    prependScript(dynamicAssetInterceptorScript.replace('%%BASE_PATH%%', basePath));
    prependScript(interceptorScriptContent);
    prependScript(workerInterceptorScript);
    
    const assetElements = Array.from(doc.querySelectorAll('link[rel="stylesheet"][href], script[src]'));
    
    for (const el of assetElements) {
        const pathAttr = el.getAttribute('href') || el.getAttribute('src');
        
        // A more robust check for absolute URLs.
        let isAbsolute = false;
        try {
            new URL(pathAttr);
            isAbsolute = true;
        } catch (e) {
            // Not a full URL, might be protocol-relative like //example.com/script.js
            if (pathAttr.startsWith('//')) {
                isAbsolute = true;
            }
        }
        if(isAbsolute) continue;

        const isLink = el.tagName === 'LINK';
        const resolvedPath = resolveRelativePath(baseItem.path, pathAttr);

        try {
            const assetItem = { ...workspace, path: resolvedPath };
            let content = await FileSystemProvider.read(assetItem);
            
            if (content instanceof Blob) content = await content.text();
            else if (content?.isBinary) content = FileSystemProvider.GitHub.b64_to_utf8(content.base64Content);

            if (typeof content !== 'string') throw new Error(`Asset content could not be read as string.`);
            
            const newEl = isLink ? doc.createElement('style') : doc.createElement('script');
            
            for (const { name, value } of el.attributes) {
            	if (name !== "src" && name !== "href") {
            		newEl.setAttribute(name, value);
            	}
            }
            
            newEl.textContent = content;
            el.parentNode.replaceChild(newEl, el);
            
        } catch (e) { 
            renderErrorOnPage(`Could not inline static asset: ${resolvedPath}`, e);
        }
    }

    return doc.documentElement.outerHTML;
}

// At the very bottom of html-preview-processor.js

function resolveRelativePath(basePath, relativePath) {
    if (relativePath.startsWith('/')) {
        return relativePath; // Already root-relative
    }
    // Get the directory of the base file path.
    const baseDir = basePath.substring(0, basePath.lastIndexOf('/'));
    try {
        // Use the URL constructor for reliable path joining.
        const baseUrl = new URL(baseDir + '/', 'http://dummy.com/');
        const resolvedUrl = new URL(relativePath, baseUrl);
        return resolvedUrl.pathname;
    } catch (e) {
        console.error("Path resolution failed:", e);
        return relativePath;
    }
}