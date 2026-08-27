// B"H
// parser-core.js

(function(root, factory) {
    // Execute factory immediately to start the loading process
    const merkavaPromise = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = merkavaPromise;
    } else {
        root.MerkavahParserPromise = merkavaPromise;
    }

    merkavaPromise.catch(err => {
        console.error("CRITICAL: Merkava Parser initialization failed.", err);
    });

}(typeof self !== 'undefined' ? self : this, function() {
    const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
    const isWorker = typeof importScripts === 'function';
    const host = isNode ? globalThis : self;

    if (isNode && typeof globalThis.window === 'undefined') {
        globalThis.window = globalThis;
    }

    // --- 1. Determine Base Path Once ---
    let basePath = '';
    if (!isNode) {
        if (document.currentScript) {
            // Ideal case: executed via <script> tag
            const src = document.currentScript.src;
            basePath = src.substring(0, src.lastIndexOf('/') + 1);
        } else {
            // Fallback: Stack trace magic to find where this file lives
            try {
                throw new Error();
            } catch (e) {
                const stackLines = e.stack.split('\n');
                // Look for a line containing 'parser-core.js'
                const match = stackLines.find(l => l.includes('parser-core.js'));
                if (match) {
                    // Extract URL: http://.../parser-core.js
                    const urlMatch = match.match(/(https?|file):\/\/[^:\s)]+/);
                    if (urlMatch) {
                        const fullUrl = urlMatch[0];
                        basePath = fullUrl.substring(0, fullUrl.lastIndexOf('/') + 1);
                    }
                }
            }
        }
    }
    // If all else fails, default to empty string (relative to page)

    console.log("[Merkava Parser] Detected Base Path:", basePath);

    const loadScript = (filename) => {
        if (isNode) {
            return Promise.resolve(require(filename));
        }

        // Resolve path against the detected base
        // Note: filename comes in as './foo.js', we want 'http://.../foo.js'
        const cleanFile = filename.replace(/^\.\//, ''); 
        const url = basePath + cleanFile;

        return new Promise((resolve, reject) => {
            if (isWorker) {
                try {
                    importScripts(url);
                    resolve();
                } catch (e) { reject(new Error(`Worker importScripts failed for ${url}`)); }
            } else {
                const script = document.createElement('script');
                script.src = url;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`Script load failed: ${url}`));
                document.head.appendChild(script);
            }
        });
    };

    const initialize = async () => {
        // 1. Load Dependencies
        await loadScript('./constants.js');
        await loadScript('./node_helpers.js'); // B"H - Ensure helpers are loaded if separated
        await loadScript('./Lexer.js');

        if (isNode) {
            host.MerkavahConstants = host.MerkavahConstants || require('./constants.js');
            host.Lexer = host.Lexer || require('./Lexer.js');
        }

        // Dependencies are now global (self.Lexer, self.MerkavahConstants)
        const { TOKEN, PRECEDENCES, PRECEDENCE } = isNode ? require('./constants.js') : self.MerkavahConstants;
        const LexerClass = isNode ? require('./Lexer.js') : self.Lexer;

        if (!LexerClass) throw new Error("Lexer class not found after loading.");

        // 2. Define The Parser Class
        class MerkavahParser {
            constructor(s) {
                this.l = new LexerClass(s);
                this.errors = [];
                this.panicMode = false;
                this.prevToken = null;
                this.currToken = null;
                this.peekToken = null;

                this.prefixParseFns = {};
                this.infixParseFns = {};

                if (typeof this.registerExpressionParsers === 'function') {
                    this.registerExpressionParsers();
                }

                if (typeof this.registerExpressionParsers === 'function') {
                    this.registerExpressionParsers();
                }

                this.recursionDepth = 0;
                this.maxRecursionDepth = 2000;
                this.parsingTemplateExpression = 0;

                this.op_count = 0;
                this.max_ops = 500000; 


                this.currToken = this.l.nextToken();
                this.peekToken = this.l.nextToken();
            }

            _guard() {
                if (this.op_count++ > this.max_ops) {
                    throw new Error(`PARSER HALTED: Max ops exceeded near line ${this.currToken.line}.`);
                }
            }

            _advance() {
                this._guard();
                this.prevToken = this.currToken;
                this.currToken = this.peekToken;
                this.peekToken = this.l.nextToken();
            }

            _peekTokenIs(t) { return this.peekToken.type === t; }
            _currTokenIs(t) { return this.currToken.type === t; }


            _startNode() {
                return {
                    start: this.currToken.startIndex,
                    loc: { start: { line: this.currToken.line, column: this.currToken.column } }
                };
            }

            _finishNode(node, startNodeInfo) {
                const combined = { ...startNodeInfo, ...node };
                const endToken = this.prevToken || this.currToken;
                if (endToken) {
                    const len = endToken.literal ? endToken.literal.length : 0;
                    combined.end = (endToken.startIndex || 0) + len;
                    combined.loc.end = { line: endToken.line, column: endToken.column + len };
                }
                return combined;
            }

            _error(m) {
                if (!this.panicMode) {
                    this.panicMode = true;
                    const msg = `[Shevirah] ${m} on line ${this.currToken.line}:${this.currToken.column}. Got ${this.currToken.type}`;
                    this.errors.push(msg);
                    throw new Error(msg);
                }
            }

            _expect(t) {
                if (this._currTokenIs(t)) {
                    this._advance();
                    return true;
                }
                this._error(`Expected ${t}, got ${this.currToken.type}`);
            }

            _consumeSemicolon() {
                if (this._currTokenIs(TOKEN.SEMICOLON)) {
                    this._advance();
                    return;
                }
                if (this._currTokenIs(TOKEN.RBRACE) || this._currTokenIs(TOKEN.EOF) || this.currToken.hasLineTerminatorBefore) {
                    return;
                }
                // Optional warning?
            }

            _getPrecedence(t) {
                return PRECEDENCES[t.type] || PRECEDENCE.LOWEST;
            }

            parse() {
                const program = {
                    type: 'Program',
                    body: [],
                    sourceType: 'module',
                    loc: { start: { line: 1, column: 0 } }
                };

                while (!this._currTokenIs(TOKEN.EOF)) {
                    try {
                        // B"H
                        // This method is injected by parser-declarations.js.
                        // If it's missing, the extension failed to load.
                        if (typeof this._parseDeclaration !== 'function') {
                            throw new Error("Parser configuration incomplete: _parseDeclaration is missing. The 'parser-declarations.js' extension may have failed to load.");
                        }

                        const stmt = this._parseDeclaration();
                        if (stmt) program.body.push(stmt);

                    } catch (e) {
                        if (!this.errors.includes(e.message)) this.errors.push(e.message);
                        // Break on fatal errors to prevent hang
                        break; 
                    }
                }

                // Finish program node
                const endToken = this.prevToken || this.currToken;
                program.loc.end = {
                    line: endToken.line,
                    column: endToken.column + (endToken.literal?.length || 0)
                };
                return program;
            }
        }

        // 3. Expose Globally (for extensions)
        host.MerkavahParser = MerkavahParser;

        // 4. Load Extensions (Sequential)
        await loadScript('./parser-expressions.js');
        await loadScript('./parser-statements.js');
        await loadScript('./parser-declarations.js'); // This injects _parseDeclaration

        // 5. Return the fully assembled class
        return host.MerkavahParser;
    };

    return initialize();
}));