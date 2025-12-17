
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
                case OPCODES.PUSH_CONST: {
                    const idx = thread.read16();
                    const val = thread.constants[idx];
                    thread.push(val); 
                    break;
                }
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
                    let val;
                    
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
                        if (name === 'exports' && thread.currentScope && thread.currentScope.exports) {
                             val = thread.currentScope.exports;
                        }
                        else if (thread.environment && (name in thread.environment)) {
                            val = thread.environment[name];
                        } 
                        else {
                            val = vm.memory.getGlobal(name);
                            if (val === undefined) {
                                if (vm.context && (name in vm.context)) {
                                    val = vm.context[name];
                                }
                            }
                        }
                        thread.push(val);
                    }
                    break;
                }
                case OPCODES.STORE_GLOBAL: {
                    const name = thread.constants[thread.read16()];
                    const val = thread.pop();
                    let stored = false;
                    
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
                        if (thread.environment) {
                            thread.environment[name] = val;
                        } else {
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
                case OPCODES.GET_PROP: { 
                    const k = thread.pop(); 
                    const o = thread.pop(); 
                    
                    if (o === undefined || o === null) {
                        // B"H - Silent undefined on null access, but warn for debugging
                        // thread.push(undefined);
                        // console.warn(`[VM WARN] Cannot read property '${k}' of ${String(o)}`);
                        thread.push(undefined);
                    } else {
                        let val = o[k];
                        if (typeof val === 'function' && !val.prototype && !val.name.startsWith('bound ')) {
                            try { val = val.bind(o); } catch(e) {}
                        }
                        thread.push(val); 
                    }
                    break; 
                }
                case OPCODES.SET_PROP: { 
                    const v = thread.pop(); 
                    const k = thread.pop(); 
                    const o = thread.pop(); 
                    
                    if(o !== undefined && o !== null) {
                        if (typeof CSSStyleDeclaration !== 'undefined' && o instanceof CSSStyleDeclaration) {
                            if (typeof o.setProperty === 'function') o.setProperty(k, String(v));
                            else o[k] = v;
                        } else {
                            o[k] = v;
                        }
                    } else {
                       // Silent failure for robustness
                    }
                    thread.push(v); 
                    break; 
                }
                
                // B"H - NEW SPREAD OPCODES
                case OPCODES.ARRAY_PUSH: {
                    const val = thread.pop();
                    const arr = thread.peek(); 
                    if (Array.isArray(arr)) arr.push(val);
                    // else throw new TypeError("ARRAY_PUSH expected array");
                    break;
                }
                case OPCODES.ARRAY_SPREAD: {
                    const src = thread.pop();
                    const arr = thread.peek();
                    if (Array.isArray(arr)) {
                        if (src && typeof src[Symbol.iterator] === 'function') {
                            arr.push(...src);
                        }
                    }
                    break;
                }
                case OPCODES.OBJECT_MERGE: {
                    const src = thread.pop();
                    const target = thread.peek();
                    if (src !== null && src !== undefined) {
                        Object.assign(target, src);
                    }
                    break;
                }
                case OPCODES.OBJECT_REST: {
                    const keys = thread.pop();
                    const source = thread.pop();
                    const rest = {};
                    if (source !== null && source !== undefined) {
                        // B"H - Safe Destructuring
                        // 1. Convert source to object wrapper to allow 'in' check
                        const srcObj = Object(source);
                        // 2. Ensure keys are compared as strings
                        const excludeSet = new Set(Array.isArray(keys) ? keys.map(String) : []);
                        
                        for (const key in srcObj) {
                            if (!excludeSet.has(String(key))) {
                                rest[key] = srcObj[key];
                            }
                        }
                    }
                    // Pushes empty object if source was null/undefined, preventing crash
                    thread.push(rest);
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
                        upvalues: thread.currentScope,
                        environment: thread.environment 
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
                    if (ctx === undefined || ctx === null) ctx = thread.environment; 

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
                                stackSize: thread.stack.length,
                                environment: thread.environment
                            });
                            thread.bytecode = callee.code.bytecode;
                            thread.constants = callee.code.constants;
                            thread.ip = 0;
                            const scopeThis = callee.isArrow ? (callee.upvalues ? callee.upvalues['this'] : undefined) : ctx;
                            thread.currentScope = { 'this': scopeThis, 'arguments': args };
                            thread.currentUpvalues = callee.upvalues;
                            thread.environment = callee.environment || thread.environment;
                            args.forEach((a, i) => thread.currentScope[i] = a);
                        }
                    } else if (typeof callee === 'function') {
                        // B"H - NATIVE CALL HANDLER
                        if (!vm._callbackWrappers) vm._callbackWrappers = new WeakMap();
                        
                        const wrappedArgs = args.map(arg => {
                            if (arg && arg.type === 'CLOSURE') {
                                if (vm._callbackWrappers.has(arg)) return vm._callbackWrappers.get(arg);
                                
                                // B"H - Synchronous Wrapper
                                // Native functions (like Array.map) expect the callback to execute NOW and return a value.
                                const wrapper = function(...innerArgs) {
                                    const hostThis = this;
                                    const scopeThis = arg.isArrow ? (arg.upvalues ? arg.upvalues['this'] : undefined) : hostThis;
                                    
                                    if (thread.vm) {
                                         const t = thread.vm.spawn(arg.code);
                                         t.currentScope = { 'this': scopeThis, 'arguments': innerArgs };
                                         innerArgs.forEach((val, idx) => t.currentScope[idx] = val);
                                         t.currentUpvalues = arg.upvalues;
                                         t.environment = arg.environment;
                                         
                                         // B"H - FORCE SYNCHRONOUS EXECUTION
                                         const MAX_CYCLES = 2000000;
                                         let cycles = 0;
                                         
                                         // Step the thread until it's done or yields
                                         while(t.status === 'RUNNING' && cycles++ < MAX_CYCLES) {
                                             t.step();
                                         }
                                         
                                         if (t.status === 'CRASHED') {
                                             const err = t.stack[t.stack.length - 1];
                                             console.error("[VM] Callback Crashed:", err);
                                             throw new Error("[VM] Callback Crashed: " + err);
                                         } else if (t.status !== 'COMPLETED' && t.status !== 'HALTED') {
                                             console.warn("[VM] Warning: Callback exceeded sync limit or yielded. Result may be undefined.");
                                         }
                                         
                                         // Return the value from the top of the stack (if any)
                                         if (t.stack.length > 0) return t.pop();
                                         return undefined;
                                    }
                                };
                                
                                vm._callbackWrappers.set(arg, wrapper);
                                return wrapper;
                            }
                            return arg;
                        });
                        
                        try {
                            const result = callee.apply(ctx, wrappedArgs);
                            thread.push(result);
                        } catch(e) {
                            console.error("[VM] Native Call Error:", e);
                            throw e;
                        }
                    } else {
                        // console.warn(`[VM WARN] Attempted to call non-function: ${typeof callee}`);
                        thread.push(undefined);
                    }
                    break;
                }

                case OPCODES.NEW: {
                    const count = thread.read8();
                    const args = [];
                    for(let i=0; i<count; i++) args.unshift(thread.pop());
                    const callee = thread.pop();
                    if (typeof callee === 'function') {
                        try {
                            thread.push(new callee(...args));
                        } catch(e) {
                            throw new Error(`[VM] New Error: ${e.message}`);
                        }
                    } else if (callee && callee.type === 'CLOSURE') {
                        const instance = {};
                        thread.frames.push({
                            ip: thread.ip, bytecode: thread.bytecode,
                            constants: thread.constants, scope: thread.currentScope,
                            upvalues: thread.currentUpvalues, 
                            stackSize: thread.stack.length,
                            environment: thread.environment
                        });
                        thread.bytecode = callee.code.bytecode;
                        thread.constants = callee.code.constants;
                        thread.ip = 0;
                        thread.currentScope = { 'this': instance, 'arguments': args };
                        thread.currentUpvalues = callee.upvalues;
                        thread.environment = callee.environment || thread.environment;
                        args.forEach((a, i) => thread.currentScope[i] = a);
                    } else {
                        throw new TypeError(`[VM] TypeError: ${typeof callee} is not a constructor`);
                    }
                    break;
                }
                
                case OPCODES.MAKE_CLASS: {
                    const codeConstIdx = thread.read16();
                    const superClass = thread.pop();
                    const classBodyCode = thread.constants[codeConstIdx];
                    
                    const TheClass = function(...args) {
                        const instance = this; 
                        
                        if (thread.vm) {
                             const t = thread.vm.spawn(classBodyCode);
                             t.currentScope = { 
                                 'this': instance, 
                                 'arguments': args 
                             };
                             args.forEach((val, idx) => t.currentScope[idx] = val);
                             
                             t.currentUpvalues = TheClass._upvalues;
                             t.environment = TheClass._environment || thread.environment;

                             const MAX_CYCLES = 2000000;
                             let cycles = 0;
                             while(t.status === 'RUNNING' && cycles++ < MAX_CYCLES) {
                                 t.step();
                             }
                             if (t.status === 'CRASHED') {
                                 const err = t.stack[t.stack.length - 1];
                                 throw new Error("[VM] Class Constructor Crashed: " + err);
                             }
                        }
                    };
                    
                    TheClass._upvalues = thread.currentScope;
                    TheClass._environment = thread.environment;

                    if (superClass) {
                        TheClass.prototype = Object.create(superClass.prototype);
                        TheClass.prototype.constructor = TheClass;
                    }
                    
                    thread.push(TheClass);
                    break;
                }

                case OPCODES.RETURN: {
                    const retVal = thread.pop();
                    if (thread.frames.length > 0) {
                        const frame = thread.frames.pop();
                        thread.ip = frame.ip;
                        thread.bytecode = frame.bytecode;
                        thread.constants = frame.constants;
                        thread.currentScope = frame.scope;
                        thread.currentUpvalues = frame.upvalues;
                        thread.environment = frame.environment;
                        while (thread.stack.length > frame.stackSize) thread.stack.pop();
                        thread.push(retVal);
                    } else {
                        thread.push(retVal);
                        thread.status = 'COMPLETED';
                        return 'COMPLETED';
                    }
                    break;
                }

                // Async
                case OPCODES.AWAIT: {
                    const promise = thread.pop();
                    if (promise && typeof promise.then === 'function') {
                        thread.status = 'AWAITING';
                        promise.then(
                            val => {
                                thread.push(val);
                                thread.status = 'RUNNING';
                                if(vm.wake) vm.wake();
                            },
                            err => {
                                console.error("[VM] Await Error:", err);
                                thread.push(undefined);
                                thread.status = 'RUNNING';
                                if(vm.wake) vm.wake();
                            }
                        );
                    } else {
                        thread.push(promise); 
                    }
                    break;
                }
                
                case OPCODES.IMPORT: {
                    const url = thread.pop();
                    thread.push(Promise.resolve({})); 
                    break;
                }
                
                case OPCODES.IMPORT_MODULE: {
                    const url = thread.pop();
                    thread.push({}); 
                    break;
                }

                case OPCODES.THROW: {
                    const err = thread.pop();
                    throw err; 
                }
                case OPCODES.ENTER_TRY: {
                    const catchOffset = thread.read16();
                    thread.catchStack.push(thread.ip + catchOffset); 
                    break;
                }
                case OPCODES.EXIT_TRY: {
                    thread.catchStack.pop();
                    break;
                }
                
                case OPCODES.GET_ITERATOR: {
                    const iterable = thread.pop();
                    if (iterable && typeof iterable[Symbol.iterator] === 'function') {
                        thread.push(iterable[Symbol.iterator]());
                    } else {
                        throw new TypeError("Value is not iterable");
                    }
                    break;
                }
                case OPCODES.ITERATOR_NEXT: {
                    const iter = thread.peek();
                    const res = iter.next();
                    thread.push(res);
                    break;
                }
                case OPCODES.ITERATOR_DONE: {
                    const res = thread.peek();
                    thread.push(res.done);
                    break;
                }
                case OPCODES.ITERATOR_VALUE: {
                    const res = thread.peek(); 
                    thread.pop(); 
                    thread.push(res.value);
                    break;
                }
                
                case OPCODES.ENUMERATE: {
                    const obj = thread.pop();
                    const keys = [];
                    for (const k in obj) keys.push(k);
                    thread.push(keys[Symbol.iterator]());
                    break;
                }

                case OPCODES.SYSCALL: {
                    const id = thread.read8();
                    const argc = thread.read8();
                    const args = [];
                    for(let i=0; i<argc; i++) args.unshift(thread.pop());
                    if (vm.hostAPI[id]) {
                        const res = vm.hostAPI[id](...args);
                        thread.push(res);
                    } else {
                        thread.push(undefined);
                    }
                    break;
                }
                
                case OPCODES.DEBUGGER: {
                    console.warn("[VM] Debugger hit");
                    break;
                }

                default:
                    throw new Error(`Unknown Opcode: ${op}`);
            }
        }
    };

    root.MerkavaVM.Executor = Executor;
})(typeof self !== 'undefined' ? self : this);
