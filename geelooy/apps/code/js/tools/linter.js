// B"H
// FILE: js/tools/linter.js

export const Linter = {
    parserClass: null,
    
    async init() {
        if (this.parserClass) return;
        
        // Wait for MerkavahParserPromise if it exists or load the script
        if (window.MerkavahParserPromise) {
            try {
                this.parserClass = await window.MerkavahParserPromise;
                console.log("B\"H - Linter: Merkava Parser attached.");
            } catch(e) {
                console.error("Linter failed to load parser:", e);
            }
        } else {
            // Lazy load the parser script
            // B"H - Corrected Path: Pointing to the absolute reality
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = '/scripts/awtsmoos/MerkavaASTParser/parser-core.js'; 
                s.onload = async () => {
                    if (window.MerkavahParserPromise) {
                        try {
                            this.parserClass = await window.MerkavahParserPromise;
                            resolve();
                        } catch(e) { reject(e); }
                    } else reject("Parser promise not found after load.");
                };
                s.onerror = (e) => {
                    console.warn("Linter: Could not load parser from /scripts/awtsmoos/MerkavaASTParser/parser-core.js. Linting disabled.", e);
                    resolve(); 
                };
                document.head.appendChild(s);
            });
        }
    },

    lint(code) {
        if (!this.parserClass || !code.trim()) return [];
        try {
            const parser = new this.parserClass(code);
            if (parser.registerDeclarationParsers) parser.registerDeclarationParsers();
            if (parser.registerExpressionParsers) parser.registerExpressionParsers();
            if (parser.registerStatementParsers) parser.registerStatementParsers();

            parser.parse();
            
            if (parser.errors && parser.errors.length > 0) {
                return parser.errors.map(e => this._parseError(e));
            }
            return [];
        } catch (e) {
            return [this._parseError(e.message)];
        }
    },
    
    getAST(code) {
        if (!this.parserClass || !code.trim()) return { error: "Parser not loaded" };
        try {
            const parser = new this.parserClass(code);
            if (parser.registerDeclarationParsers) parser.registerDeclarationParsers();
            if (parser.registerExpressionParsers) parser.registerExpressionParsers();
            if (parser.registerStatementParsers) parser.registerStatementParsers();
            return parser.parse();
        } catch(e) {
            return { error: e.message };
        }
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