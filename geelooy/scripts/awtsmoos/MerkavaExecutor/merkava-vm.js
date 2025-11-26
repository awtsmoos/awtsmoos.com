// B"H
/**
 * @file merkava-vm.js
 * @version 1.0.0 - The Engine of Creation
 * @description
 * The Core Virtual Machine.
 *
 * This is a Stack-Based, Bytecode-Interpreted VM with Green Thread scheduling.
 * It implements the "De-Asyncing" logic to make asynchronous operations appear
 * blocking to the guest code, while remaining non-blocking to the host browser.
 *
 * FEATURES:
 * 1. **Green Threads**: Supports multiple concurrent execution contexts.
 * 2. **Scheduler**: Round-robin execution with time-slicing.
 * 3. **Virtual Memory**: Integrates with MerkavaMemory to handle Page Faults transparently.
 * 4. **Custom Atomics**: Software-level locking mechanisms.
 */

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = factory(
            require('./merkava-opcodes.js'),
            require('./merkava-memory.js')
        );
    } else {
        // Browser globals
        root.MerkavaVM = factory(root.MerkavaOpcodes, root.MerkavaMemory);
    }
}(typeof self !== 'undefined' ? self : this, function(OpcodesModule, MemoryModule) {

    const { OPCODES, VM_THREAD_STATUS, INTERRUPTS } = OpcodesModule;
    const { isPageFault } = MemoryModule;

    /**
     * @class Thread
     * @description Represents a single flow of execution (Green Thread).
     */
    class Thread {
        constructor(id, codeObject, memory) {
            this.id = id;
            this.status = VM_THREAD_STATUS.RUNNING;
            
            
            
            // Registers
            this.ip = 0; // Instruction Pointer
            this.bp = 0; // Base Pointer (start of current frame's locals)
            this.sp = 0; // Stack Pointer (points to next empty slot, conceptually)
            
            // Memory & Code
            this.stack = []; // The Data Stack
            this.frames = []; // The Call Stack (Return addresses)
            this.code = codeObject.bytecode; // Uint8Array
            this.constants = codeObject.constants; // Array
            
            // Scope management
            this.scope = null; // Pointer to current environment scope in Memory
        
	        this.catchStack = [];
            this.errorRegister = null;
        }
    }

    /**
     * @class MerkavaVM
     * @description The Orchestrator. Manages threads, memory, and the execution loop.
     */
    class MerkavaVM {
        /**
         * @param {MemoryManager} memoryManager - The VMM instance.
         * @param {object} hostAPI - Map of functions available via SYSCALL.
         */
        constructor(memoryManager, hostAPI = {}, hostContext = {}) {
            this.memory = memoryManager;
            this.hostAPI = hostAPI;
            this.hostContext = hostContext;
            
            this.threads = [];
            this.activeThreadIndex = 0;
            this.threadIdCounter = 1;
            
            // Atomics Wait Queue: Map<Address, Array<ThreadID>>
            this.atomicsWaitMap = new Map();
            
            // Debugging hooks
            this.onStep = null; // fn(thread, opcode)
        }

        /**
         * Create a new thread from a compiled CodeObject.
         * @param {object} codeObject - Output from MerkavaCompiler.
         */
        spawn(codeObject, scopePtr = null) {
            const thread = new Thread(this.threadIdCounter++, codeObject, this.memory);
            
            // Inject Scope
            thread.scopePtr = scopePtr;
            
            this.threads.push(thread);
            console.log(`[VM] Spawned Thread #${thread.id} in Scope ${scopePtr}`);
            if (this.onThreadSpawn) this.onThreadSpawn(thread.id);
            return thread.id;
        }
        
        
        /**
         * B"H - Creates a Native Bridge Function.
         * Hydrates environment, aligns stack, AND WAKES UP THE VM.
         */
        _createHostProxy(closurePtr) {
            const vm = this;
            const closure = this.memory.get(closurePtr);
            
            return function(...hostArgs) {
                const threadId = vm.threadIdCounter++;
                const inheritedFrames = closure.capturedEnvironment ? [...closure.capturedEnvironment] : [];

                const newThread = {
                    id: threadId,
                    status: 0, 
                    ip: 0,
                    bp: 1,
                    sp: 0,
                    stack: [undefined, ...hostArgs], 
                    frames: inheritedFrames, 
                    code: closure.bytecode,
                    constants: closure.constants,
                    
                    // B"H - PERSIST MODULE SCOPE
                    scopePtr: closure.moduleScopePtr || null, 
                    
                    catchStack: [],
                    errorRegister: null
                };
                
                vm.threads.push(newThread);
                if (vm.onThreadSpawn) vm.onThreadSpawn(threadId);
            };
        }

        /**
         * The Main Execution Loop.
         * Call this via `requestAnimationFrame` or `setImmediate` loop.
         * @param {number} cycles - Number of instructions to execute before yielding.
         */
        run(cycles = 1000) {
            let cyclesRun = 0;
            let idlePasses = 0; // B"H - Detect if all threads are sleeping

            while (cyclesRun < cycles && this.threads.length > 0) {
                // Scheduler: Round Robin
                this.activeThreadIndex = (this.activeThreadIndex + 1) % this.threads.length;
                const thread = this.threads[this.activeThreadIndex];

                // Cleanup dead threads
                if (thread.status === VM_THREAD_STATUS.COMPLETED || 
                    thread.status === VM_THREAD_STATUS.CRASHED) {
                    this.threads.splice(this.activeThreadIndex, 1);
                    this.activeThreadIndex--; // Adjust index
                    // Reset idle counter because thread list changed
                    idlePasses = 0;
                    continue;
                }

                // Check blocked status
                if (thread.status !== VM_THREAD_STATUS.RUNNING) {
                    idlePasses++;
                    // B"H - If we have checked every thread and ALL are blocked, 
                    // we must YIELD to the browser event loop to let Promises resolve.
                    if (idlePasses >= this.threads.length) {
                        break; // Exit the loop for this frame
                    }
                    continue;
                }

                // If we found a runnable thread, reset idle counter
                idlePasses = 0;

                try {
                    this._step(thread);
                    cyclesRun++;
                } catch (e) {
                    this._handleInterrupt(thread, e);
                }
            }
            
            // Return true if we still have threads (alive), so the SDK keeps ticking
            return this.threads.length > 0;
        }

        /**
         * Execute a single instruction for a thread.
         * @private
         */
        _step(thread) {
            // B"H - GUARD: Prevent crash if thread code is missing or corrupted.
            // This fixes the "Cannot read properties of undefined (reading 'length')" error.
            if (!thread.code || thread.ip >= thread.code.length) {
                thread.status = VM_THREAD_STATUS.COMPLETED;
                return;
            }
            
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
	        // --- B"H - THE FINAL OPCODES ---
		case OPCODES.PUSH_THIS: {
                    // The 'this' value is at the base of the current function's stack (index 0).
                    const thisVal = thread.stack[0];
                    thread.stack.push(thisVal);
                    break;
                }
                case OPCODES.SET_PROTOTYPE: {
                    // Stack: [Constructor Ptr, Prototype Ptr]
                    const protoPtr = thread.stack.pop();
                    const ctorPtr = thread.stack.pop();
                    
                    // Get the actual closure object for the constructor
                    const ctorClosure = this.memory.get(ctorPtr);
                    
                    // B"H - Store a reference to the prototype directly on the closure object.
                    ctorClosure.prototypePtr = protoPtr;
                    
                    // Mark the constructor object as modified
                    this.memory.set(ctorPtr, ctorClosure);
                    
                    // Push the constructor back onto the stack, as the class expression resolves to the constructor.
                    thread.stack.push(ctorPtr);
                    break;
                }

                // --- Error Handling ---
                case OPCODES.ENTER_TRY: {
                    const catchOffset = this._readInt16(thread);
                    const finallyOffset = this._readInt16(thread); // Consumes 2 more bytes
                    
                    thread.catchStack.push({
                        // B"H - Fix Offset: The compiler calculated the jump based on a 3-byte instruction.
                        // We have advanced 2 extra bytes reading 'finallyOffset', so we are 2 bytes ahead.
                        // Subtract 2 to align with the compiler's target.
                        catchIP: (thread.ip - 2) + catchOffset,
                        stackSize: thread.stack.length 
                    });
                    break;
                }
                case OPCODES.EXIT_TRY: {
                    thread.catchStack.pop();
                    break;
                }
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
                    
                    if (constructorPtr === undefined || constructorPtr === null) {
                        this._handleInterrupt(thread, "TypeError: Constructor is undefined or null.");
                        break;
                    }
                    
                    let Constructor = (typeof constructorPtr === 'function') ? constructorPtr : this.memory.get(constructorPtr);

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
                            // B"H - SAVE SCOPE STATE
                            prevScopePtr: thread.scopePtr
                        });

                        // B"H - CONTEXT SWITCH
                        if (Constructor.moduleScopePtr) {
                            thread.scopePtr = Constructor.moduleScopePtr;
                        }

                        thread.stack = [instancePtr, ...args];
                        thread.bp = 1;
                        thread.code = Constructor.bytecode;
                        thread.constants = Constructor.constants;
                        thread.ip = 0;
                    }
                    break;
                }
                // --- 0x00: CONTROL FLOW ---
                case OPCODES.NOP: break;
                
                case OPCODES.HALT:
                    thread.status = VM_THREAD_STATUS.COMPLETED;
                    break;

                case OPCODES.JUMP: {
                    const offset = this._readInt16(thread);
                    thread.ip += offset; // Relative jump
                    break;
                }

                case OPCODES.JUMP_IF_FALSE: {
                    const offset = this._readInt16(thread);
                    const condition = thread.stack.pop();
                    if (!condition) thread.ip += offset;
                    break;
                }
                
                case OPCODES.JUMP_IF_TRUE: {
                    const offset = this._readInt16(thread);
                    const condition = thread.stack.pop();
                    if (condition) thread.ip += offset;
                    break;
                }
                
                // B"H - MISSING OPCODES RESTORED (0x06 & 0x07)
                // These allow '&&' and '||' to short-circuit correctly.
                case OPCODES.JUMP_IF_FALSE_PERSIST: {
                    const offset = this._readInt16(thread);
                    // Peek at the top value (do NOT pop)
                    const condition = thread.stack[thread.stack.length - 1];
                    // If false, jump (and keep the false value as the result)
                    if (!condition) thread.ip += offset;
                    break;
                }
                
                case OPCODES.JUMP_IF_TRUE_PERSIST: {
                    const offset = this._readInt16(thread);
                    // Peek at the top value (do NOT pop)
                    const condition = thread.stack[thread.stack.length - 1];
                    // If true, jump (and keep the true value as the result)
                    if (condition) thread.ip += offset;
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
                        
                        // B"H - RESTORE SCOPE
                        // We return to the world of the caller.
                        if (frame.prevScopePtr !== undefined) {
                            thread.scopePtr = frame.prevScopePtr;
                        }

                        let finalResult = result;
                        if (frame.isConstructorCall) {
                            if (typeof result !== 'object' || result === null) {
                                finalResult = frame.instancePtr;
                            }
                        }
                        thread.stack.push(finalResult);
                    }
                    break;
                }
        

                // --- 0x10: STACK ---
                case OPCODES.POP: thread.stack.pop(); break;
                case OPCODES.DUP: thread.stack.push(thread.stack[thread.stack.length - 1]); break;
                
                case OPCODES.PUSH_CONST: {
                    const idx = this._readInt16(thread);
                    thread.stack.push(thread.constants[idx]);
                    break;
                }
                
                case OPCODES.PUSH_UNDEFINED: thread.stack.push(undefined); break;
                case OPCODES.PUSH_NULL: thread.stack.push(null); break;
                case OPCODES.PUSH_TRUE: thread.stack.push(true); break;
                case OPCODES.PUSH_FALSE: thread.stack.push(false); break;

                // --- 0x20: VARIABLES (The Complex Part) ---
                case OPCODES.LOAD_LOCAL: {
                    const idx = this._readUint8(thread);
                    // Locals are on the stack, relative to BP
                    const val = thread.stack[thread.bp + idx];
                    thread.stack.push(val);
                    break;
                }

                case OPCODES.STORE_LOCAL: {
                    const idx = this._readUint8(thread);
                    const val = thread.stack.pop();
                    thread.stack[thread.bp + idx] = val;
                    break;
                }
                
                case OPCODES.LOAD_UPVALUE: {
                    const depth = this._readUint8(thread);
                    const idx = this._readUint8(thread);
                    
                    const frameIndex = thread.frames.length - depth;
                    if (frameIndex < 0) throw new Error(`[VM] Upvalue access out of bounds`);
                    
                    const frame = thread.frames[frameIndex];
                    const val = frame.prevStack[frame.prevBP + idx];
                    
                    if (val === undefined) {
                        console.warn(`[VM WARNING] Upvalue at Depth ${depth}, Idx ${idx} is UNDEFINED. (Thread #${thread.id})`);
                    }
                    
                    thread.stack.push(val);
                    break;
                }

                case OPCODES.STORE_UPVALUE: {
                    const depth = this._readUint8(thread);
                    const idx = this._readUint8(thread);
                    const val = thread.stack.pop();
                    
                    const frameIndex = thread.frames.length - depth;
                    if (frameIndex < 0) throw new Error("[VM] Upvalue store out of bounds");
                    
                    const frame = thread.frames[frameIndex];
                    // Update the value in the parent's stack snapshot
                    frame.prevStack[frame.prevBP + idx] = val;
                    break;
                }

                case OPCODES.LOAD_GLOBAL: {
                    const nameIdx = this._readInt16(thread);
                    const name = thread.constants[nameIdx];
                    
                    let val = undefined;
                    let found = false;
                    
                    // 1. Try Module Scope
                    if (thread.scopePtr) { 
                        const moduleScope = this.memory.get(thread.scopePtr);
                        if (moduleScope && name in moduleScope) {
                            val = moduleScope[name];
                            found = true;
                        }
                    }
                    
                    // 2. Try Universal Global
                    if (!found) {
                        const globalScope = this.memory.get(1);
                        if (globalScope && name in globalScope) {
                            val = globalScope[name];
                            found = true;
                        }
                    }
                    
                    // 3. Try Host Context
                    if (!found && name in this.hostContext) {
                        val = this.hostContext[name];
                        found = true;
                    }
                    
                    if (!found) {
                        // B"H - SILENT FAIL-SAFE FOR DEVELOPMENT
                        // Instead of crashing the thread, we push undefined and warn.
                        // This allows feature detection code to run (e.g. if (typeof x !== 'undefined'))
                        console.warn(`[VM WARNING] ReferenceError: '${name}' not found in any scope. Returning undefined.`);
                        val = undefined; 
                        // Uncomment below to enforce strict mode:
                        // throw new Error(`ReferenceError: ${name} is not defined`);
                    }
                    
                    thread.stack.push(val);
                    break;
                }

                case OPCODES.STORE_GLOBAL: {
                    const nameIdx = this._readInt16(thread);
                    const name = thread.constants[nameIdx];
                    const val = thread.stack.pop();
                    
                    // B"H - PREFER MODULE SCOPE FOR WRITES
                    if (thread.scopePtr) {
                        const moduleScope = this.memory.get(thread.scopePtr);
                        moduleScope[name] = val;
                        this.memory.set(thread.scopePtr, moduleScope);
                    } else {
                        // Fallback to Ptr 1 (True Global)
                        const globalScope = this.memory.get(1);
                        globalScope[name] = val;
                        this.memory.set(1, globalScope);
                    }
                    break;
                }
                

                // --- 0x30: OBJECTS ---
                
                case OPCODES.ALLOC_ARRAY: {
                    const ptr = this.memory.allocate([]); // B"H - Allocate empty JS Array
                    thread.stack.push(ptr);
                    break;
                }
                
                
                case OPCODES.ALLOC_OBJECT: {
                    const ptr = this.memory.allocate({});
                    thread.stack.push(ptr); // Pushing Pointer
                    break;
                }

                
                
                
                
                
                case OPCODES.GET_PROP: {
                    const key = thread.stack.pop();
                    const objPtr = thread.stack.pop();
                    
                    // Safe key stringification for logs
                    const keyStr = typeof key === 'symbol' ? String(key) : key;

                    if (objPtr === undefined || objPtr === null) {
                        console.error(`[VM] GET_PROP Error: Target is ${objPtr}, Key is '${keyStr}'`);
                        this._handleInterrupt(thread, `TypeError: Cannot read property '${keyStr}' of ${objPtr}`);
                        break;
                    }

                    let resultVal;

                    if ((typeof objPtr === 'object' && objPtr !== null) || typeof objPtr === 'function') {
                        const val = objPtr[key];
                        if (typeof val === 'function') resultVal = val.bind(objPtr);
                        else resultVal = val;
                    } 
                    else {
                        try {
                            const obj = this.memory.get(objPtr); 
                            resultVal = obj[key];
                        } catch (e) {
                            if (e.type === "PRIMITIVE_ACCESS") {
                                const wrapper = Object(objPtr);
                                const val = wrapper[key];
                                if (typeof val === 'function') resultVal = val.bind(objPtr);
                                else resultVal = val;
                            } else {
                                throw e;
                            }
                        }
                    }
                    
                    // Silent or limited tracing to avoid log spam/crashes
                    if (resultVal === undefined && key !== 'prototype') {
                       // console.warn(`[VM TRACE] GET_PROP '${keyStr}' returned UNDEFINED. Obj:`, objPtr);
                    }

                    thread.stack.push(resultVal);
                    break;
                }

                case OPCODES.SET_PROP: {
                    const val = thread.stack.pop(); 
                    const key = thread.stack.pop(); 
                    const objPtr = thread.stack.pop(); 
                    
                    if (objPtr === undefined || objPtr === null) {
                        this._handleInterrupt(thread, `TypeError: Cannot set property '${key}' of ${objPtr}`);
                        break;
                    }

                    // Host Object (e.g. Window, Canvas)
                    if ((typeof objPtr === 'object' && objPtr !== null) || typeof objPtr === 'function') {
                        try {
                            objPtr[key] = val;
                        } catch(e) {
                            console.warn(`[VM] Failed to set host prop ${key}:`, e);
                        }
                        thread.stack.push(val);
                    } else {
                        // VM Memory Object
                        const obj = this.memory.get(objPtr);
                        obj[key] = val;
                        this.memory.set(objPtr, obj);
                        thread.stack.push(val);
                    }
                    break;
                }

                case OPCODES.DEFINE_PROP: {
                    // Stack: [ClassPrototype, Key, Value]
                    const val = thread.stack.pop();
                    const key = thread.stack.pop();
                    const objPtr = thread.stack.pop();
                    
                    // Define property on the prototype/object (similar to SET_PROP but for definitions)
                    if ((typeof objPtr === 'object' && objPtr !== null) || typeof objPtr === 'function') {
                        objPtr[key] = val;
                    } else {
                        const obj = this.memory.get(objPtr);
                        obj[key] = val;
                        this.memory.set(objPtr, obj);
                    }
                    // Unlike SET_PROP, DEFINE usually doesn't push the result back, but let's check stack balance.
                    // If compiler expects it to behave like expression, push val. If statement, don't.
                    // For safety in this version, we assume it consumes and returns nothing (void).
                    break; 
                }

                // --- 0x40: BINARY OPS ---
                case OPCODES.ADD: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a + b); break; }
                case OPCODES.SUB: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a - b); break; }
                case OPCODES.MUL: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a * b); break; }
                case OPCODES.DIV: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a / b); break; }
                
                // B"H 
                //MATH & BITWISE OPCODES ADDED HERE
                case OPCODES.MOD: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a % b); break; }
                case OPCODES.POW: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a ** b); break; }
                
                case OPCODES.BIT_AND: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a & b); break; }
                case OPCODES.BIT_OR:  { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a | b); break; }
                case OPCODES.BIT_XOR: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a ^ b); break; }
                case OPCODES.SHL:     { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a << b); break; }
                case OPCODES.SHR:     { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a >> b); break; }
                case OPCODES.USHR:    { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a >>> b); break; }
                
                
                case OPCODES.EQ:  { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a == b); break; }
                case OPCODES.STRICT_EQ: { 
                    const b = thread.stack.pop(); 
                    const a = thread.stack.pop(); 
                    thread.stack.push(a === b); 
                    break; 
                }
                case OPCODES.STRICT_NEQ: { 
                    const b = thread.stack.pop(); 
                    const a = thread.stack.pop(); 
                    thread.stack.push(a !== b); 
                    break; 
                }
                
                case OPCODES.LT:  { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a < b); break; }
                case OPCODES.LTE: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a <= b); break; }
                case OPCODES.GT:  { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a > b); break; }
                case OPCODES.GTE: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a >= b); break; }
                case OPCODES.NEQ: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a != b); break; }
                
                case OPCODES.INSTANCEOF: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a instanceof b); break; }
		case OPCODES.IN:         { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a in b); break; }


                // --- 0x70: FUNCTIONS ---
                case OPCODES.CLOSURE: {
                    const templateIdx = this._readInt16(thread);
                    const template = thread.constants[templateIdx];
                    
                    const currentEnv = {
                        prevStack: [...thread.stack],
                        prevBP: thread.bp
                    };
                    
                    const closure = {
                        type: 'CLOSURE',
                        name: template.name,
                        bytecode: template.bytecode,
                        constants: template.constants,
                        capturedEnvironment: [...thread.frames, currentEnv],
                        
                        // B"H - CAPTURE MODULE CONTEXT
                        moduleScopePtr: thread.scopePtr
                    };
                    
                    const ptr = this.memory.allocate(closure);
                    thread.stack.push(ptr);
                    break;
                }

                case OPCODES.CALL: {
                    const argCount = this._readUint8(thread);
                    const frameSize = argCount + 2;
                    
                    if (thread.stack.length < frameSize) {
                        this._handleInterrupt(thread, "Stack Underflow on CALL");
                        break;
                    }

                    const prevStack = thread.stack.slice(0, thread.stack.length - frameSize);
                    const callFrame = thread.stack.splice(thread.stack.length - frameSize);
                    
                    const funcPtr = callFrame[0];
                    const thisVal = callFrame[1];
                    const args = callFrame.slice(2);
                    
                    if (funcPtr === undefined) {
                        console.error("[VM FATAL] CALL opcode invoked on undefined!");
                        console.error("Thread ID:", thread.id);
                        console.error("Stack Snapshot:", callFrame);
                        // Trace execution to console to find previous instruction
                        this._handleInterrupt(thread, "TypeError: Object is not a function (undefined).");
                        break;
                    }
                    
                    if (funcPtr === undefined) {
                        console.error(`[VM CRITICAL] Attempting to CALL undefined! Stack Size: ${prevStack.length}. Arg Count: ${argCount}.`);
                        // This usually means the previous LOAD instruction pushed undefined.
                    }
                    
                    if (funcPtr === undefined || funcPtr === null) {
                        this._handleInterrupt(thread, "TypeError: Object is not a function (undefined).");
                        break;
                    }
                    
                    let funcObj;
                    // B"H - Robust Resolution
                    if (typeof funcPtr === 'function') {
                        funcObj = funcPtr;
                    } else {
                        try {
                            funcObj = this.memory.get(funcPtr);
                        } catch (e) {
                            if (e.type === "PRIMITIVE_ACCESS") {
                                // Calling a number? 808() -> Error.
                                // But what if funcPtr is the function from property access on a number?
                                // e.g. (10).toString()
                                // In that case funcPtr IS 'function toString() { [native code] }' which is handled above.
                                // If we are here, funcPtr is literally the number 808.
                                this._handleInterrupt(thread, `TypeError: ${funcPtr} is not a function.`);
                                break;
                            }
                            throw e;
                        }
                    }

                    if (typeof funcObj === 'function') {
                        // ... Host Logic (same as existing) ...
                        try {
                            const marshalledArgs = args.map(arg => {
                                if (typeof arg === 'number' && Number.isInteger(arg) && arg > 0) {
                                    // Only marshal pointers that are WITHIN bounds (allocated objects)
                                    // Primitives pass through as numbers.
                                    if (arg < this.memory.nextPtr && this.memory.ram.has(arg)) {
                                        const obj = this.memory.ram.get(arg);
                                        if (obj && obj.type === 'CLOSURE') return this._createHostProxy(arg);
                                    }
                                }
                                return arg;
                            });
                            
                            const res = funcObj.apply(thisVal, marshalledArgs);
                            thread.stack = prevStack;
                            
                            if (res && typeof res.then === 'function') {
                                thread.status = VM_THREAD_STATUS.BLOCKED_ASYNC;
                                res.then(val => {
                                    thread.stack.push(val);
                                    thread.status = VM_THREAD_STATUS.RUNNING;
                                }).catch(err => this._handleInterrupt(thread, err));
                            } else {
                                thread.stack.push(res);
                            }
                        } catch (e) {
                            this._handleInterrupt(thread, `Host Function Error: ${e.message}`);
                        }
                    } else {
                        // ... Closure Logic (same as existing) ...
                        if (!funcObj || !funcObj.bytecode) {
                             this._handleInterrupt(thread, `Type Error: Object at ptr ${funcPtr} is not a function.`);
                             break;
                        }
                        
                        thread.frames.push({
                            returnIP: thread.ip,
                            prevBP: thread.bp,
                            prevStack: prevStack, 
                            code: thread.code, 
                            constants: thread.constants,
                            prevScopePtr: thread.scopePtr
                        });

                        if (funcObj.moduleScopePtr) {
                            thread.scopePtr = funcObj.moduleScopePtr;
                        }

                        thread.stack = [thisVal, ...args];
                        thread.bp = 1; 
                        thread.code = funcObj.bytecode;
                        thread.constants = funcObj.constants;
                        thread.ip = 0;
                    }
                    break;
                }
                
                

                // --- 0x80: ASYNC / ATOMICS ---
                case OPCODES.AWAIT: {
                    const promise = thread.stack.pop();
                    
                    if (promise && typeof promise.then === 'function') {
                        thread.status = VM_THREAD_STATUS.BLOCKED_ASYNC;
                        
                        promise.then(result => {
                            thread.stack.push(result);
                            thread.status = VM_THREAD_STATUS.RUNNING;
                        }).catch(err => {
                            // B"H - Route Async Errors to the central Interrupt Handler
                            // We must use an arrow function to preserve 'this'
                            this._handleInterrupt(thread, err); 
                        });
                    } else {
                        thread.stack.push(promise);
                    }
                    break;
                }

                case OPCODES.ATOMIC_WAIT: {
                    // [Addr, Index, Val, Timeout]
                    const timeout = thread.stack.pop();
                    const expect = thread.stack.pop();
                    const index = thread.stack.pop();
                    const addrPtr = thread.stack.pop();
                    
                    const buffer = this.memory.get(addrPtr); // PageFault possible
                    
                    if (buffer[index] === expect) {
                        // Block thread
                        thread.status = VM_THREAD_STATUS.BLOCKED_ATOMICS;
                        const key = `${addrPtr}-${index}`;
                        
                        if (!this.atomicsWaitMap.has(key)) this.atomicsWaitMap.set(key, []);
                        this.atomicsWaitMap.get(key).push(thread.id);
                        
                        if (timeout > 0) {
                            setTimeout(() => {
                                if (thread.status === VM_THREAD_STATUS.BLOCKED_ATOMICS) {
                                    thread.status = VM_THREAD_STATUS.RUNNING;
                                    thread.stack.push("timed-out");
                                }
                            }, timeout);
                        }
                    } else {
                        thread.stack.push("not-equal");
                    }
                    break;
                }

                case OPCODES.ATOMIC_NOTIFY: {
                    const count = thread.stack.pop();
                    const index = thread.stack.pop();
                    const addrPtr = thread.stack.pop();
                    
                    const key = `${addrPtr}-${index}`;
                    const waiters = this.atomicsWaitMap.get(key) || [];
                    
                    let woken = 0;
                    while (waiters.length > 0 && woken < count) {
                        const tid = waiters.shift();
                        const t = this.threads.find(x => x.id === tid);
                        if (t && t.status === VM_THREAD_STATUS.BLOCKED_ATOMICS) {
                            t.status = VM_THREAD_STATUS.RUNNING;
                            t.stack.push("ok");
                            woken++;
                        }
                    }
                    thread.stack.push(woken);
                    break;
                }

                // --- 0x90: SYSCALLS ---
                case OPCODES.SYSCALL: {
                    const id = this._readUint8(thread);
                    const argCount = this._readUint8(thread);
                    const args = [];
                    for(let i=0; i<argCount; i++) {
                        args.unshift(thread.stack.pop());
                    }
                    
                    if (this.hostAPI[id]) {
                        const res = this.hostAPI[id](...args);
                        
                        // B"H - TIKKUN: Auto-Await Promises
                        // If the Host API returns a Promise (like Import), we must pause the thread.
                        if (res && typeof res.then === 'function') {
                            thread.status = VM_THREAD_STATUS.BLOCKED_ASYNC;
                            res.then(val => {
                                thread.stack.push(val);
                                thread.status = VM_THREAD_STATUS.RUNNING;
                            }).catch(err => this._handleInterrupt(thread, err));
                        } else {
                            thread.stack.push(res);
                        }
                    } else {
                        throw new Error(`Unknown SysCall: ${id}`);
                    }
                    break;
                }
                
                
                // --- 0x60: UNARY OPS ---
                case OPCODES.TYPEOF: {
                    const val = thread.stack.pop();
                    thread.stack.push(typeof val);
                    break;
                }
                case OPCODES.NOT: {
                    const val = thread.stack.pop();
                    thread.stack.push(!val);
                    break;
                }
                
                case OPCODES.BIT_NOT: {
                    const val = thread.stack.pop();
                    thread.stack.push(~val);
                    break;
                }
                case OPCODES.VOID: {
                    thread.stack.pop(); // Discard top
                    thread.stack.push(undefined);
                    break;
                }
                case OPCODES.DELETE: {
                    const key = thread.stack.pop();
                    const objPtr = thread.stack.pop();
                    let success = true;
                    
                    if ((typeof objPtr === 'object' && objPtr !== null)) {
                        delete objPtr[key];
                    } else if (typeof objPtr === 'number') {
                        const obj = this.memory.get(objPtr);
                        if (obj) {
                            delete obj[key];
                            this.memory.set(objPtr, obj);
                        } else { success = false; }
                    } else { success = true; } // Deleting from null/undefined is non-fatal in JS strict usually? No, returns true.
                    
                    thread.stack.push(success);
                    break;
                }
                
                case OPCODES.NEGATE: {
                    const val = thread.stack.pop();
                    thread.stack.push(-val);
                    break;
                }

                // --- 0x90: EXCEPTIONS ---
                case OPCODES.THROW: {
                    const error = thread.stack.pop();
                    // B"H - Throwing a JS error here triggers the VM's _handleInterrupt
                    // which we just patched to report the crash to the UI.
                    throw new Error(error); 
                }
                

                default:
                    throw new Error(`Unknown Opcode: 0x${opcode.toString(16)} at IP: ${thread.ip - 1}`);
            }
        }

        _handleInterrupt(thread, error) {
            if (isPageFault(error)) {
                thread.status = VM_THREAD_STATUS.WAITING_FOR_PAGE;
                this.memory.resolveFault(error.ptr).then(success => {
                    if (success) {
                        thread.ip--; // Retry the instruction that failed
                        thread.status = VM_THREAD_STATUS.RUNNING;
                    } else {
                        this._handleInterrupt(thread, "Segfault: Pointer not found on disk.");
                    }
                });
                return;
            }

            if (thread.catchStack.length > 0) {
                const handler = thread.catchStack.pop();
                thread.ip = handler.catchIP;
                
                // B"H - Unwind Stack: Discard junk from the failed block
                // Restores stack to the state it was in when 'try' began.
                while (thread.stack.length > handler.stackSize) {
                    thread.stack.pop();
                }
                
                thread.errorRegister = error.message || error;
                // Note: We don't log here, the guest code handles it.
            } else {
                const msg = `[VM] Thread #${thread.id} CRASHED: ${error.message || error}`;
                console.error(msg);
                if (this.hostAPI && this.hostAPI[0]) this.hostAPI[0]("CRITICAL VM ERROR:", msg);
                thread.status = VM_THREAD_STATUS.CRASHED;
            }
        }

        // Helpers
        _readUint8(thread) {
            return thread.code[thread.ip++];
        }
        _readInt16(thread) {
            const low = thread.code[thread.ip++];
            const high = thread.code[thread.ip++];
            const unsigned = (high << 8) | low;
            // B"H - Sign extension: If the 16th bit (0x8000) is set, 
            // treat it as a negative number (2's complement).
            return unsigned >= 0x8000 ? unsigned - 0x10000 : unsigned;
        }
    }

    return MerkavaVM;
}));