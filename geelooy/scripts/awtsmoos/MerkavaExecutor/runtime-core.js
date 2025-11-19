
// B"H
// runtime-core.js

/**
 * The EnvironmentManager: The Nexus of Worlds.
 * This entity is the Chariot's senses, allowing it to perceive and interact with the
 * specific cosmic laws of the reality it is born into (Node.js, Browser, or Worker).
 * It unifies the disparate methods of creation (`require`, `fetch`, `importScripts`) into a single, divine act.
 */
class EnvironmentManager {
    constructor() {
        this.environment = 'unknown';
        if (typeof process !== 'undefined' && process.versions != null && process.versions.node != null) {
            this.environment = 'node';
        } else if (typeof self !== 'undefined' && typeof self.importScripts === 'function') {
            this.environment = 'worker';
        } else if (typeof window !== 'undefined') {
            this.environment = 'browser';
        }
    }

    /**
     * Loads a module from another world, using the native tongue of the current reality.
     * @param {string} specifier The name of the world to import.
     * @returns {Promise<object>} The module's exported light.
     */
    async loadModule(specifier) {
        console.log(`[Nexus] Perceiving module '${specifier}' in environment '${this.environment}'.`);
        switch (this.environment) {
            case 'node':
                // In Node's reality, we use the ancient incantation of 'require'.
                return require(specifier);
            case 'browser':
                // In the Browser's reality, we must fetch the scripture and give it life ourselves.
                const response = await fetch(specifier);
                const script = await response.text();
                // This is a simplified dynamic module execution, a form of controlled 'eval'.
                const exports = {};
                const module = { exports };
                const factory = new Function('module', 'exports', script);
                factory(module, exports);
                return module.exports;
            case 'worker':
                // In a Worker's isolated reality, we use a different incantation.
                self.importScripts(specifier);
                // This is a simplification; a real implementation would need a convention
                // for how the imported script registers its exports.
                return self[specifier.split('/').pop().split('.')[0]]; // Guess global name
            default:
                throw new Error(`[Nexus] Unknowable reality. Cannot import module '${specifier}'.`);
        }
    }
}

/**
 * The MerkavaExecutor: The Throne of Creation.
 * No longer a mere observer, this Chariot is now a Creator, endowed with a will to act and a hand to shape reality.
 * It does not just traverse the AST; it performs the divine labors the scripture commands, from the smallest
 * variable assignment to the reshaping of fundamental laws.
 */
class MerkavaExecutor {
    constructor(MerkavahParser, initialContext, customImportResolver) {
        if (!MerkavahParser) throw new Error("A Throne cannot be built without its Architect (MerkavahParser).");
        
        this.MerkavahParser = MerkavahParser;
        this.globalObject = initialContext || (typeof self !== 'undefined' ? self : global);
        this.envManager = new EnvironmentManager();
        this.globalScope = this._createScope(null, {}, this.globalObject);
        this.callStack = [];
        this.moduleCache = new Map();
        
        // The default resolver now delegates to the Nexus of Worlds.
        this.customImportResolver = customImportResolver || this.envManager.loadModule.bind(this.envManager);
    }

    async execute(jsCode) {
        try {
            const parser = new this.MerkavahParser(jsCode);
            parser.registerExpressionParsers();
            parser.registerStatementParsers();
            parser.registerDeclarationParsers();
            const ast = parser.parse();

            if (parser.errors.length > 0) throw new Error("Parsing failed (Shevirah): " + parser.errors.join('\n'));

            const executionContext = { ast, scope: this.globalScope };
            return await this._executeNode(ast.body, executionContext);
        } catch (e) {
            console.error("[MerkavaExecutor] Creation Halted by a Shattering:", e.stack);
            throw e;
        }
    }

    // --- THE DIVINE WILL: CORE EXECUTION ---

    async _executeNode(nodeOrStatements, context) {
        if (Array.isArray(nodeOrStatements)) {
            let result;
            for (const node of nodeOrStatements) {
                result = await this._executeNode(node, context);
            }
            return result;
        }

        const node = nodeOrStatements;
        if (!node) return;

        try {
            switch (node.type) {
                case 'Program': return this._executeNode(node.body, context);
                case 'BlockStatement': return this._executeBlock(node, context);
                case 'ExpressionStatement': return this._executeNode(node.expression, context);
                case 'VariableDeclaration': return this._executeVariableDeclaration(node, context);
                case 'FunctionDeclaration': return this._executeFunctionDeclaration(node, context);
                case 'Identifier': return this._executeIdentifier(node, context);
                case 'Literal': return node.value;
                case 'ThisExpression': return context.scope.get('this');
                case 'MemberExpression': return this._executeMemberExpression(node, context);
                case 'CallExpression': return this._executeCallExpression(node, context);
                case 'NewExpression': return this._executeNewExpression(node, context);
                case 'AssignmentExpression': return this._executeAssignmentExpression(node, context);
                case 'BinaryExpression': return this._executeBinaryExpression(node, context);
                case 'LogicalExpression': return this._executeLogicalExpression(node, context);
                case 'UnaryExpression': return this._executeUnaryExpression(node, context);
                case 'UpdateExpression': return this._executeUpdateExpression(node, context);
                case 'IfStatement': return this._executeIfStatement(node, context);
                case 'ForStatement': return this._executeForStatement(node, context);
                case 'WhileStatement': return this._executeWhileStatement(node, context);
                case 'ReturnStatement': throw { type: 'Return', value: await this._executeNode(node.argument, context) };
                case 'ObjectExpression': return this._executeObjectExpression(node, context);
                case 'ArrayExpression': return this._executeArrayExpression(node, context);
                case 'TryStatement': return this._executeTryStatement(node, context);
                case 'ImportDeclaration': return this._executeImportDeclaration(node, context);
                default: throw new Error(`[Merkava] Unknowable Emanation: ${node.type}`);
            }
        } catch (error) {
            if (error.type === 'Return') throw error; // Propagate controlled jumps.
            throw error; // A true exception.
        }
    }
    
