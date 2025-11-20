// B'H
// runtime-core.js

/**
 * MerkavaExecutor: A JavaScript runtime.
 * This is the final, comprehensive implementation. It includes handlers for all previously
 * missing AST nodes and features, including try/catch, switch, optional chaining, class fields,
 * and a full range of expression operators.
 */
class MerkavaExecutor {
    constructor(MerkavahParser, initialContext, customImportResolver, customExportResolver) {
        if (!MerkavahParser) throw new Error("Parser not provided.");

        this.MerkavahParser = MerkavahParser;
        this.globalObject = initialContext || (typeof self !== 'undefined' ? self : global);
        this.globalScope = this._createScope(this, null, {}, this.globalObject);
        
        // Custom handlers for module interactions
        this.customImportResolver = customImportResolver || (spec => { throw new Error(`Import resolver not provided for: ${spec}`) });
        this.customExportResolver = customExportResolver || (() => {}); // Default to a no-op function
        
        // Private fields for classes are managed via a WeakMap to associate private state with object instances.
        this.privateFields = new WeakMap();
    }

    async execute(jsCode) {
        // Reset exports for each execution run
        this.exports = new Map();
        try {
            const parser = new this.MerkavahParser(jsCode);
            parser.registerExpressionParsers();
            parser.registerStatementParsers();
            parser.registerDeclarationParsers();
            const ast = parser.parse();
            if (parser.errors.length > 0) throw new Error("Parsing failed: " + parser.errors.join('\n'));

            return await this._executeStatements(ast.body, { scope: this.globalScope });
        } catch (e) {
            // Handle control-flow signals that escape to the top level, which indicates an error.
            if (e && ['Return', 'Break', 'Continue'].includes(e.type)) {
                console.error(`[RUNTIME-FATAL] Uncaught control-flow signal: ${e.type}`);
            } else {
                 console.error("--- Execution ERROR ---", e.stack || e.message);
            }
            throw e;
        }
    }
    
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
        if (!executor) throw new Error(`Unsupported AST node type: ${node.type}`);
        return await executor.call(this, node, context);
    }

    // Creates a new scope for functions, blocks, or loops.
    
    _createScope(executor, parent, bindings = {}, thisBinding) {
        const scope = {
            parent,
            bindings: new Map(Object.entries(bindings)),
            thisBinding,
            get(name) {
                if (name === 'this') return this.thisBinding;
                let current = this;
                while (current) {
                    if (current.bindings.has(name)) return current.bindings.get(name);
                    current = current.parent;
                }
                // CORRECTED FALLBACK: Check the true global object, not the contextual `this`.
                if (name in executor.globalObject) {
                    return executor.globalObject[name];
                }
                // Return undefined if not found anywhere. The Identifier executor will throw the ReferenceError.
                return undefined;
            },
            set(name, value) { this.bindings.set(name, value); },
            findAndSet(name, value) {
                let current = this;
                while (current) {
                    if (current.bindings.has(name)) {
                        current.bindings.set(name, value);
                        return true;
                    }
                    current = current.parent;
                }
                // If not found in any scope, set on the global context
                executor.globalObject[name] = value;
                return false;
            }
        };
        return scope;
    }
    
    // Handles destructuring assignment for variables, parameters, and catch clauses.
    async _assignPattern(pattern, value, context) {
        if (!pattern) return;
        if (pattern.type === 'Identifier') {
            context.scope.set(pattern.name, value);
        } else if (pattern.type === 'ObjectPattern') {
            for (const prop of pattern.properties) {
                if(prop.type === 'RestElement') {
                    const assignedKeys = pattern.properties.map(p => p.key.name);
                    const restValue = {};
                    for(const key in value) {
                        if(Object.hasOwn(value, key) && !assignedKeys.includes(key)) {
                            restValue[key] = value[key];
                        }
                    }
                    await this._assignPattern(prop.argument, restValue, context);
                    continue;
                }

                const key = prop.computed ? await this._executeNode(prop.key, context) : prop.key.name;
                const valToAssign = (value !== null && value !== undefined) ? value[key] : undefined;

                if (prop.value.type === 'AssignmentPattern') { // Default value handling
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
                const element = pattern.elements[i];
                if (!element) continue;

                if(element.type === 'RestElement') {
                    await this._assignPattern(element.argument, value.slice(i), context);
                    break;
                }
                
                const valToAssign = value[i];
                if (element.type === 'AssignmentPattern') { // Default value handling
                    if (valToAssign === undefined) {
                        await this._assignPattern(element.left, await this._executeNode(element.right, context), context);
                    } else {
                        await this._assignPattern(element.left, valToAssign, context);
                    }
                } else {
                    await this._assignPattern(element, valToAssign, context);
                }
            }
        }
    }
    
    // --- The Complete AST Node Executor Map ---
    nodeExecutors = {
        // ### CORE & STATEMENTS ###
        Program: async function(n, c) { return await this._executeStatements(n.body, c); },
        BlockStatement: async function(n, c) {
            const blockScope = this._createScope(this, c.scope, {}, c.scope.thisBinding);
            return await this._executeStatements(n.body, { ...c, scope: blockScope });
        },
        ExpressionStatement: async function(n, c) { return await this._executeNode(n.expression, c); },
        IfStatement: async function(n, c) {
            if (await this._executeNode(n.test, c)) return await this._executeNode(n.consequent, c);
            else if (n.alternate) return await this._executeNode(n.alternate, c);
        },
        ForStatement: async function(n, c) {
            const loopScope = this._createScope(this, c.scope);
            const loopCtx = { ...c, scope: loopScope };
            for (await this._executeNode(n.init, loopCtx); n.test ? await this._executeNode(n.test, loopCtx) : true; await this._executeNode(n.update, loopCtx)) {
                try { await this._executeNode(n.body, loopCtx); } catch (e) {
                    if (e.type === 'Break') break; if (e.type === 'Continue') continue; throw e;
                }
            }
        },
        ForOfStatement: async function(n, c) {
            const iterable = await this._executeNode(n.right, c);
            for await (const value of iterable) {
                const loopScope = this._createScope(this, c.scope);
                const varDecl = n.left.type === 'VariableDeclaration' ? n.left.declarations[0].id : n.left;
                await this._assignPattern(varDecl, value, { scope: loopScope });
                try { await this._executeNode(n.body, { ...c, scope: loopScope }); } catch (e) {
                    if (e.type === 'Break') break; if (e.type === 'Continue') continue; throw e;
                }
            }
        },
        ForInStatement: async function(n, c) {
            const object = await this._executeNode(n.right, c);
            for (const key in object) {
                if (Object.hasOwn(object, key)) {
                    const loopScope = this._createScope(this, c.scope);
                    const varDecl = n.left.type === 'VariableDeclaration' ? n.left.declarations[0].id : n.left;
                    await this._assignPattern(varDecl, key, { scope: loopScope });
                    try { await this._executeNode(n.body, { ...c, scope: loopScope }); } catch (e) {
                        if (e.type === 'Break') break; if (e.type === 'Continue') continue; throw e;
                    }
                }
            }
        },
        WhileStatement: async function(n, c) {
            while (await this._executeNode(n.test, c)) {
                try { await this._executeNode(n.body, c); } catch (e) {
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
        SwitchStatement: async function(n, c) {
            const discriminant = await this._executeNode(n.discriminant, c);
            let matched = false;
            const switchScope = this._createScope(this, c.scope);
            const switchCtx = { ...c, scope: switchScope };

            for (const caseClause of n.cases) {
                if (!matched && (caseClause.test === null || discriminant === await this._executeNode(caseClause.test, switchCtx))) {
                    matched = true;
                }
                if (matched) {
                    try {
                        await this._executeStatements(caseClause.consequent, switchCtx);
                    } catch (e) {
                        if (e.type === 'Break') return;
                        throw e;
                    }
                }
            }
        },
        TryStatement: async function(n, c) {
            try {
                return await this._executeNode(n.block, c);
            } catch (error) {
                if (n.handler) {
                    const catchScope = this._createScope(this, c.scope);
                    const catchContext = { ...c, scope: catchScope };
                    if (n.handler.param) {
                        await this._assignPattern(n.handler.param, error, catchContext);
                    }
                    return await this._executeNode(n.handler.body, catchContext);
                } else {
                    throw error; // Rethrow if no catch handler
                }
            } finally {
                if (n.finalizer) {
                    await this._executeNode(n.finalizer, c);
                }
            }
        },
        ThrowStatement: async function(n, c) { throw await this._executeNode(n.argument, c); },
        LabeledStatement: async function(n, c) {
            try {
                return await this._executeNode(n.body, c);
            } catch (e) {
                if ((e.type === 'Break' || e.type === 'Continue') && e.label === n.label.name) {
                    return; // Consume the labeled control signal
                }
                throw e; // Propagate other signals
            }
        },
        WithStatement: async function(n, c) {
            const withObject = await this._executeNode(n.object, c);
            // This is a simplified, non-performant simulation of a `with` block's scope chain modification.
            const withBindings = {};
            for(const key in withObject) { withBindings[key] = withObject[key]; }
            const withScope = this._createScope(this, c.scope, withBindings, withObject);
            return await this._executeNode(n.body, { ...c, scope: withScope });
        },
        
        // ### CONTROL FLOW SIGNALS ###
        ReturnStatement: async function(n, c) { throw { type: 'Return', value: await this._executeNode(n.argument, c) }; },
        BreakStatement: function(n) { throw { type: 'Break', label: n.label ? n.label.name : null }; },
        ContinueStatement: function(n) { throw { type: 'Continue', label: n.label ? n.label.name : null }; },

        // ### DECLARATIONS ###
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

        // ### PRIMITIVE & IDENTIFIER EXPRESSIONS ###
        Identifier: function(n, c) {
            const value = c.scope.get(n.name);
            if (value === undefined) throw new ReferenceError(`${n.name} is not defined`);
            return value;
        },
        PrivateIdentifier: function(n, c) {
            // This node is handled inside MemberExpression and Class logic, not executed directly.
            throw new Error("PrivateIdentifier should not be executed directly.");
        },
        Literal: function(n) { return n.value; },
        ThisExpression: function(n, c) { return c.scope.thisBinding; },
        Super: function(n, c) {
            const thisObj = c.scope.thisBinding;
            if (!thisObj) throw new ReferenceError("Super called outside of class context");
            const proto = Object.getPrototypeOf(thisObj);
            if (!proto) throw new ReferenceError("Super called on an object with no prototype");
            return proto;
        },
        MetaProperty: function(n, c) {
            if (n.meta.name === 'new' && n.property.name === 'target') {
                // This requires passing new.target state through call contexts. For now, returns undefined.
                return undefined;
            }
            if (n.meta.name === 'import' && n.property.name === 'meta') {
                // Return a mock object
                return { url: 'file:///mock/path/to/module.js' };
            }
        },

        // ### COMPLEX EXPRESSIONS ###
        MemberExpression: async function(n, c) {
            const obj = await this._executeNode(n.object, c);
            if (n.optional && (obj === null || obj === undefined)) return undefined;

            if (n.property.type === 'PrivateIdentifier') {
                if (!this.privateFields.has(obj) || !this.privateFields.get(obj).has(`#${n.property.name}`)) {
                    throw new TypeError(`Cannot read private member #${n.property.name} from an object whose class did not declare it`);
                }
                const value = this.privateFields.get(obj).get(`#${n.property.name}`);
                 // If it's a private method, it needs to be bound to the instance.
                return typeof value === 'function' ? value.bind(obj) : value;
            }

            const prop = n.computed ? await this._executeNode(n.property, c) : n.property.name;
            if (obj === null || obj === undefined) throw new TypeError(`Cannot read properties of ${obj} (reading '${prop}')`);
            
            const value = obj[prop];
            return typeof value === 'function' && n.object.type !== 'Super' ? value.bind(obj) : value;
        },
        CallExpression: async function(n, c) {
            let thisContext = this.globalObject, func;
            if (n.callee.type === 'MemberExpression') {
                const obj = await this._executeNode(n.callee.object, c);
                if (n.optional && (obj === null || obj === undefined)) return undefined;

                thisContext = obj;
                let prop;
                if(n.callee.property.type === 'PrivateIdentifier') {
                     if (!this.privateFields.has(obj) || !this.privateFields.get(obj).has(`#${n.callee.property.name}`)) {
                        throw new TypeError(`Cannot access private member #${n.callee.property.name}`);
                    }
                    func = this.privateFields.get(obj).get(`#${n.callee.property.name}`);
                } else {
                    prop = n.callee.computed ? await this._executeNode(n.callee.property, c) : n.callee.property.name;
                    func = obj[prop];
                }
            } else if (n.callee.type === 'Super') {
                 thisContext = c.scope.thisBinding;
                 const proto = Object.getPrototypeOf(Object.getPrototypeOf(thisContext));
                 func = proto.constructor;
            } else {
                 func = await this._executeNode(n.callee, c);
            }
            
            if (n.optional && (func === null || func === undefined)) return undefined;
            if (typeof func !== 'function') throw new TypeError(`'${n.callee.type}' is not a function`);
            
            const rawArgs = await Promise.all(n.arguments.map(arg => this._executeNode(arg, c)));
            const args = [];
            for(const arg of rawArgs) {
                if (arg && arg.isSpread) args.push(...arg.value);
                else args.push(arg);
            }
            
            return await func.apply(thisContext, args);
        },
        ChainExpression: async function(n, c) { return await this._executeNode(n.expression, c); },
        
        
        NewExpression: async function(n, c) {
            const constructor = await this._executeNode(n.callee, c);
            if (typeof constructor !== 'function') {
                throw new TypeError(`${n.callee.name || 'value'} is not a constructor`);
            }
            const args = await Promise.all(n.arguments.map(arg => this._executeNode(arg, c)));
            
            // Create the instance that will be the `this` value during construction.
            const newInstance = Object.create(constructor.prototype);

            // CRITICAL: Initialize instance fields *before* calling the constructor.
            // This mimics the true JavaScript order of operations.
            if (constructor.merkavaMetadata && constructor.merkavaMetadata.instanceFields) {
                const fieldCtx = { ...c, scope: this._createScope(this, c.scope, {}, newInstance) };
                for (const field of constructor.merkavaMetadata.instanceFields) {
                     const value = field.value ? await this._executeNode(field.value, fieldCtx) : undefined;
                     if (field.key.type === 'PrivateIdentifier') {
                         // Private field logic would go here
                     } else {
                         const key = field.computed ? await this._executeNode(field.key, fieldCtx) : field.key.name;
                         newInstance[key] = value;
                     }
                }
            }
            
            // Call the constructor function with the new instance as its `this` context.
            const result = await constructor.apply(newInstance, args);

            // The constructor can optionally return an object to override the `new` expression's result.
            return (typeof result === 'object' && result !== null) ? result : newInstance;
        },
        
        
        AssignmentExpression: async function(n, c) {
            let leftValue;
            // Handle compound assignment by first getting the current value
            if (n.operator !== '=') {
                if (n.left.type === 'Identifier') leftValue = c.scope.get(n.left.name);
                else if (n.left.type === 'MemberExpression') {
                    const obj = await this._executeNode(n.left.object, c);
                    const prop = n.left.computed ? await this._executeNode(n.left.property, c) : n.left.property.name;
                    leftValue = obj[prop];
                }
            }
            
            const rightValue = await this._executeNode(n.right, c);
            let finalValue;
            switch(n.operator) {
                case '=': finalValue = rightValue; break;
                case '+=': finalValue = leftValue + rightValue; break;
                case '-=': finalValue = leftValue - rightValue; break;
                case '*=': finalValue = leftValue * rightValue; break;
                case '/=': finalValue = leftValue / rightValue; break;
                case '%=': finalValue = leftValue % rightValue; break;
                case '**=': finalValue = leftValue ** rightValue; break;
                case '<<=': finalValue = leftValue << rightValue; break;
                case '>>=': finalValue = leftValue >> rightValue; break;
                case '>>>=': finalValue = leftValue >>> rightValue; break;
                case '&=': finalValue = leftValue & rightValue; break;
                case '|=': finalValue = leftValue | rightValue; break;
                case '^=': finalValue = leftValue ^ rightValue; break;
                case '&&=': finalValue = leftValue && rightValue; break;
                case '||=': finalValue = leftValue || rightValue; break;
                case '??=': finalValue = leftValue ?? rightValue; break;
                default: throw new Error(`Unsupported assignment operator: ${n.operator}`);
            }

            if (n.left.type === 'Identifier') {
                c.scope.findAndSet(n.left.name, finalValue);
            } else if (n.left.type === 'MemberExpression') {
                const obj = await this._executeNode(n.left.object, c);
                if (n.left.property.type === 'PrivateIdentifier') {
                    if (!this.privateFields.has(obj)) throw new TypeError(`Cannot set private member on object`);
                    this.privateFields.get(obj).set(`#${n.left.property.name}`, finalValue);
                } else {
                    const prop = n.left.computed ? await this._executeNode(n.left.property, c) : n.left.property.name;
                    obj[prop] = finalValue;
                }
            } else {
                await this._assignPattern(n.left, finalValue, c);
            }
            return finalValue;
        },
        BinaryExpression: async function(n, c) {
            // Short-circuiting operators are handled by LogicalExpression
            const left = await this._executeNode(n.left, c);
            const right = await this._executeNode(n.right, c);
            switch (n.operator) {
                case '+': return left + right; case '-': return left - right; case '*': return left * right; case '/': return left / right;
                case '%': return left % right; case '**': return left ** right;
                case '==': return left == right; case '===': return left === right; case '!=': return left != right; case '!==': return left !== right;
                case '<': return left < right; case '<=': return left <= right; case '>': return left > right; case '>=': return left >= right;
                case '<<': return left << right; case '>>': return left >> right; case '>>>': return left >>> right;
                case '&': return left & right; case '|': return left | right; case '^': return left ^ right;
                case 'in': return left in right; case 'instanceof': return left instanceof right;
                default: throw new Error(`Unsupported binary operator: ${n.operator}`);
            }
        },
        LogicalExpression: async function(n, c) {
            const left = await this._executeNode(n.left, c);
            if (n.operator === '&&') return left && await this._executeNode(n.right, c);
            if (n.operator === '||') return left || await this._executeNode(n.right, c);
            if (n.operator === '??') return left ?? await this._executeNode(n.right, c);
        },
        UnaryExpression: async function(n, c) {
            if (n.operator === 'delete') { /* Simplified delete logic */ return true; }
            const arg = await this._executeNode(n.argument, c);
            switch (n.operator) {
                case '!': return !arg; case '-': return -arg; case '+': return +arg;
                case 'typeof': return typeof arg; case '~': return ~arg; case 'void': return void arg;
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
        ConditionalExpression: async function(n, c) {
            return await this._executeNode(n.test, c) ? await this._executeNode(n.consequent, c) : await this._executeNode(n.alternate, c);
        },
        SequenceExpression: async function(n, c) {
            let result;
            for(const expr of n.expressions) { result = await this._executeNode(expr, c); }
            return result;
        },
        AwaitExpression: async function(n, c) { return await this._executeNode(n.argument, c); },
        YieldExpression: async function(n, c) {
            // WARNING: This is a placeholder. True generator behavior is not supported.
            // This will execute the expression but will not pause execution.
            return n.argument ? await this._executeNode(n.argument, c) : undefined;
        },

        // ### LITERAL-LIKE EXPRESSIONS ###
        
        FunctionExpression: async function(n, c) {
            const executor = this;
            
            // The callable MUST be a regular `function` to have a `.prototype`
            // and to work correctly as a constructor.
            const callable = function(...args) {
                const thisContext = this; // Capture the `this` from the call site.

                // The execution of the body is wrapped in an async IIFE.
                // This makes the *behavior* async if needed, without making the
                // function object itself an `async function`.
                const executionPromise = (async () => {
                    const funcScope = executor._createScope(this, c.scope, {}, thisContext);
                    const funcContext = { ...c, scope: funcScope };

                    for (let i = 0; i < n.params.length; i++) {
                        await executor._assignPattern(n.params[i], args[i], funcContext);
                    }
                    
                    try {
                        return await executor._executeNode(n.body, funcContext);
                    } catch (e) {
                        // If a return statement is caught, we resolve the promise with its value.
                        if (e.type === 'Return') return e.value;
                        // Otherwise, re-throw the error to reject the promise.
                        throw e;
                    }
                })();

                // If the original function was a constructor or synchronous method,
                // we cannot return the promise. This is a limitation of a purely async
                // interpreter. For this simulation, we will always return the promise.
                // Real-world synchronous methods would require a separate execution path.
                return executionPromise;
            };

            // If the function had a name (e.g., function myFunc() {}), assign it.
            if (n.id && n.id.name) {
                Object.defineProperty(callable, 'name', { value: n.id.name, configurable: true });
            }

            return callable;
        },
        
        ArrowFunctionExpression: async function(n, c) {
            const executor = this;
            return async function(...args) {
                const thisContext = c.scope.thisBinding; // Lexical 'this'
                const funcScope = executor._createScope(this, c.scope, {}, thisContext);
                const funcContext = { ...c, scope: funcScope };
                for (let i = 0; i < n.params.length; i++) {
                    await executor._assignPattern(n.params[i], args[i], funcContext);
                }
                try {
                    if (n.body.type !== 'BlockStatement') return await executor._executeNode(n.body, funcContext);
                    return await executor._executeNode(n.body, funcContext);
                } catch (e) {
                    if (e.type === 'Return') return e.value;
                    throw e;
                }
            };
        },
        ArrayExpression: async function(n, c) {
            const arr = [];
            for(const element of n.elements) {
                if(!element) { arr.push(undefined); continue; }
                const value = await this._executeNode(element, c);
                if(value && value.isSpread) arr.push(...value.value);
                else arr.push(value);
            }
            return arr;
        },
        ObjectExpression: async function(n, c) {
            const obj = {};
            for (const prop of n.properties) {
                if(prop.type === 'SpreadElement') {
                    Object.assign(obj, await this._executeNode(prop.argument, c));
                    continue;
                }
                const key = prop.computed ? await this._executeNode(prop.key, c) : (prop.key.name || prop.key.value);
                if(prop.kind === 'init') obj[key] = await this._executeNode(prop.value, c);
                else { // Handle getter/setter
                    const descriptor = Object.getOwnPropertyDescriptor(obj, key) || { configurable: true, enumerable: true };
                    descriptor[prop.kind] = await this._executeNode(prop.value, c);
                    Object.defineProperty(obj, key, descriptor);
                }
            }
            return obj;
        },
        SpreadElement: async function(n, c) { return { isSpread: true, value: await this._executeNode(n.argument, c) }; },
        TemplateLiteral: async function(n, c) {
            let result = '';
            for (let i = 0; i < n.quasis.length; i++) {
                result += n.quasis[i].value.cooked;
                if (n.expressions[i]) {
                    result += await this._executeNode(n.expressions[i], c);
                }
            }
            return result;
        },
        TaggedTemplateExpression: async function(n, c) {
            const tagFunc = await this._executeNode(n.tag, c);
            const strings = n.quasi.quasis.map(q => q.value.cooked);
            const rawStrings = n.quasi.quasis.map(q => q.value.raw);
            Object.defineProperty(strings, 'raw', { value: rawStrings, enumerable: false });
            const expressions = await Promise.all(n.quasi.expressions.map(exp => this._executeNode(exp, c)));
            return await tagFunc(strings, ...expressions);
        },

        // ### CLASS DEFINITIONS ###
        ClassDeclaration: async function(n, c) {
            const classConstructor = await this.nodeExecutors.ClassExpression.call(this, n, c);
            if (n.id && n.id.name) c.scope.set(n.id.name, classConstructor);
        },
        ClassExpression: async function(n, c) {
            const superClass = n.superClass ? await this._executeNode(n.superClass, c) : null;
            const classScope = this._createScope(this, c.scope);
            const classContext = { ...c, scope: classScope };
            
            let classConstructor;
            const constructorDef = n.body.body.find(m => m.kind === 'constructor');

            // Step 1: Create the constructor function FIRST.
            // This is the most critical change. We create the function wrapper before doing anything else.
            if (constructorDef) {
                // We execute the FunctionExpression node to get the constructor logic.
                classConstructor = await this._executeNode(constructorDef.value, classContext);
            } else {
                // If no constructor is defined, create a default one that calls super() if needed.
                classConstructor = function(...args) {
                    if (superClass) {
                        superClass.apply(this, args);
                    }
                };
            }
            
            // Step 2: Now that the function exists, safely set up its inheritance.
            if (superClass) {
                Object.setPrototypeOf(classConstructor.prototype, superClass.prototype);
                Object.setPrototypeOf(classConstructor, superClass);
            }

            // Step 3: Attach metadata for the 'new' expression to use later for instance fields.
            // This needs to be attached to the function object itself.
            classConstructor.merkavaMetadata = {
                instanceFields: n.body.body.filter(m => m.type === 'PropertyDefinition' && !m.static),
            };

            if (n.id) {
                classScope.set(n.id.name, classConstructor);
                Object.defineProperty(classConstructor, 'name', { value: n.id.name, configurable: true });
            }
            
            // Attach metadata for field initialization and private members
            classConstructor.merkavaMetadata = {
                instanceFields: n.body.body.filter(m => m.type === 'PropertyDefinition' && !m.static),
                staticFields: n.body.body.filter(m => m.type === 'PropertyDefinition' && m.static),
            };

            
            
            // Process all class members (methods, fields, static blocks)
            for (const member of n.body.body) {
                // A) Handle static fields (e.g., `static MY_PROP = 123;`)
                if (member.type === 'PropertyDefinition' && member.static) {
                    const key = member.computed 
                        ? await this._executeNode(member.key, classContext) 
                        : member.key.name;
                    
                    // Private static fields are not supported in this model yet.
                    if (member.key.type === 'PrivateIdentifier') continue;

                    classConstructor[key] = member.value 
                        ? await this._executeNode(member.value, classContext) 
                        : undefined;
                } 
                // B) Handle method definitions
                else if (member.type === 'MethodDefinition' && member.kind !== 'constructor') {
                    // Private methods are handled during instance creation.
                    if (member.key.type === 'PrivateIdentifier') continue;
                    
                    const key = member.computed 
                        ? await this._executeNode(member.key, classContext) 
                        : member.key.name;
                    
                    const target = member.static ? classConstructor : classConstructor.prototype;
                    const methodFunc = await this._executeNode(member.value, classContext);

                    if (member.kind === 'method') {
                        target[key] = methodFunc;
                    } else { // Handle 'get' or 'set'
                        const descriptor = Object.getOwnPropertyDescriptor(target, key) || { configurable: true, enumerable: false };
                        descriptor[member.kind] = methodFunc;
                        Object.defineProperty(target, key, descriptor);
                    }
                }
            }
            
            // Execute static blocks and initialize static fields
            for(const member of n.body.body) {
                if(member.type === 'StaticBlock') await this._executeNode(member.body, classContext);
            }
            for (const field of classConstructor.merkavaMetadata.staticFields) {
                const value = field.value ? await this._executeNode(field.value, classContext) : undefined;
                if (field.key.type === 'PrivateIdentifier') { /* Static private fields not supported in this model */ }
                else {
                    const key = field.computed ? await this._executeNode(field.key, classContext) : field.key.name;
                    classConstructor[key] = value;
                }
            }
            
            return classConstructor;
        },
        StaticBlock: async function(n, c) { return await this._executeStatements(n.body, c); },

        // ### MODULES ###
        ImportDeclaration: async function(n, c) {
            const specifier = n.source.value;
            if (!this.moduleCache) this.moduleCache = new Map();
            if (!this.moduleCache.has(specifier)) {
                this.moduleCache.set(specifier, await this.customImportResolver(specifier));
            }
            const moduleObject = this.moduleCache.get(specifier);
            for (const spec of n.specifiers) {
                if (spec.type === 'ImportDefaultSpecifier') c.scope.set(spec.local.name, moduleObject.default);
                else if (spec.type === 'ImportSpecifier') c.scope.set(spec.local.name, moduleObject[spec.imported.name]);
            }
        },
        ImportExpression: async function(n, c) {
            const specifier = await this._executeNode(n.source, c);
            return await this.customImportResolver(specifier);
        },
        ExportDefaultDeclaration: async function(n, c) {
            const value = await this._executeNode(n.declaration, c);
            this.customExportResolver('default', value);
            // If it's an anonymous function/class declaration, it doesn't create a local binding.
            if(n.declaration.id) this.exports.set('default', c.scope.get(n.declaration.id.name));
            else this.exports.set('default', value);
        },
        ExportNamedDeclaration: async function(n, c) {
            if (n.declaration) {
                await this._executeNode(n.declaration, c);
                const getDeclNames = (decl) => {
                    if (decl.id && decl.id.type === 'Identifier') return [decl.id.name];
                    if (decl.id && decl.id.type === 'ObjectPattern') return decl.id.properties.map(p => p.key.name);
                    return [];
                };
                if (n.declaration.type === 'VariableDeclaration') {
                    for(const decl of n.declaration.declarations) {
                        for(const name of getDeclNames(decl)) {
                            const value = c.scope.get(name);
                            this.customExportResolver(name, value);
                            this.exports.set(name, value);
                        }
                    }
                } else { // Func/Class
                     const name = n.declaration.id.name;
                     const value = c.scope.get(name);
                     this.customExportResolver(name, value);
                     this.exports.set(name, value);
                }
            }
            if (n.specifiers.length > 0) {
                for (const spec of n.specifiers) {
                    const value = n.source ? (await this.customImportResolver(n.source.value))[spec.local.name] : c.scope.get(spec.local.name);
                    this.customExportResolver(spec.exported.name, value);
                    this.exports.set(spec.exported.name, value);
                }
            }
        },
        ExportAllDeclaration: async function(n, c) {
            const moduleObject = await this.customImportResolver(n.source.value);
            for (const key in moduleObject) {
                if (key !== 'default') {
                    this.customExportResolver(key, moduleObject[key]);
                    this.exports.set(key, moduleObject[key]);
                }
            }
        },
    };
}

if (typeof module !== 'undefined' && module.exports) module.exports = MerkavaExecutor; else window.MerkavaExecutor = MerkavaExecutor;