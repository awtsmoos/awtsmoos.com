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
                    const type = thread.read8(); // 0=new.target, 1=import.meta
                    if (type === 0) thread.push(thread.currentScope['new.target'] || undefined);
                    else thread.push({ url: 'virtual-module' });
                    break;
                }

                // Variables
                case OPCODES.LOAD_GLOBAL: {
                    const name = thread.constants[thread.read16()];
                    let found = false;
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
                        let val = vm.memory.getGlobal(name);
                        if (val === undefined && thread.environment && (name in thread.environment)) {
                            val = thread.environment[name];
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
                    if (!stored) vm.memory.setGlobal(name, val);
                    break;
                }
                case OPCODES.LOAD_LOCAL: thread.push(thread.currentScope[thread.read8()]); break;
                case OPCODES.STORE_LOCAL: { if(!thread.currentScope) thread.currentScope={}; thread.currentScope[thread.read8()] = thread.pop(); break; }

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
                case OPCODES.SET_PROP: { const v = thread.pop(); const k = thread.pop(); const o = thread.pop(); if(o) o[k] = v; thread.push(v); break; }

                // Functions & Closures
                case OPCODES.CLOSURE: {
                    const code = thread.constants[thread.read16()];
                    const flags = thread.read8(); // isAsync(1) | isGen(2) | isArrow(4)
                    const closure = { 
                        type: 'CLOSURE', 
                        code, 
                        isAsync: !!(flags & 1), 
                        isGenerator: !!(flags & 2),
                        isArrow: !!(flags & 4),
                        upvalues: thread.currentScope // Simplified capture
                    };
                    thread.push(closure);
                    break;
                }

                case OPCODES.CALL: {
                    const count = thread.read8();
                    const args = [];
                    for(let i=0; i<count; i++) args.unshift(thread.pop());
                    const ctx = thread.pop(); // this
                    const callee = thread.pop();

                    if (callee && callee.type === 'CLOSURE') {
                        if (callee.isGenerator) {
                            // Generator return mock
                            const genObj = {
                                next: (val) => ({ value: undefined, done: true }),
                                [Symbol.iterator]: function() { return this; }
                            };
                            thread.push(genObj);
                        } else {
                            thread.frames.push({
                                ip: thread.ip, bytecode: thread.bytecode,
                                constants: thread.constants, scope: thread.currentScope,
                                stackSize: thread.stack.length
                            });
                            thread.bytecode = callee.code.bytecode;
                            thread.constants = callee.code.constants;
                            thread.ip = 0;
                            thread.currentScope = { 
                                'this': callee.isArrow ? ctx : ctx, 
                                'arguments': args 
                            };
                            args.forEach((a, i) => thread.currentScope[i] = a);
                        }
                    } else if (typeof callee === 'function') {
                        thread.push(callee.apply(ctx, args));
                    } else {
                        // B"H - Enhanced Error Message
                        const type = typeof callee;
                        const msg = `[VM] TypeError: ${type === 'undefined' ? 'undefined' : type} is not a function (callee was ${String(callee)})`;
                        throw new Error(msg);
                    }
                    break;
                }
                
                // Classes
                case OPCODES.MAKE_CLASS: {
                    const superClass = thread.pop();
                    const methodCode = thread.constants[thread.read16()];
                    
                    const ClassConstructor = function(...args) {
                        // In a real VM, we would invoke the constructor logic here
                    };
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
                        thread.ip = f.ip; thread.bytecode = f.bytecode; thread.constants = f.constants; thread.currentScope = f.scope;
                        thread.push(ret);
                    } else {
                        thread.push(ret); return 'COMPLETED';
                    }
                    break;
                }

                // Async
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

                // Iteration
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

                // Exceptions
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
            }
            return 'CONTINUE';
        }
    };

    root.MerkavaVM.Executor = Executor;
})(typeof self !== 'undefined' ? self : this);