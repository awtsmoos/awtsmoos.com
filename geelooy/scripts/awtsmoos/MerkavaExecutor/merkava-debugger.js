// B"H
/**
 * @file merkava-debugger.js
 * @version 1.0.0 - The All-Seeing Eye
 * @description
 * The Debugging Suite for the Merkava VM.
 *
 * Allows for:
 * 1. **Omniscience**: Searching the entire memory space (RAM + Disk) for values.
 * 2. **Time Control**: Breakpoints, Stepping, and "Hibernation" (Snapshotting).
 * 3. **Introspection**: Disassembling bytecode and inspecting Stack Frames.
 *
 * This module sits outside the VM loop but hooks into its `onStep` event to
 * assert control over the flow of time.
 */

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(
            require('./merkava-opcodes.js'),
            require('./merkava-memory.js')
        );
    } else {
        root.MerkavaDebugger = factory(root.MerkavaOpcodes, root.MerkavaMemory);
    }
}(typeof self !== 'undefined' ? self : this, function(OpcodesModule, MemoryModule) {

    const { OPCODES, getOpName, VM_THREAD_STATUS } = OpcodesModule;

    /**
     * @class MerkavaDebugger
     * @description The toolset for inspecting and manipulating the frozen universe.
     */
    class MerkavaDebugger {
        /**
         * @param {MerkavaVM} vm - The Virtual Machine instance to debug.
         */
        constructor(vm) {
            this.vm = vm;
            this.memory = vm.memory;
            
            // Maps CodeObject ID -> Set of Instruction Pointers (IPs)
            // For V1 simplified: Just a Set of global IPs if code is single-blob, 
            // but realistically breakpoints are per-thread or per-code-block.
            // We will assume Absolute IP breakpoints for simplicity here.
            this.breakpoints = new Set(); 
            
            this.isPaused = false;
            this.stepMode = false;
        }

        /**
         * Attach the debugger to the VM's execution loop.
         */
        attach() {
            console.log("[Debugger] Attaching to VM...");
            this.vm.onStep = (thread, opcode) => {
                this._handleStep(thread, opcode);
            };
        }

        /**
         * Detach the debugger.
         */
        detach() {
            this.vm.onStep = null;
            console.log("[Debugger] Detached.");
        }

        // --- EXECUTION CONTROL ---

        /**
         * Internal hook called before every instruction.
         * @private
         */
        _handleStep(thread, opcode) {
            // 1. Check Breakpoints
            if (this.breakpoints.has(thread.ip)) {
                console.warn(`[Debugger] Hit Breakpoint at IP: ${thread.ip}`);
                this.pause();
            }

            // 2. Handle Pause / Step
            if (this.isPaused) {
                thread.status = VM_THREAD_STATUS.PAUSED_BY_DEBUGGER;
                // In a real async loop, we would await a signal here.
                // Since our current VM `run()` is synchronous loop blocks, 
                // "Pausing" effectively means throwing an Interrupt or returning false to the runner loop.
                throw { type: "DEBUGGER_PAUSE", threadId: thread.id };
            }
        }

        /** Pause execution. */
        pause() {
            this.isPaused = true;
            console.log("[Debugger] Execution Paused.");
        }

        /** Resume execution. */
        resume() {
            this.isPaused = false;
            // Wake up threads paused by debugger
            this.vm.threads.forEach(t => {
                if (t.status === VM_THREAD_STATUS.PAUSED_BY_DEBUGGER) {
                    t.status = VM_THREAD_STATUS.RUNNING;
                }
            });
            console.log("[Debugger] Resuming...");
        }

        /** Set a breakpoint at a specific instruction index. */
        setBreakpoint(ip) {
            this.breakpoints.add(ip);
            console.log(`[Debugger] Breakpoint set at IP: ${ip}`);
        }

        // --- INTROSPECTION ---

        /**
         * Disassemble a range of bytecode into human-readable instructions.
         * @param {Uint8Array} code 
         * @param {number} start - Start IP
         * @param {number} length - Number of instructions to read (approx)
         */
        disassemble(code, start = 0, length = 10) {
            let ip = start;
            const output = [];
            
            for (let i = 0; i < length && ip < code.length; i++) {
                const op = code[ip];
                const name = getOpName(op);
                let args = "";
                let size = 1;

                // Rudimentary operand decoding based on opcode ranges
                // (Ideally, Opcodes module should export an Operand Map)
                if ([OPCODES.PUSH_CONST, OPCODES.JUMP, OPCODES.JUMP_IF_FALSE, 
                     OPCODES.LOAD_GLOBAL, OPCODES.STORE_GLOBAL].includes(op)) {
                    const val = (code[ip+2] << 8) | code[ip+1];
                    args = `0x${val.toString(16).padStart(4, '0')} (${val})`;
                    size = 3;
                } else if ([OPCODES.LOAD_LOCAL, OPCODES.STORE_LOCAL].includes(op)) {
                    const val = code[ip+1];
                    args = `[${val}]`;
                    size = 2;
                }

                output.push(`${ip.toString(16).padStart(4, '0')}: ${name} ${args}`);
                ip += size;
            }
            return output.join('\n');
        }

        /**
         * Inspect a Thread's Stack.
         */
        inspectThread(threadId) {
            const thread = this.vm.threads.find(t => t.id === threadId);
            if (!thread) return "Thread not found.";

            return {
                id: thread.id,
                status: Object.keys(VM_THREAD_STATUS).find(k => VM_THREAD_STATUS[k] === thread.status),
                ip: thread.ip,
                stackDepth: thread.stack.length,
                topOfStack: thread.stack.slice(-5), // Show last 5 items
                currentOp: getOpName(thread.code[thread.ip])
            };
        }

        // --- THE ALL-SEEING EYE (Search) ---

        /**
         * Deep Search the entire Virtual Memory (RAM + Disk) for a value.
         * This simulates an "Omniscient Debugger".
         * 
         * @param {function(value): boolean} predicate - Filter function.
         * @returns {Promise<Array>} List of { ptr, value } matches.
         */
        async scanMemory(predicate) {
            console.log("[Debugger] Starting Deep Memory Scan...");
            const results = [];

            // 1. Scan RAM (L1 Cache)
            for (const [ptr, val] of this.memory.ram.entries()) {
                if (predicate(val)) {
                    results.push({ source: 'RAM', ptr, val });
                }
            }

            // 2. Scan IndexedDB (Disk)
            // We bypass the MemoryManager's `get` to avoid pollution/page faults
            // and read the raw store cursor.
            const db = this.memory.db.db; // Access raw IDBDatabase
            if (!db) throw new Error("Database not open.");

            return new Promise((resolve, reject) => {
                const tx = db.transaction("heap_objects", "readonly");
                const store = tx.objectStore("heap_objects");
                const req = store.openCursor();

                req.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor) {
                        // Don't double count if it's in RAM (RAM is authoritative)
                        if (!this.memory.ram.has(cursor.key)) {
                            if (predicate(cursor.value)) {
                                results.push({ source: 'DISK', ptr: cursor.key, val: cursor.value });
                            }
                        }
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
                req.onerror = () => reject(req.error);
            });
        }

        // --- SNAPSHOTTING ("Hibernation") ---

        /**
         * Serialize the entire VM state to a JSON blob.
         * Allows saving the exact execution moment to a file.
         * 
         * Strategy:
         * 1. Flush RAM to Disk (Ensure persistence).
         * 2. Serialize the Thread List (The "Soul").
         * 3. Return the Thread List + Meta info.
         */
        async createCheckpoint() {
            // 1. Stop time
            const wasPaused = this.isPaused;
            this.pause();

            // 2. Flush memory
            await this.memory.flush();

            // 3. Serialize Threads
            // Note: Uint8Arrays (bytecode) need special handling for JSON
            const threadsDump = this.vm.threads.map(t => ({
                id: t.id,
                status: t.status,
                ip: t.ip,
                bp: t.bp,
                sp: t.stack.length, // Stack pointer is usually length in JS implementation
                stack: t.stack,     // Should contain only primitives or pointers (Integers)
                frames: t.frames,
                // Code is tricky. We save the CODE_ID, not the bytes, assuming code is in constants/memory.
                // For V1, let's assume code is immutable and regenerated by compiler, 
                // or stored in memory heap. 
                // Simplification: We serialize the bytecode as Base64 or array.
                code: Array.from(t.code), 
                constants: t.constants 
            }));

            const snapshot = {
                timestamp: Date.now(),
                nextPtr: this.memory.nextPtr,
                threads: threadsDump
            };

            // 4. Resume if needed
            if (!wasPaused) this.resume();

            return JSON.stringify(snapshot);
        }

        /**
         * Restore the VM from a checkpoint.
         * @param {string} jsonSnapshot 
         */
        async loadCheckpoint(jsonSnapshot) {
            const snapshot = JSON.parse(jsonSnapshot);
            
            // 1. Restore Memory Meta
            this.memory.nextPtr = snapshot.nextPtr;
            this.memory.ram.clear();
            this.memory.dirtySet.clear();

            // 2. Restore Threads
            this.vm.threads = snapshot.threads.map(tData => {
                const t = new this.vm.constructor.Thread(tData.id, { 
                    bytecode: new Uint8Array(tData.code),
                    constants: tData.constants
                }, this.memory);
                
                t.status = tData.status;
                t.ip = tData.ip;
                t.bp = tData.bp;
                t.stack = tData.stack;
                t.frames = tData.frames;
                
                return t;
            });

            console.log(`[Debugger] Restored ${this.vm.threads.length} threads from checkpoint.`);
        }
    }

    return MerkavaDebugger;
}));