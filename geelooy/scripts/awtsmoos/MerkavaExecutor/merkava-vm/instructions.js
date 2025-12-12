

// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    
    // The Executor holds the logic for every Opcode.
    const Executor = {
        exec(op, thread, OPCODES) {
            const vm = thread.vm;
            
            switch (op) {
                case OPCODES.NOP: break;
                case OPCODES.HALT: return 'HALT';
                
                // Stack
                case OPCODES.PUSH_CONST: thread.push(thread.constants[thread.read16()]); break;
                case OPCODES.PUSH_UNDEFINED: thread.push(undefined); break;
                case OPCODES.PUSH_NULL: thread.push(null); break;
                case OPCODES.PUSH_TRUE: thread.push(true); break;
                case OPCODES.PUSH_FALSE: thread.push(false); break;
                case OPCODES.POP: thread.pop(); break;
                case OPCODES.DUP: thread.push(thread.peek()); break;
                case OPCODES.SWAP: { const a = thread.pop(); const b = thread.pop(); thread.push(a); thread.push(b); break; }
                
                case OPCODES.PUSH_THIS: thread.push(thread.currentScope ? thread.currentScope['this'] : undefined); break;
                case OPCODES.PUSH_META: {
                    const type = thread.read8(); 
                    if (type === 0) thread.push(thread.currentScope['new.target'] || undefined);
                    else thread.push({ url: 'virtual-module' });
                    break;
                }

                // Variables
                case OPCODES.LOAD_GLOBAL: {
                    const name = thread.constants[thread.read16()];
                    let found = false;
                    
                    // 1. Check `with` stack
                    if (thread.withStack && thread.withStack.length > 0) {
                        for (let i = thread.withStack.length - 1; i >= 0; i--) {
                            const scopeObj = thread.withStack[i];
                            if (name in scopeObj) {
                                thread.push(scopeObj[name]);
                                found = true;
                                break;
                            }
                        }
                    }
                    
                    if (!found) {
                        let val;
                        let source = 'none';
                        // 2. B"H - TIKKUN: Check Module/Thread Environment FIRST
                        if (thread.environment && (name in thread.environment)) {
                            val = thread.environment[name];
                            source = 'env';
                        } 
                        // 3. Check Shared Global Heap & Host Context (Polyfills)
                        else {
                            val = vm.memory.getGlobal(name);
                            if (val !== undefined) source = 'heap';
                            
                            if (val === undefined && vm.context && (name in vm.context)) {
                                val = vm.context[name];
                                source = 'context';
                            }
                        }
                        
                        // Debug critical globals
                        if (name === 'exports' || name === 'CANVAS_WIDTH') {
                           if(vm.hostAPI[0]) vm.hostAPI[0](`[VM-OP] LOAD_GLOBAL '${name}' -> ${typeof val} (Source: ${source})`);
                        }
                        
                        thread.push(val);
                    }
                    break;
                }
                case OPCODES.STORE_GLOBAL: {
                    const name = thread.constants[thread.read16()];
                    const val = thread.pop();
                    let stored = false;
                    
                    // 1. Check `with` stack
                    if (thread.withStack && thread.withStack.length > 0) {
                        for (let i = thread.withStack.length - 1; i >= 0; i--) {
                            const scopeObj = thread.withStack[i];
                            if (name in scopeObj) {
                                scopeObj[name] = val;
                                stored = true;
                                break;
                            }
                        }
                    }
                    
                    if (!stored) {
                        // 2. B"H - TIKKUN: Store in Module/Thread Environment if available
                        if (thread.environment) {
                            thread.environment[name] = val;
                            if (name === 'CANVAS_WIDTH') {
                               if(vm.hostAPI[0]) vm.hostAPI[0](`[VM-OP] STORE_GLOBAL '${name}' to environment.`);
                            }
                        } else {
                            // 3. Fallback to Shared Heap
                            vm.memory.setGlobal(name, val);
                        }
                    }
                    break;
                }
                case OPCODES.LOAD_LOCAL: thread.push(thread.currentScope[thread.read8()]); break;
                case OPCODES.STORE_LOCAL: { 
                    if(!thread.currentScope) thread.currentScope={}; 
                    const idx = thread.read8();
                    const val = thread.pop();
                    thread.currentScope[idx] = val;
                    break; 
                }

                case OPCODES.LOAD_UPVALUE: {
                    const idx = thread.read8();
                    const depth = thread.read8();
                    let scope = thread.currentUpvalues; 
                    thread.push(scope ? scope[idx] : undefined);
                    break;
                }
                case OPCODES.STORE_UPVALUE: {
                    const idx = thread.read8();
                    const depth = thread.read8();
                    const val = thread.pop();
                    if (thread.currentUpvalues) {
                        thread.currentUpvalues[idx] = val;
                    }
                    break;
                }

                // Arithmetic & Logic
                case OPCODES.ADD: { const b = thread.pop(); const a = thread.pop(); thread.push(a + b); break; }
                case OPCODES.SUB: { const b = thread.pop(); const a = thread.pop(); thread.push(a - b); break; }
                case OPCODES.MUL: { const b = thread.pop(); const a = thread.pop(); thread.push(a * b); break; }
                case OPCODES.DIV: { const b = thread.pop(); const a = thread.pop(); thread.push(a / b); break; }
                case OPCODES.MOD: { const b = thread.pop(); const a = thread.pop(); thread.push(a % b); break; }
                case OPCODES.POW: { const b = thread.pop(); const a = thread.pop(); thread.push(Math.pow(a, b)); break; }
                
                case OPCODES.BIT_AND: { const b = thread.pop(); const a = thread.pop(); thread.push(a & b); break; }
                case OPCODES.BIT_OR:  { const b = thread.pop(); const a = thread.pop(); thread.push(a | b); break; }
                case OPCODES.BIT_XOR: { const b = thread.pop(); const a = thread.pop(); thread.push(a ^ b); break; }
                case OPCODES.SHL:     { const b = thread.pop(); const a = thread.pop(); thread.push(a << b); break; }
                case OPCODES.SHR:     { const b = thread.pop(); const a = thread.pop(); thread.push(a >> b); break; }
                case OPCODES.USHR:    { const b = thread.pop(); const a = thread.pop(); thread.push(a >>> b); break; }

                case OPCODES.EQ: { const b = thread.pop(); const a = thread.pop(); thread.push(a == b); break; }
                case OPCODES.STRICT_EQ: { const b = thread.pop(); const a = thread.pop(); thread.push(a === b); break; }
                case OPCODES.NEQ: { const b = thread.pop(); const a = thread.pop(); thread.push(a != b); break; }
                case OPCODES.STRICT_NEQ: { const b = thread.pop(); const a = thread.pop(); thread.push(a !== b); break; }
                case OPCODES.LT: { const b = thread.pop(); const a = thread.pop(); thread.push(a < b); break; }
                case OPCODES.LTE: { const b = thread.pop(); const a = thread.pop(); thread.push(a <= b); break; }
                case OPCODES.GT: { const b = thread.pop(); const a = thread.pop(); thread.push(a > b); break; }
                case OPCODES.GTE: { const b = thread.pop(); const a = thread.pop(); thread.push(a >= b); break; }
                case OPCODES.INSTANCEOF: { const b = thread.pop(); const a = thread.pop(); thread.push(a instanceof b); break; }
                case OPCODES.IN: { const b = thread.pop(); const a = thread.pop(); thread.push(a in b); break; }

                case OPCODES.NOT: { thread.push(!thread.pop()); break; }
                case OPCODES.BIT_NOT: { thread.push(~thread.pop()); break; }
                case OPCODES.NEGATE: { thread.push(-thread.pop()); break; }
                case OPCODES.TYPEOF: { thread.push(typeof thread.pop()); break; }
                case OPCODES.VOID: { thread.pop(); thread.push(undefined); break; }
                case OPCODES.DELETE_PROP: { const p = thread.pop(); const o = thread.pop(); thread.push(delete o[p]); break; }

                // Flow Control
                case OPCODES.JUMP: thread.ip += thread.read16(); break;
                case OPCODES.JUMP_IF_FALSE: { const off = thread.read16(); if (!thread.pop()) thread.ip += off; break; }
                case OPCODES.JUMP_IF_TRUE: { const off = thread.read16(); if (thread.pop()) thread.ip += off; break; }
                
                case OPCODES.CHAIN_CHECK: {
                    const off = thread.read16();
                    const val = thread.peek();
                    if (val === null || val === undefined) {
                        thread.pop(); 
                        thread.push(undefined);
                        thread.ip += off;
                    }
                    break;
                }
                
                case OPCODES.WITH_ENTER: {
                    if (!thread.withStack) thread.withStack = [];
                    thread.withStack.push(thread.pop());
                    break;
                }
                case OPCODES.WITH_EXIT: {
                    thread.withStack.pop();
                    break;
                }

                // Objects
                case OPCODES.ALLOC_OBJECT: thread.push({}); break;
                case OPCODES.ALLOC_ARRAY: thread.push([]); break;
                case OPCODES.GET_PROP: { const k = thread.pop(); const o = thread.pop(); thread.push(o ? o[k] : undefined); break; }
                case OPCODES.SET_PROP: { 
                    const v = thread.pop(); 
                    const k = thread.pop(); 
                    const o = thread.pop(); 
                    if(o) {
                        o[k] = v;
                        // Debug export setting
                        if (k === 'CANVAS_WIDTH' || k === 'DOVE_WIDTH' || k === 'flap') {
                           if(vm.hostAPI[0]) vm.hostAPI[0](`[VM-OP] SET_PROP on object: ${k} = ${typeof v}`);
                        }
                    } else {
                       if(vm.hostAPI[0]) vm.hostAPI[0](`[VM-OP] SET_PROP failed. Object is ${o}. Key: ${k}`);
                    }
                    thread.push(v); 
                    break; 
                }

                // Functions & Closures
                case OPCODES.CLOSURE: {
                    const code = thread.constants[thread.read16()];
                    const flags = thread.read8(); 
                    const closure = { 
                        type: 'CLOSURE', 
                        code, 
                        isAsync: !!(flags & 1), 
                        isGenerator: !!(flags & 2),
                        isArrow: !!(flags & 4),
                        upvalues: thread.currentScope 
                    };
                    thread.push(closure);
                    break;
                }

                case OPCODES.CALL: {
                    const count = thread.read8();
                    const args = [];
                    for(let i=0; i<count; i++) args.unshift(thread.pop());
                    
                    const callee = thread.pop(); 
                    let ctx = thread.pop(); 

                    if (ctx === undefined || ctx === null) {
                        ctx = thread.environment; 
                    }

                    if (callee && callee.type === 'CLOSURE') {
                        if (callee.isGenerator) {
                            const genObj = {
                                next: (val) => ({ value: undefined, done: true }),
                                [Symbol.iterator]: function() { return this; }
                            };
                            thread.push(genObj);
                        } else {
                            thread.frames.push({
                                ip: thread.ip, bytecode: thread.bytecode,
                                constants: thread.constants, scope: thread.currentScope,
                                upvalues: thread.currentUpvalues, 
                                stackSize: thread.stack.length
                            });
                            
                            thread.bytecode = callee.code.bytecode;
                            thread.constants = callee.code.constants;
                            thread.ip = 0;
                            thread.currentScope = { 
                                'this': callee.isArrow ? ctx : ctx, 
                                'arguments': args 
                            };
                            thread.currentUpvalues = callee.upvalues;

                            args.forEach((a, i) => thread.currentScope[i] = a);
                        }
                    } else if (typeof callee === 'function') {
                        thread.push(callee.apply(ctx, args));
                    } else {
                        // B"H - Enhanced Error Info
                        const type = typeof callee;
                        const msg = `[VM] TypeError: ${type === 'undefined' ? 'undefined' : type} is not a function (callee was ${String(callee)}). Hint: Did an imported module fail to load? Check the logs for [Import] errors.`;
                        throw new Error(msg);
                    }
                    break;
                }
                
                case OPCODES.MAKE_CLASS: {
                    const superClass = thread.pop();
                    const methodCode = thread.constants[thread.read16()];
                    const ClassConstructor = function(...args) {};
                    if (superClass) {
                        ClassConstructor.prototype = Object.create(superClass.prototype);
                        ClassConstructor.prototype.constructor = ClassConstructor;
                    }
                    thread.push(ClassConstructor);
                    break;
                }
                
                case OPCODES.NEW: {
                    const count = thread.read8();
                    const args = [];
                    for(let i=0; i<count; i++) args.unshift(thread.pop());
                    const ctor = thread.pop();
                    thread.push(new ctor(...args));
                    break;
                }

                case OPCODES.RETURN: {
                    const ret = thread.pop();
                    if (thread.frames.length > 0) {
                        const f = thread.frames.pop();
                        thread.ip = f.ip; thread.bytecode = f.bytecode; 
                        thread.constants = f.constants; thread.currentScope = f.scope;
                        thread.currentUpvalues = f.upvalues; 
                        thread.push(ret);
                    } else {
                        thread.push(ret); return 'COMPLETED';
                    }
                    break;
                }

                case OPCODES.AWAIT: {
                    const promise = thread.pop();
                    if (promise && typeof promise.then === 'function') {
                        thread.status = 'AWAITING';
                        promise.then(
                            val => { thread.push(val); thread.status = 'RUNNING'; vm.wake(); },
                            err => { thread.push(err); thread.status = 'RUNNING'; vm.wake(); }
                        );
                        return 'YIELD';
                    } else {
                        thread.push(promise);
                    }
                    break;
                }
                case OPCODES.YIELD: { thread.push(thread.pop()); break; }

                case OPCODES.GET_ITERATOR: {
                    const o = thread.pop();
                    thread.push(o[Symbol.iterator]());
                    break;
                }
                case OPCODES.ITERATOR_NEXT: thread.push(thread.pop().next()); break;
                case OPCODES.ITERATOR_DONE: { const r = thread.pop(); thread.push(r); thread.push(r.done); break; }
                case OPCODES.ITERATOR_VALUE: thread.push(thread.pop().value); break;
                case OPCODES.ENUMERATE: {
                    const o = thread.pop();
                    const keys = []; for(let k in o) keys.push(k);
                    thread.push(keys[Symbol.iterator]());
                    break;
                }

                case OPCODES.ENTER_TRY: { const off = thread.read16(); if(!thread.catchStack) thread.catchStack=[]; thread.catchStack.push(thread.ip + off); break; }
                case OPCODES.EXIT_TRY: { if(thread.catchStack) thread.catchStack.pop(); break; }
                case OPCODES.THROW: throw thread.pop();

                case OPCODES.SYSCALL: {
                    const id = thread.read8();
                    const cnt = thread.read8();
                    const args=[]; for(let i=0; i<cnt; i++) args.unshift(thread.pop());
                    if(vm.hostAPI[id]) vm.hostAPI[id](...args);
                    thread.push(undefined);
                    break;
                }
                
                // B"H - Module Import System
                case OPCODES.IMPORT_MODULE: {
                    const path = thread.pop();
                    
                    // Check Cache
                    if (vm.moduleCache.has(path)) {
                        thread.push(vm.moduleCache.get(path));
                        break;
                    }
                    
                    if (!vm.importResolver) {
                        throw new Error(`[VM] Import Error: No importResolver provided to resolve '${path}'`);
                    }
                    
                    // Suspend current thread
                    thread.status = 'AWAITING';
                    
                    vm.importResolver(path).then(async (res) => {
                        try {
                            const code = (res && (res.code || res.content || res)) || '';
                            if (!code) throw new Error(`Empty code for module ${path}`);
                            
                            // 1. Compile Module
                            const parser = new self.MerkavahParser(code);
                            parser.registerStatementParsers(); 
                            parser.registerExpressionParsers(); 
                            parser.registerDeclarationParsers();
                            const compiler = new self.MerkavaCompiler.Compiler();
                            const codeObj = compiler.compile(parser.parse());
                            
                            // 2. Prepare Module Context
                            const exportsObj = {};
                            const moduleContext = Object.create(vm.context);
                            moduleContext.exports = exportsObj;
                            
                            // 3. Spawn Sub-Thread
                            const modThread = vm.spawn(codeObj);
                            modThread.environment = moduleContext;
                            modThread.currentScope = { 'this': moduleContext, 'exports': exportsObj };
                            
                            // 4. Hook into completion
                            const originalStep = modThread.step.bind(modThread);
                            modThread.step = function() {
                                const active = originalStep();
                                if (this.status === 'COMPLETED') {
                                    vm.moduleCache.set(path, exportsObj); // Cache exports
                                    
                                    // B"H - Debug log for loaded module
                                    if(vm.hostAPI[0]) vm.hostAPI[0](`[VM] Module Loaded: ${path}. Keys: ${Object.keys(exportsObj).join(', ')}`);
                                    
                                    thread.push(exportsObj); // Result for importer
                                    thread.status = 'RUNNING'; // Resume importer
                                } else if (this.status === 'CRASHED' || this.status === 'TERMINATED') {
                                    // B"H - Safe Fallback for Crashed Modules
                                    if(vm.hostAPI[0]) vm.hostAPI[0](`[VM] Module CRASHED: ${path}`);
                                    console.error(`[VM] Module ${path} CRASHED. Returning empty exports.`);
                                    thread.push(exportsObj); // Return what we have (maybe empty) to prevent callee error
                                    thread.status = 'RUNNING';
                                }
                                return active;
                            };
                            
                            vm.wake(); 
                            
                        } catch(e) {
                            if(vm.hostAPI[0]) vm.hostAPI[0](`[VM] Module Compilation Failed: ${path}`, e.message);
                            console.error(`[VM] Module Load Failed: ${path}`, e);
                            thread.push({}); // Push empty object on failure to avoid undefined
                            thread.status = 'RUNNING';
                            vm.wake();
                        }
                    }).catch(e => {
                        if(vm.hostAPI[0]) vm.hostAPI[0](`[VM] Import Resolution Failed: ${path}`, e.message);
                        console.error(`[VM] Import Resolver Failed: ${path}`, e);
                        thread.push({});
                        thread.status = 'RUNNING';
                        vm.wake();
                    });
                    
                    return 'YIELD';
                }
            }
            return 'CONTINUE';
        }
    };

    root.MerkavaVM.Executor = Executor;
})(typeof self !== 'undefined' ? self : this);