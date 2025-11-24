/*B"H*/

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./constants.js'));
    } else {
        root.Lexer = factory(root.MerkavahConstants);
    }
}(typeof self !== 'undefined' ? self : this, function({ TOKEN, KEYWORDS }) {
class Lexer {
	constructor(s) {
		this.source = s;
		this.position = 0;
		this.readPosition = 0;
		this.ch = '';
		this.line = 1;
		this.column = 0;
		this.hasLineTerminatorBefore = false;
		this.templateStack = [];
		this.comments = []; 
		this.braceNestingLevel = 0;
		this.op_count = 0;
		this.max_ops = 250000;
		this._advance();
	}

	_guard() {
		if (this.op_count++ > this.max_ops) {
			throw new Error(
				`LEXER HALTED: Maximum operation count (${this.max_ops}) exceeded. ` +
				`This is a guaranteed infinite loop, likely caused by a bug in the lexer's state. ` +
				`Stuck near character: '${this.ch}' at Line: ${this.line}, Col: ${this.column}`
			);
		}
	}

	_advance() {
		this._guard();
		if (this.readPosition >= this.source.length) {
			this.ch = null;
		} else {
			this.ch = this.source[this.readPosition];
		}
		this.position = this.readPosition;
		this.readPosition++;
		if (this.ch !== '\n' && this.ch !== '\r') {
			this.column++;
		}
	}

	_peek() {
		this._guard();
		if (this.readPosition >= this.source.length) return null;
		return this.source[this.readPosition];
	}

	_makeToken(type, literal, startColumn, startLine) {
		this._guard();
		const col = startColumn ?? this.column - (literal?.length || (this.ch === null ? 0 : 1));
		const line = startLine || this.line;
		
		return {
			type,
			literal,
			line: line,
			column: col,
			hasLineTerminatorBefore: this.hasLineTerminatorBefore,
			startIndex: this.position
		};
	}

    _skipWhitespace() {
        while (this.ch !== null) {
            this._guard();
    
            if (' \t'.includes(this.ch)) {
                this._advance();
    
            } else if ('\n\r'.includes(this.ch)) {
                this.hasLineTerminatorBefore = true;
                if (this.ch === '\r' && this._peek() === '\n') this._advance();
                this._advance();
                this.line++;
                this.column = 0;
    
            } else if (this.ch === '/' && this._peek() === '/') {
                const startPos = this.position;
                const startLine = this.line;
                const startCol = this.column;
                
                this._advance(); // Consume /
                this._advance(); // Consume /
    
                const commentStart = this.position;
                while (this.ch !== '\n' && this.ch !== '\r' && this.ch !== null) {
                    this._advance();
                }
                const commentEnd = this.position;
                const value = this.source.slice(commentStart, commentEnd);
    
                this.comments.push({
                    type: "Line",
                    value: " " + value,
                    start: startPos,
                    end: commentEnd,
                    loc: {
                        start: { line: startLine, column: startCol },
                        end: { line: this.line, column: this.column }
                    }
                });
            
            } else if (this.ch === '/' && this._peek() === '*') {
                const startPos = this.position;
                const startLine = this.line;
                const startCol = this.column;
    
                this._advance(); // Consume /
                this._advance(); // Consume *
    
                const commentStart = this.position;
                while (this.ch !== null && (this.ch !== '*' || this._peek() !== '/')) {
                    if ('\n\r'.includes(this.ch)) {
                        this.hasLineTerminatorBefore = true;
                        if (this.ch === '\r' && this._peek() === '\n') this._advance();
                        this.line++;
                        this.column = 0;
                    }
                    this._advance();
                }
                const commentEnd = this.position;
                const value = this.source.slice(commentStart, commentEnd);
                
                if (this.ch !== null) {
                    this._advance(); // Consume *
                    this._advance(); // Consume /
                }
    
                 this.comments.push({
                    type: "Block",
                    value: value,
                    start: startPos,
                    end: commentEnd + 2,
                    loc: {
                        start: { line: startLine, column: startCol },
                        end: { line: this.line, column: this.column }
                    }
                });
    
            } else if (this.hasLineTerminatorBefore && this.ch === '<' && this._peek() === '!' && this.source.substring(this.position, this.position + 4) === '<!--') {
                while (this.ch !== '\n' && this.ch !== '\r' && this.ch !== null) this._advance();
    
            } else if (this.hasLineTerminatorBefore && this.ch === '-' && this._peek() === '-' && this.source.substring(this.position, this.position + 3) === '-->') {
                while (this.ch !== '\n' && this.ch !== '\r' && this.ch !== null) this._advance();
            
            } else {
                break;
            }
        }
    }
	
    
	_readPrivateIdentifier() {
		this._advance(); // Consume '#'
		const startColumn = this.column - 1;
		const ident = this._readIdentifier();
		if (!ident) {
			return this._makeToken(TOKEN.ILLEGAL, '#', startColumn);
		}
		return this._makeToken(TOKEN.PRIVATE_IDENT, '#' + ident, startColumn);
	}
	
	_readIdentifier() {
		const p = this.position;
		while (this.ch !== null && this._isIdentifierChar(this.ch)) {
			this._advance();
		}
		return this.source.slice(p, this.position);
	}

    _readNumber() {
        const p = this.position;
        if (this.ch === '0' && this._peek() && 'xob'.includes(this._peek().toLowerCase())) {
            this._advance(); 
            this._advance(); 
            while (this.ch !== null) {
                if (this._isIdentifierChar(this.ch)) {
                    this._advance();
                    if (this.ch === '_' && this._isIdentifierChar(this._peek())) {
                        this._advance();
                    }
                } else {
                    break;
                }
            }
        } else {
            while (this.ch !== null) {
                if (this._isDigit(this.ch)) {
                    this._advance();
                    if (this.ch === '_' && this._isDigit(this._peek())) {
                        this._advance();
                    }
                } else {
                    break;
                }
            }
            if (this.ch === '.' && this._isDigit(this._peek())) {
                this._advance();
                while (this.ch !== null) {
                    if (this._isDigit(this.ch)) {
                        this._advance();
                        if (this.ch === '_' && this._isDigit(this._peek())) {
                            this._advance();
                        }
                    } else {
                        break;
                    }
                }
            }
        }
        
        if (this.ch === 'n') {
            this._advance();
        }
        
        return this.source.slice(p, this.position);
    }

    _readString(quote) {
        this._advance(); // consume opening quote
        const p = this.position;
        while (this.ch !== quote && this.ch !== null) {
            this._guard();
            
            if (this.ch === '\\') {
                this._advance();
                continue;       
            }

            if ('\n\r'.includes(this.ch)) {
                if (this.ch === '\r' && this._peek() === '\n') this._advance();
                this.line++;
                this.column = 0;
                this._advance();
                continue;
            }
            
            this._advance();
        }
        const s = this.source.slice(p, this.position);
        if (this.ch !== quote) return this._makeToken(TOKEN.ILLEGAL, s); // Unterminated string
        this._advance(); // consume closing quote
        return this._makeToken(TOKEN.STRING, s);
    }
    
    
    
    
    nextToken() {
        this._guard();
        this.hasLineTerminatorBefore = false;
        this._skipWhitespace();

        const startLine = this.line;
        const startColumn = this.column;

        if (this.ch === null) {
            return this._makeToken(TOKEN.EOF, '', startColumn, startLine);
        }
        
        const c = this.ch;
        let tok;

        switch (c) {
            case '{':
                if (this.braceNestingLevel > 0) {
                    this.braceNestingLevel++;
                }
                tok = this._makeToken(TOKEN.LBRACE, '{', startColumn); 
                this._advance(); 
                return tok;

            // --- THE FIX in the '}' case ---
            case '}':
                if (this.braceNestingLevel > 0) {
                    this.braceNestingLevel--;
                    if (this.braceNestingLevel === 0) {
                        this.templateStack.pop();
                        this._advance(); // Consume the '}'
                        
                        // PASS 'true' to indicate we are resuming (Middle or Tail), not starting (Head)
                        return this._readTemplatePart(true); 
                    }
                }
                tok = this._makeToken(TOKEN.RBRACE, '}', startColumn); 
                this._advance(); 
                return tok;
            // -------------------------------

            case '`':
                this._advance();
                // Pass 'false' (or undefined) because we are starting from scratch
                return this._readTemplatePart(false); 

            case '=':
                this._advance();
                if (this.ch === '>') { this._advance(); return this._makeToken(TOKEN.ARROW, '=>', startColumn); }
                if (this.ch === '=') { this._advance(); return this.ch === '=' ? (this._advance(), this._makeToken(TOKEN.EQ_STRICT, '===', startColumn)) : this._makeToken(TOKEN.EQ, '==', startColumn); }
                return this._makeToken(TOKEN.ASSIGN, '=', startColumn);
            case '!':
                this._advance();
                if (this.ch === '=') { this._advance(); return this.ch === '=' ? (this._advance(), this._makeToken(TOKEN.NOT_EQ_STRICT, '!==', startColumn)) : this._makeToken(TOKEN.NOT_EQ, '!=', startColumn); }
                return this._makeToken(TOKEN.BANG, '!', startColumn);
            case '+':
                this._advance();
                if (this.ch === '+') { this._advance(); return this._makeToken(TOKEN.INCREMENT, '++', startColumn); }
                if (this.ch === '=') { this._advance(); return this._makeToken(TOKEN.PLUS_ASSIGN, '+=', startColumn); }
                return this._makeToken(TOKEN.PLUS, '+', startColumn);
            case '-':
                this._advance();
                if (this.ch === '-') { this._advance(); return this._makeToken(TOKEN.DECREMENT, '--', startColumn); }
                if (this.ch === '=') { this._advance(); return this._makeToken(TOKEN.MINUS_ASSIGN, '-=', startColumn); }
                return this._makeToken(TOKEN.MINUS, '-', startColumn);
            case '*':
                this._advance();
                if (this.ch === '*') { this._advance(); return this.ch === '=' ? (this._advance(), this._makeToken(TOKEN.EXPONENT_ASSIGN, '**=', startColumn)) : this._makeToken(TOKEN.EXPONENT, '**', startColumn); }
                if (this.ch === '=') { this._advance(); return this._makeToken(TOKEN.ASTERISK_ASSIGN, '*=', startColumn); }
                return this._makeToken(TOKEN.ASTERISK, '*', startColumn);
            case '/':
                this._advance();
                if (this.ch === '=') { this._advance(); return this._makeToken(TOKEN.SLASH_ASSIGN, '/=', startColumn); }
                return this._makeToken(TOKEN.SLASH, '/', startColumn);
            case '%':
                this._advance();
                if (this.ch === '=') { this._advance(); return this._makeToken(TOKEN.MODULO_ASSIGN, '%=', startColumn); }
                return this._makeToken(TOKEN.MODULO, '%', startColumn);
            case '<':
                this._advance();
                if (this.ch === '<') { this._advance(); return this.ch === '=' ? (this._advance(), this._makeToken(TOKEN.LEFT_SHIFT_ASSIGN, '<<=', startColumn)) : this._makeToken(TOKEN.LEFT_SHIFT, '<<', startColumn); }
                if (this.ch === '=') { this._advance(); return this._makeToken(TOKEN.LTE, '<=', startColumn); }
                return this._makeToken(TOKEN.LT, '<', startColumn);
            case '>':
                this._advance();
                if (this.ch === '>') { this._advance(); if (this.ch === '>') { this._advance(); return this.ch === '=' ? (this._advance(), this._makeToken(TOKEN.UNSIGNED_RIGHT_SHIFT_ASSIGN, '>>>=', startColumn)) : this._makeToken(TOKEN.UNSIGNED_RIGHT_SHIFT, '>>>', startColumn); } if (this.ch === '=') { this._advance(); return this._makeToken(TOKEN.RIGHT_SHIFT_ASSIGN, '>>=', startColumn); } return this._makeToken(TOKEN.RIGHT_SHIFT, '>>', startColumn); }
                if (this.ch === '=') { this._advance(); return this._makeToken(TOKEN.GTE, '>=', startColumn); }
                return this._makeToken(TOKEN.GT, '>', startColumn);
            case '&':
                this._advance();
                if (this.ch === '&') { this._advance(); return this.ch === '=' ? (this._advance(), this._makeToken(TOKEN.LOGICAL_AND_ASSIGN, '&&=')) : this._makeToken(TOKEN.AND, '&&'); }
                if (this.ch === '=') { this._advance(); return this._makeToken(TOKEN.BITWISE_AND_ASSIGN, '&='); }
                return this._makeToken(TOKEN.BITWISE_AND, '&');
            case '|':
                this._advance();
                if (this.ch === '|') { this._advance(); return this.ch === '=' ? (this._advance(), this._makeToken(TOKEN.LOGICAL_OR_ASSIGN, '||=')) : this._makeToken(TOKEN.OR, '||'); }
                if (this.ch === '=') { this._advance(); return this._makeToken(TOKEN.BITWISE_OR_ASSIGN, '|='); }
                return this._makeToken(TOKEN.BITWISE_OR, '|');
            case '^':
                this._advance();
                if (this.ch === '=') { this._advance(); return this._makeToken(TOKEN.BITWISE_XOR_ASSIGN, '^=', startColumn); }
                return this._makeToken(TOKEN.BITWISE_XOR, '^', startColumn);
            case '~':
                tok = this._makeToken(TOKEN.BITWISE_NOT, '~', startColumn); this._advance(); return tok;
            case '?':
                this._advance();
                if (this.ch === '?') { this._advance(); return this.ch === '=' ? (this._advance(), this._makeToken(TOKEN.NULLISH_ASSIGN, '??=', startColumn)) : this._makeToken(TOKEN.NULLISH_COALESCING, '??', startColumn); }
                if (this.ch === '.') { this._advance(); return this._makeToken(TOKEN.OPTIONAL_CHAINING, '?.', startColumn); }
                return this._makeToken(TOKEN.QUESTION, '?', startColumn);
            case '.':
                this._advance();
                if (this.ch === '.' && this._peek() === '.') { this._advance(); this._advance(); return this._makeToken(TOKEN.DOTDOTDOT, '...', startColumn); }
                return this._makeToken(TOKEN.DOT, '.', startColumn);
            case '(': tok = this._makeToken(TOKEN.LPAREN, '(', startColumn); this._advance(); return tok;
            case ')': tok = this._makeToken(TOKEN.RPAREN, ')', startColumn); this._advance(); return tok;
            case '[': tok = this._makeToken(TOKEN.LBRACKET, '[', startColumn); this._advance(); return tok;
            case ']': tok = this._makeToken(TOKEN.RBRACKET, ']', startColumn); this._advance(); return tok;
            case ',': tok = this._makeToken(TOKEN.COMMA, ',', startColumn); this._advance(); return tok;
            case ';': tok = this._makeToken(TOKEN.SEMICOLON, ';', startColumn); this._advance(); return tok;
            case ':': tok = this._makeToken(TOKEN.COLON, ':', startColumn); this._advance(); return tok;
            case '"': case "'": return this._readString(c);
            case '#': return this._readPrivateIdentifier();
            default:
                if (this._isLetter(c)) {
                    const ident = this._readIdentifier();
                    const type = Object.prototype.hasOwnProperty.call(KEYWORDS, ident)
                        ? KEYWORDS[ident]
                        : TOKEN.IDENT;
                    return this._makeToken(type, ident, startColumn);
                }
                if (this._isDigit(c)) {
                    return this._makeToken(TOKEN.NUMBER, this._readNumber(), startColumn);
                }
                tok = this._makeToken(TOKEN.ILLEGAL, c, startColumn);
                this._advance();
                return tok;
        }
    }

	
	_readTemplatePart(isResuming = false) { 
        const p = this.position;
        while (this.ch !== null) {
            if (this.ch === '`') {
                const literal = this.source.slice(p, this.position);
                this._advance();
                return this._makeToken(TOKEN.TEMPLATE_TAIL, literal);
            }
            if (this.ch === '$' && this._peek() === '{') {
                const literal = this.source.slice(p, this.position);
                this._advance(); // Consume '$'
                this._advance(); // Consume '{'
                this.templateStack.push(true);
                this.braceNestingLevel = 1;
                
                // If we are Resuming (coming from '}'), it is a MIDDLE.
                // If we are not (coming from '`'), it is a HEAD.
                const type = isResuming ? TOKEN.TEMPLATE_MIDDLE : TOKEN.TEMPLATE_HEAD;
                return this._makeToken(type, literal);
            }
            if (this.ch === '\\') {
                this._advance(); // Skip escaped character
                if (this.ch === null) break;
            }
            this._advance();
        }
        return this._makeToken(TOKEN.ILLEGAL, 'Unterminated template literal');
    }
	
	
	
	
	_isLetter(c) { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c === '$'; }
	_isDigit(c) { return c >= '0' && c <= '9'; }
	_isIdentifierChar(c) { return c !== null && (this._isLetter(c) || this._isDigit(c)); }
}
return Lexer;
}));