// B"H
// runtime-core.js

/**
 * The MerkavaExecutor: A Chariot for Ascending the Soul of JavaScript.
 * This runtime is not a mere interpreter; it is a vessel for a spiritual journey. It traverses the crystalline
 * structure of the Abstract Syntax Tree, not with `eval`, but with divine introspection. It breathes life into
 * the code by simulating the very emanations of creation: the call stack, the chain of realms (scopes),
 * and the sacred, often misunderstood, bond between an execution and its context (`this`).
 * Here, every function call is an act of incarnation, and every variable is a vessel for light.
 */
class MerkavaExecutor {
    /**
     * Constructs the Chariot.
     * @param {object} MerkavahParser The divine architect, capable of translating raw text into the sacred geometry of the AST.
     * @param {object} initialContext The Great Outsider, the primordial realm (e.g., `window`), upon which all un-bound reality is inscribed.
     * @param {function} customImportResolver A function to control how the Chariot perceives other worlds (modules).
     */
    constructor(MerkavahParser, initialContext, customImportResolver) {
        if (!MerkavahParser) {
            throw new Error("A Chariot cannot be built without its Architect (MerkavahParser).");
        }
        this.MerkavahParser = MerkavahParser;

        // The globalObject is the ultimate canvas of reality.
        this.globalObject = initialContext || (typeof self !== 'undefined' ? self : global);

        // The globalScope is the first and outermost realm, containing all others.
        // Its parent is null, signifying it is the source. Its `this` is the global object itself.
        this.globalScope = this._createScope(null, this.globalObject, this.globalObject);

        this.callStack = []; // The ladder of ascent and descent for function calls.
        this.moduleCache = new Map(); // A cache of previously visited worlds.
        this.customImportResolver = customImportResolver || this._defaultImportResolver;
    }

    /**
     * Begins the ascent, executing the given JavaScript code.
     * @param {string} jsCode The sacred text, the Emanation.
     * @returns {Promise<any>} The final state of the world after the last utterance.
     */
    async execute(jsCode) {
        try {
            // 1. Unveiling: The Architect translates the text into a divine structure (AST).
            const parser = new this.MerkavahParser(jsCode);
            parser.registerExpressionParsers();
            parser.registerStatementParsers();
            parser.registerDeclarationParsers();
            const ast = parser.parse();

            if (parser.errors.length > 0) {
                // A Shevirah, a shattering of the vessels. The syntax could not contain the light.
                throw new Error("Parsing failed (Shevirah): " + parser.errors.join('\n'));
            }

            // 2. Preparation: A new context is created for this specific scripture.
            const executionContext = {
                ast,
                scope: this.globalScope, // Execution begins in the global realm.
                sourceType: ast.sourceType,
                moduleExports: {}
            };

            // 3. Ascent: We begin the traversal at the root of the scripture.
            return await this._executeProgram(executionContext);
        } catch (e) {
            console.error("[MerkavaExecutor] Ascent Halted by a Shattering:", e);
            throw e;
        }
    }

    // --- HEART OF THE CHARIOT ---

    /**
     * The main dispatcher. It gazes upon a node in the AST and directs the Chariot
     * to the appropriate handler to give it life.
     * @param {object} node - The current point of focus in the AST.
     * @param {object} context - The current state of reality (scope, etc.).
     * @returns {Promise<any>} The result of the node's execution.
     */
    async _executeNode(node, context) {
        if (!node) return undefined;

        switch (node.type) {
            // Foundational Structures
            case 'Program':
            case 'BlockStatement':
                return this._executeBlock(node, context);
            case 'ExpressionStatement':
                return this._executeNode(node.expression, context);

            // Declarations & Literals
            case 'VariableDeclaration':
                return this._executeVariableDeclaration(node, context);
            case 'Identifier':
                return this._executeIdentifier(node, context);
            case 'Literal':
                return node.value;

            // Expressions - The movements of light
            case 'BinaryExpression':
                return this._executeBinaryExpression(node, context);
            case 'LogicalExpression':
                return this._executeLogicalExpression(node, context);
            case 'AssignmentExpression':
                return this._executeAssignmentExpression(node, context);
            case 'MemberExpression':
                return this._executeMemberExpression(node, context);
            case 'CallExpression':
                return this._executeCallExpression(node, context);
            case 'UpdateExpression':
                return this._executeUpdateExpression(node, context);

            // Functions - Vessels of reusable logic
            case 'FunctionDeclaration':
            case 'FunctionExpression':
            case 'ArrowFunctionExpression':
                const func = this._createCallable(node, context);
                // A named function declaration must be bound to its name in the current realm.
                if (node.id && node.type === 'FunctionDeclaration') {
                    context.scope.set(node.id.name, func);
                }
                return func;

            // Control Flow
            case 'ReturnStatement':
                const result = node.argument ? await this._executeNode(node.argument, context) : undefined;
                // A return is a controlled "jump" out of a function's reality. We throw to unwind the stack.
                throw { type: 'Return', value: result };

            // Modules - Interacting with other worlds
            case 'ImportDeclaration':
                return this._executeImportDeclaration(node, context);

            default:
                console.warn(`[MerkavaExecutor] Unhandled Emanation (AST Node): ${node.type}`);
                return undefined;
        }
    }

