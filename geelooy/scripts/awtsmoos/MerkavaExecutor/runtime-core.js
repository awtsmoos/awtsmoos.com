// B"H
// runtime-core.js

/**
 * The MerkavaExecutor: The Architect of Reality.
 * This is the final genesis. No longer a mere Chariot or a Throne, this is a complete Demiurge,
 * a runtime capable of understanding and executing the full spectrum of JavaScript's sacred syntax.
 * It contains the wisdom of all control flows, the mastery of all object manipulations, and the senses
 * to perceive and interact with any environment it is born into. There are no more "unknowable emanations."
 * There is only the scripture, and the Architect's will to make it manifest.
 */
class MerkavaExecutor {
    constructor(MerkavahParser, initialContext, customImportResolver) {
        if (!MerkavahParser) throw new Error("An Architect cannot exist without its sacred geometry (MerkavahParser).");

        this.MerkavahParser = MerkavahParser;
        this.globalObject = initialContext || (typeof self !== 'undefined' ? self : global);
        this.globalScope = this._createScope(null, {}, this.globalObject);
        this.callStack = [];
        this.moduleCache = new Map();
        this.customImportResolver = customImportResolver || (spec => { throw new Error(`Default import resolver not implemented for specifier: ${spec}`) });
    }

    async execute(jsCode) {
        try {
            const parser = new this.MerkavahParser(jsCode);
            parser.registerExpressionParsers();
            parser.registerStatementParsers();
            parser.registerDeclarationParsers();
            const ast = parser.parse();
            if (parser.errors.length > 0) throw new Error("Parsing failed (Shevirah): " + parser.errors.join('\n'));
            return await this._executeNode(ast.body, { scope: this.globalScope });
        } catch (e) {
            if (['Return', 'Break', 'Continue'].includes(e.type)) {
                console.error("[Architect] A control flow signal escaped its vessel. This is a critical flaw.");
            } else {
                console.error("[Architect] Creation Halted by a Shattering:", e.stack);
            }
            throw e;
        }
    }

    // --- THE PANTHEON: MASTER EXECUTION DISPATCHER ---
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

