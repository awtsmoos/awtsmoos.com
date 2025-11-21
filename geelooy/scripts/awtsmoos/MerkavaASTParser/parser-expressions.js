// In parser-expressions.js
// B"H --- Parsing Expressions [DEFINITIVE, UNIVERSAL & COMPLETE] ---
(function() { 

const { TOKEN, PRECEDENCE, PRECEDENCES } = window.MerkavahConstants;
    const proto = MerkavahParser.prototype;
(function(proto) {
	// B"H
// --- Start of Replacement for registerExpressionParsers in parser-expressions.js ---

	// B"H
// In parser-expressions.js
// --- Replace your existing registerExpressionParsers with this complete, corrected version ---

proto.registerExpressionParsers = function() {
    const p = this.prefixParseFns, i = this.infixParseFns;

    // Register the new prefix operator `~`
    p[TOKEN.BANG] = p[TOKEN.MINUS] = p[TOKEN.PLUS] = p[TOKEN.AWAIT] = p[TOKEN.BITWISE_NOT] = p[TOKEN.TYPEOF] = p[TOKEN.VOID] = this._parsePrefixExpression;
    
    p[TOKEN.SLASH] = this._parseRegExpLiteral;
    p[TOKEN.IDENT] = this._parseIdentifier,
    p[TOKEN.NUMBER] = p[TOKEN.STRING] = p[TOKEN.TRUE] = p[TOKEN.FALSE] = p[TOKEN.NULL] = this._parseLiteral, 
    p[TOKEN.THIS] = this._parseThisExpression,
    p[TOKEN.SUPER] = this._parseSuper, 
    p[TOKEN.INCREMENT] = p[TOKEN.DECREMENT] = l => this._parseUpdateExpression(l, !0), 
    p[TOKEN.LPAREN] = this._parseGroupedOrArrowExpression,
    p[TOKEN.LBRACE] = this._parseObjectLiteral,
    p[TOKEN.LBRACKET] = this._parseArrayLiteral,
    
    // --- THIS IS THE TIKKUN (PART 1) ---
    // Correctly register the prefix handler for template literals.
    p[TOKEN.TEMPLATE_HEAD] = p[TOKEN.TEMPLATE_TAIL] = this._parseTemplateLiteral,

    p[TOKEN.NEW] = this._parseNewExpression,
    p[TOKEN.FUNCTION] = this._parseFunctionExpression,
    p[TOKEN.CLASS] = this._parseClassExpression;
    p[TOKEN.ASYNC] = this._parseAsyncExpression;
    p[TOKEN.YIELD] = this._parseYieldExpression;
    p[TOKEN.DOTDOTDOT] = this._parseSpreadElement;
    p[TOKEN.IMPORT] = this._parseImportExpression;
        
    const binary = l => this._parseBinaryExpression(l);
    
    // --- THIS IS THE TIKKUN (PART 2) ---
    // Register the infix handler for tagged templates.
    i[TOKEN.TEMPLATE_HEAD] = i[TOKEN.TEMPLATE_TAIL] = this._parseTaggedTemplateExpression;

    // Register all binary operators, including the new bitwise and shift ones
    i[TOKEN.PLUS] = i[TOKEN.MINUS] = i[TOKEN.SLASH] = i[TOKEN.ASTERISK] = i[TOKEN.MODULO] = binary; 
    i[TOKEN.EQ] = i[TOKEN.NOT_EQ] = i[TOKEN.EQ_STRICT] = i[TOKEN.NOT_EQ_STRICT] = binary; 
    i[TOKEN.LT] = i[TOKEN.GT] = i[TOKEN.LTE] = i[TOKEN.GTE] = i[TOKEN.IN] = i[TOKEN.INSTANCEOF] = binary; 
    i[TOKEN.AND] = i[TOKEN.OR] = i[TOKEN.NULLISH_COALESCING] = binary; 
    i[TOKEN.EXPONENT] = binary; 
    i[TOKEN.BITWISE_AND] = i[TOKEN.BITWISE_OR] = i[TOKEN.BITWISE_XOR] = binary;
    i[TOKEN.LEFT_SHIFT] = i[TOKEN.RIGHT_SHIFT] = i[TOKEN.UNSIGNED_RIGHT_SHIFT] = binary;

    i[TOKEN.ASSIGN] = i[TOKEN.PLUS_ASSIGN] = i[TOKEN.MINUS_ASSIGN] = i[TOKEN.ASTERISK_ASSIGN] = 
    i[TOKEN.SLASH_ASSIGN] = i[TOKEN.EXPONENT_ASSIGN] = i[TOKEN.MODULO_ASSIGN] = i[TOKEN.NULLISH_ASSIGN] =
    i[TOKEN.LOGICAL_OR_ASSIGN] = i[TOKEN.LOGICAL_AND_ASSIGN] = 
    i[TOKEN.BITWISE_AND_ASSIGN] = i[TOKEN.BITWISE_OR_ASSIGN] = i[TOKEN.BITWISE_XOR_ASSIGN] = 
    i[TOKEN.LEFT_SHIFT_ASSIGN] = i[TOKEN.RIGHT_SHIFT_ASSIGN] = i[TOKEN.UNSIGNED_RIGHT_SHIFT_ASSIGN] = 
    l => this._parseAssignmentExpression(l); 
    
    i[TOKEN.COMMA] = l => this._parseSequenceExpression(l); 
    i[TOKEN.INCREMENT] = i[TOKEN.DECREMENT] = l => this._parseUpdateExpression(l, !1);
    i[TOKEN.LPAREN] = this._parseCallExpression;
    i[TOKEN.DOT] = this._parseMemberExpression;
    i[TOKEN.LBRACKET] = this._parseMemberExpression;
    i[TOKEN.OPTIONAL_CHAINING] = this._parseChainExpression;
    i[TOKEN.QUESTION] = this._parseConditionalExpression;
};


	// B"H
	
	


/* B"H */

proto._parseExpression = function(precedence) {
    this.recursionDepth++;
    if (this.recursionDepth > this.maxRecursionDepth) {
        throw new Error("Stack overflow detected: Maximum recursion depth exceeded.");
    }

    try {
        let prefix = this.prefixParseFns[this.currToken.type];
        if (!prefix) {
            this._error(`No prefix parse function for ${this.currToken.type}`);
            return null;
        }
        let leftExp = prefix.call(this);

        while (precedence < this._getPrecedence(this.currToken)) {
            // --- THIS IS THE TIKKUN HA'GADOL (THE GREAT RECTIFICATION) ---
            // This guard is the rune of binding that halts the infinite loop.
            // It gives the parser the awareness that if it is inside a template's expression,
            // the beginning of the next template part is a BOUNDARY, not an operator.
            if (this.parsingTemplateExpression && 
               (this.currToken.type === TOKEN.TEMPLATE_MIDDLE || this.currToken.type === TOKEN.TEMPLATE_TAIL)) {
                return leftExp;
            }
            // --- END OF THE RECTIFICATION ---

            let infix = this.infixParseFns[this.currToken.type];
            if (!infix) {
                return leftExp;
            }
            leftExp = infix.call(this, leftExp);
        }
        return leftExp;
    } finally {
        this.recursionDepth--;
    }
};
	proto._parseIdentifier =
		function() {
			if (this._peekTokenIs(
					TOKEN.ARROW)) {
				const t = this
					._startNode(),
					e = {
						type: "Identifier",
						name: this
							.currToken
							.literal
					};
				this._advance();
				const s = this
					._finishNode(e,
						t);
				return this
					._parseArrowFunctionExpression(
						t, [s])
			}
			const t = this
				._startNode(),
				e = {
					type: "Identifier",
					name: this
						.currToken
						.literal
				};
			return this._advance(),
				this._finishNode(e,
					t)
		};
		
		
	
	
	// B"H

// This version adds logic to correctly handle numeric separators and BigInts.
proto._parseLiteral = function() {
    const s = this._startNode();
    const token = this.currToken;
    let value = token.literal;
    let node = { type: "Literal" };

    switch (token.type) {
        case TOKEN.NUMBER:
            // --- FIX FOR BIGINT ---
            if (token.literal.endsWith('n')) {
                const bigintStr = token.literal.slice(0, -1).replace(/_/g, '');
                node.value = null; // Per ESTree spec for BigInt
                node.bigint = bigintStr;
            } else {
            // --- FIX FOR NUMERIC SEPARATORS ---
                node.value = parseFloat(token.literal.replace(/_/g, ''));
            }
            break;
        case TOKEN.TRUE:     value = true;  break;
        case TOKEN.FALSE:    value = false; break;
        case TOKEN.NULL:     value = null;  break;
        case TOKEN.STRING:   /* value is already correct */ break;
    }

    // Assign value if it hasn't been handled by a special case
    if (node.value === undefined) {
        node.value = value;
    }
    node.raw = token.literal;

    this._advance();
    return this._finishNode(node, s);
};


// B"H

// This version correctly handles parsing the flags after the pattern.
proto._parseRegExpLiteral = function() {
    const s = this._startNode();
    const lexer = this.l;

    const bodyStartPosition = this.currToken.startIndex + 1;
    let scanPosition = bodyStartPosition;
    let inCharSet = false;
    while (scanPosition < lexer.source.length) {
        const char = lexer.source[scanPosition];
        if (char === '\\') { scanPosition += 2; continue; }
        if (char === '[') inCharSet = true;
        else if (char === ']') inCharSet = false;
        if (char === '/' && !inCharSet) break;
        scanPosition++;
    }
    const bodyEndPosition = scanPosition;
    const body = lexer.source.substring(bodyStartPosition, bodyEndPosition);
    
    // --- THIS IS THE FIX ---
    scanPosition++; // Move past the closing '/'
    const flagsStartPosition = scanPosition;
    // Scan for all valid regex flags
    while (scanPosition < lexer.source.length && 'gimsuy'.includes(lexer.source[scanPosition])) {
        scanPosition++;
    }
    const flagsEndPosition = scanPosition;
    const flags = lexer.source.substring(flagsStartPosition, flagsEndPosition);
    // --- END OF FIX ---

    const node = {
        type: 'Literal', value: null, raw: `/${body}/${flags}`,
        regex: { pattern: body, flags: flags }
    };
    const finishedNode = this._finishNode(node, s);

    lexer.readPosition = flagsEndPosition;
    lexer._advance();
    
    this.currToken = this.l.nextToken();
    this.peekToken = this.l.nextToken();

    return finishedNode;
};
	
	
	proto._parseThisExpression =
		function() {
			const t = this
				._startNode();
			return this._advance(),
				this._finishNode({
					type: "ThisExpression"
				}, t)
		};
	proto._parseSuper = function() {
		const t = this
			._startNode();
		return this._advance(),
			this._finishNode({
				type: "Super"
			}, t)
	};
	
	
	// B"H
	


// 




	
	proto._parsePrefixExpression =
		function() {
			const t = this
				._startNode(),
				e = this.currToken
				.literal,
				s = this.currToken
				.type === TOKEN
				.AWAIT;
			this._advance();
			const i = this
				._parseExpression(
					PRECEDENCE
					.PREFIX),
				o = s ?
				"AwaitExpression" :
				"UnaryExpression";
			return this
				._finishNode({
					type: o,
					operator: e,
					argument: i,
					prefix: !0
				}, t)
		};
	proto._parseUpdateExpression =
		function(t, e) {
			const s = this
				._startNode();
			e ? (t = this
					._parseIdentifier()
				) : s.loc
				.start = t.loc
				.start;
			const i = this.currToken
				.literal;
			return this._advance(),
				this._finishNode({
					type: "UpdateExpression",
					operator: i,
					argument: t,
					prefix: e
				}, s)
		};
		
		
	



// B"H
// In parser-expressions.js

// --- THE DEFINITIVE REPLACEMENT for _parseGroupedOrArrowExpression ---
proto._parseGroupedOrArrowExpression = function() {
    const s = this._startNode();
    this._expect(TOKEN.LPAREN);

    if (this._currTokenIs(TOKEN.RPAREN)) { // Handles `()` for `() => ...`
        this._advance();
        if (!this._currTokenIs(TOKEN.ARROW)) {
            this._error("Unexpected empty parentheses in expression.");
            return null;
        }
        return this._parseArrowFunctionExpression(s, [], false);
    }

    const exprList = [];
    do {
        // --- THE FIX ---
        // We parse each item in the parenthesized list with the precedence of SEQUENCE.
        // This is the perfect balance:
        // 1. It is LOW enough (1) to allow an AssignmentExpression (precedence 2) to be parsed within it.
        // 2. It is HIGH enough (1) to NOT treat a comma (precedence 1) as an infix sequence operator,
        //    leaving the comma to be correctly handled by this do...while loop as a separator.
        exprList.push(this._parseExpression(PRECEDENCE.SEQUENCE));
    } while (this._currTokenIs(TOKEN.COMMA) && (this._advance(), true));

    this._expect(TOKEN.RPAREN);

    // After parsing, we resolve the ambiguity by looking for the arrow.
    if (this._currTokenIs(TOKEN.ARROW)) {
        // It's an arrow function. Convert expressions to valid parameter patterns.
        const params = exprList.map(e => this._convertExpressionToPattern(e));
        return this._parseArrowFunctionExpression(s, params, false);
    }

    // It was not an arrow function.
    if (exprList.length > 1) {
        // It was a sequence expression, like `(a, b, c)`.
        const seqNode = { type: 'SequenceExpression', expressions: exprList };
        const seqStart = { loc: { start: exprList[0].loc.start } };
        return this._finishNode(seqNode, seqStart);
    } else {
        // It was a single grouped expression, like `(a + b)`.
        return exprList[0];
    }
};
		
		
		
		
		
	proto._parseBinaryExpression =
		function(t) {
			const e = this
				._startNode();
			e.loc.start = t.loc
				.start;
			const s = this.currToken
				.literal,
				i = this
				._getPrecedence(this
					.currToken);
			this._advance();
			const o = this
				._parseExpression(
					i);
			return this
				._finishNode({
					type: "BinaryExpression",
					operator: s,
					left: t,
					right: o
				}, e)
		};
	// B"H
// B"H - In parser-expressions.js
// REPLACE your old _parseAssignmentExpression with this unified version.

/**
 * The Unification. This method now wields the Lens of Truth.
 * It no longer assumes the left side of an assignment is a simple name.
 * It uses `_convertExpressionToPattern` to transfigure what *looks* like
 * an Array or Object Expression into its true spiritual form: a Pattern
 * for destructuring. This allows it to see `[a, b, c]` as a vessel,
 * not a value, in the sacred context of assignment.
 */
proto._parseAssignmentExpression = function(left) {
    // First, gaze through the Lens of Truth to see the true form of the left side.
    const pattern = this._convertExpressionToPattern(left);

    // If the conversion returns null, the vessel is invalid (e.g., `5 = x`).
    // This is a true Shevirah.
    if (!pattern) {
        this._error("Invalid left-hand side in assignment expression.");
        return null;
    }

    // The rest of the ritual proceeds with this newfound clarity.
    const s = this._startNode();
    s.loc.start = pattern.loc.start;
    const operator = this.currToken.literal;
    this._advance();
    
    // Parse the right side with slightly lower precedence to handle chained assignments correctly.
    const right = this._parseExpression(PRECEDENCE.ASSIGNMENT - 1);

    return this._finishNode({
        type: "AssignmentExpression",
        operator: operator,
        left: pattern, // Use the enlightened, true pattern.
        right: right
    }, s);
};


// B"H - In parser-expressions.js
// ADD THIS NEW, CRITICAL HELPER FUNCTION.

/**
 * The Lens of Truth. A new, sacred helper method.
 * This is the alchemical engine of the Tikkun. It takes an AST node
 * born as an Expression and reveals its hidden soul as a Pattern. It
 * recursively transmutes ObjectExpressions into ObjectPatterns and
 * ArrayExpressions into ArrayPatterns, preparing them for the holy
 * act of destructuring. If it gazes upon a form that cannot be
 * transmuted (like a number), it signals a transgression.
 */
proto._convertExpressionToPattern = function(node) {
    if (!node) return null;
    switch (node.type) {
        // These forms are already pure and need no conversion.
        case 'Identifier':
        case 'ObjectPattern':
        case 'ArrayPattern':
        case 'RestElement':
            return node;

        // An ObjectExpression in this context is revealed to be an ObjectPattern.
        case 'ObjectExpression':
            node.type = 'ObjectPattern';
            node.properties.forEach(prop => {
                // Recursively reveal the true nature of each property's value.
                prop.value = this._convertExpressionToPattern(prop.value);
            });
            return node;

        // An ArrayExpression is revealed to be an ArrayPattern.
        case 'ArrayExpression':
            node.type = 'ArrayPattern';
            node.elements = node.elements.map(el => this._convertExpressionToPattern(el));
            return node;
        
        // A MemberExpression (e.g., `this.a`) is a valid assignment target.
        case 'MemberExpression':
            return node;

        // Any other form is profane in this context and shatters the vessel.
        default:
            this._error(`Cannot assign to an expression of type ${node.type}.`);
            return null;
    }
};

	proto
		._parseConditionalExpression =
		function(t) {
			const e = this
				._startNode();
			e.loc.start = t.loc
				.start, this
				._advance();
			const s = this
				._parseExpression(
					PRECEDENCE
					.LOWEST);
			this._expect(TOKEN
				.COLON);
			const i = this
				._parseExpression(
					PRECEDENCE
					.LOWEST);
			return this
				._finishNode({
					type: "ConditionalExpression",
					test: t,
					consequent: s,
					alternate: i
				}, e)
		};
	proto._parseSequenceExpression =
		function(t) {
			const e = this
				._startNode();
			e.loc.start = t.loc
				.start;
			const s =
				"SequenceExpression" ===
				t.type ? t
				.expressions : [t];
			return this._advance(),
				s.push(this
					._parseExpression(
						PRECEDENCE
						.SEQUENCE -
						1)), this
				._finishNode({
					type: "SequenceExpression",
					expressions: s
				}, e)
		};
	proto._parseArrayLiteral =
		function() {
			const t = this
				._startNode();
			this._expect(TOKEN
				.LBRACKET);
			const e = [];
			for (; !this
				._currTokenIs(TOKEN
					.RBRACKET) && !
				this._currTokenIs(
					TOKEN.EOF);) {
				if (this
					._currTokenIs(
						TOKEN.COMMA)
				) {
					this._advance(),
						e.push(
							null);
					continue
				}
				if (e.push(this
						._parseExpression(
							PRECEDENCE
							.ASSIGNMENT
						)), this
					._currTokenIs(
						TOKEN.COMMA)
				) this
					._advance();
				else if (!this
					._currTokenIs(
						TOKEN
						.RBRACKET)
				) {
					this._error(
						"Expected comma or ']' after array element."
					);
					break
				}
			}
			return this._expect(
					TOKEN.RBRACKET),
				this._finishNode({
					type: "ArrayExpression",
					elements: e
				}, t)
		};
	proto._parseObjectLiteral = function() {
		const t = this._startNode();
		this._expect(TOKEN.LBRACE);
		const e = [];

		// --- THE FORTRESS ---
		// This loop is now fortified. If _roperty fails and returns null,
		// we explicitly advance the token stream to prevent an infinite loop.
		while (!this._currTokenIs(TOKEN.RBRACE) && !this._currTokenIs(TOKEN.EOF)) {
			const prop = this._parseObjectProperty();
			if (prop) {
				e.push(prop);
			} else {
				// This is the safety net. If parsing a property fails,
				// we report it and advance past the problematic token.
				this._error("Failed to parse object property. Advancing to recover.");
				this._advance();
			}

			if (this._currTokenIs(TOKEN.RBRACE)) {
				break;
			}
			if (this._currTokenIs(TOKEN.COMMA)) {
				this._advance();
			} else if (!this._currTokenIs(TOKEN.RBRACE)) {
				this._error("Expected a comma or '}' after object property.");
				break; 
			}
		}
		// --- END OF THE FORTRESS ---

		this._expect(TOKEN.RBRACE);
		return this._finishNode({
			type: "ObjectExpression",
			properties: e
		}, t);
	};

	/**
	 * B"H
	 * The Tikkun HaGadol (The Great Rectification) of the Object Property.
	 * The sin of false prophecy has been purged. This version returns to the
	 * fundamental truth: observe, then act. It no longer predicts.
	 * 1. It handles spread elements and modifiers (`async`, `*`).
	 * 2. It tentatively identifies `get`/`set` but is prepared to be wrong.
	 * 3. It parses the property's key (identifier, literal, or computed).
	 * 4. CRUCIALLY, it looks at the *next* token to decide what it is:
	 *    - If `(`, it's a method.
	 *    - If `:`, it's a key-value pair.
	 *    - Otherwise, it's a shorthand property (with an optional default value).
	 * This clear, prioritized logic path resolves the paradox and restores stability.
	 */


// B"H - In parser-expressions.js

/**
 * The Seer's Method. This is the rectified version.
 * Its previous incarnation was too simple and could not see beyond a simple value.
 * This version understands that an object property's value can be a complex universe
 * of its own, such as a full AssignmentExpression. By calling `_parseExpression` with
 * the low precedence of `ASSIGNMENT`, we grant it the vision to see `[] = []` as a
 * single (though syntactically flawed) unit, which is the key to correctly
 * identifying the source of the transgression.
 */
proto._parseObjectProperty = function() {
    const s = this._startNode();

    // Handle SpreadElement (`...rest`) as a special case.
    if (this._currTokenIs(TOKEN.DOTDOTDOT)) {
        return this._parseSpreadElement();
    }

    // A property's key can be an identifier, string, or number.
    const key = (this.currToken.type === TOKEN.STRING || this.currToken.type === TOKEN.NUMBER)
        ? this._parseLiteral()
        : this._parseIdentifier();
    
    if (!key) return null;

    // This handles shorthand properties like `{ data }`. If there is no colon,
    // it's a shorthand property and we are done.
    if (!this._currTokenIs(TOKEN.COLON)) {
        return this._finishNode({ 
            type: 'Property', 
            key: key, 
            value: key,
            kind: 'init', 
            method: false, 
            shorthand: true, 
            computed: false 
        }, s);
    }

    // If we are here, it's a standard key-value pair.
    this._advance(); // Consume the ':'

    // --- THIS IS THE PRECISE, ESSENTIAL TIKKUN ---
    // This line commands the parser to parse a complete expression as the value.
    // By setting the precedence to `ASSIGNMENT`, it is capable of consuming
    // operators like `=` as part of this value expression.
    const value = this._parseExpression(PRECEDENCE.ASSIGNMENT);
    // --- END OF THE TIKKUN ---

    if (!value) {
        this._error("Expected a value after ':' in object property.");
        return null;
    }

    return this._finishNode({ 
        type: 'Property', 
        key: key, 
        value: value,
        kind: 'init', 
        method: false, 
        shorthand: false, 
        computed: false 
    }, s);
};

		
		
		
		
	proto._parseSpreadElement =
		function() {
			const t = this
				._startNode();
			this._expect(TOKEN
				.DOTDOTDOT);
			const e = this
				._parseExpression(
					PRECEDENCE
					.ASSIGNMENT);
			return this
				._finishNode({
					type: "SpreadElement",
					argument: e
				}, t)
		};
	

proto._parseArrowFunctionExpression = function(t, e, isAsync = false) { // The 'isAsync' parameter is new
    this._expect(TOKEN.ARROW);
    const s = this._currTokenIs(TOKEN.LBRACE) ? this._parseBlockStatement() : this._parseExpression(PRECEDENCE.ASSIGNMENT);
    return this._finishNode({
        type: "ArrowFunctionExpression",
        id: null,
        params: e,
        body: s,
        async: isAsync, // Use the new parameter here
        expression: "BlockStatement" !== s.type
    }, t)
};



// ADD THIS ENTIRE NEW FUNCTION to parser-expressions.js
// This is the new, smart entry point for all 'async' expressions.
proto._parseAsyncExpression = function() {
    const s = this._startNode();
    this._advance(); // Consume 'async'

    // After 'async', we could have 'async function() {}'
    if (this._currTokenIs(TOKEN.FUNCTION)) {
        // It's an async function EXPRESSION, so we call _parseFunction and tell it.
        return this._parseFunction('expression', true);
    }

    // Otherwise, it MUST be an async arrow function.
    // An arrow function can start with an identifier (async a => ...)
    // or parentheses (async () => ...). Let's parse that part.
    let arrowFn;
    if (this._currTokenIs(TOKEN.LPAREN)) {
        arrowFn = this._parseGroupedOrArrowExpression();
    } else if (this._currTokenIs(TOKEN.IDENT)) {
        arrowFn = this._parseIdentifier();
    } else {
        return this._error("Unexpected token after async keyword.");
    }

    // Now, we must verify that what we parsed was actually an arrow function
    if (arrowFn && arrowFn.type === 'ArrowFunctionExpression') {
        // It was! Now, we mark it as async and fix its start location.
        arrowFn.async = true;
        arrowFn.loc.start = s.loc.start; // The start was the 'async' token, not the '(' or identifier.
        return arrowFn;
    }

    // If we get here, it was something like `async (a + b)`, which is invalid.
    return this._error("async keyword must be followed by a function or an arrow function.");
};


	proto._parseFunctionExpression =
		function() {
			return this
				._parseFunction(
					"expression")
		};
	
    // --- THIS IS THE TIKKUN ---
	proto._parseClassExpression = function() {
        const s = this._startNode();
        this._expect(TOKEN.CLASS);

        let id = null;
        if (this._currTokenIs(TOKEN.IDENT)) {
            id = this._parseIdentifier();
        }

        let superClass = null;
        if (this._currTokenIs(TOKEN.EXTENDS)) {
            this._advance();
            // This is the rectification: it now correctly parses a full expression
            // as the superclass, not just a single identifier.
            superClass = this._parseExpression(PRECEDENCE.LOWEST);
        }

        const body = this._parseClassBody();
        return this._finishNode({
            type: "ClassExpression",
            id: id,
            superClass: superClass,
            body: body
        }, s);
    };
    // --- END OF TIKKUN ---

	proto._parseNewExpression = function() {
		const s = this._startNode();
		this._expect(TOKEN.NEW);

		if (this._currTokenIs(TOKEN.DOT)) {
			this._advance(); 
			const meta = { type: 'Identifier', name: 'new', loc: s.loc };
			if (!this._currTokenIs(TOKEN.IDENT) || this.currToken.literal !== 'target') {
				this._error("Expected 'target' after 'new.'.");
				return null;
			}
			const property = this._parseIdentifier();
			return this._finishNode({ type: 'MetaProperty', meta: meta, property: property }, s);
		}
		
		const callee = this._parseExpression(PRECEDENCE.CALL);
		let args = [];
		if (this._currTokenIs(TOKEN.LPAREN)) {
			args = this._parseArgumentsList();
		}
		
		return this._finishNode({
			type: "NewExpression",
			callee: callee,
			arguments: args
		}, s);
	};
	
	proto._parseCallExpression =
		function(t) {
			const e = this
				._startNode();
			e.loc.start = t.loc
				.start;
			const s = this
				._parseArgumentsList();
			return this
				._finishNode({
					type: "CallExpression",
					callee: t,
					arguments: s,
					optional: !1
				}, e)
		};
		
		
	// B"H

	// B"H - The rectified _parseArgumentsList
proto._parseArgumentsList = function() {
    this._expect(TOKEN.LPAREN); // Consume '('
    const args = [];

    // This single, more robust loop correctly handles all argument list patterns.
    while (!this._currTokenIs(TOKEN.RPAREN) && !this._currTokenIs(TOKEN.EOF)) {
        // It correctly handles:
        //  - An empty list: ()
        //  - A single argument: (a)
        //  - Multiple arguments: (a, b)
        //  - Trailing commas, which are valid JS syntax: (a, b, )
        
        // Parse the next argument expression. This will also handle spread elements (`...args`).
        const arg = this._parseExpression(PRECEDENCE.ASSIGNMENT);
        args.push(arg);

        // If the next token is not a comma, it must be the end of the list.
        if (!this._currTokenIs(TOKEN.COMMA)) {
            break;
        }

        // If it is a comma, consume it and prepare for the next argument.
        this._advance();
    }

    this._expect(TOKEN.RPAREN); // Expect and consume the closing ')'
    return args;
};
	
		
	



proto._parseMemberExpression = function(t, e = !1) {
    const s = this._startNode();
    s.loc.start = t.loc.start;
    const i = this._currTokenIs(TOKEN.LBRACKET);
    this._advance(); // Consume '.' or '['

    // THIS IS THE UPGRADE: Check for a private identifier after the '.'
    let o;
    if (!i && this._currTokenIs(TOKEN.PRIVATE_IDENT)) {
        o = this._parsePrivateIdentifier();
    } else {
        o = i ? this._parseExpression(PRECEDENCE.LOWEST) : this._parseIdentifier();
    }

    if (i) {
        this._expect(TOKEN.RBRACKET);
    }
    
    return this._finishNode({
        type: "MemberExpression",
        object: t,
        property: o,
        computed: i,
        optional: e
    }, s);
};
	// B"H 

proto._parseChainExpression = function(left) { // `left` is the object being chained, e.g., `user.profile`
    const chainStartNode = this._startNode();
    chainStartNode.loc.start = left.loc.start;
    
    let expressionNode = left; // Start with the left-hand side

    // Loop to handle chains like a?.b?.c
    while (this._currTokenIs(TOKEN.OPTIONAL_CHAINING)) {
        const optionalStartNode = this._startNode();
        optionalStartNode.loc.start = expressionNode.loc.start;
        this._advance(); // Consume the '?.' token

        if (this._currTokenIs(TOKEN.LPAREN)) {
            // It's an optional call: `...?.()`
            const args = this._parseArgumentsList(); // This handles parsing `(...)`
            expressionNode = this._finishNode({
                type: 'CallExpression',
                callee: expressionNode,
                arguments: args,
                optional: true // Mark as optional
            }, optionalStartNode);

        } else if (this._currTokenIs(TOKEN.LBRACKET)) {
            // It's optional computed property access: `...?.[...]`
            this._advance(); // consume '['
            const property = this._parseExpression(PRECEDENCE.LOWEST);
            this._expect(TOKEN.RBRACKET);
            expressionNode = this._finishNode({
                type: 'MemberExpression',
                object: expressionNode,
                property: property,
                computed: true,
                optional: true // Mark as optional
            }, optionalStartNode);

        } else {
            // It's optional property access: `...?.prop`
            const property = this._parseIdentifier(); // This will parse 'prop'
            expressionNode = this._finishNode({
                type: 'MemberExpression',
                object: expressionNode,
                property: property,
                computed: false,
                optional: true // Mark as optional
            }, optionalStartNode);
        }
    }
    
    // According to ESTree, the whole thing is wrapped in a ChainExpression
    return this._finishNode({ type: 'ChainExpression', expression: expressionNode }, chainStartNode);
};
		
		
	// Add this new function to parser-expressions.js
proto._parseYieldExpression = function() {
    const s = this._startNode();
    this._advance(); // Consume 'yield'

    let argument = null;
    let delegate = false;

    // Check for yield*
    if (this._currTokenIs(TOKEN.ASTERISK)) {
        delegate = true;
        this._advance(); // Consume '*'
    }

    // Parse an argument if it's there and not prohibited by ASI
    if (!this._currTokenIs(TOKEN.SEMICOLON) && !this._currTokenIs(TOKEN.RBRACE) && !this.currToken.hasLineTerminatorBefore) {
        argument = this._parseExpression(PRECEDENCE.LOWEST);
    }

    return this._finishNode({ type: 'YieldExpression', argument, delegate }, s);
};


/* B"H */
// IN: geelooy/scripts/awtsmoos/MerkavaASTParser/parser-expressions.js

proto._parseTemplateLiteral = function() {
    const s = this._startNode();
    const quasis = [];
    const expressions = [];
    let done = false;

    while (!done) {
        const type = this.currToken.type;
        const literal = this.currToken.literal;
        done = (type === TOKEN.TEMPLATE_TAIL);

        quasis.push(this._finishNode({
            type: 'TemplateElement',
            value: { raw: literal, cooked: literal },
            tail: done
        }, this._startNode()));
        this._advance();

        if (!done) {
            // --- SETTING THE CONSCIOUSNESS ---
            this.parsingTemplateExpression = true;
            expressions.push(this._parseExpression(PRECEDENCE.LOWEST));
            this.parsingTemplateExpression = false;
            // --- CONSCIOUSNESS RESTORED ---
        }
    }

    return this._finishNode({ type: 'TemplateLiteral', quasis, expressions }, s);
};


/**
 * B"H
 * Parses a tagged template expression (e.g., `tag`hello ${name}`).
 * This is an INFIX function. It receives the `tag` as its left-hand side.
 * It is responsible for parsing the template part itself, directly.
 */
proto._parseTaggedTemplateExpression = function(tag) {
    const s = this._startNode();
    s.loc.start = tag.loc.start;
    
    // Manually parse the TemplateLiteral part (the "quasi")
    const quasi_s = this._startNode();
    const quasis = [];
    const expressions = [];
    let done = false;

    while (!done) {
        const type = this.currToken.type;
        const literal = this.currToken.literal;
        done = (type === TOKEN.TEMPLATE_TAIL);

        quasis.push(this._finishNode({
            type: 'TemplateElement',
            value: { raw: literal, cooked: literal },
            tail: done
        }, this._startNode()));
        this._advance();

        if (!done) {
            expressions.push(this._parseExpression(PRECEDENCE.LOWEST));
        }
    }
    const quasi = this._finishNode({ type: 'TemplateLiteral', quasis, expressions }, quasi_s);
    
    return this._finishNode({
        type: 'TaggedTemplateExpression',
        tag: tag,
        quasi: quasi
    }, s);
};


		// Add this new helper function to parser-expressions.js
proto._parsePrivateIdentifier = function() {
    const s = this._startNode();
    // The literal from the lexer already includes the '#'
    const name = this.currToken.literal.slice(1);
    const node = { type: 'PrivateIdentifier', name: name };
    this._advance();
    return this._finishNode(node, s);
};






// Its purpose is to convert an AST parsed as an expression into a valid pattern for binding.


// B"H 

proto._convertExpressionToPattern = function(node) {
    if (!node) return null;
    switch (node.type) {
        // --- THE TIKKUN (THE FIX) ---
        // An AssignmentPattern is ALREADY a valid pattern. It represents a
        // parameter with a default value. We simply allow it to pass through.
        case 'AssignmentPattern':
        case 'Identifier':
        case 'ObjectPattern':
        case 'ArrayPattern':
            return node;

        // Convert expression types to their pattern equivalents.
        case 'ObjectExpression':
            node.type = 'ObjectPattern';
            node.properties.forEach(prop => {
                // The key of a property is not converted, but its value is.
                prop.value = this._convertExpressionToPattern(prop.value);
            });
            return node;

        case 'ArrayExpression':
            node.type = 'ArrayPattern';
            node.elements = node.elements.map(el => this._convertExpressionToPattern(el));
            return node;
        
        // This case is now handled above, but we keep the logic for clarity.
        case 'AssignmentExpression':
            node.type = 'AssignmentPattern';
            node.left = this._convertExpressionToPattern(node.left);
            return node;

        // If we find an expression that truly cannot be a pattern, it's a syntax error.
        default:
            this._error(`Cannot use expression of type ${node.type} as a parameter.`);
            return null;
    }
};





// B"H 


proto._parseImportExpression = function() {
    const s = this._startNode();
    
    // Manually create the 'import' identifier node for the AST, as it doesn't come
    // from a standard IDENT token but from the IMPORT keyword.
    const metaIdentifier = { type: 'Identifier', name: 'import', loc: s.loc };
    
    this._advance(); // Consume the 'import' keyword.

    // --- THIS IS THE TIKKUN (THE FIX) ---
    // After 'import', we check for a '.' to see if it is the 'import.meta' property.
    if (this._currTokenIs(TOKEN.DOT)) {
        this._advance(); // Consume '.'

        const property = this._parseIdentifier();
        if (property.name !== 'meta') {
            this._error("Expected 'meta' after 'import.'");
            return null;
        }

        // According to the ESTree spec, this is a MetaProperty node.
        return this._finishNode({ type: 'MetaProperty', meta: metaIdentifier, property: property }, s);
    }

    // If it was not 'import.meta', it must be a dynamic import: 'import()'.
    if (!this._currTokenIs(TOKEN.LPAREN)) {
        this._error("Expected '(' after import for a dynamic import expression.");
        return null;
    }
    this._advance(); // Consume '('

    // Parse the module source as an expression.
    const source = this._parseExpression(PRECEDENCE.LOWEST);

    this._expect(TOKEN.RPAREN); // Consume ')'

    // According to the ESTree spec, this is an ImportExpression node.
    return this._finishNode({ type: 'ImportExpression', source: source }, s);
};

// --- 




// B"H
// --- The Illumination: A new helper function to reveal the true nature of a pattern ---

proto._convertExpressionToPattern = function(node) {
    if (!node) return null;
    switch (node.type) {
        // These types are already valid patterns or can be part of one.
        case 'Identifier':
        case 'MemberExpression':
        case 'ObjectPattern': // Already a pattern
        case 'ArrayPattern':  // Already a pattern
            return node;

        // An ObjectExpression in this context is truly an ObjectPattern.
        case 'ObjectExpression':
            node.type = 'ObjectPattern';
            // Recursively convert the values of its properties.
            for (const prop of node.properties) {
                prop.value = this._convertExpressionToPattern(prop.value);
            }
            return node;

        // An ArrayExpression in this context is truly an ArrayPattern.
        case 'ArrayExpression':
            node.type = 'ArrayPattern';
            // Recursively convert its elements.
            node.elements = node.elements.map(el => this._convertExpressionToPattern(el));
            return node;

        // If we find any other type of expression, it is an invalid assignment target.
        default:
            // This is where the error for `1 = 2` would be caught.
            return null;
    }
}; 







})(MerkavahParser
	.prototype
	);
})();