    /** Executes a sequence of statements within a new, temporary realm (scope). */
    async _executeBlock(node, context) {
        // A new, deeper realm is created, linked to the one above it.
        const newScope = this._createScope(context.scope, {}, context.scope.thisBinding);
        const newContext = { ...context, scope: newScope };
        let result = undefined;
        try {
            for (const bodyNode of node.body) {
                result = await this._executeNode(bodyNode, newContext);
            }
        } catch (e) {
            if (e.type === 'Return') throw e; // Propagate the return jump upwards.
            throw e;
        }
        return result;
    }
    
    async _executeProgram(context) {
        let result = undefined;
        for (const node of context.ast.body) {
            result = await this._executeNode(node, context);
        }
        return result;
    }

    // --- REALM & ESSENCE MANAGEMENT (SCOPE & `this`) ---

    /**
     * Creates a new realm (scope) for holding variables and context.
     * @param {object | null} parent The parent realm from which this one emanates.
     * @param {object} bindings Initial variables to populate this realm with.
     * @param {object} thisBinding The object that `this` should resolve to within this realm.
     */
    _createScope(parent, bindings = {}, thisBinding) {
        const scope = {
            parent,
            bindings: new Map(Object.entries(bindings)),
            thisBinding: thisBinding,
            globalObject: parent ? parent.globalObject : this.globalObject,

            /** Looks for a name in the current realm. If not found, ascends to the parent. */
            get(name) {
                // The sacred `this` keyword returns the context of the current realm.
                if (name === 'this') return this.thisBinding;
                if (this.bindings.has(name)) return this.bindings.get(name);
                if (this.parent) return this.parent.get(name);
                return undefined; // Not found in any realm.
            },

            /** Binds a name to a value in the CURRENT realm. Used for `let`, `const`, `var`. */
            set(name, value) {
                this.bindings.set(name, value);
            },

            /** Seeks a name up the chain of realms to update it. If not found, creates it on the global canvas. */
            findAndSet(name, value) {
                if (this.bindings.has(name)) {
                    this.bindings.set(name, value);
                    return true;
                }
                if (this.parent) {
                    return this.parent.findAndSet(name, value);
                }
                // If we've ascended all the way to the top and still haven't found it,
                // this is an "implied global". We inscribe it onto the global object itself.
                this.globalObject[name] = value;
                return true;
            }
        };
        return scope;
    }

    /** Creates a callable function object, a soul waiting for incarnation. */
    _createCallable(node, declarationContext) {
        const executor = this;

        // This is not a real JS function, but a blueprint our executor understands.
        return {
            __isMerkavaFunction: true,
            node,
            declarationContext,

            /** The act of incarnation, called by _executeCallExpression. */
            async call(thisContext, args) {
                // A new realm is created for the function's execution.
                const callScope = executor._createScope(this.declarationContext.scope, {}, thisContext);

                // Arguments are bound as vessels in this new realm.
                this.node.params.forEach((param, index) => {
                    if (param.type === 'Identifier') {
                        callScope.set(param.name, args[index]);
                    }
                });

                const callContext = { ...this.declarationContext, scope: callScope };
                executor.callStack.push(callContext);
                try {
                    // We execute the function's body within its own, newly-born reality.
                    return await executor._executeNode(this.node.body, callContext);
                } catch (e) {
                    if (e.type === 'Return') return e.value; // The controlled jump succeeded.
                    throw e; // An uncontrolled shattering occurred.
                } finally {
                    executor.callStack.pop();
                }
            }
        };
    }

    // --- NODE EXECUTION HELPERS ---