    // --- THE HAND OF GOD: ASSIGNMENT AND MODIFICATION ---

    /** Resolves the target of an assignment to a container and a key. This is the "Hand". */
    async _resolveAssignmentTarget(node, context) {
        if (node.type === 'Identifier') {
            return { scope: context.scope, name: node.name };
        }
        if (node.type === 'MemberExpression') {
            const container = await this._executeNode(node.object, context);
            const propertyName = node.computed 
                ? await this._executeNode(node.property, context)
                : node.property.name;
            return { container, propertyName };
        }
        throw new Error("Invalid left-hand side in assignment.");
    }

    async _executeAssignmentExpression(node, context) {
        const target = await this._resolveAssignmentTarget(node.left, context);
        const value = await this._executeNode(node.right, context);

        if (target.scope) {
            target.scope.findAndSet(target.name, value);
        } else {
            target.container[target.propertyName] = value;
        }
        return value;
    }

    // --- REALM & ESSENCE MANAGEMENT (SCOPE & `this`) ---

    _createScope(parent, bindings = {}, thisBinding) {
        const scope = {
            parent,
            bindings: new Map(Object.entries(bindings)),
            thisBinding,
            get(name) {
                if (name === 'this') return this.thisBinding;
                if (this.bindings.has(name)) return this.bindings.get(name);
                if (parent) return parent.get(name);
                if (name in thisBinding) return thisBinding[name]; // Fallback to global
                return undefined;
            },
            set(name, value) { this.bindings.set(name, value); },
            findAndSet(name, value) {
                let current = this;
                while (current) {
                    if (current.bindings.has(name)) {
                        current.set(name, value);
                        return;
                    }
                    current = current.parent;
                }
                this.thisBinding[name] = value; // Assign to global
            }
        };
        return scope;
    }

    // --- STRUCTURES OF THOUGHT & CREATION ---

    async _executeBlock(node, context) {
        const newScope = this._createScope(context.scope, {}, context.scope.thisBinding);
        return await this._executeNode(node.body, { ...context, scope: newScope });
    }

    async _executeFunctionDeclaration(node, context) {
        const func = this._createCallable(node, context);
        context.scope.set(node.id.name, func);
        return func;
    }

    _createCallable(node, declarationContext) {
        const executor = this;
        const fn = async function(...args) {
            const callScope = executor._createScope(declarationContext.scope, {}, this);
            node.params.forEach((param, i) => callScope.set(param.name, args[i]));
            const callContext = { ...declarationContext, scope: callScope };
            executor.callStack.push(callContext);
            try {
                return await executor._executeNode(node.body, callContext);
            } finally {
                executor.callStack.pop();
            }
        };
        // Bind the function's name for recursive calls
        Object.defineProperty(fn, 'name', { value: node.id ? node.id.name : '' });
        return fn;
    }

    async _executeCallExpression(node, context) {
        let thisContext = this.globalObject;
        let functionToCall;

        if (node.callee.type === 'MemberExpression') {
            thisContext = await this._executeNode(node.callee.object, context);
            const propName = node.callee.computed
                ? await this._executeNode(node.callee.property, context)
                : node.callee.property.name;
            functionToCall = thisContext[propName];
        } else {
            functionToCall = await this._executeNode(node.callee, context);
        }

        if (typeof functionToCall !== 'function') throw new TypeError("Expression is not a function.");

        const args = await Promise.all(node.arguments.map(arg => this._executeNode(arg, context)));
        return functionToCall.apply(thisContext, args);
    }

    async _executeNewExpression(node, context) {
        const constructor = await this._executeNode(node.callee, context);
        const args = await Promise.all(node.arguments.map(arg => this._executeNode(arg, context)));
        return new constructor(...args);
    }
    
    async _executeObjectExpression(node, context) {
        const obj = {};
        for(const prop of node.properties) {
            const key = prop.computed ? await this._executeNode(prop.key, context) : prop.key.name;
            obj[key] = await this._executeNode(prop.value, context);
        }
        return obj;
    }

    async _executeArrayExpression(node, context) {
        return Promise.all(node.elements.map(el => this._executeNode(el, context)));
    }

