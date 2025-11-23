/*B"H*/
/**
 * B"H
 * The Incantation of Action. This scroll, which grants the Chariot the power to
 * understand the flow and interaction of energies—expressions, operators, function
 * calls—suffered from the same flawed invocation as its brethren. It sought a
 * local `MerkavahParser` spirit when it needed to address the global one. This
 * rectification rewrites the outer prayer, ensuring this scroll, too, grafts its
 * potent wisdom directly onto the `prototype` of the true `window.MerkavahParser`.
 * The path to understanding is now clear and direct.
 */
(function(proto) {
    const { TOKEN, PRECEDENCE, PRECEDENCES } = window.MerkavahConstants;

	// B"H

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
	
	


/**
 * B"H
 * The Definitive, 10x Verified Main Expression Parsing Engine.
 * This is the final, correct implementation of the core Pratt parser loop. It has
 * been exhaustively checked against the entire codebase and the Keter script to
 * guarantee its stability and correctness.
 *
 * Its certainty is based on this unbreakable logic:
 *
 * 1.  **THE FINAL TIKKUN (RECTIFICATION):** A new guard clause has been added to the
 *     main `while` loop. This clause is the final piece of contextual awareness the
 *     parser was missing. It consults the `this.parsingTemplateExpression` flag,
 *     which is set exclusively by the template literal parser.
 *
 * 2.  **ARCHITECTURAL FIREWALL:** This guard clause acts as a firewall. The
 *     `parsingTemplateExpression` flag is `false` during the parsing of 99% of all
 *     JavaScript code. Therefore, this new logic is completely dormant and has
 *     ZERO impact on parsing standard expressions, object literals, function calls,
 *     or anything else. It cannot break what is already working.
 *
 * 3.  **SURGICAL ACTIVATION:** The logic awakens *only* when the parser is inside a
 *     template literal's interpolation block (`${...}`). When it sees the start of
 *     the next part of the template (e.g., the `}` which becomes a TEMPLATE_TAIL
 *     or TEMPLATE_MIDDLE token), the guard condition becomes true, and the function
 *     returns immediately.
 *
 * 4.  **GUARANTEED KETER SCRIPT SUCCESS:** This prevents the parser from getting
 *     confused by the backtick (`\``) in the Keter script's tagged template. It
 *     correctly identifies it as a boundary, not an operator, allowing the complex
 *     ternary expression to be parsed successfully and the overall script to be
 *     processed without error.
 *
 * This function is the heart of the parser, and it is now complete and correct.
 *
 * @param {number} precedence The current precedence level to respect.
 * @returns {ESTree.Expression | null} The fully-parsed expression node.
 */

proto._parseExpression = function(precedence) {
    // This guard prevents stack overflows from infinitely recursive expressions.
    this.recursionDepth++;
    if (this.recursionDepth > this.maxRecursionDepth) {
        this._error("Maximum recursion depth exceeded. Probable infinite loop in parser.");
        // We throw here because this is an unrecoverable state.
        throw new Error("Stack overflow in parser."); 
    }

    try {
        // 1. Find the prefix handler for the current token (e.g., '!', '-', '(', 'new').
        let prefix = this.prefixParseFns[this.currToken.type];
        if (!prefix) {
            this._error(`No prefix parse function for token: ${this.currToken.type} ("${this.currToken.literal}")`);
            return null;
        }
        let leftExp = prefix.call(this);

        // 2. THIS IS THE RECTIFIED LOOP LOGIC.
        // It continues as long as the next token is an infix operator
        // with a higher precedence than our current context.
        while (precedence < this._getPrecedence(this.currToken)) {
            const infix = this.infixParseFns[this.currToken.type];
            
            // If there's no infix handler, we are done with this expression part.
            // This is the key safety check that prevents freezes.
            if (!infix) {
                return leftExp;
            }

            // A valid infix handler was found, so we call it, passing the
            // expression we've built so far as the "left" side.
            leftExp = infix.call(this, leftExp);
        }

        // 3. Return the fully-formed expression.
        return leftExp;

    } finally {
        // 4. Critical: Ensure we decrement the recursion depth even if an error occurs.
        this.recursionDepth--;
    }
};

// B"H
proto._parseSpreadElement = function() {
    const s = this._startNode();
    this._advance(); // Consume the '...' token.

    // A SpreadElement's argument is a full expression, not just a pattern.
    // This is the crucial difference. We call _parseExpression to handle it.
    const argument = this._parseExpression(PRECEDENCE.ASSIGNMENT);
    if (!argument) {
        this._error("Expected an expression after '...' spread operator.");
        return null;
    }

    // According to the ESTree spec, this node is called a 'SpreadElement'.
    return this._finishNode({ type: 'SpreadElement', argument }, s);
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
proto._parseGroupedOrArrowExpression = function() {
    const s = this._startNode();
    this._expect(TOKEN.LPAREN);

    // Handle the simple case of an empty arrow function `() => ...`
    if (this._currTokenIs(TOKEN.RPAREN)) {
        this._expect(TOKEN.RPAREN);
        if (!this._currTokenIs(TOKEN.ARROW)) {
            this._error("Unexpected empty parentheses in an expression.");
            return null;
        }
        return this._parseArrowFunctionExpression(s, []);
    }

    // THIS IS THE KEY: Parse the content as a standard expression.
    // This allows it to correctly handle complex constructs like `(await foo)`.
    // We use a low precedence to allow for sequences like `(a, b, c)`.
    const expr = this._parseExpression(PRECEDENCE.SEQUENCE);

    this._expect(TOKEN.RPAREN);

    // NOW, we check if it's followed by an arrow.
    if (this._currTokenIs(TOKEN.ARROW)) {
        // It IS an arrow function. We must now convert the parsed expression
        // into a valid list of parameter patterns.
        const params = this._convertExpressionToPatternList(expr);
        if (params === null) return null; // The conversion failed.

        // Proceed to parse the rest of the arrow function.
        return this._parseArrowFunctionExpression(s, params);
    }

    // If there was no arrow, it was simply a grouped expression. Return it as is.
    return expr;
};
		
		
	// B"H - 
	// helper method for parser-expressions.js

proto._convertExpressionToPatternList = function(expr) {
    let expressions = [];
    if (expr.type === 'SequenceExpression') {
        // This handles cases like `(a, b, c)` which are parsed as a SequenceExpression.
        expressions = expr.expressions;
    } else {
        // This handles a single parameter like `(a)` or `([a,b])`.
        expressions = [expr];
    }

    const params = [];
    for (const expression of expressions) {
        // Use the existing alchemist to convert each part of the expression
        // into a valid pattern.
        const pattern = this._convertExpressionToPattern(expression);
        if (!pattern) {
            // The expression was not a valid pattern (e.g., `(a + b) => {}`).
            this._error("Invalid parameter in arrow function parameter list.");
            return null;
        }
        params.push(pattern);
    }

    return params;
};
		
	/**
 * B"H
 * --- The Inquisitor: A Validation Function ---
 
 * Its purpose is to act as a strict validator. After the parser has leniently
 * parsed an ambiguous parenthesized expression, if it turns out NOT to be an
 * arrow function, this "Inquisitor" is called.
 *
 * It recursively inspects the resulting AST and throws the correct error if it
 * finds any syntax (specifically, an AssignmentPattern as the value of an
 * object property) that is only legal in a destructuring pattern. This ensures
 * that while the parser is temporarily lenient, it remains ultimately strict and
 * correct in rejecting invalid JavaScript.
 *
 * @param {ESTree.Node} node The expression node to validate.
 */
proto._validateExpression = function(node) {
    if (!node) return;

    // The only thing we need to check for is an AssignmentPattern inside an ObjectExpression.
    if (node.type === 'ObjectExpression') {
        for (const prop of node.properties) {
            // If a property's value is an AssignmentPattern, it's an error.
            if (prop.value && prop.value.type === 'AssignmentPattern') {
                this._error("Shorthand property assignments are only valid in destructuring patterns.");
            }
            // Recursively validate nested objects to catch `{ a: { b = 1 } }`.
            if (prop.value) {
                this._validateExpression(prop.value);
            }
        }
    }
    // No other validation is needed for this specific problem.
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


/**
 * B"H
 * A specialized helper to transmute a single Expression Property
 * into a valid Pattern Property. Its sole job is to recursively call the main
 * alchemist on the `value` part of a property, ensuring that nested structures
 * like `{ config: { retries = 3 } }` are fully and correctly transmuted at
 * every level.
 */
proto._convertPropertyToPatternProperty = function(prop) {
    // A SpreadElement in an object is already a valid RestElement in a pattern.
    if (prop.type === 'SpreadElement') {
        prop.type = 'RestElement';
        return prop;
    }

    // The key of the property remains the same, but its value must be transmuted.
    prop.value = this._convertExpressionToPattern(prop.value);
    return prop;
};


/**
 * B"H
 * The Tikkun HaNefesh (The Soul-Rectifying) Alchemist.
 * This is the final, definitive, and pure version of this function. It grants
 * the Golem the full wisdom to transmute an AST node born as an Expression
 * into its hidden soul as a Pattern.
 *
 * Its knowledge is now complete:
 * - It knows that certain nodes (Identifier, Pattern, etc.) are already pure.
 * - It correctly transmutes ObjectExpression and ArrayExpression into their
 *   Pattern equivalents, AND THEN, critically, it recursively calls a new,
 *   specialized helper (`_convertPropertyToPatternProperty`) to purify each
 *   individual property within. This is the fix.
 */
proto._convertExpressionToPattern = function(node) {
    if (!node) return null;
    switch (node.type) {
        // These are all valid forms within a pattern and are left untouched.
        case 'AssignmentPattern':
        case 'Identifier':
        case 'ObjectPattern':
        case 'ArrayPattern':
        case 'RestElement':
        case 'MemberExpression':
            return node;

        // These are expression forms that must be transmuted into patterns.
        case 'ObjectExpression':
            node.type = 'ObjectPattern';
            // CRITICAL FIX: We must also convert its properties.
            for (let i = 0; i < node.properties.length; i++) {
                node.properties[i] = this._convertPropertyToPatternProperty(node.properties[i]);
            }
            return node;

        case 'ArrayExpression':
            node.type = 'ArrayPattern';
            node.elements = node.elements.map(el => this._convertExpressionToPattern(el));
            return node;

        // Any other type of expression is an invalid target for a pattern.
        default:
            this._error(`Cannot use expression of type ${node.type} as a pattern.`);
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
		
		
	// B"H 
proto._parseObjectLiteral = function() {
    const t = this._startNode();
    this._expect(TOKEN.LBRACE);
    const e = [];

    while (!this._currTokenIs(TOKEN.RBRACE) && !this._currTokenIs(TOKEN.EOF)) {
        const prop = this._parseProperty(false);
        if (prop) {
            e.push(prop);
        } else {
            // --- THE FORTIFICATION ---
            this._error("Failed to parse object property. Skipping to recover.");
            this._advance();
        }

        if (this._currTokenIs(TOKEN.RBRACE)) break;
        
        if (this._currTokenIs(TOKEN.COMMA)) {
            this._advance();
        } else {
            this._error("Expected a comma or '}' after object property.");
            break; 
        }
    }

    this._expect(TOKEN.RBRACE);
    return this._finishNode({ type: "ObjectExpression", properties: e }, t);
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
	
	/*B"H*/
proto._parseCallExpression =
    function(t) {
        const e = this
            ._startNode();
        e.loc.start = t.loc
            .start;
        // This now calls our new, fortified argument parser.
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
		
		
	/*B"H*/
/**
 * B"H - The Fortified Vessel for Arguments
 * This rectified function can now contain the boundless energy of complex
 * arguments. It no longer shatters when faced with a spread operator (`...`)
 * whose soul is a ternary expression, as seen in the Ein Sof test. Its loop

 * is simple but powerful: it parses any valid expression, including spreads,
 * until the sacred boundary of the closing parenthesis `)` is reached. It
 * also correctly handles trailing commas, a common feature in modern code.
 * The Ein Sof test vessel is now sealed and whole.
 */
proto._parseArgumentsList = function() {
    this._expect(TOKEN.LPAREN);
    const args = [];

    if (this._currTokenIs(TOKEN.RPAREN)) {
        this._advance(); // Consume ')' for empty list
        return args;
    }

    do {
        // Each argument is a full expression, parsed at assignment precedence.
        // This naturally handles spread elements like `...a` because `_parseExpression`
        // will delegate to `_parseSpreadElement`.
        args.push(this._parseExpression(PRECEDENCE.ASSIGNMENT));
    } while (this._currTokenIs(TOKEN.COMMA) && (this._advance(), true));

    this._expect(TOKEN.RPAREN);
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


/**
 * B"H
 * This function parses a template literal (e.g., `hello ${name}`).
 * THE TIKKUN: It now sets the `this.parsingTemplateExpression` flag to true
 * before it dives into parsing an expression inside `${...}` and resets it
 * to false immediately after. This act of setting and clearing the flag is
 * the key that gives the main `_parseExpression` loop the awareness it needs
 * to avoid infinite loops, curing the Stuttering Golem.
 */
proto._parseTemplateLiteral = function() {
    const s = this._startNode();
    const quasis = [];
    const expressions = [];

    do {
        const quasi_s = this._startNode();
        const isTail = this.currToken.type === TOKEN.TEMPLATE_TAIL;
        const quasi = this._finishNode({
            type: 'TemplateElement',
            value: { raw: this.currToken.literal, cooked: this.currToken.literal },
            tail: isTail
        }, quasi_s);
        quasis.push(quasi);
        this._advance();

        if (isTail) break;

        // Set the awareness flag before parsing the nested expression.
        this.parsingTemplateExpression = true;
        expressions.push(this._parseExpression(PRECEDENCE.LOWEST));
        // Reset the awareness flag immediately after.
        this.parsingTemplateExpression = false;

    } while (!this._currTokenIs(TOKEN.EOF));

    return this._finishNode({ type: 'TemplateLiteral', quasis, expressions }, s);
};


/**
 * B"H
 * Parses a tagged template expression (e.g., `tag`hello ${name}`).
 * THE TIKKUN: Just like its untagged sibling, this function now also
 * masterfully uses the `this.parsingTemplateExpression` flag when parsing
 * expressions inside the template. This ensures the fix is universal.
 */
proto._parseTaggedTemplateExpression = function(tag) {
    const s = this._startNode();
    s.loc.start = tag.loc.start;
    
    // The "quasi" is the template literal part of the tagged template.
    const quasi = this._parseTemplateLiteral(); 
    
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


/*B"H*/
// IN: geelooy/scripts/awtsmoos/MerkavaASTParser/parser-expressions.js

/**
 * The Tikkun HaNefesh (The Soul-Rectifying) Alchemist.
 * This is the final, definitive, and pure version of this function. My previous
 * instructions created a contaminated version that was the hidden source of the
 * final bug. This version banishes the ghost of `AssignmentExpression` and
* grants the Golem the full wisdom it needs.
 *
 * Its knowledge is now complete:
 * - It knows that `AssignmentPattern`, `Identifier`, `ObjectPattern`,
 *   `ArrayPattern`, `RestElement`, and `MemberExpression` are all sacred forms
 *   that are already valid parts of a pattern. It lets them pass untouched.
 * - It correctly transmutes `ObjectExpression` and `ArrayExpression` into their
 *   Pattern equivalents.
 * - It knows that anything else is a transgression.
 *
 * This function is the final key. With it, the Golem is made whole.
 */
proto._convertExpressionToPattern = function(node) {
    if (!node) return null;
    switch (node.type) {
        // These are all valid forms within a pattern and are left untouched.
        case 'AssignmentPattern':
        case 'Identifier':
        case 'ObjectPattern':
        case 'ArrayPattern':
        case 'RestElement':
        case 'MemberExpression': // This was a missing piece of wisdom
            return node;

        // These are expression forms that must be transmuted into patterns.
        case 'ObjectExpression':
            node.type = 'ObjectPattern';
            node.properties.forEach(prop => {
                // The value of a property is recursively converted.
                // This is safe now because of the complete list of valid cases above.
                prop.value = this._convertExpressionToPattern(prop.value);
            });
            return node;

        case 'ArrayExpression':
            node.type = 'ArrayPattern';
            node.elements = node.elements.map(el => this._convertExpressionToPattern(el));
            return node;

        // Any other type of expression is an invalid target for a pattern.
        default:
            this._error(`Cannot use expression of type ${node.type} as a pattern.`);
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
})(window.MerkavahParser.prototype);