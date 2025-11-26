// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import { UI } from './ui.js';

// We import the Merkava SDK dynamically to ensure the pathways are open.
const SDK_PATH = '/scripts/awtsmoos/MerkavaExecutor/merkava-sdk.js';
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const nextFrame = () => new Promise(r => requestAnimationFrame(r));

/**
 * B"H
 * The recursive loader, the `Ohr Chozer` (Returning Light).
 * v2.1 - Universal Proxy Edition
 */
class ModuleLoader {
    constructor(workspaceId, iframeWindow) {
        this.workspaceId = workspaceId;
        this.iframeWindow = iframeWindow;
        this.moduleCache = new Map();
        this.Merkava = null;
        
        this.sharedMemory = null;
        this.sharedVM = null;
        this.hostAPI = null;
        this.context = null;
        
        this.exportHandlerStack = [];
        this.isLoopRunning = false;
    }

    async init() {
        if (this.Merkava) return;

        try {
            const module = await import(SDK_PATH);
            this.Merkava = module.default || window.Merkava;
        } catch (e) { console.warn("[Merkava] SDK import warning:", e); }
        if (!this.Merkava && window.Merkava) this.Merkava = window.Merkava;
        if (!this.Merkava) throw new Error("Merkava SDK missing.");

        await this.Merkava.init();

        // 1. Shared Memory
        this.sharedMemory = new window.MerkavaMemory.MemoryManager(5000);
        await this.sharedMemory.init();
        // Ensure Global Scope (Ptr 1) exists
        if (this.sharedMemory.nextPtr === 1) this.sharedMemory.allocate({});
        else if (!this.sharedMemory.ram.has(1)) {
             await this.sharedMemory.resolveFault(1);
             if (!this.sharedMemory.ram.has(1)) this.sharedMemory.set(1, {});
        }

        // 2. Host API
        this.hostAPI = {
            0: (...args) => console.log("[VM stdout]", ...args),
            1: (specifier) => {
                const requester = this.currentRunningPath || '/';
                return this.importResolver(requester, specifier);
            },
            // Syscall 2 (Export):
            // We assume the VM compiler emits STORE_GLOBAL for top-level vars.
            // Syscall 2 is mostly for confirming the export name exists.
            // We aggressively write the value to the Global Scope just in case.
            2: (name, value) => {
                const globalScope = this.sharedMemory.ram.get(1);
                if (globalScope) {
                    globalScope[name] = value;
                    this.sharedMemory.set(1, globalScope);
                }
            },
            0xFF: (target, source) => Object.assign(target, source)
        };

        // 3. Context & VM
        this.context = this.iframeWindow;
        this.sharedVM = new window.MerkavaVM(this.sharedMemory, this.hostAPI, this.context);
        this.sharedVM.onThreadSpawn = () => this.ensureLoop();
         window.__MERKAVA_SHARED_VM__ = this.sharedVM;
    }

