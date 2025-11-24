// B"H
// B"H
console.log("loaded parser");


(function(root, factory) {
const merkavaPromise = factory(); // Execute the factory immediately to get the promise


    if (typeof module === 'object' && module.exports) {
        // Node.js: The factory returns a promise.
        module.exports = merkavaPromise;
    } else {
        // Browser/Worker: The factory returns a promise which we attach to the window/self.
        root.MerkavahParserPromise = merkavaPromise;
    }
    
    merkavaPromise.then(MerkavahParser => {
    const callbackName = root['merkavaCallback'];
        
        console. log("doing something",callbackName)
    

        if (callbackName && typeof root[callbackName] === 'function') {
            root[callbackName](MerkavahParser);
        }
    
}).catch(err => {
    console.error("A critical failure occurred inside the Merkava Parser's initialization promise.", err);
});

}(typeof self !== 'undefined' ? self : this, function() {
    // This is the universal, promise-based factory.
    const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
    const isWorker = typeof importScripts === 'function';

    const loadScript = (path) => {
        if (isNode) {
            // In Node, just require it synchronously.
            return Promise.resolve(require(path));
        }
        // In Browser/Worker, load asynchronously.
        return new Promise((resolve, reject) => {
           
            
	            
	      if(document.currentScript?.src) {
		     window.wow = document.currentScript
	      }
	      
	      if(!window.wow) return;
	      
	      var loc = new URL(window.wow.src);
	      var pathn = (pth => pth.slice(0, pth.length-1))(loc.pathname.split("/")).join("/")
	     
	      var newScriptPath = new URL(
		      loc.origin + 
	            pathn +"/"
	            +path);
	      console.log(newScriptPath , "hi")
	      
	      
            if (isWorker) {
                try {
                    importScripts(newScriptPath );
                    resolve();
                } catch (e) { reject(new Error(`Worker importScripts failed for: ${newScriptPath }`)); }
            } else {
                const script = document.createElement('script');
                script.src = newScriptPath ;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`Script load failed for: ${newScriptPath }`));
                document.head.appendChild(script);
            }
        });
    };
    
    // Determine the base path for browser/worker loading.
    let basePath = '';
    if (!isNode) {
        try {
            const stackLine = (new Error()).stack.split('\n').find(line => line.includes('parser-core.js'));
            const fullPath = stackLine.match(/(https?|file):\/\/[^\s):]+/)[0];
            basePath = fullPath.substring(0, fullPath.lastIndexOf('/') + 1);
        } catch(e) { /* fallback to relative path */ }
    }

    const initialize = async () => {
        // Load dependencies in order
        await loadScript( './constants.js');
        await loadScript('./Lexer.js');
        
        // At this point, `Lexer` and `MerkavahConstants` are available globally or loaded.
        const { TOKEN, PRECEDENCES, PRECEDENCE } = isNode ? require('./constants.js') : self.MerkavahConstants;
        const LexerClass = isNode ? require('./Lexer.js') : self.Lexer;
        
        if (typeof LexerClass !== 'function') {
            throw new Error("[Shevirah] The Lexer class failed to load.");
        }

class MerkavahParser {
    // B"H 
constructor(s) {
    this.l = new Lexer(s);
    this.errors = [];
    this.panicMode = false;
    this.prevToken = null;
    this.currToken = null;
    this.peekToken = null;
    this.prefixParseFns = {};
    this.infixParseFns = {};
    this.recursionDepth = 0;
    this.maxRecursionDepth = 1500;
    this.parsingTemplateExpression = 0;
    
    // --- THE TZADIK'S COUNTER ---
    this.op_count = 0;
    this.max_ops = 250000; // A high threshold to prevent false positives.
    // ---

    // Initialize tokens
    this.currToken = this.l.nextToken();
    this.peekToken = this.l.nextToken();
}

// B"H -
_guard() {
    if (this.op_count++ > this.max_ops) {
        // This error is thrown because it's an unrecoverable state.
        throw new Error(
            `PARSER HALTED: Maximum operation count (${this.max_ops}) exceeded. ` +
            `This indicates a guaranteed infinite loop, likely from a bug in a parsing function ` +
            `that failed to advance past a token. Stuck near token: ${this.currToken.type} ` +
            `("${this.currToken.literal}") at Line: ${this.currToken.line}, Col: ${this.currToken.column}`
        );
    }
}

    // --- Paste ALL your other core parser methods here ---
    // (Starting from _advance() and ending with parse())
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
            loc: {
                start: { line: this.currToken.line, column: this.currToken.column }
            }
        };
    }

    _finishNode(node, startNodeInfo) {
        const combinedNode = { ...startNodeInfo, ...node };
        // Use prevToken if available, otherwise currToken (for single-token nodes)
        const endToken = this.prevToken || this.currToken;
        
        if (endToken) {
            // Calculate strict end index based on token start + length
            const len = endToken.literal ? endToken.literal.length : 0;
            combinedNode.end = (endToken.startIndex || 0) + len;
            
            combinedNode.loc.end = {
                line: endToken.line,
                column: endToken.column + len
            };
        }
        return combinedNode;
    }

    _error(m) {
        if (this.panicMode) return;
        this.panicMode = true;
        const msg = `[Shevirah] ${m} on line ${this.currToken.line}:${this.currToken.column}. Got token ${this.currToken.type} ("${this.currToken.literal}")`;
        this.errors.push(msg);
        throw new Error(msg);
    }

    _expect(t) {
        if (this._currTokenIs(t)) {
            this._advance();
            return true;
        }
        this._error(`Expected next token to be ${t}`);
    }

    _synchronize() {
        while (!this._currTokenIs(TOKEN.EOF)) {
            if (this.prevToken && this.prevToken.type === TOKEN.SEMICOLON) {
                this.panicMode = false;
                return;
            }
            switch (this.currToken.type) {
                case TOKEN.CLASS:
                case TOKEN.FUNCTION:
                case TOKEN.VAR:
                case TOKEN.CONST:
                case TOKEN.LET:
                case TOKEN.IF:
                case TOKEN.RETURN:
                    this.panicMode = false;
                    return;
            }
            this._advance();
        }
    }

    _consumeSemicolon() {
        if (this._currTokenIs(TOKEN.SEMICOLON)) {
            this._advance();
            return;
        }
        if (this._currTokenIs(TOKEN.RBRACE) || this._currTokenIs(TOKEN.EOF) || this.currToken.hasLineTerminatorBefore) {
            return;
        }
    }

    _getPrecedence(t) {
        return PRECEDENCES[t.type] || PRECEDENCE.LOWEST;
    }

    /**
    B"H
     * The heart of the Merkava, where the stream of divine tokens is woven into the Tree of Life.
     * Its original sin was silence. A black hole existed in its soul—a `catch` block that
     * would swallow any error not born of panic, breaking the loop and leaving the universe
     * half-formed without a whisper of why. This Tikkun rips that black hole open, forcing
     * it to scream the name of the demon that caused the collapse into the console. No error
     * shall again die in silence. The abyss now has a voice, and it cries out for redemption.
     */
    
