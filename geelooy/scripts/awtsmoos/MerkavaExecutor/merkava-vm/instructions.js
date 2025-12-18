
// B"H
(function(root) {
    // Define a standalone Executor to avoid VM Class overwrite issues
    root.MerkavaExecutor = {
        exec(op, thread, OPCODES) {
            const vm = thread.vm;

            switch (op) {
                case 0x00: break; // NOP
                case 0x0a: break; // B"H - Crumple Zone: Treat 0x0a as NOP if it leaks into instruction stream
                case 0x01: return 'HALT';

                // --- STACK ---
                case 0x13: { // PUSH_CONST
                    const idx = thread.read16();
                    if (idx < 0 || idx >= thread.constants.length) {
                        thread.push(undefined);
                    } else {
                        thread.push(thread.constants[idx]); 
                    }
                    break;
                }
                case 0x14: thread.push(undefined); break;
                case 0x15: thread.push(null); break;
                case 0x16: thread.push(true); break;
                case 0x17: thread.push(false); break;
                
                case 0x10: thread.pop(); break; // POP
                
                case 0x11: thread.push(thread.peek()); break; // DUP
                case 0x12: { const a = thread.pop(); const b = thread.pop(); thread.push(a); thread.push(b); break; } // SWAP
                
                case 0x18: thread.push(thread.currentScope ? thread.currentScope['this'] : undefined); break; // PUSH_THIS
                case 0x19: { // PUSH_META
                    const type = thread.read8(); 
                    if (type === 0) thread.push(thread.currentScope['new.target'] || undefined);
                    else thread.push({ url: 'virtual-module' });
                    break;
                }

                // --- VARIABLES ---
                case 0x22: { // LOAD_GLOBAL
                    const idx = thread.read16();
                    const name = thread.constants[idx];
                    let val;
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
                        if (name === 'exports' && thread.currentScope && thread.currentScope.exports) val = thread.currentScope.exports;
                        else if (thread.environment && (name in thread.environment)) val = thread.environment[name];
                        else {
                            val = vm.memory.getGlobal(name);
                            if (val === undefined && vm.context && (name in vm.context)) val = vm.context[name];
                        }
                        thread.push(val);
                    }
                    break;
                }
                
                case 0x23: { // STORE_GLOBAL
                    // B"H - ABSOLUTE PRIORITY: Read Operand Index
                    const idx = thread.read16(); // IP += 2
                    
                    // B"H - Execute Store Logic
                    const val = thread.pop();
                    
                    if (idx >= 0 && idx < thread.constants.length) {
                        const name = thread.constants[idx];
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
                            if (thread.environment) thread.environment[name] = val;
                            else vm.memory.setGlobal(name, val);
                        }
                    }
                    break;
                }
                
                case 0x20: thread.push(thread.currentScope[thread.read8()]); break; // LOAD_LOCAL
                case 0x21: { // STORE_LOCAL
                    if(!thread.currentScope) thread.currentScope={}; 
                    const idx = thread.read8();
                    const val = thread.pop();
                    thread.currentScope[idx] = val;
                    break; 
                }

                case 0x24: { // LOAD_UPVALUE
                    const idx = thread.read8();
                    const depth = thread.read8();
                    const scope = thread.currentUpvalues; 
                    thread.push(scope ? scope[idx] : undefined);
                    break;
                }
                case 0x25: { // STORE_UPVALUE
                    const idx = thread.read8();
                    const depth = thread.read8();
                    const val = thread.pop();
                    if (thread.currentUpvalues) thread.currentUpvalues[idx] = val;
                    break;
                }

                // --- MATH ---
                case 0x40: { const b = thread.pop(); const a = thread.pop(); thread.push(a + b); break; }
                case 0x41: { const b = thread.pop(); const a = thread.pop(); thread.push(a - b); break; }
                case 0x42: { const b = thread.pop(); const a = thread.pop(); thread.push(a * b); break; }
                case 0x43: { const b = thread.pop(); const a = thread.pop(); thread.push(a / b); break; }
                case 0x44: { const b = thread.pop(); const a = thread.pop(); thread.push(a % b); break; }
                case 0x45: { const b = thread.pop(); const a = thread.pop(); thread.push(Math.pow(a, b)); break; }
                
                case 0x46: { const b = thread.pop(); const a = thread.pop(); thread.push(a & b); break; }
                case 0x47: { const b = thread.pop(); const a = thread.pop(); thread.push(a | b); break; }
                case 0x48: { const b = thread.pop(); const a = thread.pop(); thread.push(a ^ b); break; }
                case 0x49: { const b = thread.pop(); const a = thread.pop(); thread.push(a << b); break; }
                case 0x4A: { const b = thread.pop(); const a = thread.pop(); thread.push(a >> b); break; }
                case 0x4B: { const b = thread.pop(); const a = thread.pop(); thread.push(a >>> b); break; }

                case 0x4C: { const b = thread.pop(); const a = thread.pop(); thread.push(a == b); break; }
                case 0x4E: { const b = thread.pop(); const a = thread.pop(); thread.push(a === b); break; }
                case 0x4D: { const b = thread.pop(); const a = thread.pop(); thread.push(a != b); break; }
                case 0x4F: { const b = thread.pop(); const a = thread.pop(); thread.push(a !== b); break; }
                case 0x52: { const b = thread.pop(); const a = thread.pop(); thread.push(a < b); break; }
                case 0x53: { const b = thread.pop(); const a = thread.pop(); thread.push(a <= b); break; }
                case 0x50: { const b = thread.pop(); const a = thread.pop(); thread.push(a > b); break; }
                case 0x51: { const b = thread.pop(); const a = thread.pop(); thread.push(a >= b); break; }
                case 0x54: { const b = thread.pop(); const a = thread.pop(); thread.push(a instanceof b); break; }
                case 0x55: { const b = thread.pop(); const a = thread.pop(); thread.push(a in b); break; }

                case 0x60: { thread.push(!thread.pop()); break; }
                case 0x61: { thread.push(~thread.pop()); break; }
                case 0x62: { thread.push(-thread.pop()); break; }
                case 0x63: { thread.push(typeof thread.pop()); break; }
                case 0x64: { thread.push(typeof thread.pop()); break; }
                case 0x34: { const p = thread.pop(); const o = thread.pop(); thread.push(delete o[p]); break; }

                // --- FLOW ---
                case 0x03: thread.ip += thread.read16(); break;
                case 0x04: { const off = thread.read16(); if (!thread.pop()) thread.ip += off; break; }
                case 0x05: { const off = thread.read16(); if (thread.pop()) thread.ip += off; break; }
                
                case 0xA5: { // CHAIN_CHECK
                    const off = thread.read16();
                    const val = thread.peek();
                    if (val === null || val === undefined) {
                        thread.pop(); 
                        thread.push(undefined);
                        thread.ip += off;
                    }
                    break;
                }
                
                case 0xA6: { // WITH_ENTER
                    if (!thread.withStack) thread.withStack = [];
                    thread.withStack.push(thread.pop());
                    break;
                }
                case 0xA7: { // WITH_EXIT
                    thread.withStack.pop();
                    break;
                }

                // --- OBJECTS ---
                case 0x30: thread.push({}); break;
                case 0x31: thread.push([]); break;
                case 0x32: { // GET_PROP
                    const k = thread.pop(); 
                    const o = thread.pop(); 
                    if (o === undefined || o === null) thread.push(undefined);
                    else {
                        let val = o[k];
                        if (typeof val === 'function' && !val.prototype && !val.name.startsWith('bound ')) {
                            try { val = val.bind(o); } catch(e) {}
                        }
                        thread.push(val); 
                    }
                    break; 
                }
                case 0x33: { // SET_PROP
                    const v = thread.pop(); 
                    const k = thread.pop(); 
                    const o = thread.pop(); 
                    if(o !== undefined && o !== null) {
                        if (typeof CSSStyleDeclaration !== 'undefined' && o instanceof CSSStyleDeclaration) {
                            if (typeof o.setProperty === 'function') o.setProperty(k, String(v));
                            else o[k] = v;
                        } else o[k] = v;
                    }
                    thread.push(v); 
                    break; 
                }
                
                case 0xB3: { // ARRAY_PUSH
                    const val = thread.pop();
                    const arr = thread.peek(); 
                    if (Array.isArray(arr)) arr.push(val);
                    break;
                }
                case 0xB4: { // ARRAY_SPREAD
                    const src = thread.pop();
                    const arr = thread.peek();
                    if (Array.isArray(arr) && src && typeof src[Symbol.iterator] === 'function') arr.push(...src);
                    break;
                }
                case 0xB5: { // OBJECT_MERGE
                    const src = thread.pop();
                    const target = thread.peek();
                    if (src !== null && src !== undefined) Object.assign(target, src);
                    break;
                }
                case 0xB6: { // OBJECT_REST
                    const keys = thread.pop();
                    const source = thread.pop();
                    const rest = {};
                    if (source !== null && source !== undefined) {
                        const srcObj = Object(source);
                        const excludeSet = new Set(Array.isArray(keys) ? keys.map(String) : []);
                        for (const key in srcObj) {
                            if (!excludeSet.has(String(key))) rest[key] = srcObj[key];
                        }
                    }
                    thread.push(rest);
                    break;
                }

                // --- FUNCTIONS ---
                case 0x70: { // CLOSURE
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

                case 0x71: { // CALL
                    const count = thread.read8();
                    const args = [];
                    for(let i=0; i<count; i++) args.unshift(thread.pop());
                    const callee = thread.pop(); 
                    let ctx = thread.pop(); 
                    if (ctx === undefined || ctx === null) ctx = thread.environment; 

                    if (callee && callee.type === 'CLOSURE') {
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
                    } else if (typeof callee === 'function') {
                        try {
                            const result = callee.apply(ctx, args);
                            thread.push(result);
                        } catch(e) { throw e; }
                    } else {
                        thread.push(undefined);
                    }
                    break;
                }

                case 0x72: { // NEW
                    const count = thread.read8();
                    const args = [];
                    for(let i=0; i<count; i++) args.unshift(thread.pop());
                    const callee = thread.pop();
                    if (typeof callee === 'function') {
                        thread.push(new callee(...args));
                    } else {
                        throw new TypeError(`[VM] New Error: Not a constructor`);
                    }
                    break;
                }
                
                case 0x73: { // MAKE_CLASS
                    const codeConstIdx = thread.read16();
                    const superClass = thread.pop();
                    const classBodyCode = thread.constants[codeConstIdx];
                    const TheClass = function(...args) {
                         // Simplified Constructor for Stability
                    };
                    thread.push(TheClass);
                    break;
                }

                case 0x02: { // RETURN
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

                case 0x80: { // AWAIT
                    const promise = thread.pop();
                    if (promise && typeof promise.then === 'function') {
                        thread.status = 'AWAITING';
                        promise.then(
                            val => { thread.push(val); thread.status = 'RUNNING'; if(vm.wake) vm.wake(); },
                            err => { console.error("[VM] Await Error:", err); thread.push(undefined); thread.status = 'RUNNING'; if(vm.wake) vm.wake(); }
                        );
                    } else thread.push(promise);
                    break;
                }
                
                case 0x95: { // IMPORT
                    const url = thread.pop();
                    thread.push(Promise.resolve({})); 
                    break;
                }
                
                case 0x96: { // IMPORT_MODULE
                    const url = thread.pop();
                    thread.push({}); 
                    break;
                }

                case 0x91: { // THROW
                    const err = thread.pop();
                    throw err; 
                }
                case 0x92: { // ENTER_TRY
                    const catchOffset = thread.read16();
                    thread.catchStack.push(thread.ip + catchOffset); 
                    break;
                }
                case 0x93: { // EXIT_TRY
                    thread.catchStack.pop();
                    break;
                }
                
                case 0xA0: { // GET_ITERATOR
                    const iterable = thread.pop();
                    if (iterable && typeof iterable[Symbol.iterator] === 'function') thread.push(iterable[Symbol.iterator]());
                    else throw new TypeError("Value is not iterable");
                    break;
                }
                case 0xA1: { const iter = thread.peek(); thread.push(iter.next()); break; }
                case 0xA2: { const res = thread.peek(); thread.push(res.done); break; }
                case 0xA3: { const res = thread.peek(); thread.pop(); thread.push(res.value); break; }
                
                case 0xA4: { // ENUMERATE
                    const obj = thread.pop();
                    const keys = [];
                    for (const k in obj) keys.push(k);
                    thread.push(keys[Symbol.iterator]());
                    break;
                }

                case 0x90: { // SYSCALL
                    const id = thread.read8();
                    const argc = thread.read8();
                    const args = [];
                    for(let i=0; i<argc; i++) args.unshift(thread.pop());
                    if (vm.hostAPI[id]) thread.push(vm.hostAPI[id](...args));
                    else thread.push(undefined);
                    break;
                }
                
                case 0x94: console.warn("[VM] Debugger hit"); break;

                default:
                    return 'UNKNOWN_OP';
            }
        }
    };
    
    // Also attach to VM for backward compat if needed, but we rely on Global now
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.Executor = root.MerkavaExecutor;
    
    console.log("[MerkavaVM] Global Executor Installed (Fix 25 - Scorched Earth).");
})(typeof self !== 'undefined' ? self : this);
