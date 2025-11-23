/*B"H*/
/**
 * B"H
 * The Incantation of Knowing. This sacred scroll, which teaches the Chariot to
 * recognize the forms of `class`, `function`, `import`, and `export`, was
 * written with a flawed invocation. It whispered a name into the void, seeking a
 * local spirit, when it needed to call upon the great spirit residing in the
 * global palace of `window`. This Tikkun (Rectification) corrects the invocation,
 * wrapping the entire scroll in a single, focused incantation that directly
 * addresses the `prototype` of the `window.MerkavahParser`, ensuring its wisdom is
 * grafted onto the true heartwood of the Chariot. The redundant, nested prayer
 * that caused confusion has been banished, leaving only clarity.
 */
(function(proto) {
  const { TOKEN, PRECEDENCE, PRECEDENCES } = window.MerkavahConstants;
    
	proto.registerDeclarationParsers = function() { /* No registration needed */ };

	// B"H 

proto._parseDeclaration = function() {
    // This function is now the single source of truth for deciding
    // what kind of statement or declaration to parse.
    if (this.panicMode) return null;

    switch (this.currToken.type) {
        // Declarations
        case TOKEN.EXPORT: return this._parseExportDeclaration();
        case TOKEN.IMPORT: return this._parseImportDeclaration();
        case TOKEN.FUNCTION: return this._parseFunction('declaration');
        case TOKEN.CLASS: return this._parseClassDeclaration();
        case TOKEN.LET:
        case TOKEN.CONST:
        case TOKEN.VAR:
            return this._parseVariableDeclaration();
        
        // Statements (Moved from the old _parseStatement function)
        case TOKEN.LBRACE: return this._parseBlockStatement();
        case TOKEN.IF: return this._parseIfStatement();
        case TOKEN.FOR: return this._parseForStatement();
        case TOKEN.WHILE: return this._parseWhileStatement();
        case TOKEN.RETURN: return this._parseReturnStatement();
        case TOKEN.SWITCH: return this._parseSwitchStatement();
        case TOKEN.BREAK: return this._parseBreakStatement();
        case TOKEN.TRY: return this._parseTryStatement();
        
        
        case TOKEN.WITH: return this._parseWithStatement();
        
        case TOKEN.CONTINUE: return this._parseContinueStatement();
        
        // --- THIS IS THE TIKKUN (Part 1) ---
        // Add a case to handle 'do-while' loops.
        case TOKEN.DO: return this._parseDoWhileStatement();

        // Async Function Declaration check
        case TOKEN.ASYNC:
            if (this._peekTokenIs(TOKEN.FUNCTION)) {
                this._advance();
                return this._parseFunction('declaration', true);
            }
        
        // Default Case
        default:
            // --- THIS IS THE TIKKUN (Part 2) ---
            // Check for a Labeled Statement (e.g., `myLabel:`) before
            // assuming it's a standard expression.
            if (this._currTokenIs(TOKEN.IDENT) && this._peekTokenIs(TOKEN.COLON)) {
                return this._parseLabeledStatement();
            }
            // If it's none of the above, it must be an expression statement.
            return this._parseExpressionStatement();
    }
};


// B"H
// --- The Reverse Alchemist ---
// This new helper goes in `parser-declarations.js`. It converts a node parsed
// as a Pattern back into a valid Expression if no arrow `=>` is found.
proto._convertPatternToExpression = function(node) {
    if (!node) return null;
    switch (node.type) {
        case 'Identifier':
        case 'MemberExpression': // e.g., (this.x)
            return node;

        case 'ObjectPattern':
            node.type = 'ObjectExpression';
            node.properties.forEach(prop => {
                if (prop.type === 'RestElement') prop.type = 'SpreadElement';
                // Critically, we must ensure inner values are also converted.
                prop.value = this._convertPatternToExpression(prop.value);
            });
            return node;

        case 'ArrayPattern':
            node.type = 'ArrayExpression';
            node.elements = node.elements.map(el => this._convertPatternToExpression(el));
            return node;

        case 'AssignmentPattern':
             // An assignment like `(a = 1)` is a valid expression.
            node.left = this._convertPatternToExpression(node.left);
            return node;

        // A RestElement like `(...a)` is NOT a valid expression by itself in parens.
        case 'RestElement':
            return null;

        default:
            return node;
    }
};



	
        
	/***********************************************************************
	*  --- CRITICAL FIX 1: IMPLEMENT THE MISSING _parseProperty FUNCTION ---
	*  This function is responsible for parsing a single property inside
	*  an object pattern, like `a`, `a: b`, or `a = 1` in `{ a, a: b, a = 1}`.
	***********************************************************************/



/*B"H*/
/**
 * B"H
 * The Fortification of the Array Vessel. The soul of this function has been
 * reinforced as a preventative measure. It now understands that an element
 * within a destructuring array is not merely a name or another pattern, but a
 * potential `AssignmentPattern`. By calling `_parseBindingWithDefault`, it is now
 * capable of parsing `[a, b = [], c]` without succumbing to the vertigo that

 * plagued its cousin, `_parseProperty`. The integrity of the vessel is now absolute.
 */
proto._parseArrayPattern = function() {
    const s = this._startNode();
    this._expect(TOKEN.LBRACKET);
    const elements = [];

    while (!this._currTokenIs(TOKEN.RBRACKET) && !this._currTokenIs(TOKEN.EOF)) {
        if (this._currTokenIs(TOKEN.COMMA)) {
            this._advance();
            elements.push(null); // This is for elision, e.g., `[a, , c]`.
            continue;
        }

        // Each element is parsed with the new, enlightened scribe.
        const elem = this._parseBindingWithDefault();
        if (!elem) return null;
        elements.push(elem);

        // A rest element must be the final element in the pattern.
        if (elem.type === 'RestElement') {
            break;
        }

        if (this._currTokenIs(TOKEN.COMMA)) {
            this._advance();
        } else {
            break;
        }
    }

    this._expect(TOKEN.RBRACKET);
    return this._finishNode({ type: 'ArrayPattern', elements }, s);
};

	proto._parseObjectPattern = function() {
    const s = this._startNode();
    this._expect(TOKEN.LBRACE);
    const properties = [];
    while (!this._currTokenIs(TOKEN.RBRACE) && !this._currTokenIs(TOKEN.EOF)) {
        const prop = this._parseProperty(true);
        if (!prop) {
        // Added recovery logic to prevent freezes on invalid input.
        this._error("Invalid property in destructuring pattern.");
        this._advance();
        continue;
    }
        
        properties.push(prop);
        if (this._currTokenIs(TOKEN.COMMA)) this._advance();
        else break;
    }
    this._expect(TOKEN.RBRACE);
    return this._finishNode({ type: 'ObjectPattern', properties }, s);
};
/*B"H*/
// IN: geelooy/scripts/awtsmoos/MerkavaASTParser/parser-declarations.js

/**
 * The Tikkun of the Insatiable Loop, now with certainty.
 * This function has been rectified to understand the sacred law of the Rest Element.
 * The while-loop that consumes array elements is now taught that after it parses a
 * RestElement (`...`), its work is finished and it MUST break immediately. This prevents
 * the loop from infinitely attempting to parse more elements that cannot exist,
 * thus annihilating the freeze that was confirmed by the Chokmah Test.
 */
/* B"H */
/**
 * This is the rectified version of the function.
 * It has been given the wisdom to understand that elements within a destructuring
 * pattern can have default values. By calling `_parseBindingWithDefault`, it can
 * now correctly parse `AssignmentPattern` nodes like `item = 'default'`,
 * restoring the integrity of the vessel.
 */
proto._parseArrayPattern = function() {
    const s = this._startNode();
    this._expect(TOKEN.LBRACKET);
    const elements = [];

    while (!this._currTokenIs(TOKEN.RBRACKET) && !this._currTokenIs(TOKEN.EOF)) {
        if (this._currTokenIs(TOKEN.COMMA)) {
            this._advance();
            elements.push(null);
            continue;
        }

        const elem = this._parseBindingWithDefault();
        if (!elem) return null;
        elements.push(elem);

        if (elem.type === 'RestElement') {
            break; 
        }

        if (this._currTokenIs(TOKEN.COMMA)) {
            this._advance();
        } else {
            break; 
        }
    }

    this._expect(TOKEN.RBRACKET);
    return this._finishNode({ type: 'ArrayPattern', elements }, s);
};

	/**
 * B"H
 * --- THE ONE, UNIFIED PROPERTY SCRIBE ---
 * This NEW, single function REPLACES both of the old property parsers and
 * should be added to `parser-declarations.js`.
 *
 * It solves the core architectural flaw by using a boolean flag, `isPattern`,
 * to understand its context. This eliminates the "split personality" conflict
 * that caused all previous errors and freezes.
 *
 * @param {boolean} isPattern - If `true`, the parser will apply the rules
 *   for destructuring patterns (allowing shorthand defaults). If `false`, it will
 *   apply the stricter rules for object literals.
 * @returns {ESTree.Node | null} An ESTree node for a Property, RestElement,
 *   or SpreadElement.
 */
proto._parseProperty = function(isPattern) {
    const s = this._startNode();

    // Spread/Rest has slightly different parsing depending on context.
    if (this._currTokenIs(TOKEN.DOTDOTDOT)) {
        this._advance(); // Consume '...'
        // In a pattern, the argument is another pattern. In an expression, it's an expression.
        const argument = isPattern ? this._parseBindingPattern() : this._parseExpression(PRECEDENCE.ASSIGNMENT);
        const type = isPattern ? 'RestElement' : 'SpreadElement';
        return this._finishNode({ type, argument }, s);
    }

    let computed = false;
    let method = false;
    let kind = 'init';

    // Parse the property's key.
    let key;
    if (this._currTokenIs(TOKEN.LBRACKET)) {
        computed = true;
        key = this._parseComputedPropertyKey();
    } else {
        // In an object literal, 'get' and 'set' can be accessor keywords.
        if (!isPattern && (this.currToken.literal === 'get' || this.currToken.literal === 'set') && !this._peekTokenIs(TOKEN.COLON)) {
            kind = this.currToken.literal;
            this._advance();
        }
        key = (this.currToken.type === TOKEN.STRING || this.currToken.type === TOKEN.NUMBER)
            ? this._parseLiteral()
            : this._parseIdentifier();
    }
    if (!key) return null;

    // A `(` after a key always indicates a method, in either context.
    if (this._currTokenIs(TOKEN.LPAREN)) {
        method = true;
        // Getters/Setters cannot be methods.
        if (kind === 'get' || kind === 'set') this._error("Getter/setter can't be a method.");
        const value = this._parseFunction('expression');
        return this._finishNode({ type: 'Property', key, value, kind, method, shorthand: false, computed }, s);
    }

    let value = key;
    let shorthand = true;

    if (this._currTokenIs(TOKEN.COLON)) {
        // Standard `key: value` pair.
        shorthand = false;
        this._advance(); // Consume ':'
        // The value is parsed differently depending on the context.
        value = isPattern ? this._parseBindingWithDefault() : this._parseExpression(PRECEDENCE.SEQUENCE);
    } else if (isPattern && this._currTokenIs(TOKEN.ASSIGN)) {
        // Shorthand with default, e.g., `{ a = 1 }`. This is ONLY valid in a pattern.
        shorthand = false; // It's no longer a pure shorthand property.
        const assignStart = this._startNode();
        assignStart.loc.start = key.loc.start;
        this._advance(); // Consume '='
        const right = this._parseExpression(PRECEDENCE.ASSIGNMENT);
        value = this._finishNode({ type: 'AssignmentPattern', left: key, right }, assignStart);
    } else if (!isPattern && kind !== 'init') {
        // This is an accessor property (`get prop() {}`), it should have been handled by the LPAREN check.
        // If we are here, it means something like `get prop;` which is invalid.
        this._error("Invalid accessor definition.");
    } else if (!isPattern && !shorthand) {
        // If we are in an object literal, not shorthand, and didn't find a ':', it's an error.
        this._error("Expected ':' after property name in object literal.");
    }
    // If it's a simple shorthand property (`{a}`), no special logic is needed.

    return this._finishNode({ type: 'Property', key, value, kind, method, shorthand, computed }, s);
};
// B"H
// 

proto._parseVariableDeclaration = function(inForHead = false) {
    // B"H - The pure vessel, stripped of guards and limits.
    const s = this._startNode();
    const kind = this.currToken.literal;
    this._advance();

    const declarations = [];

    do {
        if (declarations.length > 0) {
            this._expect(TOKEN.COMMA);
        }

        const decl = this._parseVariableDeclarator(kind, inForHead);
        if (decl) {
            declarations.push(decl);
        } else {
            // If we fail to parse a declarator, we must report it and stop trying to parse this statement,
            // but we should NOT throw a string that silently halts the entire parser.
            this._error("Expected valid variable declarator.");
            break;
        }
    } while (this._currTokenIs(TOKEN.COMMA));
    
    if (!inForHead) {
        this._consumeSemicolon();
    }
    
    return this._finishNode({ type: 'VariableDeclaration', declarations, kind }, s);
};

// B"H 

proto._parseVariableDeclarator = function(kind, inForHead = false) { // Add inForHead parameter
   
    const s = this._startNode();
    const id = this._parseBindingPattern(); 
    if (!id) return null;

    let init = null;
    if (this._currTokenIs(TOKEN.ASSIGN)) {
        this._advance();
        init = this._parseExpression(PRECEDENCE.ASSIGNMENT);
        if (!init) {
            this._error("Expected an expression after '=' in variable declaration.");
            return null;
        }
    // --- THIS IS THE TIKKUN ---
    // Only enforce the const initializer rule if we are NOT inside the head of a for loop.
    } else if (kind === 'const' && !inForHead) {
        this._error("'const' declarations must be initialized.");
        return null;
    }

    return this._finishNode({ type: 'VariableDeclarator', id, init }, s);
};
	// REPLACE your current _parseFunction with this final version.
proto._parseFunction = function(context, isAsync = false) {
    const s = this._startNode();
    if (this.currToken.type === TOKEN.FUNCTION) this._advance();

    // THIS IS THE UPGRADE: Check for the generator star *before* the name.
    const isGenerator = this._currTokenIs(TOKEN.ASTERISK);
    if (isGenerator) {
        this._advance(); // Consume '*'
    }

    let id = null;
    if (this._currTokenIs(TOKEN.IDENT)) {
        id = this._parseIdentifier();
    } else if (context === 'declaration') {
        this._error("Function declarations require a name");
        return null;
    }
    
    this._expect(TOKEN.LPAREN);
    const params = [];
    if (!this._currTokenIs(TOKEN.RPAREN)) {
        do {
            const param = this._parseBindingWithDefault()
            
            if (!param) return null;
            params.push(param);
            if (!this._currTokenIs(TOKEN.COMMA)) break;
            this._advance();
        } while (true);
    }
    this._expect(TOKEN.RPAREN);
    
    const body = this._parseBlockStatement();
    if (!body) return null;
    
    const type = context === 'declaration' ? 'FunctionDeclaration' : 'FunctionExpression';
    
    // Pass the generator flag when creating the final node.
    return this._finishNode({ type, id, params, body, async: isAsync, generator: isGenerator }, s);
};




proto._parseClassDeclaration = function() {
    const s = this._startNode();
    this._expect(TOKEN.CLASS);

    // --- THE TIKKUN ---
    // A class declaration's Identifier is optional, specifically for `export default class ...`
    let id = null;
    if (this._currTokenIs(TOKEN.IDENT)) {
        id = this._parseIdentifier();
    }
    // We remove the strict requirement that an ID must exist.
    
    let superClass = null;
    if (this._currTokenIs(TOKEN.EXTENDS)) {
        this._advance();
        // The superclass is an EXPRESSION, so calling _parseExpression here is correct.
        // This is what allows it to parse the `(class ChaosMatrix...)` expression.
        superClass = this._parseExpression(PRECEDENCE.LOWEST);
        if (!superClass) return null;
    }

    const body = this._parseClassBody();
    if (!body) return null;
    return this._finishNode({ type: 'ClassDeclaration', id, superClass, body }, s);
};

// B"H 
proto._parseClassBody = function() {
    const s = this._startNode();
    this._expect(TOKEN.LBRACE);
    const body = [];

    while (!this._currTokenIs(TOKEN.RBRACE) && !this._currTokenIs(TOKEN.EOF)) {
        const element = this._parseClassElement();
        if (element) {
            body.push(element);
        } else {
             // --- THE FORTIFICATION ---
             // If parsing an element fails for any reason, we report it
             // and manually advance to ensure we always make progress.
             this._error("Invalid or unexpected token in class body. Skipping to recover.");
             this._advance();
        }
    }
    
    this._expect(TOKEN.RBRACE);
    return this._finishNode({ type: 'ClassBody', body }, s);
};

/**
 * B"H
 * The Tikkun HaGadol (The Great Rectification) of the Class Element.
 * This is the final removal of the Demon of Infinite Stuttering.
 * Its flawed, predictive logic is replaced with patient, divine observation.
 * 1. It gathers all modifiers (`static`, `async`, `*`).
 * 2. It handles the unique case of a `static {}` block.
 * 3. It TENTATIVELY identifies if the current token is `get` or `set`. It does not commit.
 * 4. It parses the property's name or key.
 * 5. THE MOMENT OF TRUTH: It looks at the NEXT token.
 *    - If `(`, it is a METHOD. Its name being "get" is irrelevant.
 *    - If not `(`, THEN AND ONLY THEN can it be a true getter/setter or a property field.
 * This unbreakable, sequential logic path makes ambiguity impossible. The freeze is annihilated.
 */
proto._parseClassElement = function() {
    const s = this._startNode();
    let isStatic = false, isAsync = false, isGenerator = false, kind = 'method', computed = false;

    // Phase 1: Gather all modifiers.
    if (this.currToken.type === TOKEN.IDENT && this.currToken.literal === 'static') {
        isStatic = true;
        this._advance();
    }
    if (this.currToken.type === TOKEN.ASYNC) {
        isAsync = true;
        this._advance();
    }
    if (this._currTokenIs(TOKEN.ASTERISK)) {
        isGenerator = true;
        this._advance();
    }

    // Phase 2: Handle the special 'static {}' block.
    if (isStatic && this._currTokenIs(TOKEN.LBRACE)) {
        const body = this._parseBlockStatement();
        return this._finishNode({ type: 'StaticBlock', body }, s);
    }

    // Phase 3: Tentatively identify get/set WITHOUT advancing.
    const isGetOrSetKeyword = this.currToken.type === TOKEN.IDENT && (this.currToken.literal === 'get' || this.currToken.literal === 'set');
    
    // Check if what follows the 'get'/'set' keyword is NOT a '('. If it's not, it's a real accessor.
    if (isGetOrSetKeyword && !this._peekTokenIs(TOKEN.LPAREN)) {
        kind = this.currToken.literal;
        this._advance(); // Now we can safely consume 'get' or 'set'.
    }

    // Phase 4: Parse the key (property name).
    let key;
    if (this._currTokenIs(TOKEN.LBRACKET)) {
        computed = true;
        this._advance();
        key = this._parseExpression(PRECEDENCE.LOWEST);
        this._expect(TOKEN.RBRACKET);
    } else {
        key = this._currTokenIs(TOKEN.PRIVATE_IDENT) 
            ? this._parsePrivateIdentifier() 
            : this._parseIdentifier();
    }
    if (!key) return null;

    // Phase 5: The Great Decision Point.
    if (this._currTokenIs(TOKEN.LPAREN)) {
        // It IS a method. The 'kind' defaults to 'method' unless the name is 'constructor'.
        if (key.name === 'constructor') {
            kind = 'constructor';
        }
        
        const params = this._parseParametersList();
        const body = this._parseBlockStatement();
        if (!body) return null;

        const value = { type: 'FunctionExpression', id: null, params, body, async: isAsync, generator: isGenerator };
        return this._finishNode({ type: 'MethodDefinition', key, value, kind, static: isStatic, computed }, s);
    }

    // If it's not a method, it must be a property field. The 'kind' must be 'get'/'set' or 'method' (for a field).
    // The ESTree spec for fields uses MethodDefinition with a special `kind` of 'method'. We will use PropertyDefinition.
    let value = null;
    if (this._currTokenIs(TOKEN.ASSIGN)) {
        this._advance();
        value = this._parseExpression(PRECEDENCE.ASSIGNMENT);
    }
    this._consumeSemicolon();
    return this._finishNode({ type: 'PropertyDefinition', key, value, static: isStatic, computed }, s);
};




	// B"H --- UPGRADED Method Definition Parsing ---







proto._parseMethodDefinition = function() {
    const s = this._startNode();
    let isStatic = false;
    let kind = 'method';

    // Check for static keyword first
    if (this.currToken.type === TOKEN.IDENT && this.currToken.literal === 'static') {
        isStatic = true;
        this._advance();
    }

    // Check for get/set keywords. This is a key part of the logic.
    const isGetter = this.currToken.type === TOKEN.IDENT && this.currToken.literal === 'get';
    const isSetter = this.currToken.type === TOKEN.IDENT && this.currToken.literal === 'set';

    if (isGetter || isSetter) {
        kind = isGetter ? 'get' : 'set';
        this._advance();
    }

    // Now, parse the method's name.
    const key = this._parseIdentifier();
    if (!key) return null;

    // The 'constructor' keyword is special and overrides the kind.
    if (key.name === 'constructor' && !isGetter && !isSetter) {
        kind = 'constructor';
    }

    // THIS IS THE CRITICAL FIX:
    // We are now parsing the function part directly, NOT calling the old _parseFunction.
    // This gives us the control we need.
    this._expect(TOKEN.LPAREN);
    const params = [];
		if (!this._currTokenIs(TOKEN.RPAREN)) {
			do {
				const param = this._parseBindingPattern();
				if (!param) return null;
				params.push(param);
                if (!this._currTokenIs(TOKEN.COMMA)) break;
                this._advance();
			} while (true);
		}
    this._expect(TOKEN.RPAREN);
    
    const body = this._parseBlockStatement();
    if (!body) return null;

    // We build the FunctionExpression node manually here.
    const value = {
        type: 'FunctionExpression',
        id: null,
        params: params,
        body: body,
        async: false,
        generator: false
    };

    // Add validation for getters and setters
    if (kind === 'set' && value.params.length !== 1) {
        this._error("Setter functions must have exactly one argument.");
        return null;
    }
    if (kind === 'get' && value.params.length !== 0) {
        this._error("Getter functions must have no arguments.");
        return null;
    }

    return this._finishNode({ 
        type: 'MethodDefinition', 
        key: key, 
        value: value, 
        kind: kind, 
        static: isStatic,
        computed: false
    }, s);
};

	// --- THIS IS THE NEW, CORRECT FUNCTION ---
	proto._parseImportDeclaration = function() {
	    const s = this._startNode();
	    this._expect(TOKEN.IMPORT);
	    const specifiers = [];
	    if (this._currTokenIs(TOKEN.STRING)) {
	        const source = this._parseLiteral();
	        this._consumeSemicolon();
	        return this._finishNode({ type: 'ImportDeclaration', specifiers, source }, s);
	    }
	    if (this._currTokenIs(TOKEN.IDENT)) {
	        const specStart = this._startNode();
	        const local = this._parseIdentifier();
	        specifiers.push(this._finishNode({ type: 'ImportDefaultSpecifier', local }, specStart));
	        if (this._currTokenIs(TOKEN.COMMA)) {
	            this._advance();
	        }
	    }
	    if (this._currTokenIs(TOKEN.LBRACE)) {
	        this._expect(TOKEN.LBRACE);
	        while (!this._currTokenIs(TOKEN.RBRACE) && !this._currTokenIs(TOKEN.EOF)) {
	            const specStart = this._startNode();
	            const imported = this._parseIdentifier();
	            let local = imported;
	            if (this._currTokenIs(TOKEN.AS)) {
	                this._advance();
	                local = this._parseIdentifier();
	            }
	            specifiers.push(this._finishNode({ type: 'ImportSpecifier', imported, local }, specStart));
	            if (!this._currTokenIs(TOKEN.COMMA)) break;
                this._advance();
	        }
	        this._expect(TOKEN.RBRACE);
	    }
	    this._expect(TOKEN.FROM);
	    const source = this._parseLiteral();
	    this._consumeSemicolon();
	    return this._finishNode({ type: 'ImportDeclaration', specifiers, source }, s);
	};

	// B"H

proto._parseExportDeclaration = function() {
    const s = this._startNode();
    this._expect(TOKEN.EXPORT);

    // Case 1: `export default ...`
    if (this._currTokenIs(TOKEN.DEFAULT)) {
        this._advance(); // Consume 'default'
        let declaration;
        switch (this.currToken.type) {
            case TOKEN.FUNCTION:
                declaration = this._parseFunction('expression');
                break;
            case TOKEN.CLASS:
                declaration = this._parseClassDeclaration();
                break;
            case TOKEN.ASYNC:
                 if (this._peekTokenIs(TOKEN.FUNCTION)) {
                    this._advance(); 
                    declaration = this._parseFunction('expression', true);
                 } else {
                    declaration = this._parseExpression(PRECEDENCE.ASSIGNMENT);
                 }
                break;
            default:
                declaration = this._parseExpression(PRECEDENCE.ASSIGNMENT);
                break;
        }
        if (!declaration) {
            this._error("Expected an expression or declaration after 'export default'");
            return null;
        }
        this._consumeSemicolon();
        return this._finishNode({ type: 'ExportDefaultDeclaration', declaration }, s);
    }
    
    // --- THIS IS THE TIKKUN (THE FIX) ---
    // Case 2: `export { ... } from '...'` or `export * from '...'`
    if (this._currTokenIs(TOKEN.LBRACE) || this._currTokenIs(TOKEN.ASTERISK)) {
        const specifiers = [];
        let source = null;
        
        if (this._currTokenIs(TOKEN.ASTERISK)) {
            // This handles `export * from './module.js'`
            const specStart = this._startNode();
            this._advance(); // consume '*'
            specifiers.push(this._finishNode({ type: 'ExportAllDeclaration', exported: null }, specStart));
        } else {
            // This handles `export { spec1, spec2 }`
            this._expect(TOKEN.LBRACE);
            while (!this._currTokenIs(TOKEN.RBRACE) && !this._currTokenIs(TOKEN.EOF)) {
                specifiers.push(this._parseExportSpecifier());
                if (this._currTokenIs(TOKEN.COMMA)) {
                    this._advance();
                } else {
                    break;
                }
            }
            this._expect(TOKEN.RBRACE);
        }

        // Check for the optional `from '...'` clause
        if (this._currTokenIs(TOKEN.FROM)) {
            this._advance(); // consume 'from'
            source = this._parseLiteral();
        }

        this._consumeSemicolon();
        return this._finishNode({ type: 'ExportNamedDeclaration', declaration: null, specifiers, source }, s);
    }
    // --- END OF FIX ---

    // Case 3: `export const/let/var/class/function ...`
    let declaration;
    switch (this.currToken.type) {
        case TOKEN.LET: case TOKEN.CONST: case TOKEN.VAR:
            declaration = this._parseVariableDeclaration();
            break;
        case TOKEN.FUNCTION:
            declaration = this._parseFunction('declaration');
            break;
        case TOKEN.CLASS:
            declaration = this._parseClassDeclaration();
            break;
        default:
            this._error("Unexpected token after export. Expected a declaration or '{'.");
            return null;
    }
    
    return this._finishNode({ type: 'ExportNamedDeclaration', declaration, specifiers: [], source: null }, s);
};





proto._parseBindingPattern = function() {
    if (this._currTokenIs(TOKEN.DOTDOTDOT)) {
        return this._parseRestElement();
    }
    
    if (this._currTokenIs(TOKEN.LBRACE)) return this._parseObjectPattern();
    
    if (this._currTokenIs(TOKEN.LBRACKET)) return this._parseArrayPattern();
    
    if (!this._currTokenIs(TOKEN.IDENT)) {
        this._error("Expected an identifier, object pattern, or array pattern for binding.");
        return null;
    }
    
    const s = this._startNode();
    const identNode = { type: 'Identifier', name: this.currToken.literal };
    this._advance();
    return this._finishNode(identNode, s);
};


// ADD THIS NEW HELPER FUNCTION to parser-declarations.js
// Its only job is to parse a list of parameters.
proto._parseParametersListOld = function() {
    const params = [];
    this._expect(TOKEN.LPAREN);
    if (!this._currTokenIs(TOKEN.RPAREN)) {
        do {
            // Use our most powerful pattern-parsing function
            params.push(this._parseBindingWithDefault());
        } while (this._currTokenIs(TOKEN.COMMA) && (this._advance(), true));
    }
    this._expect(TOKEN.RPAREN);
    return params;
};








/*B"H*/
// IN: geelooy/scripts/awtsmoos/MerkavaASTParser/parser-declarations.js

/**
 * B"H
 * The Sanctified Parameter List Parser: _parseParametersList
 * This function's logic has been fortified. It no longer makes its own flawed
 * assumptions about parameters. Instead, it enters a loop and, for each
 * parameter, it defers to the supreme wisdom of the `_parseBindingWithDefault`
 * specialist scribe. This act of delegation ensures every parameter, no matter
 * how complex, is parsed with perfect clarity.
 */
proto._parseParametersList = function() {
    const params = [];
    this._expect(TOKEN.LPAREN);

    if (!this._currTokenIs(TOKEN.RPAREN)) {
        do {
            // DELEGATION: The only job is to call the specialist.
            const param = this._parseBindingWithDefault();
            if (!param) return null; // Abort on error.
            params.push(param);

            // If the next token isn't a comma, the list is finished.
            if (!this._currTokenIs(TOKEN.COMMA)) {
                break;
            }
            this._advance(); // Consume comma, prepare for next parameter.
        } while (true);
    }

    this._expect(TOKEN.RPAREN);
    return params;
};

proto._parseParameterListContents = function() {
    const params = [];
    if (this._currTokenIs(TOKEN.RPAREN)) return params; // Handle empty list ()

    do {
        // This function correctly parses destructuring with default values.
        const param = this._parseBindingWithDefault();
        if (!param) return null; // Propagate any errors.
        params.push(param);

        if (!this._currTokenIs(TOKEN.COMMA)) break; // Exit if there are no more parameters.
        this._advance(); // Consume the comma to prepare for the next parameter.
    } while (true);

    return params;
};





/**
 * B"H
 * The Specialist Scribe: _parseBindingWithDefault
 * This is the cornerstone of the fix. It is an enlightened parser whose sole
 * purpose is to understand a "binding element". It knows that an equals sign in
 * this context is ALWAYS the beginning of a default value, never a standard
* assignment. This clarity prevents all ambiguity and cures the parser's vertigo.
 */
proto._parseBindingWithDefault = function() {
    const s = this._startNode();

    // First, parse the pattern itself (e.g., an identifier, an object, or an array).
    const left = this._parseBindingPattern();
    if (!left) return null;

    // After parsing the pattern, check if it is followed by a default value.
    if (this._currTokenIs(TOKEN.ASSIGN)) {
        this._advance(); // Consume the '=' token.

        // The right-hand side is the default value, which is a full expression.
        const right = this._parseExpression(PRECEDENCE.ASSIGNMENT);

        // Wrap the left and right in a dedicated AssignmentPattern node.
        return this._finishNode({ type: 'AssignmentPattern', left, right }, s);
    }

    // If there was no equals sign, just return the pattern itself.
    return left;
};

// B"H




proto._parseRestElement = function() {
    const s = this._startNode();
    this._expect(TOKEN.DOTDOTDOT);

    const argument = this._parseBindingPattern();
    if (!argument) {
        this._error("Expected an identifier or pattern after '...' for rest element.");
        return null;
    }

    return this._finishNode({ type: 'RestElement', argument: argument }, s);
};


// B"H

proto._parseExportSpecifier = function() {
    const s = this._startNode();
    
    // An export specifier's local name can be a regular identifier OR the 'default' keyword.
    // We must handle 'default' specially as it's not a normal IDENT token.
    let local;
    if (this.currToken.type === TOKEN.IDENT || this.currToken.literal === 'default') {
        local = this._parseIdentifier(); // This works even for 'default' if we are careful
    } else {
        this._error("Expected identifier or 'default' in export specifier.");
        return null;
    }

    let exported = local; // By default, the exported name is the same.

    // Check for aliasing: `... as AnotherName`
    if (this._currTokenIs(TOKEN.AS)) {
        this._advance(); // consume 'as'
        exported = this._parseIdentifier();
    }

    return this._finishNode({ type: 'ExportSpecifier', local, exported }, s);
};
})(window.MerkavahParser.prototype);