    async _executeIfStatement(node, context) {
        const test = await this._executeNode(node.test, context);
        if (test) {
            return await this._executeNode(node.consequent, context);
        } else if (node.alternate) {
            return await this._executeNode(node.alternate, context);
        }
    }

    async _executeForStatement(node, context) {
        const loopScope = this._createScope(context.scope, {}, context.scope.thisBinding);
        const loopContext = {...context, scope: loopScope};
        for(await this._executeNode(node.init, loopContext); await this._executeNode(node.test, loopContext); await this._executeNode(node.update, loopContext)) {
            await this._executeNode(node.body, loopContext);
        }
    }
    
    async _executeWhileStatement(node, context) {
        while(await this._executeNode(node.test, context)) {
            await this._executeNode(node.body, context);
        }
    }

    async _executeTryStatement(node, context) {
        try {
            return await this._executeNode(node.block, context);
        } catch(e) {
            if (node.handler) {
                const catchScope = this._createScope(context.scope, {}, context.scope.thisBinding);
                if (node.handler.param) {
                    catchScope.set(node.handler.param.name, e);
                }
                return await this._executeNode(node.handler.body, {...context, scope: catchScope});
            }
            throw e; // Re-throw if no catch handler
        } finally {
            if (node.finalizer) {
                await this._executeNode(node.finalizer, context);
            }
        }
    }

    // --- PRIMORDIAL UTTERANCES: OPERATORS & IDENTIFIERS ---

    _executeIdentifier(node, context) {
        const val = context.scope.get(node.name);
        if (val === undefined) throw new ReferenceError(`${node.name} is not defined.`);
        return val;
    }

    async _executeMemberExpression(node, context) {
        const obj = await this._executeNode(node.object, context);
        const prop = node.computed ? await this._executeNode(node.property, context) : node.property.name;
        if (obj === null || obj === undefined) throw new TypeError(`Cannot read property '${prop}' of ${obj}`);
        return obj[prop];
    }

    async _executeUnaryExpression(node, context) {
        const arg = await this._executeNode(node.argument, context);
        switch (node.operator) {
            case '!': return !arg;
            case '-': return -arg;
            case '+': return +arg;
            case 'typeof': return typeof arg;
            default: throw new Error(`Unsupported unary operator: ${node.operator}`);
        }
    }

    async _executeVariableDeclaration(node, context) {
        for (const decl of node.declarations) {
            const value = decl.init ? await this._executeNode(decl.init, context) : undefined;
            context.scope.set(decl.id.name, value);
        }
    }

    async _executeLogicalExpression(node, context) {
        const left = await this._executeNode(node.left, context);
        if (node.operator === '&&') return left ? await this._executeNode(node.right, context) : left;
        if (node.operator === '||') return left ? left : await this._executeNode(node.right, context);
    }
    
    async _executeUpdateExpression(node, context) {
        const target = await this._resolveAssignmentTarget(node.argument, context);
        let value = await this._executeMemberExpression(node.argument, context);
        const originalValue = value;
        if(node.operator === '++') value++; else if(node.operator === '--') value--;
        if (target.scope) target.scope.findAndSet(target.name, value);
        else target.container[target.propertyName] = value;
        return node.prefix ? value : originalValue;
    }

    async _executeBinaryExpression(node, context) {
        const left = await this._executeNode(node.left, context);
        // Special case for MemberExpression to check for prototype overrides like `Number.prototype['+']`
        if(node.operator in Object.getPrototypeOf(left)) {
            return left[node.operator](await this._executeNode(node.right, context));
        }
        const right = await this._executeNode(node.right, context);
        switch (node.operator) {
            case '+': return left + right; case '-': return left - right;
            case '*': return left * right; case '/': return left / right;
            case '%': return left % right; case '**': return left ** right;
            case '==': return left == right; case '===': return left === right;
            case '!=': return left != right; case '!==': return left !== right;
            case '<': return left < right; case '<=': return left <= right;
            case '>': return left > right; case '>=': return left >= right;
            case 'in': return left in right; case 'instanceof': return left instanceof right;
            default: throw new Error(`Unsupported binary operator: ${node.operator}`);
        }
    }

    async _executeImportDeclaration(node, context) {
        const specifier = node.source.value;
        if (!this.moduleCache.has(specifier)) {
            this.moduleCache.set(specifier, await this.customImportResolver(specifier));
        }
        const moduleObject = this.moduleCache.get(specifier);
        for (const spec of node.specifiers) {
            switch (spec.type) {
                case 'ImportDefaultSpecifier':
                    context.scope.set(spec.local.name, moduleObject.default);
                    break;
                case 'ImportSpecifier':
                    context.scope.set(spec.local.name, moduleObject[spec.imported.name]);
                    break;
                case 'ImportNamespaceSpecifier':
                    context.scope.set(spec.local.name, moduleObject);
                    break;
            }
        }
    }
}

// B"H
// Expose the Throne to the world so that Creation may begin.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MerkavaExecutor;
} else {
    window.MerkavaExecutor = MerkavaExecutor;
}