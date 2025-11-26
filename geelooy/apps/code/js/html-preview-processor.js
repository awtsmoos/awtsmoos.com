// B"H
// FILE: js/html-preview-processor.js

import { State } from './state.js';
import { FileSystemProvider } from './fs-provider.js';
import { UI } from './ui.js';

// We import the Merkava SDK dynamically to ensure the pathways are open.
const SDK_PATH = '/scripts/awtsmoos/MerkavaExecutor/merkava-sdk.js';

/**
 * B"H
 * The recursive loader, the `Ohr Chozer` (Returning Light).
 * When a module seeks another, this entity traverses the file system tree,
 * reads the essence (source code), executes it in a new spark of consciousness (VM),
 * and returns the resulting vessels (exports).
 */
class ModuleLoader {
    constructor(workspaceId, iframeWindow) {
        this.workspaceId = workspaceId;
        this.iframeWindow = iframeWindow;
        this.moduleCache = new Map(); // The Otzar (Treasury) of loaded souls
        this.Merkava = null;
    }

    async init() {
        if (this.Merkava) return;

        // B"H - FIX: Robust SDK Loading
        // The SDK might attach to window instead of exporting default.
        // We check both locations to ensure we capture the Divine Chariot.
        try {
            const module = await import(SDK_PATH);
            this.Merkava = module.default || window.Merkava;
        } catch (e) {
            console.warn("[Merkava] SDK import warning:", e);
        }

        // Final check: If import failed but script ran, it should be on window.
        if (!this.Merkava && window.Merkava) {
            this.Merkava = window.Merkava;
        }

        if (!this.Merkava) {
            throw new Error("Merkava SDK could not be located. The Chariot is missing.");
        }
    }

    /**
     * Resolves the physical path of a dependency relative to the requester.
     */
    resolvePath(basePath, specifier) {
        if (specifier.startsWith('/')) return specifier; // Absolute path (assumed relative to workspace root)

        // Normalize base path to directory
        const stack = basePath.split('/');
        stack.pop(); // Remove current filename
        
        const parts = specifier.split('/');

        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                if (stack.length > 0) stack.pop();
            } else {
                stack.push(part);
            }
        }
        
        const res = stack.join('/');
        return res.startsWith('/') ? res : '/' + res;
    }

    /**
     * The sacred act of Import.
     */
    async importResolver(requestingPath, specifier) {
        const fullPath = this.resolvePath(requestingPath, specifier);
        
        if (this.moduleCache.has(fullPath)) {
            return this.moduleCache.get(fullPath);
        }

        const exports = {};
        this.moduleCache.set(fullPath, exports);

        try {
            const workspace = State.workspaces.find(ws => ws.id === this.workspaceId);
            if (!workspace) throw new Error(`Workspace ${this.workspaceId} not found`);

            const item = { 
                ...workspace, 
                path: fullPath, 
                kind: 'file' 
            };
            
            let code = await FileSystemProvider.read(item);
            
            if (code instanceof Blob) {
                code = await code.text();
            } else if (code && typeof code !== 'string' && code.base64Content) {
                 code = atob(code.base64Content);
            }

            await this.runMerkava(code || '', fullPath, exports);
            return exports;

        } catch (e) {
            console.error(`[Merkava] Failed to resolve dependency: ${specifier}`, e);
            // Re-throw here because a failed import usually stops the dependent module
            throw e; 
        }
    }

    /**
     * Executes code within the iframe's reality context.
     */
    async runMerkava(code, currentPath, exportsContainer = {}) {
        if (!this.Merkava) await this.init();

        await this.Merkava.run(code, {
            context: this.iframeWindow, 
            
            importResolver: (spec) => this.importResolver(currentPath, spec),
            
            // B"H - ADD THIS: Function to read raw file content for Workers
            fileReader: async (spec) => {
                const fullPath = this.resolvePath(currentPath, spec);
                const item = { 
                    workspaceId: this.workspaceId, 
                    path: fullPath, 
                    kind: 'file' 
                };
                // Re-use FileSystemProvider logic (copy-pasted or factored out)
                // Since we are inside ModuleLoader, we can assume FS Provider access.
                // Note: We need to import FileSystemProvider if not available in scope, 
                // but this method is defined inside the module where it IS imported.
                
                let raw = await FileSystemProvider.read(item);
                if (raw instanceof Blob) return await raw.text();
                if (raw && raw.base64Content) return atob(raw.base64Content);
                return raw;
            },

            exportHandler: (name, value) => {
                exportsContainer[name] = value;
            }
        });
        
        return exportsContainer;
    }
}

/**
 * B"H
 * The Orchestrator. 
 * FIX: Now gracefully handles missing files by logging warnings instead of crashing.
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
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(doc.documentElement.outerHTML);
    iframeDoc.close();

    // 5. Init Loader
    const loader = new ModuleLoader(workspaceId, iframe.contentWindow);
    try {
        await loader.init();
    } catch(e) {
        console.error("CRITICAL: Failed to initialize Merkava Runtime.", e);
        return; // Cannot proceed without runtime
    }

    iframe.contentWindow.MerkavaLoader = loader;

    // 6. Enliven Scripts (Robust Loop)
    for (const task of scriptTasks) {
        let code = task.content;
        let path = item.path; 

        // --- B"H - ROBUST FILE LOADING ---
        if (task.src) {
            // Skip externals
            if (/^(http:|https:|\/\/)/.test(task.src)) {
                const newScript = iframeDoc.createElement('script');
                newScript.src = task.src;
                if (task.type) newScript.type = task.type;
                iframeDoc.body.appendChild(newScript);
                continue; 
            }

            path = loader.resolvePath(item.path, task.src);
            
            try {
                const scriptItem = { 
                    ...item, 
                    path: path, 
                    kind: 'file' 
                };
                
                // Try to read the file
                let fileData = await FileSystemProvider.read(scriptItem);
                
                if (fileData instanceof Blob) {
                    code = await fileData.text();
                } else if (fileData && typeof fileData !== 'string' && fileData.base64Content) {
                    code = atob(fileData.base64Content);
                } else {
                    code = fileData;
                }

                if (!code && code !== "") {
                    throw new Error("File content empty or undefined");
                }

                console.log(`[Preview] ✅ Successfully found: ${path}`);

            } catch (readErr) {
                // B"H - THE REQUESTED FIX:
                // Log the missing file to console, but DO NOT CRASH.
                // Continue to the next script.
                console.warn(`[Preview] ⚠️ Could not find or read script: ${path}`, readErr.message);
                console.log(`[Preview] Skipping ${path} and continuing...`);
                continue; 
            }
        }

        // --- EXECUTION ---
        try {
            // console.log(`[Preview] Executing: ${path}`);
            await loader.runMerkava(code || '', path);
        } catch (execErr) {
            // We still show execution errors (syntax, runtime) because the file WAS found but failed to run.
            console.error(`[Preview] ❌ Runtime Error in ${path}:`, execErr);
            
            const errDiv = iframeDoc.createElement('div');
            errDiv.style.cssText = "color: #ff7777; background: #1a0000; padding: 8px; border-bottom: 1px solid #550000; font-family: monospace; font-size: 12px; overflow:auto;";
            errDiv.innerText = `Runtime Error in ${task.src || 'inline script'}:\n${execErr.message}`;
            iframeDoc.body.prepend(errDiv);
        }
    }
};