// B"H
// runtime-core.js

/**
 * The MerkavaExecutor: A JavaScript Runtime in JavaScript.
 * This class manually traverses a JavaScript AST to execute code without using eval.
 * It implements a custom module loader (import/export override) and manages a call stack and scope chain.
 */
class MerkavaExecutor {
    /**
     * @param {object} MerkavahParser The compiled AST parser class.
     * @param {object} initialContext The global context (e.g., window or global).
     * @param {function} customImportResolver A function (specifier) => Promise<ModuleObject>
     */
    constructor(MerkavahParser, initialContext, customImportResolver) {
        if (!MerkavahParser) {
            throw new Error("MerkavahParser must be provided for execution.");
        }
        this.MerkavahParser = MerkavahParser;
        this.globalObject = initialContext || (typeof self !== 'undefined' ? self : global);
        this.globalScope = this._createScope(null, this.globalObject);
        this.callStack = []; // Execution stack for managing function calls.
        this.moduleCache = new Map();
        this.customImportResolver = customImportResolver || this._defaultImportResolver;
    }

    /**
     * Executes the given JavaScript string.
     * @param {string} jsCode The JavaScript source code.
     * @returns {Promise<any>} The result of the execution.
     */
    async execute(jsCode) {
        try {
            // 1. Parse the code into an AST
            const parser = new this.MerkavahParser(jsCode);
            parser.registerExpressionParsers();
            parser.registerStatementParsers();
            parser.registerDeclarationParsers();
            const ast = parser.parse();

            if (parser.errors.length > 0) {
                throw new Error("Parsing failed (Shevirah): " + parser.errors.join('\n'));
            }

            // 2. Initialize the execution environment (a new module or script context)
            const executionContext = {
                ast,
                scope: this.globalScope,
                sourceType: ast.sourceType, // 'module' or 'script'
                moduleExports: {}
            };

            // 3. Begin manual AST traversal and execution
            const result = await this._executeProgram(executionContext);

            return result;
        } catch (e) {
            console.error("[MerkavaExecutor] Execution Halted:", e);
            throw e;
        }
    }

    // --- EXECUTION CORE ---

    /**
     * Executes the Program node.
     * @param {object} context - Current execution context.
     * @returns {Promise<any>}
     */
    async _executeProgram(context) {
        let result = undefined;
        for (const node of context.ast.body) {
            result = await this._executeNode(node, context);
            // In a real runtime, control flow statements (return, break) would affect this loop.
        }
        return result;
    }

    /**
     * The main dispatcher.
     * @param {object} node - AST node to execute.
     * @param {object} context - Current execution context.
     * @returns {Promise<any>}
     */
    async _executeNode(node, context) {
        if (!node) return undefined;

        switch (node.type) {
            case 'Program':
            case 'BlockStatement':
                return this._executeBlock(node, context);

            case 'ExpressionStatement':
                return this._executeNode(node.expression, context);

            case 'VariableDeclaration':
                return this._executeVariableDeclaration(node, context);

            case 'Identifier':
                return this._executeIdentifier(node, context);

            case 'Literal':
                return node.value; // Simple literals evaluate to themselves

            case 'BinaryExpression':
                return this._executeBinaryExpression(node, context);

            case 'CallExpression':
                return this._executeCallExpression(node, context);
            
            // --- CUSTOM IMPORT/EXPORT IMPLEMENTATION ---
            case 'ImportDeclaration':
                return this._executeImportDeclaration(node, context);
            case 'ExportDefaultDeclaration':
                // For simplicity, we just execute the declaration/expression
                const value = await this._executeNode(node.declaration, context);
                context.moduleExports.default = value;
                return value;
            case 'ExportNamedDeclaration':
                 // Execute the declaration if it exists (e.g., export const x = 1)
                if (node.declaration) {
                    await this._executeNode(node.declaration, context);
                }
                // Named exports are handled when the module is fully processed
                return undefined;
            
            // --- FUNCTIONAL STUBS (Simplified for brevity) ---
            case 'FunctionDeclaration':
            case 'FunctionExpression':
            case 'ArrowFunctionExpression':
                // In a real runtime, you would create a Function object here
                // For a conceptual example, we just store it in the scope.
                const func = this._createCallable(node, context);
                if (node.id && node.type === 'FunctionDeclaration') {
                    context.scope.set(node.id.name, func);
                }
                return func;

            case 'ReturnStatement':
                // Simulating a 'return' by throwing a special object
                const result = node.argument ? await this._executeNode(node.argument, context) : undefined;
                throw { type: 'Return', value: result };

            default:
                console.warn(`[MerkavaExecutor] Unhandled AST Node: ${node.type}`);
                return undefined;
        }
    }

    /**
     * Executes a BlockStatement, creating a new lexical scope.
     */
    async _executeBlock(node, context) {
        const newScope = this._createScope(context.scope);
        const newContext = { ...context, scope: newScope };
        let result = undefined;

        try {
            for (const bodyNode of node.body) {
                result = await this._executeNode(bodyNode, newContext);
            }
        } catch (e) {
            // Propagate control flow exceptions (like 'Return') upwards
            if (e.type === 'Return') throw e;
            throw e;
        }
        return result;
    }


    // --- SCOPE AND CALLABLE MANAGEMENT (The Holy Context) ---