    resolvePath(basePath, specifier) {
        if (specifier.startsWith('/')) return specifier;
        const stack = basePath.split('/');
        stack.pop();
        const parts = specifier.split('/');
        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') { if (stack.length > 0) stack.pop(); }
            else { stack.push(part); }
        }
        const res = stack.join('/');
        return res.startsWith('/') ? res : '/' + res;
    }

    async importResolver(requestingPath, specifier) {
        const fullPath = this.resolvePath(requestingPath, specifier);
        
        if (this.moduleCache.has(fullPath)) {
            return this.moduleCache.get(fullPath);
        }

        const proxyState = { scopePtr: null };

        const exportsProxy = new Proxy({}, {
            get: (target, prop) => {
                if (proxyState.scopePtr) {
                    const moduleScope = this.sharedMemory.ram.get(proxyState.scopePtr);
                    if (moduleScope && prop in moduleScope) {
                        return moduleScope[prop];
                    }
                }
                return target[prop];
            },
            set: (target, prop, value) => {
                if (proxyState.scopePtr) {
                    const moduleScope = this.sharedMemory.ram.get(proxyState.scopePtr);
                    if (moduleScope) {
                        moduleScope[prop] = value;
                        this.sharedMemory.set(proxyState.scopePtr, moduleScope);
                    }
                }
                target[prop] = value;
                return true;
            }
        });

        this.moduleCache.set(fullPath, exportsProxy);

        try {
            const workspace = State.workspaces.find(ws => ws.id === this.workspaceId);
            const item = { ...workspace, path: fullPath, kind: 'file' };
            let code = await FileSystemProvider.read(item);
            if (code instanceof Blob) code = await code.text();
            else if (code && code.base64Content) code = atob(code.base64Content);
            
            // Keep the Dove Sanity Patch if you wish, though this fix likely makes it redundant.
            if (fullPath.endsWith('dove.js')) {
                 code = code.replace('export let y = C.DOVE_START_Y;', 'export let y = 0;');
            }

            const prevPath = this.currentRunningPath;
            this.currentRunningPath = fullPath;
            this.exportHandlerStack.push(exportsProxy);
            
            // B"H - TIKKUN: RECEIVE THE TRUE SCOPE
            const actualScopePtr = await this.loadAndRunModule(code || '');
            proxyState.scopePtr = actualScopePtr;
            
            this.exportHandlerStack.pop();
            this.currentRunningPath = prevPath;

            return exportsProxy;

        } catch (e) {
            console.error(`[Merkava] Failed to resolve: ${specifier}`, e);
            throw e;
        }
    }


    async loadAndRunModule(code) {
        if (!this.sharedVM) await this.init();

        const parser = new window.MerkavahParser(code);
        if(parser.registerExpressionParsers) parser.registerExpressionParsers();
        if(parser.registerStatementParsers) parser.registerStatementParsers();
        if(parser.registerDeclarationParsers) parser.registerDeclarationParsers();
        
        const ast = parser.parse();
        const compiler = new window.MerkavaCompiler.Compiler();
        const codeObject = compiler.compile(ast);

        // Allocate Scope
        const moduleScopePtr = this.sharedMemory.allocate({});
        
        // B"H - CRITICAL FIX: Stack safety
        // We still need currentModuleScopePtr for Syscall 2 (Export) during execution,
        // but we save the previous one to restore it, handling nesting properly.
        const prevScopePtr = this.currentModuleScopePtr;
        this.currentModuleScopePtr = moduleScopePtr;

        const threadId = this.sharedVM.spawn(codeObject, moduleScopePtr);
        
        this.ensureLoop();

        try {
            await new Promise((resolve, reject) => {
                const check = () => {
                    const thread = this.sharedVM.threads.find(t => t.id === threadId);
                    if (!thread) resolve(); 
                    else if (thread.status === 2) reject(new Error(`Thread #${threadId} crashed.`));
                    else setTimeout(check, 10); 
                };
                check();
            });
        } finally {
            // RESTORE the previous scope pointer for the parent module
            this.currentModuleScopePtr = prevScopePtr;
        }
        
        // Return the pointer we created
        return moduleScopePtr;
    }

    ensureLoop() {
        if (this.isLoopRunning) return;
        this.isLoopRunning = true;
        const tick = () => {
            try {
                // B"H - Responsive Budget
                // Double buffering handles the flicker, so we can safely use a smaller budget
                // to prevent the "Freezing" you experienced.
                const deadline = performance.now() + 12; 
                let hasWork = true;
                
                while (performance.now() < deadline && hasWork) {
                    hasWork = this.sharedVM.run(5000); 
                }

                if (hasWork) {
                    if (this.iframeWindow.requestAnimationFrame) 
                        this.iframeWindow.requestAnimationFrame(tick);
                    else 
                        setTimeout(tick, 0);
                } else {
                    this.isLoopRunning = false; 
                }
            } catch (e) {
                console.error("[Merkava] VM Loop Crash:", e);
                this.isLoopRunning = false;
            }
        };
        tick();
    }
    
    async executeInSharedVM(code, path, exportsContainer) {
        this.currentRunningPath = path;
        this.exportHandlerStack.push(exportsContainer);
        try { await this.loadAndRunModule(code); } 
        finally { this.exportHandlerStack.pop(); }
    }
}