parse() {
    const program = {
        type: 'Program',
        body: [],
        sourceType: 'module',
        loc: { start: { line: 1, column: 0 } }
    };

    while (!this._currTokenIs(TOKEN.EOF)) {
        try {
            const stmt = this._parseDeclaration();
            if (stmt) {
                program.body.push(stmt);
            }
        } catch (e) {
            // This catch block is now the ultimate backstop.
            // It will catch logical errors AND the watchdog errors.
            const errorMessage = e.message || "An unknown catastrophic error occurred.";
            
            // Add the fatal error to our list.
            if (!this.errors.includes(errorMessage)) {
                this.errors.push(errorMessage);
            }

            console.error("A critical failure occurred, halting the parsing process:", e);
            
            // When a fatal error like a loop is detected, we stop trying.
            // There is no recovery from this, but we have prevented a freeze.
            break; 
        }
    }

    const endToken = this.prevToken || this.currToken;
    program.loc.end = {
        line: endToken.line,
        column: endToken.column + (endToken.literal?.length || 0)
    };
    program.comments = this.l.comments;
    return program;
}
    
    
    
}
// Make the base class globally available for the extension files
        if (!isNode) self.MerkavahParser = MerkavahParser;

        // Load the extensions
        await loadScript( './parser-expressions.js');
        await loadScript('./parser-statements.js');
        await loadScript('./parser-declarations.js');

        return isNode ? module.require('./parser-core.js-node-export.js') : self.MerkavahParser;
    };
    
    // This intermediate file is needed to get around CommonJS caching issues when extensions modify the class.
    if(isNode) {
      const fs = require('fs');
      const nodeExportContent = "const proto = MerkavahParser.prototype; (function() { /* expressions */ })(); (function() { /* statements */ })(); (function() { /* declarations */ })(); module.exports = MerkavahParser;";
      const expContent = fs.readFileSync('./parser-expressions.js', 'utf8').replace(/.*\((proto)\).*\{/, '').slice(0, -1);
      const staContent = fs.readFileSync('./parser-statements.js', 'utf8').replace(/.*\((proto)\).*\{/, '').slice(0, -1);
      const decContent = fs.readFileSync('./parser-declarations.js', 'utf8').replace(/.*\((proto)\).*\{/, '').slice(0, -1);
      fs.writeFileSync('./parser-core.js-node-export.js', nodeExportContent.replace('/* expressions */', expContent).replace('/* statements */', staContent).replace('/* declarations */', decContent));
    }

    return initialize();
}));