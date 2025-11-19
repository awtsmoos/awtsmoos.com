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
                return node.value;

            case 'BinaryExpression':
                return this._executeBinaryExpression(node, context);

            // --- THE FIX - PART 1: ADDED MemberExpression and REVISED CallExpression ---
            case 'MemberExpression':
                return this._executeMemberExpression(node, context);

            case 'CallExpression':
                return this._executeCallExpression(node, context);
            
            case 'ImportDeclaration':
                return this._executeImportDeclaration(node, context);
            case 'ExportDefaultDeclaration':
                const value = await this._executeNode(node.declaration, context);
                context.moduleExports.default = value;
                return value;
            case 'ExportNamedDeclaration':
                if (node.declaration) {
                    await this._executeNode(node.declaration, context);
                }
                return undefined;
            
            case 'FunctionDeclaration':
            case 'FunctionExpression':
            case 'ArrowFunctionExpression':
                const func = this._createCallable(node, context);
                if (node.id && node.type === 'FunctionDeclaration') {
                    context.scope.set(node.id.name, func);
                }
                return func;

            case 'ReturnStatement':
                const result = node.argument ? await this._executeNode(node.argument, context) : undefined;
                throw { type: 'Return', value: result };

            default:
                console.warn(`[MerkavaExecutor] Unhandled AST Node: ${node.type}`);
                return undefined;
        }
    }

    async _executeBlock(node, context) {
        const newScope = this._createScope(context.scope);
        const newContext = { ...context, scope: newScope };
        let result = undefined;
        try {
            for (const bodyNode of node.body) {
                result = await this._executeNode(bodyNode, newContext);
            }
        } catch (e) {
            if (e.type === 'Return') throw e;
            throw e;
        }
        return result;
    }

    // --- SCOPE AND CALLABLE MANAGEMENT ---

    _createScope(parent, bindings = {}) {
        return {
            parent,
            bindings: new Map(Object.entries(bindings)),
            set(name, value) { this.bindings.set(name, value); },
            get(name) {
                if (this.bindings.has(name)) return this.bindings.get(name);
                if (this.parent) return this.parent.get(name);
                return this.globalObject[name];
            }
        };
    }

    _createCallable(node, declarationContext) {
        const executor = this;
        return async function(...args) {
            const callScope = executor._createScope(declarationContext.scope);
            node.params.forEach((param, index) => {
                if (param.type === 'Identifier') {
                    callScope.set(param.name, args[index]);
                }
            });
            const callContext = { ...declarationContext, scope: callScope };
            executor.callStack.push(callContext);
            try {
                return await executor._executeNode(node.body, callContext);
            } catch (e) {
                if (e.type === 'Return') return e.value;
                throw e;
            } finally {
                executor.callStack.pop();
            }
        };
    }

    // --- NODE EXECUTION HELPERS ---

    _executeIdentifier(node, context) {
        return context.scope.get(node.name);
    }

    async _executeVariableDeclaration(node, context) {
        for (const declarator of node.declarations) {
            const name = declarator.id.name;
            const initialValue = declarator.init ? await this._executeNode(declarator.init, context) : undefined;
            context.scope.set(name, initialValue);
        }
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
            case '&&': return left && right;
            case '||': return left || right;
            default: throw new Error(`[Runtime] Unsupported operator: ${node.operator}`);
        }
    }

    // --- THE FIX - PART 2: THE NEW `_executeMemberExpression` METHOD ---
    /**
     * Resolves an object's property. E.g., `console.log` -> the `log` function.
     */
    async _executeMemberExpression(node, context) {
        const object = await this._executeNode(node.object, context);
        if (object === undefined || object === null) {
            throw new TypeError(`Cannot read properties of ${object} (reading '${node.property.name}')`);
        }
        // Simplified for dot-notation (not computed properties like obj[key])
        const propertyName = node.property.name;
        return object[propertyName];
    }

    // --- THE FIX - PART 3: THE REWRITTEN `_executeCallExpression` METHOD ---
    /**
     * Handles function calls, correctly determining the callee and `this` context.
     */
    async _executeCallExpression(node, context) {
        const args = await Promise.all(node.arguments.map(arg => this._executeNode(arg, context)));

        let thisContext = this.globalObject;
        let functionToCall;

        // If callee is `console.log` or `moduleA.run`, it's a MemberExpression.
        if (node.callee.type === 'MemberExpression') {
            // The `this` context is the object itself (e.g., `console` or `moduleA`).
            thisContext = await this._executeNode(node.callee.object, context);
            const propertyName = node.callee.property.name;
            functionToCall = thisContext[propertyName];
        } else {
            // Otherwise, it's a direct call like `add(...)`.
            functionToCall = await this._executeNode(node.callee, context);
        }
        
        if (typeof functionToCall !== 'function') {
            throw new TypeError(`${node.callee.name || 'Expression'} is not a function`);
        }

        // Use `.apply()` to call the function with the correct `this` context.
        return functionToCall.apply(thisContext, args);
    }

    // --- IMPORT OVERRIDE ---

    _defaultImportResolver(specifier) {
        console.log(`[MerkavaExecutor] Resolving module: ${specifier} (using mock data)`);
        return Promise.resolve({
            default: { message: `Module ${specifier} resolved (mock data)` },
            namedExport: 42
        });
    }

    async _executeImportDeclaration(node, context) {
        const specifier = node.source.value;
        if (!this.moduleCache.has(specifier)) {
            const moduleObject = await this.customImportResolver(specifier);
            this.moduleCache.set(specifier, moduleObject);
        }
        return this._bindImports(node.specifiers, context, this.moduleCache.get(specifier));
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
                    importedValue = moduleObject[specifier.imported.name];
                    break;
                case 'ImportNamespaceSpecifier':
                    importedValue = moduleObject;
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