/**
 * B"H
 * The Orchestrator.
 * Now includes: CSS Inlining to ensure styles load from the Virtual FS.
 */
export const orchestratePreview = async (item, iframe, contentOverride = null) => {
    const workspaceId = item.workspaceId;
    
    // 1. Read the HTML Blueprint
    let htmlContent = contentOverride;
    
    if (htmlContent === null) {
        if (!item.type && item.workspaceId !== undefined) {
             const ws = State.workspaces.find(w => w.id === item.workspaceId);
             if (ws) item.type = ws.type;
        }

        try {
            htmlContent = await FileSystemProvider.read(item);
            if (htmlContent instanceof Blob) {
                htmlContent = await htmlContent.text();
            } else if (htmlContent && typeof htmlContent !== 'string' && htmlContent.base64Content) {
                htmlContent = atob(htmlContent.base64Content);
            }
        } catch (e) {
            console.error("Failed to read HTML source", e);
            return;
        }
    }

    if (!htmlContent) return;

    // 2. Parse DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // B"H - TIKKUN: INLINE CSS
    // We must fetch external stylesheets from the Virtual FS and weave them into the DOM.
    const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
    for (const link of links) {
        const href = link.getAttribute('href');
        if (href) {
            try {
                // Simple Path Resolution (Relative to the HTML file)
                let cssPath = href;
                if (!href.startsWith('/')) {
                    const basePath = item.path.substring(0, item.path.lastIndexOf('/'));
                    const stack = basePath.split('/').filter(p => p);
                    const parts = href.split('/');
                    for (const p of parts) {
                        if (p === '..') stack.pop();
                        else if (p !== '.') stack.push(p);
                    }
                    cssPath = (href.startsWith('/') ? '' : '/') + stack.join('/') + (stack.length > 0 ? '/' : '') + parts[parts.length - 1];
                    // Fix logic for simple filename:
                    if(basePath === '/') cssPath = '/' + href;
                    else cssPath = basePath + '/' + href;
                }

                // Fetch CSS content
                const cssItem = { ...item, path: cssPath, kind: 'file' };
                let cssContent = await FileSystemProvider.read(cssItem);
                if (cssContent instanceof Blob) cssContent = await cssContent.text();
                
                // Replace <link> with <style>
                const style = doc.createElement('style');
                style.textContent = cssContent;
                link.replaceWith(style);
                console.log(`[Preview] Inlined CSS from: ${cssPath}`);
            } catch (e) {
                console.warn(`[Preview] Could not inline CSS: ${href}`, e);
            }
        }
    }

    // 3. Extract scripts
    const scripts = Array.from(doc.querySelectorAll('script'));
    const scriptTasks = scripts.map(script => {
        const src = script.getAttribute('src');
        const content = script.innerHTML;
        const type = script.getAttribute('type');
        script.remove();
        return { src, content, type };
    });

    // 4. Write static body
   // 4. Write static body
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(doc.documentElement.outerHTML);

    // B"H - INJECT DOUBLE BUFFERING SHIM
    // This creates an offscreen buffer for the game to draw on.
    // The browser only sees the buffer *after* drawing is done, eliminating flicker
    // regardless of how slow the VM executes.
    const shimScript = iframeDoc.createElement('script');
    shimScript.textContent = /*js*/`
    (function() {
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, options) {
            // Only intercept 2D contexts
            if (type !== '2d') return originalGetContext.call(this, type, options);
            
            const realCanvas = this;
            const realCtx = originalGetContext.call(realCanvas, '2d');
            
            // Create the hidden buffer
            const offscreen = new OffscreenCanvas(realCanvas.width || 300, realCanvas.height || 150);
            const offCtx = offscreen.getContext('2d');
            
            // Helper to keep sizes in sync
            const sync = () => {
                if (offscreen.width !== realCanvas.width) offscreen.width = realCanvas.width;
                if (offscreen.height !== realCanvas.height) offscreen.height = realCanvas.height;
            };

            // Create a Proxy to redirect all drawing commands to the hidden buffer
            const proxy = new Proxy(offCtx, {
                get(target, prop) {
                    // If the game asks for 'canvas', give it the real one so resize logic works
                    if (prop === 'canvas') return realCanvas;
                    
                    const val = target[prop];
                    if (typeof val === 'function') {
                        return function(...args) {
                            sync(); // Ensure size matches before drawing
                            return val.apply(target, args);
                        };
                    }
                    return val;
                },
                set(target, prop, value) {
                    target[prop] = value;
                    return true;
                }
            });

            // The "Blit" Loop: Copy the buffer to the screen smoothly
            function renderLoop() {
                sync();
                if (realCanvas.width > 0 && realCanvas.height > 0) {
                    // Clear and draw the buffer
                    realCtx.clearRect(0, 0, realCanvas.width, realCanvas.height);
                    realCtx.drawImage(offscreen, 0, 0);
                }
                requestAnimationFrame(renderLoop);
            }
            requestAnimationFrame(renderLoop);

            return proxy;
        };
    })();
    `;
    iframeDoc.body.appendChild(shimScript);

    iframeDoc.close();

    // 5. Init Loader
    const loader = new ModuleLoader(workspaceId, iframe.contentWindow);
    try {
        await loader.init();
    } catch(e) {
        console.error("CRITICAL: Failed to initialize Merkava Runtime.", e);
        return;
    }

    iframe.contentWindow.MerkavaLoader = loader;
    // B"H - TIKKUN: THE BREATH OF LIFE
    // We must allow the browser a moment to "Flow" (Layout) the Iframe.
    // If we run scripts instantly, window.innerHeight reports 0, and the game world collapses.
    // We wait for 2 frames to ensure dimensions are calculated.
    await nextFrame();
    await nextFrame();
    // 6. Enliven Scripts
    for (const task of scriptTasks) {
        let code = task.content;
        let path = item.path; 

        if (task.src) {
            if (/^(http:|https:|\/\/)/.test(task.src)) {
                const newScript = iframeDoc.createElement('script');
                newScript.src = task.src;
                if (task.type) newScript.type = task.type;
                iframeDoc.body.appendChild(newScript);
                continue; 
            }

            path = loader.resolvePath(item.path, task.src);
            
            try {
                const scriptItem = { ...item, path: path, kind: 'file' };
                let fileData = await FileSystemProvider.read(scriptItem);
                
                if (fileData instanceof Blob) {
                    code = await fileData.text();
                } else if (fileData && typeof fileData !== 'string' && fileData.base64Content) {
                    code = atob(fileData.base64Content);
                } else {
                    code = fileData;
                }

                if (!code && code !== "") throw new Error("File content empty");
                
                

                console.log(`[Preview] ✅ Loaded script: ${path}`);

            } catch (readErr) {
                console.warn(`[Preview] ⚠️ Script not found: ${path}`, readErr.message);
                continue; 
            }
        }

        try {
            await loader.executeInSharedVM(code || '', path, {});
        } catch (execErr) {
            console.error(`[Preview] ❌ Runtime Error in ${path}:`, execErr);
            const errDiv = iframeDoc.createElement('div');
            errDiv.style.cssText = "color: #ff7777; background: #1a0000; padding: 8px; border-bottom: 1px solid #550000; font-family: monospace; font-size: 12px; overflow:auto; position:relative; z-index:9999;";
            errDiv.innerText = `Runtime Error in ${task.src || 'inline script'}:\n${execErr.message}`;
            iframeDoc.body.prepend(errDiv);
        }
    }
};