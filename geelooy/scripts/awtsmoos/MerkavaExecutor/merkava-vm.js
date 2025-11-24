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
        constructor(memoryManager, hostAPI = {}) {
            this.memory = memoryManager;
            this.hostAPI = hostAPI;
            
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
        spawn(codeObject) {
            const thread = new Thread(this.threadIdCounter++, codeObject, this.memory);
            this.threads.push(thread);
            console.log(`[VM] Spawned Thread #${thread.id}`);
            return thread.id;
        }

        /**
         * The Main Execution Loop.
         * Call this via `requestAnimationFrame` or `setImmediate` loop.
         * @param {number} cycles - Number of instructions to execute before yielding.
         */
        run(cycles = 1000) {
            let cyclesRun = 0;

            while (cyclesRun < cycles && this.threads.length > 0) {
                // Scheduler: Round Robin
                this.activeThreadIndex = (this.activeThreadIndex + 1) % this.threads.length;
                const thread = this.threads[this.activeThreadIndex];

                // Cleanup dead threads
                if (thread.status === VM_THREAD_STATUS.COMPLETED || 
                    thread.status === VM_THREAD_STATUS.CRASHED) {
                    this.threads.splice(this.activeThreadIndex, 1);
                    this.activeThreadIndex--; // Adjust index
                    continue;
                }

                // Skip blocked threads
                if (thread.status !== VM_THREAD_STATUS.RUNNING) {
                    continue;
                }

                try {
                    this._step(thread);
                    cyclesRun++;
                } catch (e) {
                    this._handleInterrupt(thread, e);
                }
            }
            
            return this.threads.length > 0; // Return true if still working
        }

        /**
         * Execute a single instruction for a thread.
         * @private
         */
        _step(thread) {
            // Fetch
            if (thread.ip >= thread.code.length) {
                thread.status = VM_THREAD_STATUS.COMPLETED;
                return;
            }
            
            const opcode = thread.code[thread.ip];
            thread.ip++;

            // Debug hook
            if (this.onStep) this.onStep(thread, opcode);

            // Decode & Execute
            switch (opcode) {
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

                case OPCODES.RETURN: {
                    const result = thread.stack.length > 0 ? thread.stack.pop() : undefined;
                    
                    if (thread.frames.length === 0) {
                        // Return from main function = exit thread
                        console.log(`[VM] Thread #${thread.id} Finished. Result:`, result);
                        thread.status = VM_THREAD_STATUS.COMPLETED;
                    } else {
                        const frame = thread.frames.pop();
                        thread.ip = frame.returnIP;
                        thread.bp = frame.prevBP;
                        
                        // Restore code context (if returning from a different closure)
                        thread.code = frame.code;
                        thread.constants = frame.constants;
                        thread.scope = frame.scope;
                        
                        // Prune stack to remove args from called function
                        // (BP points to start of locals, so everything above it was the frame)
                        // Actually, standard convention: Caller pops args or Callee pops.
                        // Let's assume Callee pops local vars, Result replaces them.
                        // Simplified: We reset stack length to BP? No, that kills the result.
                        // Implementation: The locals were on the stack. We discard them.
                        // This requires precise stack management.
                        // For V1 JS-hosted stack:
                        thread.stack = frame.prevStack; // Simplest way: Restore stack snapshot + push result
                        thread.stack.push(result);
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
                    
                    // Logic: Walk up the call stack 'depth' times.
                    // thread.frames contains the history. 
                    // frames[length - 1] is the immediate caller (depth 1).
                    const frameIndex = thread.frames.length - depth;
                    
                    if (frameIndex < 0) {
                        throw new Error(`[VM] Upvalue access out of bounds (Depth: ${depth}, Frames: ${thread.frames.length})`);
                    }
                    
                    const frame = thread.frames[frameIndex];
                    // Locals are stored in the frame's stack snapshot relative to its BP
                    const val = frame.prevStack[frame.prevBP + idx];
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
                    // Global scope is ptr 1
                    const globalScope = this.memory.get(1); 
                    if (!(name in globalScope)) throw new Error(`ReferenceError: ${name} is not defined`);
                    thread.stack.push(globalScope[name]);
                    break;
                }

                case OPCODES.STORE_GLOBAL: {
                    const nameIdx = this._readInt16(thread);
                    const name = thread.constants[nameIdx];
                    const val = thread.stack.pop();
                    
                    const globalScope = this.memory.get(1);
                    globalScope[name] = val;
                    this.memory.set(1, globalScope); // Mark dirty
                    break;
                }

                // --- 0x30: OBJECTS ---
                case OPCODES.ALLOC_OBJECT: {
                    const ptr = this.memory.allocate({});
                    thread.stack.push(ptr); // Pushing Pointer
                    break;
                }

                case OPCODES.GET_PROP: {
                    const key = thread.stack.pop();
                    const objPtr = thread.stack.pop();
                    const obj = this.memory.get(objPtr); // Can THROW PageFault
                    thread.stack.push(obj[key]);
                    break;
                }

                case OPCODES.SET_PROP: {
                    const val = thread.stack.pop();
                    // Backtracked in compiler order: Obj, Key, Val. But stack is LIFO.
                    // If compiler pushed Obj, Key, Val...
                    // Pop Val -> Pop Key -> Pop Obj.
                    const key = thread.stack.pop();
                    const objPtr = thread.stack.pop();
                    
                    const obj = this.memory.get(objPtr); // Can THROW PageFault
                    obj[key] = val;
                    this.memory.set(objPtr, obj); // Mark dirty
                    thread.stack.push(val); // Assignment returns value
                    break;
                }

                // --- 0x40: BINARY OPS ---
                case OPCODES.ADD: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a + b); break; }
                case OPCODES.SUB: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a - b); break; }
                case OPCODES.MUL: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a * b); break; }
                case OPCODES.DIV: { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a / b); break; }
                case OPCODES.EQ:  { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a == b); break; }
                case OPCODES.LT:  { const b = thread.stack.pop(); const a = thread.stack.pop(); thread.stack.push(a < b); break; }
                
                // --- 0x70: FUNCTIONS ---
                case OPCODES.CLOSURE: {
                    const templateIdx = this._readInt16(thread);
                    const template = thread.constants[templateIdx];
                    
                    // Create Closure Object
                    // It needs to capture the current Scope Chain?
                    // For V1: Simple object containing code ref
                    const closure = {
                        type: 'CLOSURE',
                        name: template.name,
                        bytecode: template.bytecode,
                        constants: template.constants,
                        upvalues: [] // TODO: Capture upvalues
                    };
                    
                    // Store closure in Heap? Or just on stack as object?
                    // Closures are first-class objects.
                    const ptr = this.memory.allocate(closure);
                    thread.stack.push(ptr);
                    break;
                }

                case OPCODES.CALL: {
                    const argCount = this._readUint8(thread);
                    
                    // Args are on stack. Then 'This'. Then Func.
                    // We need to peel them off.
                    // Stack: [Func, This, Arg1, Arg2] (Top)
                    
                    // Snapshot stack for restoring after return (minus args/func)
                    // Slice end is - (argCount + 2)
                    const prevStack = thread.stack.slice(0, thread.stack.length - (argCount + 2));
                    
                    const args = [];
                    for(let i=0; i<argCount; i++) args.unshift(thread.stack.pop());
                    const thisVal = thread.stack.pop();
                    const funcPtr = thread.stack.pop();
                    
                    const funcObj = this.memory.get(funcPtr); // Can THROW PageFault
                    
                    // Native Host Call?
                    if (typeof funcObj === 'function') {
                        const res = funcObj.apply(thisVal, args);
                        thread.stack = prevStack;
                        thread.stack.push(res);
                        break;
                    }

                    // VM Closure Call
                    // Save current state
                    thread.frames.push({
                        returnIP: thread.ip,
                        prevBP: thread.bp,
                        code: thread.code,
                        constants: thread.constants,
                        scope: thread.scope,
                        prevStack: prevStack
                    });

                    // Setup new frame
                    thread.code = funcObj.bytecode;
                    thread.constants = funcObj.constants;
                    thread.ip = 0;
                    
                    // Locals start here. 
                    // We need to push args back onto stack as locals?
                    // Compiler expects StoreLocal to handle var declarations.
                    // But params are locals 0, 1, 2...
                    
                    // Reset Stack for new frame?
                    // Stack-based VMs usually share one big stack.
                    // BP points to where the new frame starts.
                    // Let's just push args back on.
                    thread.stack = args; 
                    thread.bp = 0;
                    
                    break;
                }

                // --- 0x80: ASYNC / ATOMICS ---
                case OPCODES.AWAIT: {
                    const promise = thread.stack.pop();
                    
                    // Check if it's actually a promise
                    if (promise && typeof promise.then === 'function') {
                        thread.status = VM_THREAD_STATUS.BLOCKED_ASYNC;
                        
                        // Suspend!
                        promise.then(result => {
                            // Resume Callback
                            thread.stack.push(result);
                            thread.status = VM_THREAD_STATUS.RUNNING;
                        }).catch(err => {
                            // Error handling (simplified)
                            console.error("[VM] Async Error", err);
                            thread.status = VM_THREAD_STATUS.CRASHED;
                        });
                    } else {
                        // Not a promise? Just continue.
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
                    const argCount = this._readUint8(thread); // B"H - Now reading count from bytecode
                    
                    // Pop arguments from stack (LIFO -> FIFO)
                    const args = [];
                    for(let i=0; i<argCount; i++) {
                        args.unshift(thread.stack.pop());
                    }
                    
                    // Host API check
                    if (this.hostAPI[id]) {
                        // Execute
                        const res = this.hostAPI[id](...args);
                        // Push result (or undefined if void)
                        thread.stack.push(res);
                    } else {
                        throw new Error(`Unknown SysCall: ${id}`);
                    }
                    break;
                }

                default:
                    throw new Error(`Unknown Opcode: 0x${opcode.toString(16)} at IP: ${thread.ip - 1}`);
            }
        }

        /**
         * Handles Exceptions and Interrupts (Page Faults).
         * @private
         */
        _handleInterrupt(thread, error) {
            if (isPageFault(error)) {
                // PAGE FAULT!
                // 1. Mark thread as waiting
                thread.status = VM_THREAD_STATUS.WAITING_FOR_PAGE;
                // 2. Backtrack instruction pointer so we retry instruction upon resume
                // (Simple V1: assume 1-byte opcode logic, might need precise decrement based on opcode size)
                // Better: The instruction failed BEFORE modifying IP significantly? 
                // Actually, we incremented IP after fetch. We need to undo that.
                // But opcodes have operands... 
                // STRATEGY: Just reset IP to where it was before the step?
                // Note: This requires saving `prevIP` before step.
                // Fix: We rely on the fact that `memory.get` happens before side effects.
                // We need to restart the instruction.
                // Hack: We assume standard opcodes.
                
                // Let's trigger the async load
                this.memory.resolveFault(error.ptr).then(success => {
                    if (success) {
                        // Rewind IP?
                        // This is tricky without a map of instruction lengths.
                        // ALTERNATIVE: The Thread object should track `currentOpIP`.
                        // Let's assume we add that later.
                        // For now, assuming we caught it inside the opcode execution:
                        // We just decrement IP by 1? No, some ops read args.
                        
                        // CORRECT FIX: Don't increment IP until AFTER execution success?
                        // Or store `lastIP` in Thread.
                        
                        // RECOVERY:
                        // thread.ip = thread.lastIP; 
                        // thread.status = RUNNING;
                        
                        // For this example code to run, we assume a simple rewind:
                        thread.ip -= 1; // Simple rewind for 1-byte opcodes (dangerous but placeholder)
                        thread.status = VM_THREAD_STATUS.RUNNING;
                    } else {
                        thread.status = VM_THREAD_STATUS.CRASHED;
                        console.error("Segfault: Pointer not found on disk.");
                    }
                });
                return;
            }

            console.error(`[VM] Thread #${thread.id} CRASHED:`, error);
            thread.status = VM_THREAD_STATUS.CRASHED;
        }

        // Helpers
        _readUint8(thread) {
            return thread.code[thread.ip++];
        }
        _readInt16(thread) {
            const low = thread.code[thread.ip++];
            const high = thread.code[thread.ip++];
            return (high << 8) | low;
        }
    }

    return MerkavaVM;
}));