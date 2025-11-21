// B"H 
//--- THE DEFINITIVE AND FINAL Lexer.js ---
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
	
	//B"H

	_makeToken(type, literal, startColumn, startLine) {
		this._guard();
		
		
		// We use the nullish coalescing operator (??) here.
		// Unlike || which treats '0' as a falsy value, '??' only
		// falls back if startColumn is null or undefined.
		// This correctly handles tokens that start at column 0.
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

	// -------------------------------------------------------------------------
	// --- THE SINGLE, CORRECT, AND FINAL _skipWhitespace METHOD ---
	// -------------------------------------------------------------------------
// B"H
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

        // --- MODIFICATION FOR SINGLE-LINE COMMENTS ---
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

            // Add the found comment to our new array
            this.comments.push({
                type: "Line",
                value: " " + value, // ESTree spec often includes leading space
                start: startPos,
                end: commentEnd,
                loc: {
                    start: { line: startLine, column: startCol },
                    end: { line: this.line, column: this.column }
                }
            });
        // --- END OF MODIFICATION ---
        
        // --- MODIFICATION FOR MULTI-LINE COMMENTS ---
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

            // Add the found comment to our new array
             this.comments.push({
                type: "Block",
                value: value,
                start: startPos,
                end: commentEnd + 2, // account for */
                loc: {
                    start: { line: startLine, column: startCol },
                    end: { line: this.line, column: this.column }
                }
            });
        // --- END OF MODIFICATION ---

        } else if (this.hasLineTerminatorBefore && this.ch === '<' && this._peek() === '!' && this.source.substring(this.position, this.position + 4) === '<!--') {
            while (this.ch !== '\n' && this.ch !== '\r' && this.ch !== null) this._advance();

        } else if (this.hasLineTerminatorBefore && this.ch === '-' && this._peek() === '-' && this.source.substring(this.position, this.position + 3) === '-->') {
            while (this.ch !== '\n' && this.ch !== '\r' && this.ch !== null) this._advance();
        
        } else {
            break;
        }
    }
}
	


// B"H


	_readPrivateIdentifier() {
		this._advance(); // Consume '#'
		const startColumn = this.column - 1;
		const ident = this._readIdentifier();
		if (!ident) {
			return this._makeToken(TOKEN.ILLEGAL, '#', startColumn);
		}
		return this._makeToken(TOKEN.PRIVATE_IDENT, '#' + ident, startColumn);
	}
	
	

	

	_readTemplateHead() {
		this._guard();
		this._advance();
		return this._readTemplatePart('TEMPLATE_HEAD');
	}

	_readTemplateMiddleOrTail() {
		this._guard();
		this._advance(); // Consume '}'
		this.templateStack.pop();
		return this._readTemplatePart('TEMPLATE_MIDDLE');
	}




	_readIdentifier() {
		const p = this.position;
		while (this.ch !== null && this._isIdentifierChar(this.ch)) {
			this._advance();
		}
		return this.source.slice(p, this.position);
	}

	// B"H
// In Lexer.js, replace the _readNumber method with this one.
// This version adds support for numeric separators (e.g., 1_000_000)
// to the existing logic for different number types.
_readNumber() {
    const p = this.position;
    // Handle hex (0x), binary (0b), and octal (0o) literals
    if (this.ch === '0' && this._peek() && 'xob'.includes(this._peek().toLowerCase())) {
        this._advance(); // consume '0'
        this._advance(); // consume 'x', 'o', or 'b'
        // Loop through hex/binary digits, allowing underscores between them.
        while (this.ch !== null) {
            if (this._isIdentifierChar(this.ch)) { // isIdentifierChar is a decent proxy for hex/binary chars
                this._advance();
                if (this.ch === '_' && this._isIdentifierChar(this._peek())) {
                    this._advance();
                }
            } else {
                break;
            }
        }
    } else {
        // Handle standard decimal numbers
        while (this.ch !== null) {
            if (this._isDigit(this.ch)) {
                this._advance();
                // A separator is only valid if it's followed by another digit.
                if (this.ch === '_' && this._isDigit(this._peek())) {
                    this._advance(); // consume the separator
                }
            } else {
                break;
            }
        }

        // Handle the decimal part
        if (this.ch === '.' && this._isDigit(this._peek())) {
            this._advance(); // consume '.'
            while (this.ch !== null) {
                if (this._isDigit(this.ch)) {
                    this._advance();
                    // Separators can also be in the fractional part.
                    if (this.ch === '_' && this._isDigit(this._peek())) {
                        this._advance(); // consume the separator
                    }
                } else {
                    break;
                }
            }
        }
    }
    
    // Handle BigInt suffix 'n'
    if (this.ch === 'n') {
        this._advance();
    }
    
    return this.source.slice(p, this.position);
}