        const executor = this.nodeExecutors[node.type];
        if (!executor) throw new Error(`[Architect] Unknowable Emanation: ${node.type}`);
        return await executor.call(this, node, context);
    }

    // --- REALM & ESSENCE MANAGEMENT (SCOPE & `this`) ---
    _createScope(parent, bindings = {}, thisBinding) {
        return {
            parent,
            bindings: new Map(Object.entries(bindings)),
            thisBinding,
            get: (name) => {
                if (name === 'this') return thisBinding;
                if (this.bindings.has(name)) return this.bindings.get(name);
                let scope = this;
                while (scope) {
                    if (scope.bindings.has(name)) return scope.bindings.get(name);
                    scope = scope.parent;
                }
                if (name in thisBinding) return thisBinding[name];
                return undefined;
            },
            set: (name, value) => this.bindings.set(name, value),
            findAndSet: (name, value) => {
                let scope = this;
                while (scope) {
                    if (scope.bindings.has(name)) {
                        scope.bindings.set(name, value);
                        return;
                    }
                    scope = scope.parent;
                }
                thisBinding[name] = value;
            }
        };
    }
    
    // --- THE LOOM OF DESTRUCTURING ---
    async _assignPattern(pattern, value, context) {
        if (pattern.type === 'Identifier') {
            context.scope.set(pattern.name, value);
        } else if (pattern.type === 'ObjectPattern') {
            for (const prop of pattern.properties) {
                const key = prop.key.name;
                await this._assignPattern(prop.value, value[key], context);
            }
        } else if (pattern.type === 'ArrayPattern') {
            for (let i = 0; i < pattern.elements.length; i++) {
                if (pattern.elements[i]) {
                    await this._assignPattern(pattern.elements[i], value[i], context);
                }
            }
        }
    }

    // --- THE ARCHITECT'S TOOLKIT: NODE EXECUTORS ---
    nodeExecutors = {
        // --- Statements ---
        Program: async function(node, context) { return await this._executeNode(node.body, context); },
        BlockStatement: async function(node, context) {
            const blockScope = this._createScope(context.scope, {}, context.scope.thisBinding);
            return await this._executeNode(node.body, { ...context, scope: blockScope });
        },
        ExpressionStatement: async function(node, context) { return await this._executeNode(node.expression, context); },
        IfStatement: async function(node, context) {
            if (await this._executeNode(node.test, context)) {
                return await this._executeNode(node.consequent, context);
            } else if (node.alternate) {
                return await this._executeNode(node.alternate, context);
            }
        },
        ForStatement: async function(node, context) {
            const loopScope = this._createScope(context.scope);
            const loopContext = { ...context, scope: loopScope };
            for (await this._executeNode(node.init, loopContext); await this._executeNode(node.test, loopContext); await this._executeNode(node.update, loopContext)) {
                try { await this._executeNode(node.body, loopContext); } catch (e) {
                    if (e.type === 'Break') break;
                    if (e.type === 'Continue') continue;
                    throw e;
                }
            }
        },
        ForOfStatement: async function(node, context) {
            const iterable = await this._executeNode(node.right, context);
            for (const value of iterable) {
                const loopScope = this._createScope(context.scope);
                await this._assignPattern(node.left.declarations[0].id, value, { scope: loopScope });
                try { await this._executeNode(node.body, { ...context, scope: loopScope }); } catch (e) {
                    if (e.type === 'Break') break;
                    if (e.type === 'Continue') continue;
                    throw e;
                }
            }
        },
        WhileStatement: async function(node, context) {
            while (await this._executeNode(node.test, context)) {
                try { await this._executeNode(node.body, context); } catch (e) {
                    if (e.type === 'Break') break;
                    if (e.type === 'Continue') continue;
                    throw e;
                }
            }
        },
        SwitchStatement: async function(node, context) {
            const discriminant = await this._executeNode(node.discriminant, context);
            let matched = false;
            try {
                for (const caseClause of node.cases) {
                    const test = caseClause.test ? await this._executeNode(caseClause.test, context) : null;
                    if (matched || test === discriminant || caseClause.test === null) {
                        matched = true;
                        await this._executeNode(caseClause.consequent, context);
                    }
                }
            } catch (e) {
                if (e.type === 'Break') { /* swallow break */ }
                else throw e;
            }
        },
        ReturnStatement: async function(node, context) { throw { type: 'Return', value: await this._executeNode(node.argument, context) }; },
        BreakStatement: function(node) { throw { type: 'Break', label: node.label?.name }; },
        ContinueStatement: function(node) { throw { type: 'Continue', label: node.label?.name }; },
        ThrowStatement: async function(node, context) { throw await this._executeNode(node.argument, context); },
        TryStatement: async function(node, context) {
            try {
                return await this._executeNode(node.block, context);
            } catch (e) {
                if (node.handler) {
                    const catchScope = this._createScope(context.scope);
                    if (node.handler.param) catchScope.set(node.handler.param.name, e);
                    return await this._executeNode(node.handler.body, { ...context, scope: catchScope });
                }
                throw e;
            } finally {
                if (node.finalizer) await this._executeNode(node.finalizer, context);
            }
        },
        // --- Declarations ---
        VariableDeclaration: async function(node, context) {
            for (const declarator of node.declarations) {
                const value = declarator.init ? await this._executeNode(declarator.init, context) : undefined;
                await this._assignPattern(declarator.id, value, context);
            }
        },
        FunctionDeclaration: async function(node, context) {
            const func = await this.nodeExecutors.FunctionExpression.call(this, node, context);
            context.scope.set(node.id.name, func);
        },
        ClassDeclaration: async function(node, context) {
            const classObj = await this.nodeExecutors.ClassExpression.call(this, node, context);
            if (node.id) context.scope.set(node.id.name, classObj);
        },
        // --- Expressions ---
        Identifier: function(node, context) { return context.scope.get(node.name); },
        Literal: function(node) { return node.value; },
        ThisExpression: function(node, context) { return context.scope.get('this'); },
        MemberExpression: async function(node, context) {
            const obj = await this._executeNode(node.object, context);
            const prop = node.computed ? await this._executeNode(node.property, context) : node.property.name;
            if (obj === null || obj === undefined) throw new TypeError(`Cannot read properties of ${obj}`);
            return obj[prop];
        },
        CallExpression: async function(node, context) {
            let thisContext = this.globalObject;
            let func;
            if (node.callee.type === 'MemberExpression') {
                thisContext = await this._executeNode(node.callee.object, context);
                const prop = node.callee.computed ? await this._executeNode(node.callee.property, context) : node.callee.property.name;
                func = thisContext[prop];
            } else {
                func = await this._executeNode(node.callee, context);
            }
            if (typeof func !== 'function') throw new TypeError("Not a function");
            const args = await Promise.all(node.arguments.map(arg => this._executeNode(arg, context)));
            return func.apply(thisContext, args);
        },
        NewExpression: async function(node, context) {
            const constructor = await this._executeNode(node.callee, context);
            const args = await Promise.all(node.arguments.map(arg => this._executeNode(arg, context)));
            return new constructor(...args);
        },
        AssignmentExpression: async function(node, context) {
            const value = await this._executeNode(node.right, context);
            if (node.left.type === 'Identifier') {
                context.scope.findAndSet(node.left.name, value);
            } else if (node.left.type === 'MemberExpression') {
                const obj = await this._executeNode(node.left.object, context);
                const prop = node.left.computed ? await this._executeNode(node.left.property, context) : node.left.property.name;
                obj[prop] = value;
            } else { // Destructuring assignment
                await this._assignPattern(node.left, value, context);
            }
            return value;
        },
        BinaryExpression: async function(node, context) {
            const left = await this._executeNode(node.left, context);
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
        },
        LogicalExpression: async function(node, context) {
            const left = await this._executeNode(node.left, context);
            if (node.operator === '&&') return left ? await this._executeNode(node.right, context) : left;
            if (node.operator === '||') return left ? left : await this._executeNode(node.right, context);
            if (node.operator === '??') return left ?? await this._executeNode(node.right, context);
        },
        UnaryExpression: async function(node, context) {
            const arg = await this._executeNode(node.argument, context);
            switch (node.operator) {
                case '!': return !arg; case '-': return -arg;
                case '+': return +arg; case 'typeof': return typeof arg;
                case 'void': return void arg; case 'delete': return delete arg; // Simplified
                default: throw new Error(`Unsupported unary operator: ${node.operator}`);
            }
        },
        UpdateExpression: async function(node, context) {
            const targetNode = node.argument;
            let value;
            if (targetNode.type === 'Identifier') {
                const name = targetNode.name;
                const originalValue = context.scope.get(name);
                value = node.operator === '++' ? originalValue + 1 : originalValue - 1;
                context.scope.findAndSet(name, value);
                return node.prefix ? value : originalValue;
            } else if (targetNode.type === 'MemberExpression') {
                const obj = await this._executeNode(targetNode.object, context);
                const prop = targetNode.computed ? await this._executeNode(targetNode.property, context) : targetNode.property.name;
                const originalValue = obj[prop];
                value = node.operator === '++' ? originalValue + 1 : originalValue - 1;
                obj[prop] = value;
                return node.prefix ? value : originalValue;
            }
        },
        ArrowFunctionExpression: async function(node, context) { return await this.nodeExecutors.FunctionExpression.call(this, node, context); },
        FunctionExpression: async function(node, context) {
            const executor = this;
            const callable = async function(...args) {
                // `this` is the thisContext provided by .apply() or .call()
                const callScope = executor._createScope(context.scope, {}, this);
                node.params.forEach((param, i) => callScope.set(param.name, args[i]));
                const callContext = { ...context, scope: callScope };
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
            return callable;
        },
        ClassExpression: async function(node, context) {
            let superClass = null;
            if (node.superClass) {
                superClass = await this._executeNode(node.superClass, context);
            }
            const constructorDef = node.body.body.find(def => def.kind === 'constructor');
            const classConstructor = async function(...args) {
                const instance = superClass ? new superClass(...args) : {};
                Object.setPrototypeOf(instance, classConstructor.prototype);
                if (constructorDef) {
                    // This is a simplification. A real implementation would handle `super()` calls.
                    const constructorFunc = await executor._executeNode(constructorDef.value, context);
                    constructorFunc.apply(instance, args);
                }
                return instance;
            };

            if (superClass) {
                Object.setPrototypeOf(classConstructor.prototype, superClass.prototype);
            }
            
            for(const def of node.body.body) {
                if (def.kind !== 'constructor') {
                    const method = await this._executeNode(def.value, context);
                    const key = def.computed ? await this._executeNode(def.key, context) : def.key.name || def.key.value;
                    
                    if(def.static) {
                        classConstructor[key] = method;
                    } else {
                        classConstructor.prototype[key] = method;
                    }
                }
            }
            return classConstructor;
        },
        ArrayExpression: async function(node, context) { return await Promise.all(node.elements.map(el => this._executeNode(el, context))); },
        ObjectExpression: async function(node, context) {
            const obj = {};
            for (const prop of node.properties) {
                const key = prop.computed ? await this._executeNode(prop.key, context) : (prop.key.name || prop.key.value);
                obj[key] = await this._executeNode(prop.value, context);
            }
            return obj;
        },
        ConditionalExpression: async function(node, context) {
            return await this._executeNode(node.test, context)
                ? await this._executeNode(node.consequent, context)
                : await this._executeNode(node.alternate, context);
        },
        // --- Modules ---
        ImportDeclaration: async function(node, context) {
             const specifier = node.source.value;
             if (!this.moduleCache.has(specifier)) {
                 this.moduleCache.set(specifier, await this.customImportResolver(specifier));
             }
             const moduleObject = this.moduleCache.get(specifier);
             for (const spec of node.specifiers) {
                const localName = spec.local.name;
                 switch (spec.type) {
                     case 'ImportDefaultSpecifier': context.scope.set(localName, moduleObject.default); break;
                     case 'ImportSpecifier': context.scope.set(localName, moduleObject[spec.imported.name]); break;
                     case 'ImportNamespaceSpecifier': context.scope.set(localName, moduleObject); break;
                 }
             }
        }
    };
}

// B"H
// Expose the Architect to the world so that Reality may begin.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MerkavaExecutor;
} else {
    window.MerkavaExecutor = MerkavaExecutor;
}