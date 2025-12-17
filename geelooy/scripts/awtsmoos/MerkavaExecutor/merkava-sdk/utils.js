
// B"H
(function(root) {
    const Internal = root.MerkavaSDK_Internal = root.MerkavaSDK_Internal || {};

    Internal.Utils = {
        resolveUrl(filename) {
            try { 
                // Handle relative paths from the SDK Base Path
                let url;
                if (filename.startsWith('./') || filename.startsWith('../')) {
                    url = new URL(filename, new URL(Internal.BASE_PATH, self.location.href)).href;
                } else {
                    url = new URL(filename, new URL(Internal.BASE_PATH, self.location.href)).href;
                }
                // B"H - Cache Busting: Force fresh load
                return url + "?t=" + Date.now();
            } 
            catch (e) { return filename; }
        },

        loadScript(filename) {
            return new Promise((resolve, reject) => {
                const url = this.resolveUrl(filename);
                if (typeof importScripts === 'function') {
                    try { importScripts(url); resolve(); } catch (e) { reject(e); }
                } else {
                    const script = document.createElement('script');
                    script.src = url;
                    script.onload = resolve;
                    script.onerror = () => reject(new Error(`Failed to load ${url}`));
                    document.head.appendChild(script);
                }
            });
        },

        async loadModules(list) {
            // B"H - Environment Patch for Workers
            // Ensure 'document' exists for libraries like the Parser that expect a browser environment.
            if (typeof self.document === 'undefined') {
                self.document = {
                    currentScript: null,
                    querySelectorAll: () => [],
                    createElement: () => ({ src: '' }),
                    head: { appendChild: () => {} },
                    body: { appendChild: () => {} }
                };
            }
            if (typeof self.window === 'undefined') {
                self.window = self;
            }

            for (const mod of list) {
                await this.loadScript(mod);
            }
            
            // Load External Parser
            if (!self.MerkavahParser) {
                try {
                    // B"H - Use explicit Parser URL if provided by WorkerProxy
                    let parserUrl = self.MERKAVA_PARSER_URL;
                    
                    if (!parserUrl) {
                         // Default: assuming standard sibling directory relative to SDK Base
                         const sdkBase = new URL(Internal.BASE_PATH, self.location.href);
                         parserUrl = new URL('../MerkavaASTParser/parser-core.js', sdkBase).href;
                    }
                    
                    // B"H - Help the parser find itself by shimming currentScript.src
                    // This prevents the parser from falling back to stack trace magic which fails in Blob workers.
                    if (self.document && !self.document.currentScript) {
                        self.document.currentScript = { src: parserUrl };
                    }
                    
                    // Cache bust parser too
                    await this.loadScript(parserUrl.split('?')[0]); 
                    
                    if (self.MerkavahParserPromise) {
                        self.MerkavahParser = await self.MerkavahParserPromise;
                    }
                } catch(e) {
                    console.warn("[SDK] Parser load failed:", e);
                }
            }
        }
    };
})(typeof self !== 'undefined' ? self : this);
