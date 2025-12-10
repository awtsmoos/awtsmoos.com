// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    
    // The Executor holds the logic for every Opcode.
    // It is stateless; state is passed in via the 'thread' argument.
    const Executor = {
        exec(op, thread, OPCODES) {
            const vm = thread.vm;
            
            switch (op) {
                case OPCODES.HALT: return 'HALT';
                case OPCODES.PUSH_CONST: thread.push(thread.constants[thread.read16()]); break;
                case OPCODES.PUSH_UNDEFINED: thread.push(undefined); break;
                case OPCODES.PUSH_NULL: thread.push(null); break;
                case OPCODES.PUSH_TRUE: thread.push(true); break;
                case OPCODES.PUSH_FALSE: thread.push(false); break;
                case OPCODES.POP: thread.pop(); break;
                case OPCODES.DUP: thread.push(thread.peek()); break;
                
                case OPCODES.SWAP: {
                    const a = thread.pop();
                    const b = thread.pop();
                    thread.push(a);
                    thread.push(b);
                    break;
                }

                // Arithmetic
                case OPCODES.ADD: { const b = thread.pop(); const a = thread.pop(); thread.push(a + b); break; }
                case OPCODES.SUB: { const b = thread.pop(); const a = thread.pop(); thread.push(a - b); break; }
                case OPCODES.MUL: { const b = thread.pop(); const a = thread.pop(); thread.push(a * b); break; }
                case OPCODES.DIV: { const b = thread.pop(); const a = thread.pop(); thread.push(a / b); break; }
                case OPCODES.MOD: { const b = thread.pop(); const a = thread.pop(); thread.push(a % b); break; }
                
                // Comparison
                case OPCODES.LT: { const b = thread.pop(); const a = thread.pop(); thread.push(a < b); break; }
                case OPCODES.LTE: { const b = thread.pop(); const a = thread.pop(); thread.push(a <= b); break; }
                case OPCODES.GT: { const b = thread.pop(); const a = thread.pop(); thread.push(a > b); break; }
                case OPCODES.GTE: { const b = thread.pop(); const a = thread.pop(); thread.push(a >= b); break; }
                case OPCODES.EQ: { const b = thread.pop(); const a = thread.pop(); thread.push(a == b); break; }
                case OPCODES.STRICT_EQ: { const b = thread.pop(); const a = thread.pop(); thread.push(a === b); break; }
                case OPCODES.NEQ: { const b = thread.pop(); const a = thread.pop(); thread.push(a != b); break; }

                // Flow
                case OPCODES.JUMP: thread.ip += thread.read16(); break;
                case OPCODES.JUMP_IF_FALSE: {
                    const offset = thread.read16();
                    if (!thread.pop()) thread.ip += offset;
                    break;
                }
                // B"H - TIKKUN: Added JUMP_IF_TRUE for Logical OR (||)
                case OPCODES.JUMP_IF_TRUE: {
                    const offset = thread.read16();
                    if (thread.pop()) thread.ip += offset;
                    break;
                }

                // Scope & Globals
                case OPCODES.STORE_GLOBAL: {
                    const name = thread.constants[thread.read16()];
                    vm.memory.setGlobal(name, thread.pop());
                    break;
                }
                case OPCODES.LOAD_GLOBAL: {
                    const name = thread.constants[thread.read16()];
                    let val = vm.memory.getGlobal(name);
                    // B"H - TIKKUN: Fallback to Host Environment (Context)
                    if (val === undefined && thread.environment && (name in thread.environment)) {
                        val = thread.environment[name];
                    }
                    thread.push(val);
                    break;
                }
                case OPCODES.STORE_LOCAL: {
                    if (!thread.currentScope) thread.currentScope = {};
                    thread.currentScope[thread.read8()] = thread.pop();
                    break;
                }
                case OPCODES.LOAD_LOCAL: {
                    const idx = thread.read8();
                    thread.push(thread.currentScope ? thread.currentScope[idx] : undefined);
                    break;
                }
                case OPCODES.NOT: {
                    const a = thread.pop();
                    thread.push(!a);
                    break;
                }

                // Objects/Arrays
                case OPCODES.ALLOC_OBJECT: thread.push({ type: 'POINTER', value: vm.memory.allocate({}) }); break;
                case OPCODES.ALLOC_ARRAY: thread.push({ type: 'POINTER', value: vm.memory.allocate([]) }); break;
                
                case OPCODES.GET_PROP: {
                    const key = thread.pop();
                    let objRef = thread.pop();
                    if (objRef && objRef.type === 'POINTER') objRef = vm.memory.get(objRef.value);
                    thread.push((objRef !== undefined && objRef !== null) ? objRef[key] : undefined);
                    break;
                }
                case OPCODES.SET_PROP: {
                    const val = thread.pop();
                    const key = thread.pop();
                    const objRef = thread.pop();
                    if (objRef && objRef.type === 'POINTER') {
                        const target = vm.memory.get(objRef.value);
                        if (target) {
                            target[key] = val;
                            vm.memory.set(objRef.value, target);
                        }
                    } else if (objRef && typeof objRef === 'object') {
                        objRef[key] = val;
                    }
                    thread.push(val);
                    break;
                }

                // System & Calls
                case OPCODES.SYSCALL: {
                    const id = thread.read8();
                    const count = thread.read8();
                    const args = [];
                    for(let i=0; i<count; i++) args.unshift(thread.pop());
                    thread.push(vm.hostAPI[id] ? vm.hostAPI[id](...args) : undefined);
                    break;
                }

                case OPCODES.CLOSURE: {
                    const code = thread.constants[thread.read16()];
                    thread.push({ type: 'CLOSURE', code });
                    break;
                }

                // B"H - TIKKUN: Implemented NEW Opcode
                case OPCODES.NEW: {
                    const count = thread.read8();
                    const args = [];
                    for(let i=0; i<count; i++) args.unshift(thread.pop());
                    const constructor = thread.pop();
                    
                    if (typeof constructor === 'function') {
                         try {
                            // Use Reflect.construct to handle classes correctly
                            thread.push(Reflect.construct(constructor, args));
                         } catch(e) {
                            throw new Error(`[VM] NEW Error: ${e.message}`);
                         }
                    } else {
                        throw new Error(`[VM] NEW Error: ${constructor} is not a constructor.`);
                    }
                    break;
                }

                case OPCODES.CALL: {
                    const count = thread.read8();
                    const args = [];
                    for(let i=0; i<count; i++) args.unshift(thread.pop());
                    const ctx = thread.pop(); // 'this'
                    const callee = thread.pop();

                    if (callee && callee.type === 'CLOSURE') {
                        thread.frames.push({
                            ip: thread.ip, bytecode: thread.bytecode,
                            constants: thread.constants, scope: thread.currentScope,
                            catchStack: thread.catchStack // Save catch stack
                        });
                        thread.bytecode = callee.code.bytecode;
                        thread.constants = callee.code.constants;
                        thread.ip = 0;
                        thread.currentScope = {};
                        // B"H: Reset catch stack for new function frame? 
                        // Usually catch blocks are local to execution context.
                        thread.catchStack = []; 
                        args.forEach((a, i) => thread.currentScope[i] = a);
                    } else if (typeof callee === 'function') {
                        let realCtx = ctx;
                        if (realCtx && realCtx.type === 'POINTER') {
                            realCtx = vm.memory.get(realCtx.value);
                        }
                        thread.push(callee.apply(realCtx, args));
                    } else {
                        throw new Error(`[VM] CALL Error: '${callee}' is not a function. Context: ${ctx}`);
                    }
                    break;
                }

                case OPCODES.RETURN: {
                    const res = thread.pop();
                    if (thread.frames.length > 0) {
                        const f = thread.frames.pop();
                        thread.ip = f.ip; thread.bytecode = f.bytecode;
                        thread.constants = f.constants; thread.currentScope = f.scope;
                        thread.catchStack = f.catchStack; // Restore catch stack
                        thread.push(res);
                    } else {
                        thread.push(res);
                        return 'COMPLETED';
                    }
                    break;
                }

                // B"H - TIKKUN: Exception Handling
                case OPCODES.ENTER_TRY: {
                    const catchOffset = thread.read16();
                    if(!thread.catchStack) thread.catchStack = [];
                    // Push the absolute address of the catch block
                    thread.catchStack.push(thread.ip + catchOffset);
                    break;
                }
                case OPCODES.EXIT_TRY: {
                    if(thread.catchStack && thread.catchStack.length > 0) {
                        thread.catchStack.pop();
                    }
                    break;
                }
                case OPCODES.THROW: {
                    const err = thread.pop();
                    // Unwind logic handled in Thread.step usually, but here we can simulate a jump
                    // However, robust handling requires modifying the Thread's loop to handle exceptions.
                    // For now, we will THROW a JS Error that the Thread catches, but we attach the VM Value.
                    const vmError = new Error(err && err.message ? err.message : String(err));
                    vmError.vmValue = err;
                    throw vmError;
                }
            }
            return 'CONTINUE';
        }
    };

    root.MerkavaVM.Executor = Executor;
})(typeof self !== 'undefined' ? self : this);