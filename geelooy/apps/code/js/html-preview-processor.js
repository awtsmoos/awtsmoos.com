
// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import { SHIM_SCRIPT, getBootstrapScript } from './html-preview-templates.js';

// Constant for the SDK path
const SDK_PATH = '/scripts/awtsmoos/MerkavaExecutor/merkava-sdk.js';

/**
 * B"H
 * The Orchestrator - v3.5 (Reload Fix)
 */
export const orchestratePreview = async (item, iframe, contentOverride = null) => {
    // 0. Ensure iframe is in DOM and accessible
    if (!iframe.parentNode) {
        console.warn("[Preview] Iframe detached. Aborting orchestration.");
        return;
    }

    // 1. Acquire Source HTML
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

    // 2. Parse DOM for Processing
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // 3. Resolve Path Helpers
    const resolveRelativePath = (relPath) => {
        if (relPath.startsWith('/') || relPath.startsWith('http')) return relPath;
        const basePath = item.path.substring(0, item.path.lastIndexOf('/'));
        // If basePath is empty (root file), parts are just relPath parts.
        const stack = basePath ? basePath.split('/').filter(p => p) : [];
        const parts = relPath.split('/');
        for (const p of parts) {
            if (p === '..') stack.pop();
            else if (p !== '.') stack.push(p);
        }
        return '/' + stack.join('/');
    };

    // 4. Inline External CSS
    const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
    for (const link of links) {
        const href = link.getAttribute('href');
        if (href) {
            try {
                const cssPath = resolveRelativePath(href);
                const cssItem = { ...item, path: cssPath, kind: 'file' };
                let cssContent = await FileSystemProvider.read(cssItem);
                if (cssContent instanceof Blob) cssContent = await cssContent.text();
                const style = doc.createElement('style');
                style.textContent = cssContent;
                link.replaceWith(style);
            } catch (e) {
                console.warn(`[Preview] Failed to inline CSS: ${href}`, e);
            }
        }
    }

    // 5. Inject Double-Buffering Shim
    const shimScript = doc.createElement('script');
    shimScript.textContent = SHIM_SCRIPT;
    doc.head.prepend(shimScript);

    // 6. Inject Merkava Bootstrap
    const scripts = Array.from(doc.querySelectorAll('script'));
    const userScripts = [];
    
    for (const script of scripts) {
        if (script === shimScript) continue; 
        const src = script.getAttribute('src');
        const content = script.innerHTML;
        const type = script.getAttribute('type');
        script.remove();
        
        if (src && (src.startsWith('http') || src.startsWith('//'))) {
            const s = doc.createElement('script');
            s.src = src;
            if(type) s.type = type;
            doc.body.appendChild(s);
        } else {
            let scriptPath = item.path; 
            if (src) scriptPath = resolveRelativePath(src);
            userScripts.push({ 
                path: scriptPath, 
                content, 
                isInline: !src, 
                workspaceId: item.workspaceId 
            });
        }
    }

    for (const script of userScripts) {
        if (!script.isInline) {
            try {
                const sItem = { ...item, path: script.path, kind: 'file' };
                let sContent = await FileSystemProvider.read(sItem);
                if (sContent instanceof Blob) sContent = await sContent.text();
                else if (sContent && sContent.base64Content) sContent = atob(sContent.base64Content);
                script.content = sContent;
            } catch(e) {
                console.warn(`[Preview] Failed to load script ${script.path}`, e);
                script.content = `console.error("Failed to load script: ${script.path}");`;
            }
        }
    }

    const sdkBaseDir = SDK_PATH.substring(0, SDK_PATH.lastIndexOf('/') + 1);
    const absoluteBase = new URL(sdkBaseDir, window.location.href).href;

    const bootstrapScript = doc.createElement('script');
    bootstrapScript.textContent = getBootstrapScript(absoluteBase, SDK_PATH, userScripts, item.workspaceId);
    doc.body.appendChild(bootstrapScript);

    // 7. Write to Iframe - Safely
    // B"H - We ensure the document is cleared before writing.
    // Resetting the src to 'about:blank' can help clean slate, but might flicker.
    // Using open/write/close is standard for dynamic content.
    
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(doc.documentElement.outerHTML);
        iframeDoc.close();
    } catch(e) {
        console.error("[Preview] Failed to write to iframe:", e);
    }
};
