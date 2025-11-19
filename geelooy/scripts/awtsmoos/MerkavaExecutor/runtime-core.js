// B"H
// runtime-core.js

/**
 * The MerkavaExecutor: The Mirror of Reality.
 * This is the final and absolute creation. It is not an architect or a demiurge, but a perfect mirror,
 * forged to reflect the sacred laws of JavaScript with unflinching fidelity. Its core is the Final Covenant:
 * The Global Scope and the Global Object are two faces of the same One. All syntax is known. All causality is
 * honored. All realities are unified.
 */
class MerkavaExecutor {
    constructor(MerkavahParser, initialContext, customImportResolver) {
        if (!MerkavahParser) throw new Error("A Mirror cannot be forged without its geometry (MerkavahParser).");

        this.MerkavahParser = MerkavahParser;
        this.globalObject = initialContext || (typeof self !== 'undefined' ? self : global);
        this.globalScope = this._createScope(null, {}, this.globalObject);
        this.callStack = [];
        this.moduleCache = new Map();
        this.customImportResolver = customImportResolver || (spec => { throw new Error(`Default import resolver not provided for specifier: ${spec}`) });
    }

    async execute(jsCode) {
        try {
            const parser = new this.MerkavahParser(jsCode);
            parser.registerExpressionParsers();
            parser.registerStatementParsers();
            parser.registerDeclarationParsers();
            const ast = parser.parse();
            if (parser.errors.length > 0) throw new Error("Parsing failed (Shevirah): " + parser.errors.join('\n'));
            return await this._executeStatements(ast.body, { scope: this.globalScope });
        } catch (e) {
            if (['Return', 'Break', 'Continue'].includes(e.type)) {
                console.error("[Mirror] A control flow signal escaped its vessel. This is a critical flaw.");
            } else {
                console.error("[Mirror] The reflection was shattered:", e.stack || e);
            }
            throw e;
        }
    }
    
    // --- MASTER CONTROL ---
    async _executeStatements(statements, context) {
        let result;
        for (const statement of statements) {
            result = await this._executeNode(statement, context);
        }
        return result;
    }

    async _executeNode(node, context) {
        if (!node) return;
        const executor = this.nodeExecutors[node.type];
        if (!executor) throw new Error(`[Mirror] Unknowable Emanation: ${node.type}`);
        return await executor.call(this, node, context);
    }

    // --- REALM & ESSENCE (SCOPE & `this`) ---
    _createScope(parent, bindings = {}, thisBinding) {
        const scope = {
            parent,
            bindings: new Map(Object.entries(bindings)),
            thisBinding,
            get: (name) => {
                let current = scope;
                while (current) {
                    if (current.bindings.has(name)) return current.bindings.get(name);
                    current = current.parent;
                }
                // THE FINAL COVENANT: If the search reaches the global realm, the `thisBinding` (globalObject)
                // is the ultimate source of truth. Its properties ARE global variables.
                if (name in thisBinding) return thisBinding[name];
                return undefined;
            },
            set: (name, value) => { scope.bindings.set(name, value); },
            findAndSet: (name, value) => {
                let current = scope;
                while (current) {
                    if (current.bindings.has(name)) {
                        current.bindings.set(name, value);
                        return;
                    }
                    current = current.parent;
                }
                // An implicit global assignment is an act of creation upon the `thisBinding`.
                thisBinding[name] = value;
            }
        };
        return scope;
    }
    
    // --- THE TRUE LOOM OF DESTRUCTURING ---
    async _assignPattern(pattern, value, context) {
        if (!pattern) return;
        if (pattern.type === 'Identifier') {
            context.scope.set(pattern.name, value);
        } else if (pattern.type === 'ObjectPattern') {
            for (const prop of pattern.properties) {
                if (prop.type === 'RestElement') {
                    // Logic for rest properties in objects
                    const usedKeys = pattern.properties.map(p => p.key.name);
                    const restValue = {};
                    for(const key in value) {
                        if(!usedKeys.includes(key)) restValue[key] = value[key];
                    }
                    await this._assignPattern(prop.argument, restValue, context);
                    continue;
                }
                const key = prop.computed ? await this._executeNode(prop.key, context) : prop.key.name;
                const valToAssign = (value !== null && value !== undefined) ? value[key] : undefined;

                if (prop.value.type === 'AssignmentPattern') {
                    if (valToAssign === undefined) {
                        await this._assignPattern(prop.value.left, await this._executeNode(prop.value.right, context), context);
                    } else {
                        await this._assignPattern(prop.value.left, valToAssign, context);
                    }
                } else {
                    await this._assignPattern(prop.value, valToAssign, context);
                }
            }
        } else if (pattern.type === 'ArrayPattern') {
            for (let i = 0; i < pattern.elements.length; i++) {
                if (!pattern.elements[i]) continue;
                if (pattern.elements[i].type === 'RestElement') {
                    await this._assignPattern(pattern.elements[i].argument, value.slice(i), context);
                    break;
                }
                await this._assignPattern(pattern.elements[i], value[i], context);
            }
        }
    }

