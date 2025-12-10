// B"H
(function(root) {
    const Internal = root.MerkavaSDK_Internal = root.MerkavaSDK_Internal || {};

    Internal.Utils = {
        resolveUrl(filename) {
            try { 
                // Handle relative paths from the SDK Base Path
                if (filename.startsWith('./') || filename.startsWith('../')) {
                    return new URL(filename, new URL(Internal.BASE_PATH, self.location.href)).href;
                }
                return new URL(filename, new URL(Internal.BASE_PATH, self.location.href)).href;
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
            for (const mod of list) {
                await this.loadScript(mod);
            }
            
            // Load External Parser
            if (!self.MerkavahParser) {
                try {
                    // B"H - Use explicit Parser URL if provided by WorkerProxy
                    let parserUrl = self.MERKAVA_PARSER_URL;
                    
                    if (!parserUrl) {
                         // Default: assuming standard sibling directory
                         parserUrl = '../MerkavaASTParser/parser-core.js';
                    }
                    
                    await this.loadScript(parserUrl);
                    
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