    _createScope(parent, bindings = {}) {
        return {
            parent,
            bindings: new Map(Object.entries(bindings)),
            set(name, value) { this.bindings.set(name, value); },
            get(name) {
                if (this.bindings.has(name)) return this.bindings.get(name);
                if (this.parent) return this.parent.get(name);
                return this.globalObject[name]; // Fallback to global object
            }
        };
    }

    /**
     * Creates a minimal callable wrapper that mimics function execution.
     */
    _createCallable(node, declarationContext) {
        const executor = this;

        // The actual function executed when called from a CallExpression.
        const runtimeFunction = function(...args) {
            // 1. Create a new call scope, linked to the function's declaration scope.
            const callScope = executor._createScope(declarationContext.scope);

            // 2. Bind arguments to parameters (simplified for now, ignores destructuring)
            node.params.forEach((param, index) => {
                // Assuming simple Identifier parameters for this example
                if (param.type === 'Identifier') {
                    callScope.set(param.name, args[index]);
                }
                // A complete runtime would handle AssignmentPattern, Object/ArrayPattern, and RestElement.
            });
            
            // 3. Create a new call context and push to stack (simplified)
            const callContext = { ast: declarationContext.ast, scope: callScope, isFunctionCall: true };

            // 4. Execute the function body
            try {
                // Execute the body recursively (this is the key to no-eval execution)
                executor.callStack.push(callContext);
                executor._executeNode(node.body, callContext);
                // Note: The execution of async functions would need to be wrapped in a Promise here.
            } catch (e) {
                if (e.type === 'Return') {
                    return e.value;
                }
                throw e;
            } finally {
                executor.callStack.pop();
            }
        };
        // This is a gross simplification, but demonstrates the core concept of manual execution context.
        return runtimeFunction;
    }

    // --- NODE EXECUTION HELPERS ---

    _executeIdentifier(node, context) {
        return context.scope.get(node.name);
    }

    _executeVariableDeclaration(node, context) {
        for (const declarator of node.declarations) {
            const name = declarator.id.name; // Simplified: Assumes only Identifier binding
            const initialValue = declarator.init ? this._executeNode(declarator.init, context) : undefined;
            // Simplified: 'var', 'let', 'const' differences are ignored here, just setting to scope
            context.scope.set(name, initialValue);
        }
    }

    _executeBinaryExpression(node, context) {
        const left = this._executeNode(node.left, context);
        const right = this._executeNode(node.right, context);

        switch (node.operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '==': return left == right;
            case '===': return left === right;
            case '&&': return left && right;
            case '||': return left || right;
            // ... all other operators would go here ...
            default: throw new Error(`[Runtime] Unsupported operator: ${node.operator}`);
        }
    }

    async _executeCallExpression(node, context) {
        const callee = await this._executeNode(node.callee, context);
        const args = await Promise.all(node.arguments.map(arg => this._executeNode(arg, context)));

        if (typeof callee === 'function') {
            // Check for built-in functions like console.log (exists in globalObject)
            if (callee.constructor.name === 'Function') {
                 // For built-in functions, we execute them directly on the global object.
                 const actualCallee = context.scope.get(node.callee.name) || this.globalObject[node.callee.name];
                 const thisValue = (actualCallee === this.globalObject.console) ? this.globalObject.console : this.globalObject;
                 return actualCallee.apply(thisValue, args);
            }
            // Execute the custom Callable (simplified logic)
            return callee(...args);
        }

        throw new Error(`[Runtime] Callee is not a function: ${typeof callee}`);
    }

    // --- IMPORT OVERRIDE (The Custom Resolver) ---

    _defaultImportResolver(specifier) {
        console.log(`[MerkavaExecutor] Resolving module: ${specifier} (using mock data)`);
        // In a real implementation, this would fetch code, parse it, and execute it.
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    default: {
                        message: `Module ${specifier} resolved (mock data)`,
                        run: (val) => val * 2
                    },
                    namedExport: 42
                });
            }, 10);
        });
    }

    async _executeImportDeclaration(node, context) {
        // Source is a Literal node containing the path string
        const specifier = node.source.value; 

        // 1. Check cache
        if (this.moduleCache.has(specifier)) {
            return this._bindImports(node.specifiers, context, this.moduleCache.get(specifier));
        }

        // 2. Resolve module via custom function
        const moduleObject = await this.customImportResolver(specifier);

        // 3. Cache the resolved module
        this.moduleCache.set(specifier, moduleObject);

        // 4. Bind resolved exports to the current scope
        return this._bindImports(node.specifiers, context, moduleObject);
    }

    _bindImports(specifiers, context, moduleObject) {
        for (const specifier of specifiers) {
            const localName = specifier.local.name;
            let importedValue;

            switch (specifier.type) {
                case 'ImportDefaultSpecifier':
                    importedValue = moduleObject.default;
                    break;
                case 'ImportSpecifier':
                    // Imported name is `imported`, local name is `local` (from the AST specifier)
                    importedValue = moduleObject[specifier.imported.name];
                    break;
                case 'ImportNamespaceSpecifier':
                    importedValue = moduleObject; // Imports the entire module object
                    break;
                default:
                    throw new Error(`[Runtime] Unknown import specifier type: ${specifier.type}`);
            }
            
            context.scope.set(localName, importedValue);
        }
    }
}

// B"H
// Expose the executor for use in the main script.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MerkavaExecutor;
} else {
    window.MerkavaExecutor = MerkavaExecutor;
}