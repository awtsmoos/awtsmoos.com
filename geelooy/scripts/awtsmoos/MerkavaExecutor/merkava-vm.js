// B"H
/**
 * @file merkava-vm.js
 * @version 1.0.1 - The Engine of Creation (Rectified)
 */

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./merkava-opcodes.js'), require('./merkava-memory.js'));
    } else {
        root.MerkavaVM = factory(root.MerkavaOpcodes, root.MerkavaMemory);
    }
}(typeof self !== 'undefined' ? self : this, function(OpcodesModule, MemoryModule) {

    const { OPCODES, VM_THREAD_STATUS } = OpcodesModule;
    const { isPageFault } = MemoryModule;

    class Thread {
        constructor(id, codeObject, memory) {
            this.id = id;
            this.status = VM_THREAD_STATUS.RUNNING;
            this.ip = 0; 
            this.currentStartIP = 0; // Fix for page faults
            this.bp = 0; 
            this.sp = 0; 
            
            this.stack = []; 
            this.frames = []; 
            this.code = codeObject.bytecode; 
            this.constants = codeObject.constants; 
            
            this.scopePtr = null; 
            this.catchStack = [];
            this.errorRegister = null;
        }
    }

    class MerkavaVM {
        constructor(memoryManager, hostAPI = {}, hostContext = {}) {
            this.memory = memoryManager;
            this.hostAPI = hostAPI;
            this.hostContext = hostContext;
            this.threads = [];
            this.activeThreadIndex = 0;
            this.threadIdCounter = 1;
            this.atomicsWaitMap = new Map();
            this.onStep = null;
        }

        spawn(codeObject, scopePtr = null) {
            const thread = new Thread(this.threadIdCounter++, codeObject, this.memory);
            thread.scopePtr = scopePtr;
            this.threads.push(thread);
            if (this.onThreadSpawn) this.onThreadSpawn(thread.id);
            return thread.id;
        }
        
        _createHostProxy(closurePtr) {
            const vm = this;
            const closure = this.memory.get(closurePtr);
            
            return function(...hostArgs) {
                const threadId = vm.threadIdCounter++;
                const inheritedFrames = closure.capturedEnvironment ? [...closure.capturedEnvironment] : [];

                const newThread = new Thread(threadId, { bytecode: closure.bytecode, constants: closure.constants }, vm.memory);
                newThread.status = 0;
                newThread.bp = 1;
                newThread.stack = [undefined, ...hostArgs];
                newThread.frames = inheritedFrames;
                newThread.scopePtr = closure.moduleScopePtr || null;
                
                vm.threads.push(newThread);
                if (vm.onThreadSpawn) vm.onThreadSpawn(threadId);
            };
        }

        run(cycles = 1000) {
            let cyclesRun = 0;
            let idlePasses = 0; 

            while (cyclesRun < cycles && this.threads.length > 0) {
                this.activeThreadIndex = (this.activeThreadIndex + 1) % this.threads.length;
                const thread = this.threads[this.activeThreadIndex];

                if (thread.status === VM_THREAD_STATUS.COMPLETED || 
                    thread.status === VM_THREAD_STATUS.CRASHED) {
                    this.threads.splice(this.activeThreadIndex, 1);
                    this.activeThreadIndex--; 
                    idlePasses = 0;
                    continue;
                }

                if (thread.status !== VM_THREAD_STATUS.RUNNING) {
                    idlePasses++;
                    if (idlePasses >= this.threads.length) break; 
                    continue;
                }

                idlePasses = 0;

                try {
                    this._step(thread);
                    cyclesRun++;
                } catch (e) {
                    this._handleInterrupt(thread, e);
                }
            }
            return this.threads.length > 0;
        }

        _step(thread) {
            if (!thread.code || thread.ip >= thread.code.length) {
                thread.status = VM_THREAD_STATUS.COMPLETED;
                return;
            }
            
            thread.currentStartIP = thread.ip; // TIKKUN: Checkpoint IP for Faults

            const opcode = thread.code[thread.ip];
            thread.ip++;

            if (this.onStep) this.onStep(thread, opcode);

            switch (opcode) {
                case OPCODES.SWAP: {
                    const b = thread.stack.pop();
                    const a = thread.stack.pop();
                    thread.stack.push(b);
                    thread.stack.push(a);
                    break;
                }
                case OPCODES.PUSH_THIS: {
                    thread.stack.push(thread.stack[0]);
                    break;
                }
                case OPCODES.SET_PROTOTYPE: {
                    const protoPtr = thread.stack.pop();
                    const ctorPtr = thread.stack.pop();
                    const ctorClosure = this.memory.get(ctorPtr);
                    ctorClosure.prototypePtr = protoPtr;
                    this.memory.set(ctorPtr, ctorClosure);
                    thread.stack.push(ctorPtr);
                    break;
                }
                case OPCODES.ENTER_TRY: {
                    const catchOffset = this._readInt16(thread);
                    this._readInt16(thread); // finallyOffset (unused)
                    thread.catchStack.push({
                        catchIP: (thread.ip - 2) + catchOffset,
                        stackSize: thread.stack.length 
                    });
                    break;
                }
                case OPCODES.EXIT_TRY: thread.catchStack.pop(); break;
                case OPCODES.LOAD_ERROR: {
                    thread.stack.push(thread.errorRegister);
                    thread.errorRegister = null;
                    break;
                }
                case OPCODES.NEW: {
                    const argCount = this._readUint8(thread);
                    const frameSize = argCount + 1;
                    const callFrame = thread.stack.splice(thread.stack.length - frameSize);
                    const constructorPtr = callFrame[0];
                    const args = callFrame.slice(1);
                    
                    let Constructor;
                    if (typeof constructorPtr === 'function') {
                        Constructor = constructorPtr;
                    } else {
                        Constructor = this.memory.get(constructorPtr);
                    }

                    if (typeof Constructor === 'function') {
                        try {
                            const instance = Reflect.construct(Constructor, args);
                            thread.stack.push(instance);
                        } catch (e) {
                            this._handleInterrupt(thread, `Instantiation Error: ${e.message}`);
                        }
                    } else {
                        if (!Constructor || !Constructor.bytecode) {
                            this._handleInterrupt(thread, "Type Error: Constructor is not a function.");
                            break;
                        }
                        const instancePtr = this.memory.allocate({});
                        const instanceObj = this.memory.get(instancePtr);
                        if (Constructor.prototypePtr) {
                            const protoObj = this.memory.get(Constructor.prototypePtr);
                            if (protoObj) Object.setPrototypeOf(instanceObj, protoObj);
                        }
                        thread.frames.push({
                            returnIP: thread.ip,
                            prevBP: thread.bp,
                            prevStack: thread.stack,
                            code: thread.code,
                            constants: thread.constants,
                            isConstructorCall: true,
                            instancePtr: instancePtr,
                            prevScopePtr: thread.scopePtr
                        });
                        if (Constructor.moduleScopePtr) thread.scopePtr = Constructor.moduleScopePtr;
                        thread.stack = [instancePtr, ...args];
                        thread.bp = 1;
                        thread.code = Constructor.bytecode;
                        thread.constants = Constructor.constants;
                        thread.ip = 0;
                    }
                    break;
                }
                case OPCODES.NOP: break;
                case OPCODES.HALT: thread.status = VM_THREAD_STATUS.COMPLETED; break;
                case OPCODES.JUMP: thread.ip += this._readInt16(thread); break;
                case OPCODES.JUMP_IF_FALSE: {
                    const offset = this._readInt16(thread);
                    if (!thread.stack.pop()) thread.ip += offset;
                    break;
                }
                case OPCODES.JUMP_IF_TRUE: {
                    const offset = this._readInt16(thread);
                    if (thread.stack.pop()) thread.ip += offset;
                    break;
                }
                case OPCODES.JUMP_IF_FALSE_PERSIST: {
                    const offset = this._readInt16(thread);
                    if (!thread.stack[thread.stack.length - 1]) thread.ip += offset;
                    break;
                }
                case OPCODES.JUMP_IF_TRUE_PERSIST: {
                    const offset = this._readInt16(thread);
                    if (thread.stack[thread.stack.length - 1]) thread.ip += offset;
                    break;
                }
                case OPCODES.RETURN: {
                    const result = thread.stack.pop();
                    if (thread.frames.length === 0) {
                        thread.status = VM_THREAD_STATUS.COMPLETED;
                        thread.stack.push(result);
                    } else {
                        const frame = thread.frames.pop();
                        thread.ip = frame.returnIP;
                        thread.bp = frame.prevBP;
                        thread.stack = frame.prevStack;
                        thread.code = frame.code;
                        thread.constants = frame.constants;
                        if (frame.prevScopePtr !== undefined) thread.scopePtr = frame.prevScopePtr;
                        let finalResult = result;
                        if (frame.isConstructorCall) {
                            if (typeof result !== 'object' || result === null) finalResult = frame.instancePtr;
                        }
                        thread.stack.push(finalResult);
                    }
                    break;
                }
                case OPCODES.POP: thread.stack.pop(); break;
                case OPCODES.DUP: thread.stack.push(thread.stack[thread.stack.length - 1]); break;
                case OPCODES.PUSH_CONST: thread.stack.push(thread.constants[this._readInt16(thread)]); break;
                case OPCODES.PUSH_UNDEFINED: thread.stack.push(undefined); break;
                case OPCODES.PUSH_NULL: thread.stack.push(null); break;
                case OPCODES.PUSH_TRUE: thread.stack.push(true); break;
                case OPCODES.PUSH_FALSE: thread.stack.push(false); break;
                case OPCODES.LOAD_LOCAL: thread.stack.push(thread.stack[thread.bp + this._readUint8(thread)]); break;
                case OPCODES.STORE_LOCAL: thread.stack[thread.bp + this._readUint8(thread)] = thread.stack.pop(); break;
                case OPCODES.LOAD_UPVALUE: {
                    const depth = this._readUint8(thread);
                    const idx = this._readUint8(thread);
                    const frame = thread.frames[thread.frames.length - depth];
                    thread.stack.push(frame.prevStack[frame.prevBP + idx]);
                    break;
                }
                case OPCODES.STORE_UPVALUE: {
                    const depth = this._readUint8(thread);
                    const idx = this._readUint8(thread);
                    const frame = thread.frames[thread.frames.length - depth];
                    frame.prevStack[frame.prevBP + idx] = thread.stack.pop();
                    break;
                }
                case OPCODES.LOAD_GLOBAL: {
                    const name = thread.constants[this._readInt16(thread)];
                    let val = undefined, found = false;
                    if (thread.scopePtr) { 
                        const moduleScope = this.memory.get(thread.scopePtr);
                        if (moduleScope && name in moduleScope) { val = moduleScope[name]; found = true; }
                    }
                    if (!found) {
                        const globalScope = this.memory.get(1);
                        if (globalScope && name in globalScope) { val = globalScope[name]; found = true; }
                    }
                    if (!found && name in this.hostContext) { val = this.hostContext[name]; found = true; }
                    if (!found) console.warn(`[VM] '${name}' undefined.`);
                    thread.stack.push(val);
                    break;
                }
                case OPCODES.STORE_GLOBAL: {
                    const name = thread.constants[this._readInt16(thread)];
                    const val = thread.stack.pop();
                    const ptr = thread.scopePtr || 1;
                    const scope = this.memory.get(ptr);
                    scope[name] = val;
                    this.memory.set(ptr, scope);
                    break;
                }
                case OPCODES.ALLOC_ARRAY: thread.stack.push(this.memory.allocate([])); break;
                case OPCODES.ALLOC_OBJECT: thread.stack.push(this.memory.allocate({})); break;
                case OPCODES.GET_PROP: {
                    const key = thread.stack.pop();
                    const objPtr = thread.stack.pop();
                    let resultVal;
                    if ((typeof objPtr === 'object' && objPtr !== null) || typeof objPtr === 'function') {
                        const val = objPtr[key];
                        resultVal = (typeof val === 'function') ? val.bind(objPtr) : val;
                    } else {
                        try {
                            const obj = this.memory.get(objPtr);
                            resultVal = obj[key];
                        } catch (e) {
                            if (e.type === "PRIMITIVE_ACCESS") {
                                const val = Object(objPtr)[key];
                                resultVal = (typeof val === 'function') ? val.bind(objPtr) : val;
                            } else throw e;
                        }
                    }
                    thread.stack.push(resultVal);
                    break;
                }
                case OPCODES.SET_PROP: {
                    const val = thread.stack.pop(); 
                    const key = thread.stack.pop(); 
                    const objPtr = thread.stack.pop(); 
                    if ((typeof objPtr === 'object' && objPtr !== null) || typeof objPtr === 'function') {
                        objPtr[key] = val;
                    } else {
                        const obj = this.memory.get(objPtr);
                        obj[key] = val;
                        this.memory.set(objPtr, obj);
                    }
                    thread.stack.push(val);
                    break;
                }
                case OPCODES.ADD: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a + b); break; }
                case OPCODES.SUB: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a - b); break; }
                case OPCODES.MUL: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a * b); break; }
                case OPCODES.DIV: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a / b); break; }
                case OPCODES.MOD: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a % b); break; }
                case OPCODES.POW: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a ** b); break; }
                case OPCODES.EQ:  { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a == b); break; }
                case OPCODES.STRICT_EQ: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a === b); break; }
                case OPCODES.LT:  { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a < b); break; }
                case OPCODES.GT:  { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a > b); break; }
                case OPCODES.CLOSURE: {
                    const template = thread.constants[this._readInt16(thread)];
                    const ptr = this.memory.allocate({
                        type: 'CLOSURE', name: template.name, bytecode: template.bytecode, constants: template.constants,
                        capturedEnvironment: [...thread.frames, { prevStack: [...thread.stack], prevBP: thread.bp }],
                        moduleScopePtr: thread.scopePtr
                    });
                    thread.stack.push(ptr);
                    break;
                }
                case OPCODES.CALL: {
                    const argCount = this._readUint8(thread);
                    const frameSize = argCount + 2;
                    const prevStack = thread.stack.slice(0, thread.stack.length - frameSize);
                    const callFrame = thread.stack.splice(thread.stack.length - frameSize);
                    const funcPtr = callFrame[0];
                    const thisVal = callFrame[1];
                    const args = callFrame.slice(2);
                    
                    let funcObj;
                    if (typeof funcPtr === 'function') funcObj = funcPtr;
                    else {
                        try { funcObj = this.memory.get(funcPtr); } 
                        catch (e) { if (e.type === "PRIMITIVE_ACCESS") break; else throw e; }
                    }

                    if (typeof funcObj === 'function') {
                        try {
                            const marshalledArgs = args.map(arg => {
                                if (Number.isInteger(arg) && arg > 0 && arg < this.memory.nextPtr && this.memory.ram.has(arg)) {
                                    const obj = this.memory.ram.get(arg);
                                    if (obj && obj.type === 'CLOSURE') return this._createHostProxy(arg);
                                }
                                return arg;
                            });
                            const res = funcObj.apply(thisVal, marshalledArgs);
                            thread.stack = prevStack;
                            if (res && typeof res.then === 'function') {
                                thread.status = VM_THREAD_STATUS.BLOCKED_ASYNC;
                                res.then(val => { thread.stack.push(val); thread.status = VM_THREAD_STATUS.RUNNING; })
                                   .catch(err => this._handleInterrupt(thread, err));
                            } else thread.stack.push(res);
                        } catch (e) { this._handleInterrupt(thread, `Host Error: ${e.message}`); }
                    } else if (funcObj && funcObj.bytecode) {
                        thread.frames.push({
                            returnIP: thread.ip, prevBP: thread.bp, prevStack: prevStack, 
                            code: thread.code, constants: thread.constants, prevScopePtr: thread.scopePtr
                        });
                        if (funcObj.moduleScopePtr) thread.scopePtr = funcObj.moduleScopePtr;
                        thread.stack = [thisVal, ...args];
                        thread.bp = 1; 
                        thread.code = funcObj.bytecode;
                        thread.constants = funcObj.constants;
                        thread.ip = 0;
                    }
                    break;
                }
                case OPCODES.AWAIT: {
                    const promise = thread.stack.pop();
                    if (promise && typeof promise.then === 'function') {
                        thread.status = VM_THREAD_STATUS.BLOCKED_ASYNC;
                        promise.then(result => { thread.stack.push(result); thread.status = VM_THREAD_STATUS.RUNNING; })
                               .catch(err => this._handleInterrupt(thread, err));
                    } else thread.stack.push(promise);
                    break;
                }
                case OPCODES.SYSCALL: {
                    const id = this._readUint8(thread);
                    const argCount = this._readUint8(thread);
                    const args = [];
                    for(let i=0; i<argCount; i++) args.unshift(thread.stack.pop());
                    if (this.hostAPI[id]) {
                        const res = this.hostAPI[id](...args);
                        if (res && typeof res.then === 'function') {
                            thread.status = VM_THREAD_STATUS.BLOCKED_ASYNC;
                            res.then(val => { thread.stack.push(val); thread.status = VM_THREAD_STATUS.RUNNING; })
                               .catch(err => this._handleInterrupt(thread, err));
                        } else thread.stack.push(res);
                    }
                    break;
                }
                case OPCODES.TYPEOF: thread.stack.push(typeof thread.stack.pop()); break;
                case OPCODES.NOT: thread.stack.push(!thread.stack.pop()); break;
                case OPCODES.VOID: thread.stack.pop(); thread.stack.push(undefined); break;
                case OPCODES.THROW: throw new Error(thread.stack.pop()); 
                default: break;
            }
        }

        _handleInterrupt(thread, error) {
            if (isPageFault(error)) {
                thread.ip = thread.currentStartIP; // RESET IP TO START OF INSTRUCTION
                thread.status = VM_THREAD_STATUS.WAITING_FOR_PAGE;
                this.memory.resolveFault(error.ptr).then(success => {
                    if (success) thread.status = VM_THREAD_STATUS.RUNNING;
                    else this._handleInterrupt(thread, "Segfault: Disk read error.");
                });
                return;
            }

            if (thread.catchStack.length > 0) {
                const handler = thread.catchStack.pop();
                thread.ip = handler.catchIP;
                while (thread.stack.length > handler.stackSize) thread.stack.pop();
                thread.errorRegister = error.message || error;
            } else {
                console.error(`[VM] Thread #${thread.id} Crash:`, error);
                thread.status = VM_THREAD_STATUS.CRASHED;
            }
        }

        _readUint8(thread) { return thread.code[thread.ip++]; }
        _readInt16(thread) {
            const low = thread.code[thread.ip++];
            const high = thread.code[thread.ip++];
            const unsigned = (high << 8) | low;
            return unsigned >= 0x8000 ? unsigned - 0x10000 : unsigned;
        }
    }

    return MerkavaVM;
}));