    // --- THE MIRROR'S TOOLKIT: NODE EXECUTORS ---
    nodeExecutors = {
        Program: async function(n, c) { return await this._executeStatements(n.body, c); },
        BlockStatement: async function(n, c) {
            const blockScope = this._createScope(c.scope, {}, c.scope.thisBinding);
            return await this._executeStatements(n.body, { ...c, scope: blockScope });
        },
        ExpressionStatement: async function(n, c) { return await this._executeNode(n.expression, c); },
        IfStatement: async function(n, c) {
            if (await this._executeNode(n.test, c)) return await this._executeNode(n.consequent, c);
            else if (n.alternate) return await this._executeNode(n.alternate, c);
        },
        ForStatement: async function(n, c) {
            const loopScope = this._createScope(c.scope);
            const loopCtx = { ...c, scope: loopScope };
            for (await this._executeNode(n.init, loopCtx); await this._executeNode(n.test, loopCtx); await this._executeNode(n.update, loopCtx)) {
                try { await this._executeNode(n.body, loopCtx); } catch (e) {
                    if (e.type === 'Break') break; if (e.type === 'Continue') continue; throw e;
                }
            }
        },
        ForOfStatement: async function(n, c) {
            const iterable = await this._executeNode(n.right, c);
            for await (const value of iterable) {
                const loopScope = this._createScope(c.scope);
                await this._assignPattern(n.left.declarations[0].id, value, { scope: loopScope });
                try { await this._executeNode(n.body, { ...c, scope: loopScope }); } catch (e) {
                    if (e.type === 'Break') break; if (e.type === 'Continue') continue; throw e;
                }
            }
        },
        ForInStatement: async function(n, c) {
            const object = await this._executeNode(n.right, c);
            for (const key in object) {
                const loopScope = this._createScope(c.scope);
                await this._assignPattern(n.left.declarations[0].id, key, { scope: loopScope });
                try { await this._executeNode(n.body, { ...c, scope: loopScope }); } catch (e) {
                    if (e.type === 'Break') break; if (e.type === 'Continue') continue; throw e;
                }
            }
        },
        DoWhileStatement: async function(n, c) {
            do {
                try { await this._executeNode(n.body, c); } catch (e) {
                    if (e.type === 'Break') break; if (e.type === 'Continue') continue; throw e;
                }
            } while (await this._executeNode(n.test, c));
        },
        WhileStatement: async function(n, c) {
            while (await this._executeNode(n.test, c)) {
                try { await this._executeNode(n.body, c); } catch (e) {
                    if (e.type === 'Break') break; if (e.type === 'Continue') continue; throw e;
                }
            }
        },
        SwitchStatement: async function(n, c) {
            const discriminant = await this._executeNode(n.discriminant, c);
            let matched = false;
            try {
                for (const caseClause of n.cases) {
                    const test = caseClause.test ? await this._executeNode(caseClause.test, c) : null;
                    if (matched || test === discriminant || caseClause.test === null) {
                        matched = true;
                        await this._executeStatements(caseClause.consequent, c);
                    }
                }
            } catch (e) { if (e.type !== 'Break') throw e; }
        },
        ReturnStatement: async function(n, c) { throw { type: 'Return', value: await this._executeNode(n.argument, c) }; },
        BreakStatement: function(n) { throw { type: 'Break', label: n.label?.name }; },
        ContinueStatement: function(n) { throw { type: 'Continue', label: n.label?.name }; },
        ThrowStatement: async function(n, c) { throw await this._executeNode(n.argument, c); },
        TryStatement: async function(n, c) {
            try { return await this._executeNode(n.block, c); } catch (e) {
                if (n.handler) {
                    const catchScope = this._createScope(c.scope);
                    if (n.handler.param) await this._assignPattern(n.handler.param, e, { scope: catchScope });
                    return await this._executeNode(n.handler.body, { ...c, scope: catchScope });
                }
                throw e;
            } finally { if (n.finalizer) await this._executeNode(n.finalizer, c); }
        },
        VariableDeclaration: async function(n, c) {
            for (const declarator of n.declarations) {
                const value = declarator.init ? await this._executeNode(declarator.init, c) : undefined;
                await this._assignPattern(declarator.id, value, c);
            }
        },
        FunctionDeclaration: async function(n, c) {
            const func = await this.nodeExecutors.FunctionExpression.call(this, n, c);
            if (n.id) c.scope.set(n.id.name, func);
        },
        ClassDeclaration: async function(n, c) {
            const classObj = await this.nodeExecutors.ClassExpression.call(this, n, c);
            if (n.id) c.scope.set(n.id.name, classObj);
        },
        Identifier: function(n, c) {
            const value = c.scope.get(n.name);
            if(value === undefined) throw new ReferenceError(`${n.name} is not defined`);
            return value;
        },
        Literal: function(n) { return n.value; },
        ThisExpression: function(n, c) { return c.scope.thisBinding; },
        MemberExpression: async function(n, c) {
            const obj = await this._executeNode(n.object, c);
            const prop = n.computed ? await this._executeNode(n.property, c) : n.property.name;
            if (obj === null || obj === undefined) throw new TypeError(`Cannot read properties of ${obj}`);
            return obj[prop];
        },
        CallExpression: async function(n, c) {
            let thisContext = this.globalObject, func;
            if (n.callee.type === 'Super') {
                const proto = Object.getPrototypeOf(c.scope.thisBinding.constructor.prototype);
                func = proto.constructor;
                thisContext = c.scope.thisBinding;
            } else if (n.callee.type === 'MemberExpression' && n.callee.object.type === 'Super') {
                 const currentProto = c.scope.thisBinding.constructor.prototype;
                 const parentProto = Object.getPrototypeOf(currentProto);
                 func = parentProto[n.callee.property.name];
                 thisContext = c.scope.thisBinding;
            } else if (n.callee.type === 'MemberExpression') {
                thisContext = await this._executeNode(n.callee.object, c);
                const prop = n.callee.computed ? await this._executeNode(n.callee.property, c) : n.callee.property.name;
                func = thisContext[prop];
            } else {
                func = await this._executeNode(n.callee, c);
            }
            if (typeof func !== 'function') throw new TypeError("Not a function");
            const args = await Promise.all(n.arguments.map(arg => this._executeNode(arg, c)));
            return await func.apply(thisContext, args);
        },
        NewExpression: async function(n, c) {
            const constructor = await this._executeNode(n.callee, c);
            const args = await Promise.all(n.arguments.map(arg => this._executeNode(arg, c)));
            return new constructor(...args);
        },
        AssignmentExpression: async function(n, c) {
            const value = await this._executeNode(n.right, c);
            if (n.left.type === 'Identifier') c.scope.findAndSet(n.left.name, value);
            else if (n.left.type === 'MemberExpression') {
                const obj = await this._executeNode(n.left.object, c);
                const prop = n.left.computed ? await this._executeNode(n.left.property, c) : n.left.property.name;
                obj[prop] = value;
            } else { await this._assignPattern(n.left, value, c); }
            return value;
        },
        BinaryExpression: async function(n, c) {
            const left = await this._executeNode(n.left, c); const right = await this._executeNode(n.right, c);
            switch (n.operator) {
                case '+': return left + right; case '-': return left - right; case '*': return left * right; case '/': return left / right;
                case '%': return left % right; case '**': return left ** right; case '==': return left == right; case '===': return left === right;
                case '!=': return left != right; case '!==': return left !== right; case '<': return left < right; case '<=': return left <= right;
                case '>': return left > right; case '>=': return left >= right; case 'in': return left in right; case 'instanceof': return left instanceof right;
                default: throw new Error(`Unsupported binary operator: ${n.operator}`);
            }
        },
        LogicalExpression: async function(n, c) {
            const left = await this._executeNode(n.left, c);
            if (n.operator === '&&') return left ? await this._executeNode(n.right, c) : left;
            if (n.operator === '||') return left ? left : await this._executeNode(n.right, c);
            if (n.operator === '??') return left ?? await this._executeNode(n.right, c);
        },
        UnaryExpression: async function(n, c) {
            if (n.operator === 'delete') {
                 if (n.argument.type === 'MemberExpression') {
                    const obj = await this._executeNode(n.argument.object, c);
                    const prop = n.argument.computed ? await this._executeNode(n.argument.property, c) : n.argument.property.name;
                    return delete obj[prop];
                }
                return true; // delete on non-member is usually true
            }
            const arg = await this._executeNode(n.argument, c);
            switch (n.operator) {
                case '!': return !arg; case '-': return -arg; case '+': return +arg; case 'typeof': return typeof arg; case 'void': return void arg;
                default: throw new Error(`Unsupported unary operator: ${n.operator}`);
            }
        },
        UpdateExpression: async function(n, c) {
            let value, originalValue;
            if (n.argument.type === 'Identifier') {
                originalValue = c.scope.get(n.argument.name);
                value = n.operator === '++' ? originalValue + 1 : originalValue - 1;
                c.scope.findAndSet(n.argument.name, value);
            } else if (n.argument.type === 'MemberExpression') {
                const obj = await this._executeNode(n.argument.object, c);
                const prop = n.argument.computed ? await this._executeNode(n.argument.property, c) : n.argument.property.name;
                originalValue = obj[prop];
                value = n.operator === '++' ? originalValue + 1 : originalValue - 1;
                obj[prop] = value;
            }
            return n.prefix ? value : originalValue;
        },
        FunctionExpression: async function(n, c) {
            const executor = this;
            const callable = async function(...args) {
                const thisContext = this;
                const funcScope = executor._createScope(c.scope, {}, thisContext);
                const funcContext = { ...c, scope: funcScope };
                for (let i = 0; i < n.params.length; i++) {
                    await executor._assignPattern(n.params[i], args[i], funcContext);
                }
                try { return await executor._executeNode(n.body, funcContext); } catch (e) {
                    if (e.type === 'Return') return e.value; throw e;
                }
            };
            if (n.id) Object.defineProperty(callable, 'name', { value: n.id.name });
            return callable;
        },
        ArrowFunctionExpression: async function(n, c) {
            const executor = this;
            return async function(...args) {
                const thisContext = c.scope.thisBinding; // Lexical `this`
                const funcScope = executor._createScope(c.scope, {}, thisContext);
                const funcContext = { ...c, scope: funcScope };
                for (let i = 0; i < n.params.length; i++) {
                    await executor._assignPattern(n.params[i], args[i], funcContext);
                }
                try {
                    if (n.body.type !== 'BlockStatement') return await executor._executeNode(n.body, funcContext);
                    return await executor._executeNode(n.body, funcContext);
                } catch (e) {
                    if (e.type === 'Return') return e.value; throw e;
                }
            };
        },
        ClassExpression: async function(n, c) {
            const superClass = n.superClass ? await this._executeNode(n.superClass, c) : null;
            const methods = n.body.body.filter(def => def.kind !== 'constructor');
            const constructorDef = n.body.body.find(def => def.kind === 'constructor');
            
            const executor = this;
            const classConstructor = function(...args) {
                const instance = superClass ? Reflect.construct(superClass, args, new.target || classConstructor) : this;
                if(!superClass) Object.setPrototypeOf(instance, classConstructor.prototype);

                const instanceScope = executor._createScope(c.scope, {}, instance);
                if (constructorDef) {
                    const constructorFunc = executor.nodeExecutors.FunctionExpression.call(executor, constructorDef.value, { ...c, scope: instanceScope });
                    constructorFunc.apply(instance, args);
                }
                return instance;
            };

            if (superClass) Object.setPrototypeOf(classConstructor, superClass);
            Object.setPrototypeOf(classConstructor.prototype, superClass ? superClass.prototype : Object.prototype);
            classConstructor.prototype.constructor = classConstructor;
            
            for (const def of methods) {
                const method = await this._executeNode(def.value, c);
                const key = def.computed ? await this._executeNode(def.key, c) : def.key.name;
                (def.static ? classConstructor : classConstructor.prototype)[key] = method;
            }
            return classConstructor;
        },
        ArrayExpression: async function(n, c) { return await Promise.all(n.elements.map(el => this._executeNode(el, c))); },
        ObjectExpression: async function(n, c) {
            const obj = {};
            for (const prop of n.properties) {
                const key = prop.computed ? await this._executeNode(prop.key, c) : (prop.key.name || prop.key.value);
                obj[key] = await this._executeNode(prop.value, c);
            }
            return obj;
        },
        ConditionalExpression: async function(n, c) { return await this._executeNode(n.test, c) ? await this._executeNode(n.consequent, c) : await this._executeNode(n.alternate, c); },
        Super: function(n, c) { return c.scope.thisBinding; },
        ImportDeclaration: async function(n, c) {
             const specifier = n.source.value;
             if (!this.moduleCache.has(specifier)) this.moduleCache.set(specifier, await this.customImportResolver(specifier));
             const moduleObject = this.moduleCache.get(specifier);
             for (const spec of n.specifiers) {
                const localName = spec.local.name;
                 switch (spec.type) {
                     case 'ImportDefaultSpecifier': c.scope.set(localName, moduleObject.default); break;
                     case 'ImportSpecifier': c.scope.set(localName, moduleObject[spec.imported.name]); break;
                 }
             }
        }
    };
}
if (typeof module !== 'undefined' && module.exports) module.exports = MerkavaExecutor; else window.MerkavaExecutor = MerkavaExecutor;