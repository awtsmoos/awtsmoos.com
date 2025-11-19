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
        this.globalObject = initialContext || (typeof self !== 'undefined' ? self : global);
        
        // Pass a reference to this instance to the global context, for the twist.
        this.globalObject.MerkavaExecutor = this; 

        this.globalScope = this._createScope(null, this.globalObject, this.globalObject);
        this.callStack = [];
        this.moduleCache = new Map();
        this.customImportResolver = customImportResolver || this._defaultImportResolver;
    }

    /**
     * Begins the ascent, executing the given JavaScript code.
     * @param {string} jsCode The sacred text, the Emanation.
     * @returns {Promise<any>} The final state of the world after the last utterance.
     */
    async execute(jsCode) {
        try {
            const parser = new this.MerkavahParser(jsCode);
            parser.registerExpressionParsers();
            parser.registerStatementParsers();
            parser.registerDeclarationParsers();
            const ast = parser.parse();

            if (parser.errors.length > 0) {
                throw new Error("Parsing failed (Shevirah): " + parser.errors.join('\n'));
            }

            const executionContext = {
                ast,
                scope: this.globalScope,
                sourceType: ast.sourceType,
                moduleExports: {}
            };

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
            case 'LogicalExpression':
                return this._executeLogicalExpression(node, context);
            // TIKKUN: An assignment is a core expression that must be handled by the dispatcher.
            case 'AssignmentExpression':
                return this._executeAssignmentExpression(node, context);
            case 'MemberExpression':
                return this._executeMemberExpression(node, context);
            case 'CallExpression':
                return this._executeCallExpression(node, context);
            case 'UpdateExpression':
                return this._executeUpdateExpression(node, context);
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
            case 'ImportDeclaration':
                return this._executeImportDeclaration(node, context);
            default:
                console.warn(`[MerkavaExecutor] Unhandled Emanation (AST Node): ${node.type}`);
                return undefined;
        }
    }

    async _executeBlock(node, context) {
        const newScope = this._createScope(context.scope, {}, context.scope.thisBinding);
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
    
    async _executeProgram(context) {
        let result = undefined;
        for (const node of context.ast.body) {
            result = await this._executeNode(node, context);
        }
        return result;
    }

    // --- REALM & ESSENCE MANAGEMENT (SCOPE & `this`) ---

    _createScope(parent, bindings = {}, thisBinding) {
        return {
            parent,
            bindings: new Map(Object.entries(bindings)),
            thisBinding,
            globalObject: parent ? parent.globalObject : this.globalObject,
            get(name) {
                if (name === 'this') return this.thisBinding;
                if (this.bindings.has(name)) return this.bindings.get(name);
                if (this.parent) return this.parent.get(name);
                return undefined;
            },
            set(name, value) { this.bindings.set(name, value); },
            findAndSet(name, value) {
                let scope = this;
                while(scope) {
                    if (scope.bindings.has(name)) {
                        scope.bindings.set(name, value);
                        return;
                    }
                    scope = scope.parent;
                }
                this.globalObject[name] = value;
            }
        };
    }
    
    _createCallable(node, declarationContext) {
        const executor = this;
        return async function(...args) {
            const callScope = executor._createScope(declarationContext.scope, {}, this); // `this` is the thisContext
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
        const value = context.scope.get(node.name);
        if (value === undefined && (node.name in this.globalObject)) {
            return this.globalObject[node.name];
        }
        if (value === undefined) {
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

    async _executeAssignmentExpression(node, context) {
        if (node.left.type !== 'Identifier') {
            throw new Error("Complex assignments are not yet implemented.");
        }
        const name = node.left.name;
        const value = await this._executeNode(node.right, context);
        context.scope.findAndSet(name, value);
        return value;
    }

    async _executeLogicalExpression(node, context) {
        const left = await this._executeNode(node.left, context);
        if (node.operator === '&&') return left ? await this._executeNode(node.right, context) : left;
        if (node.operator === '||') return left ? left : await this._executeNode(node.right, context);
    }
    
    async _executeUpdateExpression(node, context) {
        const name = node.argument.name;
        let value = context.scope.get(name);
        const originalValue = value;
        if(node.operator === '++') value++; else if(node.operator === '--') value--;
        context.scope.findAndSet(name, value);
        return node.prefix ? value : originalValue;
    }

    async _executeBinaryExpression(node, context) {
        const left = await this._executeNode(node.left, context);
        const right = await this._executeNode(node.right, context);
        switch (node.operator) {
            case '+': return left + right; case '-': return left - right;
            case '*': return left * right; case '/': return left / right;
            case '==': return left == right; case '===': return left === right;
            default: throw new Error(`[Runtime] Unsupported operator: ${node.operator}`);
        }
    }

    async _executeMemberExpression(node, context) {
        const object = await this._executeNode(node.object, context);
        if (object === undefined || object === null) {
            throw new TypeError(`Cannot read properties of ${object} (reading '${node.property.name}')`);
        }
        return object[node.property.name];
    }

    async _executeCallExpression(node, context) {
        const args = await Promise.all(node.arguments.map(arg => this._executeNode(arg, context)));
        let thisContext = this.globalObject;
        let functionToCall;

        if (node.callee.type === 'MemberExpression') {
            thisContext = await this._executeNode(node.callee.object, context);
            functionToCall = thisContext[node.callee.property.name];
        } else {
            functionToCall = await this._executeNode(node.callee, context);
        }
        
        if (typeof functionToCall !== 'function') {
            throw new TypeError(`${node.callee.name || 'Expression'} is not a function`);
        }
        
        return functionToCall.apply(thisContext, args);
    }

    // --- TIKKUN: THE RECTIFIED IMPORT HANDLER ---

    _defaultImportResolver(specifier) {
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
        const moduleObject = this.moduleCache.get(specifier);

        // This rectified loop correctly handles all forms of import specifiers.
        for (const spec of node.specifiers) {
            const localName = spec.local.name;
            let importedValue;
            switch (spec.type) {
                case 'ImportDefaultSpecifier': // The path for `import moduleA from ...`
                    importedValue = moduleObject.default;
                    break;
                case 'ImportSpecifier': // The path for `import { namedExport } from ...`
                    importedValue = moduleObject[spec.imported.name];
                    break;
                case 'ImportNamespaceSpecifier': // The path for `import * as name from ...`
                    importedValue = moduleObject;
                    break;
                default:
                    throw new Error(`[Runtime] Unknown import specifier type: ${spec.type}`);
            }
            context.scope.set(localName, importedValue);
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