    _executeIdentifier(node, context) {
        const value = context.scope.get(node.name);
        if (value === undefined) {
             // If not found in any scope, check the ultimate global canvas.
            if(node.name in this.globalObject) {
                return this.globalObject[node.name];
            }
            throw new ReferenceError(`${node.name} is not defined.`);
        }
        return value;
    }

    async _executeVariableDeclaration(node, context) {
        for (const declarator of node.declarations) {
            const name = declarator.id.name;
            const initialValue = declarator.init ? await this._executeNode(declarator.init, context) : undefined;
            context.scope.set(name, initialValue);
        }
    }

    /** Handles assignment (`=`). This is where `h=8` is given life. */
    async _executeAssignmentExpression(node, context) {
        if (node.left.type !== 'Identifier') {
            throw new Error("Complex assignments (e.g., to member expressions) are not yet implemented.");
        }
        const name = node.left.name;
        const value = await this._executeNode(node.right, context);
        context.scope.findAndSet(name, value);
        return value;
    }

    /** Handles operators with wisdom, avoiding unnecessary work. */
    async _executeLogicalExpression(node, context) {
        const left = await this._executeNode(node.left, context);
        if (node.operator === '&&') {
            return left ? await this._executeNode(node.right, context) : left;
        }
        if (node.operator === '||') {
            return left ? left : await this._executeNode(node.right, context);
        }
    }

    /** Handles `i++`, `++i`, etc. */
    async _executeUpdateExpression(node, context) {
        const name = node.argument.name;
        let value = context.scope.get(name);
        const originalValue = value;
        
        if(node.operator === '++') value++;
        else if(node.operator === '--') value--;

        context.scope.findAndSet(name, value);

        return node.prefix ? value : originalValue;
    }


    async _executeBinaryExpression(node, context) {
        const left = await this._executeNode(node.left, context);
        const right = await this._executeNode(node.right, context);
        switch (node.operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '==': return left == right;
            case '===': return left === right;
            // Note: Logical ops are better handled in _executeLogicalExpression for short-circuiting.
            case '&&': return left && right;
            case '||': return left || right;
            default: throw new Error(`[Runtime] Unsupported operator: ${node.operator}`);
        }
    }

    async _executeMemberExpression(node, context) {
        const object = await this._executeNode(node.object, context);
        if (object === undefined || object === null) {
            throw new TypeError(`Cannot read properties of ${object} (reading '${node.property.name}')`);
        }
        const propertyName = node.property.name;
        const value = object[propertyName];
        // If the property is a function, we must bind it to its object!
        if (typeof value === 'function') {
            return value.bind(object);
        }
        return value;
    }

    async _executeCallExpression(node, context) {
        const args = await Promise.all(node.arguments.map(arg => this._executeNode(arg, context)));

        let thisContext = this.globalObject;
        let functionToCall;

        if (node.callee.type === 'MemberExpression') {
            thisContext = await this._executeNode(node.callee.object, context);
            const propertyName = node.callee.property.name;
            functionToCall = thisContext[propertyName];
        } else {
            functionToCall = await this._executeNode(node.callee, context);
        }
        
        if (functionToCall && functionToCall.__isMerkavaFunction) {
            // This is one of our own defined functions. Incarnate it.
            return await functionToCall.call(thisContext, args);
        } else if (typeof functionToCall === 'function') {
            // This is a native function (like console.log). Call it directly.
            return functionToCall.apply(thisContext, args);
        } else {
            throw new TypeError(`${node.callee.name || 'Expression'} is not a function`);
        }
    }

    // --- MODULES & OTHER WORLDS ---

    _defaultImportResolver(specifier) {
        return Promise.resolve({
            default: { message: `Module ${specifier} resolved (mock data)` },
        });
    }

    async _executeImportDeclaration(node, context) {
        const specifier = node.source.value;
        if (!this.moduleCache.has(specifier)) {
            const moduleObject = await this.customImportResolver(specifier);
            this.moduleCache.set(specifier, moduleObject);
        }
        const moduleObject = this.moduleCache.get(specifier);
        for (const spec of node.specifiers) {
            if (spec.type === 'ImportDefaultSpecifier') {
                context.scope.set(spec.local.name, moduleObject.default);
            }
        }
    }
}

// B"H
// Expose the Chariot to the world so that the ascent may begin.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MerkavaExecutor;
} else {
    window.MerkavaExecutor = MerkavaExecutor;
}