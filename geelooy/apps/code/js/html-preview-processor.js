

// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';

// Constant for the SDK path
const SDK_PATH = '/scripts/awtsmoos/MerkavaExecutor/merkava-sdk.js';

/**
 * B"H
 * The Orchestrator - v3.1 (Shim Recursion Fix)
 * This engine constructs a self-contained environment within the iframe.
 * It resolves relative paths, inlines CSS, and bootstraps the Merkava Runtime
 * inside the iframe itself, ensuring perfect isolation and execution context.
 */
export const orchestratePreview = async (item, iframe, contentOverride = null) => {
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
    // We need to resolve paths relative to the HTML file location.
    const resolveRelativePath = (relPath) => {
        if (relPath.startsWith('/') || relPath.startsWith('http')) return relPath;
        
        const basePath = item.path.substring(0, item.path.lastIndexOf('/'));
        const stack = basePath.split('/').filter(p => p);
        const parts = relPath.split('/');
        
        for (const p of parts) {
            if (p === '..') stack.pop();
            else if (p !== '.') stack.push(p);
        }
        
        const resolved = '/' + stack.join('/');
        return resolved;
    };

    // 4. Inline External CSS
    // Browsers in iframe (blob/data) often block relative CSS loads. Inlining fixes this.
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

    // 5. Inject Double-Buffering Shim (Anti-Flicker)
    const shimScript = doc.createElement('script');
    shimScript.textContent = /*js*/`
    (function() {
        // B"H - Double Buffering Shim (Recursion Fixed)
        const _getContext = HTMLCanvasElement.prototype.getContext;
        const _rAF = window.requestAnimationFrame;
        const canvasMap = new WeakMap();

        HTMLCanvasElement.prototype.getContext = function(type, options) {
            if (type !== '2d') return _getContext.call(this, type, options);
            
            // 1. Get the Real Context
            const realCtx = _getContext.call(this, type, options);
            
            // 2. Create Offscreen Canvas
            const offscreen = document.createElement('canvas');
            offscreen.width = this.width; 
            offscreen.height = this.height;
            
            // 3. Get Offscreen Context (CRITICAL: Use _getContext.call to bypass recursion)
            const offCtx = _getContext.call(offscreen, '2d');
            
            canvasMap.set(this, { offscreen, offCtx, realCtx });
            
            // 4. Return Proxy to intercept draws
            return new Proxy(offCtx, {
                get(t, p) { 
                    if (p === 'canvas') return realCtx.canvas;
                    const val = t[p];
                    if (typeof val === 'function') {
                        // Bind methods to the offscreen context to prevent Illegal Invocation
                        return val.bind(t);
                    }
                    return val;
                },
                set(t, p, v) { 
                    if (p === 'width' || p === 'height') {
                        offscreen[p] = v;
                        realCtx.canvas[p] = v; // Sync real canvas size too
                    }
                    t[p] = v; 
                    return true; 
                }
            });
        };

        window.requestAnimationFrame = function(cb) {
            // Blit phase: Copy offscreen buffers to real canvases
            const canvases = document.getElementsByTagName('canvas');
            for(let cvs of canvases) {
                const data = canvasMap.get(cvs);
                if(data && cvs.width > 0 && cvs.height > 0) {
                    const { offscreen, realCtx } = data;
                    
                    // Sync dimensions if they drifted
                    if(offscreen.width !== cvs.width) offscreen.width = cvs.width;
                    if(offscreen.height !== cvs.height) offscreen.height = cvs.height;
                    
                    // Clear and Draw
                    realCtx.clearRect(0, 0, cvs.width, cvs.height);
                    realCtx.drawImage(offscreen, 0, 0);
                }
            }
            return _rAF(cb);
        };
    })();
    `;
    doc.head.prepend(shimScript);

    // 6. Inject Merkava Bootstrap
    // This script loads the SDK and runs the user's scripts via the VM.
    const scripts = Array.from(doc.querySelectorAll('script'));
    const userScripts = [];
    
    // Extract script data
    for (const script of scripts) {
        if (script === shimScript) continue; // Skip our shim
        const src = script.getAttribute('src');
        const content = script.innerHTML;
        const type = script.getAttribute('type');
        
        // Remove from DOM to prevent default execution
        script.remove();
        
        // We only process if it's not a remote URL
        if (src && (src.startsWith('http') || src.startsWith('//'))) {
            // Re-inject remote scripts as-is
            const s = doc.createElement('script');
            s.src = src;
            if(type) s.type = type;
            doc.body.appendChild(s);
        } else {
            let scriptPath = item.path; // Default to current file for inline
            if (src) scriptPath = resolveRelativePath(src);
            // B"H - Include workspaceId for context resolution during imports
            userScripts.push({ 
                path: scriptPath, 
                content, 
                isInline: !src, 
                workspaceId: item.workspaceId 
            });
        }
    }

    // Pass scripts to bootstrap.
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

    // B"H - Calculate Absolute Base Path for SDK
    const sdkBaseDir = SDK_PATH.substring(0, SDK_PATH.lastIndexOf('/') + 1);
    const absoluteBase = new URL(sdkBaseDir, window.location.href).href;

    const bootstrapScript = doc.createElement('script');
    bootstrapScript.textContent = /*js*/`
    (async function() {
        // B"H - Merkava Bootstrap
        
        // FORCE BASE PATH for module loading
        window.MERKAVA_OVERRIDE_BASE_PATH = "${absoluteBase}";
        const WORKSPACE_ID = "${item.workspaceId}"; // B"H - Context for imports
        
        const SDK_URL = "${SDK_PATH}";
        
        // 1. Load SDK
        const sdkBlob = await fetch(SDK_URL).then(r => r.blob());
        const sdkUrl = URL.createObjectURL(sdkBlob);
        await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = sdkUrl;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });

        if (!window.Merkava) {
            console.error("Merkava SDK failed to load.");
            return;
        }

        await window.Merkava.init();

        const scripts = ${JSON.stringify(userScripts)};

        // 2. Execute User Scripts
        for (const script of scripts) {
            try {
                // Console Bridge
                const hostAPI = {
                    0: (...args) => {
                        console.log(...args);
                        // Send to parent console tab
                        window.parent.postMessage({
                            source: 'html-preview-console', 
                            type: 'log', 
                            payload: { level: 'log', args: args }
                        }, '*');
                    }
                };

                // B"H - Import Resolver Bridge
                const importResolver = async (specifier) => {
                    if (hostAPI[0]) hostAPI[0]("[VM] Resolving Import: " + specifier);
                    return new Promise((resolve, reject) => {
                        const id = Math.random().toString(36).slice(2);
                        const handler = (e) => {
                            if (e.data.type === 'import-response' && e.data.id === id) {
                                window.removeEventListener('message', handler);
                                if (e.data.error) reject(new Error(e.data.error));
                                else resolve(e.data.content);
                            }
                        };
                        window.addEventListener('message', handler);
                        
                        window.parent.postMessage({
                            source: 'html-preview-bridge',
                            type: 'import-request',
                            specifier: specifier,
                            referrer: script.path,
                            workspaceId: WORKSPACE_ID,
                            id: id
                        }, '*');
                    });
                };

                await window.Merkava.run(script.content, {
                    context: window,
                    hostAPI: hostAPI,
                    importResolver: importResolver
                });
            } catch(e) {
                console.error("Runtime Error:", e);
                const errDiv = document.createElement('div');
                errDiv.style.cssText = "position:fixed; top:0; left:0; right:0; background:rgba(50,0,0,0.9); color:#ffaaaa; padding:10px; border-bottom:2px solid red; font-family:monospace; z-index:99999;";
                errDiv.innerText = "Runtime Error: " + e.message;
                document.body.appendChild(errDiv);
            }
        }
    })();
    `;
    doc.body.appendChild(bootstrapScript);

    // 7. Write to Iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(doc.documentElement.outerHTML);
    iframeDoc.close();
};