// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import { getNetworkInterceptorScript } from './html-preview-templates.js';

// B"H - Updated Path to SDK (Absolute Reality)
const MERKAVA_SDK_PATH = '/scripts/awtsmoos/MerkavaExecutor/merkava-sdk.js';

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

    // 1. Parse User HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // 2. Pre-load Assets
    await processAssets(doc, item);

    // 3. Extract Scripts
    const allScripts = Array.from(doc.querySelectorAll('script'));
    const scriptQueue = [];

    for (const script of allScripts) {
        if (script.hasAttribute('data-merkava-internal')) continue;

        const src = script.getAttribute('src');
        const type = script.getAttribute('type') || 'text/javascript';
        
        if (type !== 'text/javascript' && type !== 'module' && type !== '' && type !== 'application/javascript') {
            continue;
        }

        if (src) {
            scriptQueue.push({ type: 'external', src: src });
        } else {
            scriptQueue.push({ type: 'inline', content: script.innerHTML });
        }
        script.remove();
    }

    // 4. Construct Final HTML
    const finalHtml = doc.documentElement.outerHTML;
    
    console.log(`[Merkava Debug] HTML Injection Size: ${finalHtml.length} chars.`);

    try {
        // B"H - Safe Iframe Write
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if(!iframeDoc) throw new Error("Cannot access iframe document.");
        
        iframeDoc.open();
        iframeDoc.write(finalHtml);
        iframeDoc.close();
        
        if (!iframeDoc.head) {
            const head = iframeDoc.createElement('head');
            iframeDoc.documentElement.insertBefore(head, iframeDoc.documentElement.firstChild);
        }

        // 5. Inject Interceptors & SDK
        const scriptNetwork = iframeDoc.createElement('script');
        scriptNetwork.textContent = getNetworkInterceptorScript(item.workspaceId, item.path);
        scriptNetwork.setAttribute('data-merkava-internal', 'true');
        iframeDoc.head.insertBefore(scriptNetwork, iframeDoc.head.firstChild);

        // SDK Loader & Bootstrap
        const bootstrapScript = iframeDoc.createElement('script');
        bootstrapScript.setAttribute('data-merkava-internal', 'true');
        
        const queueJson = JSON.stringify(scriptQueue);
        
        bootstrapScript.textContent = `
            // B"H - Merkava Bootstrap v5 (Trace Logging)
            (function() {
                console.log("[Merkava Debug] Bootstrap Script Started. Time:", Date.now());
                
                const pollDOM = (callback) => {
                    const check = () => {
                        const body = document.body;
                        const ready = document.readyState;
                        
                        // console.log("[Merkava Debug] Polling DOM... State:", ready);
                        
                        if (body && (body.children.length > 0 || ready === 'complete')) {
                            // console.log("[Merkava Debug] DOM appears ready. Proceeding.");
                            setTimeout(callback, 50); 
                        } else {
                            // console.log("[Merkava Debug] DOM not ready. Retrying...");
                            requestAnimationFrame(check);
                        }
                    };
                    check();
                };

                const boot = async () => {
                    console.log("[Merkava Debug] Boot sequence initiated.");
                    
                    const sdkUrl = "${MERKAVA_SDK_PATH}";
                    try {
                        await new Promise((resolve, reject) => {
                            const s = document.createElement('script');
                            s.src = sdkUrl + "?t=" + Date.now();
                            s.onload = resolve;
                            s.onerror = () => reject(new Error("Failed to load SDK script"));
                            document.head.appendChild(s);
                        });
                        console.log("[Merkava Debug] SDK Script Loaded.");
                    } catch(e) {
                        console.error("[Merkava Debug] Critical: SDK Load Failed.", e);
                        return;
                    }
                    
                    if (!window.Merkava) {
                        console.error("[Merkava Debug] SDK failed to initialize global object.");
                        return;
                    }

                    await window.Merkava.init();
                    console.log("[Merkava Debug] SDK Initialized. Starting VM...");

                    const importResolver = async (specifier) => {
                        if (window._fetchFromParent) {
                            try {
                                const content = await window._fetchFromParent(specifier);
                                return { code: content };
                            } catch(e) {
                                console.warn("[Merkava Debug] Import 404/Error:", specifier, e.message);
                                return null; 
                            }
                        }
                        return null;
                    };

                    let sharedVM = null;
                    const queue = ${queueJson};
                    
                    for (const task of queue) {
                        try {
                            let codeToRun = null;
                            if (task.type === 'inline') {
                                codeToRun = task.content;
                            } else if (task.type === 'external') {
                                console.log("[Merkava Debug] Fetching external script:", task.src);
                                const res = await importResolver(task.src);
                                if (res && res.code) codeToRun = res.code;
                                else console.warn("[Merkava Debug] Skipping missing script:", task.src);
                            }

                            if (codeToRun) {
                                console.log("[Merkava Debug] Spawning VM for script. Length:", codeToRun.length);
                                const res = await window.Merkava.run(codeToRun, {
                                    context: window,
                                    importResolver: importResolver,
                                    ramLimit: 500000,
                                    existingVM: sharedVM
                                });
                                
                                if (!sharedVM && res.vm) {
                                    sharedVM = res.vm;
                                    console.log("[Merkava Debug] Primary VM Established.");
                                }
                            }
                        } catch(e) {
                            console.error("[Merkava Debug] Script Execution Error:", e);
                        }
                    }
                    console.log("[Merkava Debug] All scripts processed.");
                };

                // Trigger Polling
                pollDOM(boot);
            })();
        `;
        iframeDoc.body.appendChild(bootstrapScript);

    } catch(e) {
        console.error("[Preview] Failed to write to iframe:", e);
    }
};

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