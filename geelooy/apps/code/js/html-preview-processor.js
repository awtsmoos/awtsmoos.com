// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import workerInterceptorScript from "./worker-intercept.js";
import importScriptsPolyfill from "./importScriptsHack.js";
import interceptorScriptContent from "./console-interceptor.js";

// B"H - This script is injected into the preview to handle dynamic assets.
const dynamicAssetInterceptorScript = `
(function() {
    'use strict';
    if (window.hasDynamicAssetInterceptor) return;
    window.hasDynamicAssetInterceptor = true;

    const basePath = '%%BASE_PATH%%';
    let assetRequestCounter = 0;
    const pendingAssets = new Map();

    function resolveRelativePath(base, relative) {
        if (!base || base === '/') {
            return \`/\${relative.replace(/^\\//, '')}\`;
        }
        try {
            const baseUrl = new URL(base, 'http://dummy.com/');
            const resolvedUrl = new URL(relative, baseUrl);
            return resolvedUrl.pathname;
        } catch (e) {
            console.error("[Dynamic Asset Interceptor] Path resolution error:", e);
            return relative;
        }
    }

    window.addEventListener('message', (event) => {
        if (event.source !== window.parent || !event.data || event.data.source !== 'vivid-x-dynamic-asset-loader') return;

        const { type, requestId, content, error } = event.data;
        if (type === 'asset-response' && pendingAssets.has(requestId)) {
            const { element, resolve, reject } = pendingAssets.get(requestId);
            pendingAssets.delete(requestId);

            if (error) {
                console.error('[Dynamic Asset Interceptor] Failed to load asset:', error);
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

    function fetchAndInline(element, attribute) {
        return new Promise((resolve, reject) => {
            const originalPath = element.getAttribute(attribute);
            if (!originalPath || originalPath.startsWith('data:') || originalPath.startsWith('blob:')) {
                return resolve();
            }
            
            element.removeAttribute(attribute);
            element.dataset.originalSrc = originalPath;

            const resolvedPath = resolveRelativePath(basePath, originalPath);
            const requestId = assetRequestCounter++;
            
            pendingAssets.set(requestId, { element, resolve, reject });

            window.parent.postMessage({
                source: 'html-preview-dynamic-asset-request',
                type: 'fetch-asset',
                path: resolvedPath,
                requestId: requestId
            }, '*');
        });
    }

    async function processNodes(nodeList) {
        const promises = [];
        for (const node of nodeList) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            
            if (node.matches('script[src]')) promises.push(fetchAndInline(node, 'src'));
            if (node.matches('link[rel="stylesheet"][href]')) promises.push(fetchAndInline(node, 'href'));
            
            node.querySelectorAll('script[src]').forEach(el => promises.push(fetchAndInline(el, 'src')));
            node.querySelectorAll('link[rel="stylesheet"][href]').forEach(el => promises.push(fetchAndInline(el, 'href')));
        }
        await Promise.all(promises).catch(err => console.error("[Dynamic Asset Interceptor] Error processing nodes:", err));
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
                 event.source.postMessage({ source: 'vivid-x-dynamic-asset-loader', type: 'asset-response', requestId, error: \`Workspace (ID: \${baseItem.workspaceId}) not found.\` }, event.origin);
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
                event.source.postMessage({ source: 'vivid-x-dynamic-asset-loader', type: 'asset-response', requestId, error: \`Failed to fetch '\${path}': \${e.message}\` }, event.origin);
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
        let resolvedPath;
        if (type === 'fetch-script-content') {
            resolvedPath = resolveRelativePath(basePath, relativePath);
        } else {
            resolvedPath = resolveRelativePath(baseItem.path, relativePath);
        }

        try {
            const assetItem = { ...workspace, path: resolvedPath };
            let scriptContent = await FileSystemProvider.read(assetItem);
            
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
            const errorMessage = \`File not found or could not be read: \${resolvedPath}. Error: \${e.message}\`;
            console.error(\`[FS_PROVIDER_ERROR] \${errorMessage}\`);
            
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
    
    const renderErrorOnPage = (message, error) => {
        const errorDiv = doc.createElement('div');
        errorDiv.style.cssText = 'background:#280000;border:2px solid #ff5555;color:#ffc8c8;padding:20px;margin:15px;font-family:monospace;white-space:pre-wrap;font-size:14px;line-height:1.6;z-index:999999;position:relative;';
        let errorText = \`B"H - FATAL PREVIEW ERROR:\n\n\${message}\`;
        if (error && error.stack) {
            errorText += \`\n\n--- STACK TRACE ---\n\${error.stack}\`;
        }
        errorDiv.textContent = errorText;
        doc.body ? doc.body.prepend(errorDiv) : doc.documentElement.prepend(errorDiv);
    };

    if (!workspace) {
        renderErrorOnPage("Could not find the current workspace.", new Error("Workspace is null or undefined."));
        return doc.documentElement.outerHTML;
    }

    const prependScript = (scriptContent) => {
        const el = doc.createElement('script');
        el.textContent = scriptContent;
        doc.head ? doc.head.prepend(el) : doc.documentElement.prepend(el);
    };
    
    // Inject all interceptors, including the new dynamic asset handler
    const basePath = baseItem.path.substring(0, baseItem.path.lastIndexOf('/')) || '/';
    prependScript(dynamicAssetInterceptorScript.replace('%%BASE_PATH%%', basePath));
    prependScript(interceptorScriptContent);
    prependScript(workerInterceptorScript);
    
    const assetElements = Array.from(doc.querySelectorAll('link[rel="stylesheet"][href], script[src]'));
    
    for (const el of assetElements) {
        const pathAttr = el.getAttribute('href') || el.getAttribute('src');
        if (/^(?:[a-z]+:)/.test(pathAttr)) continue;

        const isLink = el.tagName === 'LINK';
        const resolvedPath = resolveRelativePath(baseItem.path, pathAttr);

        try {
            const assetItem = { ...workspace, path: resolvedPath };
            
            if (assetItem.type === 'github') {
                const fileMeta = await FileSystemProvider.GitHub.api(\`/repos/\${assetItem.repoInfo.owner}/\${assetItem.repoInfo.repo}/contents/\${resolvedPath}?ref=\${assetItem.branch}\`);
                assetItem.sha = fileMeta.sha;
            }
            
            let content = await FileSystemProvider.read(assetItem);
            
            if (content instanceof Blob) {
                content = await content.text();
            } else if (content && content.isBinary) {
                content = FileSystemProvider.GitHub.b64_to_utf8(content.base64Content);
            }

            if (typeof content !== 'string') {
                throw new Error(\`Asset content for '\${resolvedPath}' could not be read as string.\`);
            }
            
            const newEl = isLink ? doc.createElement('style') : doc.createElement('script');
            for (const attr of el.attributes) {
            	if (attr.name !== "src" && attr.name !== "href") {
            		newEl.setAttribute(attr.name, attr.value);
            	}
            }
            newEl.textContent = content;
            el.parentNode.replaceChild(newEl, el);
            
        } catch (e) { 
            renderErrorOnPage(\`Could not inline static asset: \${resolvedPath}\`, e);
        }
    }

    return doc.documentElement.outerHTML;
}

function resolveRelativePath(basePath, relativePath) {
    if (!basePath || basePath === '/') {
        return \`/\${relativePath.replace(/^\\//, '')}\`;
    }
    const baseUrl = new URL(basePath, 'http://dummy.com/');
    const resolvedUrl = new URL(relativePath, baseUrl);
    return resolvedUrl.pathname;
}