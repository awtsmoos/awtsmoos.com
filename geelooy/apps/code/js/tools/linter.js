// B"H
// FILE: js/tools/linter.js

/**
 * --- LINTER & PARSER NEXUS ---
 * Responsible for loading the Merkava AST Parser and performing
 * static analysis on the source vessels. B"H.
 */
export const Linter = {
    parserClass: null,
    isReady: false,
    _astCache: new Map(), // Holy Memory: contentHash -> AST
    
    async init() {
        if (this.parserClass || this.isReady) return;
        
        // B"H - Timeout Race: Ensure we don't hang if offline
        const loadPromise = new Promise((resolve) => {
            if (window.MerkavahParserPromise) {
                window.MerkavahParserPromise.then(async (cls) => {
                    this.parserClass = cls;
                    this.isReady = true;
                    // Dynamic Import to break cycle
                    const { UI } = await import('../ui.js');
                    UI.updateLineNumbers(); 
                    resolve();
                }).catch(() => {
                    console.warn("Linter failed to load from global promise.");
                    resolve();
                }); 
            } else {
                const s = document.createElement('script');
                s.src = '/scripts/awtsmoos/MerkavaASTParser/parser-core.js'; 
                s.onload = () => {
                    if (window.MerkavahParserPromise) {
                        window.MerkavahParserPromise.then(async (cls) => {
                            this.parserClass = cls;
                            this.isReady = true;
                            // Dynamic Import to break cycle
                            const { UI } = await import('../ui.js');
                            UI.updateLineNumbers(); 
                            resolve();
                        }).catch(() => resolve());
                    } else resolve();
                };
                s.onerror = () => {
                    console.warn("Linter script failed to load (Offline?)");
                    // We resolve anyway so the app continues, but isReady remains false.
                    resolve(); 
                };
                document.head.appendChild(s);
            }
        });

        // Timeout after 500ms (Rapid Fallback)
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 500));
        
        await Promise.race([loadPromise, timeoutPromise]);
    },

    /**
     * B"H - Retrieves the AST, using cache if available.
     */
    getAST(code) {
        // Strict check: if not ready, don't try.
        if (!this.parserClass || !code.trim()) return { error: "Parser not loaded" };
        
        // Simple hash for cache lookup
        const hash = code.length + code.substring(0, 100) + code.substring(code.length - 100);
        if (this._astCache.has(hash)) return this._astCache.get(hash);

        try {
            const parser = new this.parserClass(code);
            if (parser.registerDeclarationParsers) parser.registerDeclarationParsers();
            if (parser.registerExpressionParsers) parser.registerExpressionParsers();
            if (parser.registerStatementParsers) parser.registerStatementParsers();

            const ast = parser.parse();
            this._astCache.set(hash, ast);
            // Limit cache size
            if (this._astCache.size > 10) {
                const firstKey = this._astCache.keys().next().value;
                this._astCache.delete(firstKey);
            }
            return ast;
        } catch (e) {
            return { error: e.message };
        }
    },

    lint(code) {
        const ast = this.getAST(code);
        if (ast && ast.errors && ast.errors.length > 0) {
            return ast.errors.map(e => this._parseError(e));
        }
        return [];
    },

    _parseError(msg) {
        const match = msg.match(/line (\d+):(\d+)/);
        if (match) {
            return {
                line: parseInt(match[1]),
                col: parseInt(match[2]),
                message: msg
            };
        }
        return { line: 1, col: 1, message: msg };
    }
};