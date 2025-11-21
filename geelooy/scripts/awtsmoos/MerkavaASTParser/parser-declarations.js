// B"H 
//--- Parsing Declarations [DEFINITIVE & COMPLETE] ---
(function() {
  const { TOKEN, PRECEDENCE, PRECEDENCES } = window.MerkavahConstants;
    const proto = MerkavahParser.prototype;
(function(proto) {

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


	
        
	/***********************************************************************
	*  --- CRITICAL FIX 1: IMPLEMENT THE MISSING _parseProperty FUNCTION ---
	*  This function is responsible for parsing a single property inside
	*  an object pattern, like `a`, `a: b`, or `a = 1` in `{ a, a: b, a = 1}`.
	***********************************************************************/



// B"H - In parser-declarations.js

/**
 * The Sanctuary of Sacred Patterns.
 * This is not the profane `_parseArrayLiteral` which only sees values.
 * This hallowed function understands the deeper truths of destructuring.
 * It knows of elision (empty space), of default values (AssignmentPattern),
 * and of the final gathering of light (RestElement). It is the only

 * function worthy of parsing an Array Destructuring Pattern.
 */
proto._parseArrayPattern = function() {
    const s = this._startNode();
    this._expect(TOKEN.LBRACKET);
    const elements = [];

    while (!this._currTokenIs(TOKEN.RBRACKET) && !this._currTokenIs(TOKEN.EOF)) {
        // Handle elision: `[a, , c]`
        if (this._currTokenIs(TOKEN.COMMA)) {
            this._advance();
            elements.push(null);
            continue;
        }

        // --- THE KEY ---
        // For each element, it calls the master binding function which
        // understands default values.
        const elem = this._parseBindingWithDefault(); 
        if (!elem) return null; // Abort if an element is malformed.
        elements.push(elem);

        // If we have just parsed the RestElement (`...rest`), no other
        // elements are allowed. The gathering is complete. Break the loop.
        if (elem.type === 'RestElement') {
            break; 
        }

        // After a valid element, we expect a comma or the end of the pattern.
        if (this._currTokenIs(TOKEN.COMMA)) {
            this._advance();
        } else {
            break; // No comma, so we must be at the end.
        }
    }

    this._expect(TOKEN.RBRACKET);
    return this._finishNode({ type: 'ArrayPattern', elements }, s);
};
/*B"H*/
// IN: geelooy/scripts/awtsmoos/MerkavaASTParser/parser-declarations.js

/**
 * The Final Tikkun of the Destructuring Soul.
 * This function has been granted the wisdom to understand that the value of a
 * destructured property can ITSELF have a default value. It no longer tries to
 * parse the pattern and the default in two separate, conflicting steps.
 * By replacing a call to `_parseBindingPattern` with `_parseBindingWithDefault`,
 * we restore the sacred, atomic nature of an AssignmentPattern within an object,
 * finally vanquishing the demon that froze the Keter and Chokmah tests.
 */
proto._parseProperty = function() {
    const s = this._startNode();
    
    const key = this._currTokenIs(TOKEN.LBRACKET) 
        ? this._parseComputedPropertyKey()
        : this._parseIdentifier();
    if (!key) return null;

    let value = key;
    let shorthand = true;

    if (this._currTokenIs(TOKEN.COLON)) {
        shorthand = false;
        this._advance(); // consume ':'
        value = this._parseBindingWithDefault(); 
    }

    if (shorthand && this._currTokenIs(TOKEN.ASSIGN)) {
        const assignStart = this._startNode();
        assignStart.loc.start = value.loc.start;
        this._advance(); // consume '='
        const right = this._parseExpression(PRECEDENCE.ASSIGNMENT);
        value = this._finishNode({ type: 'AssignmentPattern', left: value, right }, assignStart);
        shorthand = false;
    }

    return this._finishNode({ 
        type: 'Property', 
        key: key, 
        value: value,
        kind: 'init', 
        method: false, 
        shorthand: shorthand, 
        computed: (key.type !== 'Identifier')
    }, s);
};

// Helper function assumed by the above, ensure you have it.
proto._parseComputedPropertyKey = function() {
    this._expect(TOKEN.LBRACKET);
    const key = this._parseExpression(PRECEDENCE.LOWEST);
    this._expect(TOKEN.RBRACKET);
    return key;
};

	proto._parseObjectPattern = function() {
    const s = this._startNode();
    this._expect(TOKEN.LBRACE);
    const properties = [];
    while (!this._currTokenIs(TOKEN.RBRACE) && !this._currTokenIs(TOKEN.EOF)) {
        const prop = this._parseProperty();
        if (!prop) return null;
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

// REPLACE your old _parseClassBody with this one
proto._parseClassBody = function() {
    const s = this._startNode();
    this._expect(TOKEN.LBRACE);
    const body = [];

    // This loop now correctly handles any failure from its child parser.
    while (!this._currTokenIs(TOKEN.RBRACE) && !this._currTokenIs(TOKEN.EOF)) {
        const element = this._parseClassElement();
        if (element) {
            body.push(element);
        } else {
             // This is a crucial fallback. If _parseClassElement fails for any reason,
             // we advance past the token to prevent a freeze, and try to continue.
             this._error("Invalid or unexpected token in class body.");
             this._advance();
        }
    }

    // --- THE TIKKUN OF THE UNSEALED TEMPLE ---
    // This line was the source of your second error. It must be here to
    // consume the final '}' and complete the parsing of the class body.
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








// B"H


// It contains the pure logic for parsing a comma-separated list of binding patterns.

// B"H --- In parser-declarations.js
// REPLACE the _parseParametersList function with this more robust version.

proto._parseParametersList = function() {
    const params = [];
    this._expect(TOKEN.LPAREN);

    // This loop structure is more robust and correctly handles the edge case.
    if (!this._currTokenIs(TOKEN.RPAREN)) {
        do {
            // This function correctly parses a parameter that might have
            // a pattern and/or a default value.
            const param = this._parseBindingWithDefault();
            if (!param) return null; // Propagate errors correctly.
            params.push(param);

            // Explicitly check for the comma *after* parsing a full parameter.
            // If there isn't one, we must be at the end of the list.
            if (!this._currTokenIs(TOKEN.COMMA)) {
                break;
            }

            // Only advance if a comma was found.
            this._advance();
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





// B"H
 

proto._parseBindingWithDefault = function() {
    const s = this._startNode();
    
    const left = this._parseBindingPattern();
    if (!left) return null;

    if (this._currTokenIs(TOKEN.ASSIGN)) {
        this._advance(); // consume '='
        
        const right = this._parseExpression(PRECEDENCE.ASSIGNMENT);
        
        return this._finishNode({ type: 'AssignmentPattern', left, right }, s);
    }

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










})(MerkavahParser.prototype);
})()