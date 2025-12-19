
// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import { getNetworkInterceptorScript } from './html-preview-templates.js';

// B"H - Updated Path to SDK (Absolute to Root)
const MERKAVA_SDK_PATH = '/MerkavaExecutor/merkava-sdk.js';

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
    
    // 2. Pre-load Assets (Simple Blob URL replacement for images/css)
    await processAssets(doc, item);

    // 3. Prepare SDK Injection
    // We construct a bootstrap script that loads the SDK and initializes the VM.
    
    const scripts = Array.from(doc.querySelectorAll('script'));
    const userScripts = [];
    
    for (const script of scripts) {
        // Skip external scripts for now (handled by VM importResolver) unless we pre-fetch them?
        // Actually, we let the VM handle external imports via the bridge.
        if (script.hasAttribute('src')) {
             // For VM, we want to capture these src attributes and run them through VM.import
             // But simpler to just let them be, and intercept the fetch.
             // HOWEVER, script tags in iframe execute immediately.
             // We must change type to prevent browser execution.
             script.type = 'application/merkava-script'; 
             continue; 
        }
        
        // Inline scripts
        const content = script.innerHTML;
        script.remove(); // Remove from DOM so browser doesn't run it raw
        userScripts.push({ 
            content, 
            type: 'inline' 
        });
    }

    // 4. Construct Final HTML
    const finalHtml = doc.documentElement.outerHTML;

    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(finalHtml);
        iframeDoc.close();

        if (!iframeDoc.head) {
            const head = iframeDoc.createElement('head');
            iframeDoc.documentElement.insertBefore(head, iframeDoc.documentElement.firstChild);
        }

        // 5. Inject Interceptors & SDK
        // Network Interceptor (for fetch/imports)
        const scriptNetwork = iframeDoc.createElement('script');
        scriptNetwork.textContent = getNetworkInterceptorScript(item.workspaceId, item.path);
        iframeDoc.head.insertBefore(scriptNetwork, iframeDoc.head.firstChild);

        // SDK Loader & Bootstrap
        const bootstrapScript = iframeDoc.createElement('script');
        bootstrapScript.textContent = `
            // B"H - Merkava Bootstrap
            (async function() {
                console.log("[Merkava] Booting...");
                
                // 1. Load SDK
                const sdkUrl = "${MERKAVA_SDK_PATH}";
                await new Promise((resolve, reject) => {
                    const s = document.createElement('script');
                    s.src = sdkUrl + "?t=" + Date.now();
                    s.onload = resolve;
                    s.onerror = reject;
                    document.head.appendChild(s);
                });
                
                if (!window.Merkava) {
                    console.error("[Merkava] SDK failed to load.");
                    return;
                }

                // 2. Initialize
                await window.Merkava.init();
                console.log("[Merkava] SDK Initialized.");

                // 3. Define Import Resolver (Bridge to Editor FS)
                const importResolver = async (specifier) => {
                    // Use the bridge function defined by Network Interceptor
                    if (window._fetchFromParent) {
                        try {
                            const content = await window._fetchFromParent(specifier);
                            return { code: content };
                        } catch(e) {
                            console.error("[Merkava] Import Failed:", specifier, e);
                            return null;
                        }
                    }
                    return null;
                };

                // 4. Run Inline Scripts
                const scripts = ${JSON.stringify(userScripts)};
                
                for (const script of scripts) {
                    try {
                        await window.Merkava.run(script.content, {
                            context: window, // Run in Window context
                            importResolver: importResolver,
                            ramLimit: 500000
                        });
                    } catch(e) {
                        console.error("[Merkava] Script Error:", e);
                    }
                }
                
                // 5. Process <script type="application/merkava-script" src="...">
                const externalScripts = document.querySelectorAll('script[type="application/merkava-script"]');
                for (const s of externalScripts) {
                    const src = s.getAttribute('src');
                    if (src) {
                        // Bridge fetch
                        const res = await importResolver(src);
                        if (res && res.code) {
                             await window.Merkava.run(res.code, {
                                context: window,
                                importResolver: importResolver
                            });
                        }
                    }
                }

            })();
        `;
        iframeDoc.body.appendChild(bootstrapScript);

    } catch(e) {
        console.error("[Preview] Failed to write to iframe:", e);
    }
};

// Helper: Pre-load images/css to Blob URLs to avoid 404s in iframe
async function processAssets(doc, item) {
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

    const elements = [
        ...Array.from(doc.querySelectorAll('img[src], video[src], audio[src]')),
        ...Array.from(doc.querySelectorAll('link[rel="stylesheet"][href]'))
    ];

    await Promise.all(elements.map(async (el) => {
        const attr = el.tagName === 'LINK' ? 'href' : 'src';
        const rawPath = el.getAttribute(attr);
        const absPath = resolveRelativePath(rawPath);
        
        if (absPath) {
            try {
                let typeHint = 'text/plain';
                if (el.tagName === 'IMG') typeHint = 'image/png';
                else if (el.tagName === 'LINK') typeHint = 'text/css';

                const fsItem = { ...item, path: absPath, kind: 'file' };
                const content = await FileSystemProvider.read(fsItem);
                
                let blob;
                if (content instanceof Blob) blob = content;
                else if (content && content.base64Content) {
                    const bin = atob(content.base64Content);
                    const len = bin.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
                    blob = new Blob([bytes], { type: content.mime || typeHint });
                } else if (typeof content === 'string') {
                    blob = new Blob([content], { type: typeHint });
                }

                if (blob) {
                    el.setAttribute(attr, URL.createObjectURL(blob));
                }
            } catch (e) { /* ignore missing assets */ }
        }
    }));
}
