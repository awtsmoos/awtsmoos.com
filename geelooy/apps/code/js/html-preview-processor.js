
// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import { SHIM_SCRIPT, getBootstrapScript, getNetworkInterceptorScript, getWorkerInterceptorScript } from './html-preview-templates.js';

// B"H - Hardcoded SDK Path resolved against origin for Blob Worker compatibility
const SDK_PATH = new URL('/scripts/awtsmoos/MerkavaExecutor/merkava-sdk.js', window.location.origin).href;

export const orchestratePreview = async (item, iframe, contentOverride = null) => {
    if (!iframe.parentNode) {
        console.warn("[Preview] Iframe detached. Aborting orchestration.");
        return;
    }

    let htmlContent = contentOverride;
    
    if (htmlContent === null) {
        try {
            htmlContent = await FileSystemProvider.read(item);
            if (htmlContent instanceof Blob) htmlContent = await htmlContent.text();
            else if (htmlContent.base64Content) htmlContent = atob(htmlContent.base64Content);
        } catch (e) {
            console.error("[Preview] Failed to read source:", e);
            return;
        }
    }

    if (!htmlContent) return;

    // 1. Parse User HTML to process relative assets
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const resolveRelativePath = (relPath) => {
        if (!relPath || relPath.startsWith('http') || relPath.startsWith('data:') || relPath.startsWith('blob:')) return null;
        if (relPath.startsWith('/')) return relPath;
        const basePath = item.path.substring(0, item.path.lastIndexOf('/'));
        const stack = basePath ? basePath.split('/').filter(p => p) : [];
        const parts = relPath.split('/');
        for (const p of parts) {
            if (p === '..') stack.pop();
            else if (p !== '.') stack.push(p);
        }
        return '/' + stack.join('/');
    };

    // 2. Pre-load assets (images, css)
    const elementsToProcess = [
        ...Array.from(doc.querySelectorAll('img[src], video[src], audio[src], source[src]')),
        ...Array.from(doc.querySelectorAll('link[rel="stylesheet"][href]')),
        ...Array.from(doc.querySelectorAll('script[src]')) 
    ];

    await Promise.all(elementsToProcess.map(async (el) => {
        const attr = el.tagName === 'LINK' ? 'href' : 'src';
        const rawPath = el.getAttribute(attr);
        const absPath = resolveRelativePath(rawPath);
        
        if (absPath) {
            try {
                let typeHint = 'text/plain';
                if (el.tagName === 'IMG') typeHint = 'image/png';
                else if (el.tagName === 'SCRIPT') typeHint = 'application/javascript';
                else if (el.tagName === 'LINK') typeHint = 'text/css';

                const fsItem = { ...item, path: absPath, kind: 'file' };
                const content = await FileSystemProvider.read(fsItem);
                
                let blob;
                if (content instanceof Blob) {
                    blob = content;
                } else if (content && content.base64Content) {
                    const bin = atob(content.base64Content);
                    const len = bin.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
                    blob = new Blob([bytes], { type: content.mime || typeHint });
                } else if (typeof content === 'string') {
                    blob = new Blob([content], { type: typeHint });
                }

                if (blob) {
                    const blobUrl = URL.createObjectURL(blob);
                    el.setAttribute(attr, blobUrl);
                    el.setAttribute('data-awtsmoos-processed', 'true');
                }
            } catch (e) {
                // Warning only, don't stop execution
                console.warn(`[Preview] Failed to pre-load asset: ${absPath}`, e);
            }
        }
    }));

    // 3. Extract User Scripts (Inline) to run via Merkava later
    const scripts = Array.from(doc.querySelectorAll('script'));
    const userScripts = [];
    
    for (const script of scripts) {
        if (script.hasAttribute('src')) continue; 
        if (script.textContent.includes('B"H -')) continue;

        const content = script.innerHTML;
        script.remove(); // Remove from DOM
        userScripts.push({ 
            path: item.path, 
            content, 
            isInline: true, 
            workspaceId: item.workspaceId 
        });
    }

    // 4. Prepare the final HTML
    const finalHtml = doc.documentElement.outerHTML;

    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // A. Reset document
        iframeDoc.open();
        iframeDoc.write(finalHtml);
        iframeDoc.close();

        // B"H - SAFETY: Ensure HEAD exists
        if (!iframeDoc.head) {
            const head = iframeDoc.createElement('head');
            if (iframeDoc.documentElement) {
                iframeDoc.documentElement.insertBefore(head, iframeDoc.documentElement.firstChild);
            } else {
                iframeDoc.appendChild(head);
            }
        }

        // B. Inject Interceptors Programmatically
        const sdkBaseDir = SDK_PATH.substring(0, SDK_PATH.lastIndexOf('/') + 1);
        
        // Create script nodes
        const scriptBootstrap = iframeDoc.createElement('script');
        scriptBootstrap.textContent = getBootstrapScript(sdkBaseDir, SDK_PATH, userScripts, item.workspaceId);
        
        const scriptWorker = iframeDoc.createElement('script');
        scriptWorker.textContent = getWorkerInterceptorScript(item.workspaceId, item.path, SDK_PATH);
        
        const scriptNetwork = iframeDoc.createElement('script');
        scriptNetwork.textContent = getNetworkInterceptorScript(item.workspaceId, item.path);
        
        const scriptShim = iframeDoc.createElement('script');
        scriptShim.textContent = SHIM_SCRIPT;

        // Append in execution order (top of head)
        iframeDoc.head.insertBefore(scriptWorker, iframeDoc.head.firstChild);
        iframeDoc.head.insertBefore(scriptNetwork, iframeDoc.head.firstChild);
        iframeDoc.head.insertBefore(scriptShim, iframeDoc.head.firstChild);
        
        if (userScripts.length > 0) {
            if (iframeDoc.body) {
                iframeDoc.body.appendChild(scriptBootstrap);
            } else {
                iframeDoc.documentElement.appendChild(scriptBootstrap);
            }
        }

    } catch(e) {
        console.error("[Preview] Failed to write to iframe:", e);
    }
};