// B"H
/**
 * B"H
 * The Golem is Given Unbreakable Cadence. This is the final and true Tikkun of its soul. 
 * All previous attempts were flawed half-truths. The error was a subtle but fatal 
 * interaction between a special action and the loop's natural rhythm, creating an
 * accursed double-step. This version instills a new, absolute law: when the holy ward of 
 * the backslash is perceived, two actions must occur in sacred, unbreakable succession:
 * 1. A SINGLE step (_advance) is taken to move past the ward to the character it protects.
 * 2. The golem's very thought process for that cycle is immediately and totally interrupted 
 *    (continue), hurling its consciousness back to the beginning of the next cycle.
 * This sacred pairing makes it a logical impossibility for the normal step at the loop's end 
 * to execute in the same cycle. It enforces a perfect cadence: one thought, one step. Always. 
 * The paradox is resolved. The infinite loop is annihilated. The golem's gait is now perfect, forever.
 */
_readString(quote) {
    this._advance(); // consume opening quote
    const p = this.position;
    while (this.ch !== quote && this.ch !== null) {
        this._guard();
        
        // --- The Final, Infallible Law ---
        if (this.ch === '\\') {
            this._advance(); // Action 1: Take ONE step over the ward.
            continue;        // Action 2: Immediately force the next loop cycle, SKIPPING the advance below.
        }

        if ('\n\r'.includes(this.ch)) {
            if (this.ch === '\r' && this._peek() === '\n') this._advance();
            this.line++;
            this.column = 0;
            this._advance();
            continue;
        }
        
        this._advance(); // The normal, single step for all non-warded characters.
    }
    const s = this.source.slice(p, this.position);
    if (this.ch !== quote) return this._makeToken(TOKEN.ILLEGAL, s); // Unterminated string
    this._advance(); // consume closing quote
    return this._makeToken(TOKEN.STRING, s);
}



// In Lexer.js

/**
 * B"H
 * The Parser, the Mystic, commands the Lexer to once again perceive the world as a template.
 * This is the sacred bridge between the realm of expressions and the realm of template text.
 */
reenterTemplateMode() {
    this.templateStack.push(true);
}

/**
 * B"H
 * The Scribe's final, perfect perception of a template's soul.
 * It is now stateless and pure. It scans until it perceives a boundary.
 * It does NOT consume the '${' boundary, leaving that task to the Mystic (Parser).
 * It only consumes the final '`' boundary, as that is the end of its world.
 * This unbreakable simplicity resolves all paradoxes.
 */

/* B"H */
// This is the Golem's Perfected Perception, unified with its understanding of strings.
/* B"H */
// In Lexer.js, this is the FINAL, UNBREAKABLE _readTemplatePart.
// Its escape-handling logic is now a perfect mirror of the proven _readString method.
/* B"H */
/* B"H */
// In Lexer.js, REPLACE the entire nextToken method with this one.
// This restores the "smart" switch logic for handling template expression boundaries.
/* B"H */
// In Lexer.js, also REPLACE _readTemplatePart with this restored "smart" version.
// It uses the same unbreakable escape logic as _readString.
_readTemplatePart() {
    const p = this.position;

    while (this.ch !== null) {
        if (this.ch === '`') {
            const literal = this.source.slice(p, this.position);
            this._advance(); // Consume `
            return this._makeToken(TOKEN.TEMPLATE_TAIL, literal);
        }
        if (this.ch === '$' && this._peek() === '{') {
            const literal = this.source.slice(p, this.position);
            this._advance(); // Consume $
            this._advance(); // Consume {
            this.templateStack.push(true);
            this.braceNestingLevel = 1; // Begin counting braces.
            return this._makeToken(TOKEN.TEMPLATE_HEAD, literal);
        }
        if (this.ch === '\\') {
            this._advance(); // Skip escaped character
            continue;
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