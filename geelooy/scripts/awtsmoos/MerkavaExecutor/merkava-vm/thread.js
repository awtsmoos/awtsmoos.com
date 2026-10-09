// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};

    /**
     * B"H
     * Chapter 104: when the vessel shatters, it keeps the shard.
     *
     * OPTIMIZED (2026-10-09): Fast dispatch path.
     * - OpHandlers cached on thread at construction (was: global lookup per instruction)
     * - Stack uses preallocated array + _sp pointer (was: JS array push/pop method calls)
     * - Bytecode reads inlined in step() (was: read8()/read16() method calls)
     * - Direct handler invocation (was: executor.exec() indirection)
     */
    class Thread {
        constructor(vm, codeObject, context = {}) {
            this.id = Math.floor(Math.random() * 100000);
            this.vm = vm;
            this.bytecode = codeObject.bytecode;
            this.constants = codeObject.constants || [];
            this.ip = 0;
            // B"H: Preallocated stack with manual pointer. Eliminates Array.push/pop
            // method call overhead and growth reallocations in the hot path.
            this.stack = new Array(256);
            this._sp = 0;
            this.status = 'READY';
            this.frames = [];
            this.currentScope = { 'this': context };
            this.environment = context;
            this.catchStack = [];
            this.lastError = null;
            // B"H: Cache the handler table once. The old code did
            // `root.MerkavaExecutor || ...` on EVERY instruction.
            this._handlers = null;
        }

        _getHandlers() {
            if (!this._handlers) {
                this._handlers = root.MerkavaVM.OpHandlers
                    || (root.MerkavaExecutor && root.MerkavaExecutor.OpHandlers);
            }
            return this._handlers;
        }

        _growStack() {
            const grown = new Array(this.stack.length * 2);
            for (let i = 0; i < this._sp; i++) grown[i] = this.stack[i];
            this.stack = grown;
        }

        // Public API (used by executors and host code)
        push(val) {
            if (this._sp >= this.stack.length) this._growStack();
            this.stack[this._sp++] = val;
        }
        pop() {
            if (this._sp <= 0) return undefined;
            const val = this.stack[--this._sp];
            this.stack[this._sp] = undefined; // help GC
            return val;
        }
        peek() { return this._sp > 0 ? this.stack[this._sp - 1] : undefined; }

        read8() {
            if (this.ip >= this.bytecode.length) { this.status = 'COMPLETED'; return 0; }
            return this.bytecode[this.ip++];
        }

        read16() {
            if (this.ip + 1 >= this.bytecode.length) { this.status = 'COMPLETED'; return 0; }
            const low = this.bytecode[this.ip++];
            const high = this.bytecode[this.ip++];
            let val = (high << 8) | low;
            if (val >= 0x8000) val -= 0x10000;
            return val;
        }

        readU16() {
            if (this.ip + 1 >= this.bytecode.length) { this.status = 'COMPLETED'; return 0; }
            const low = this.bytecode[this.ip++];
            const high = this.bytecode[this.ip++];
            return (high << 8) | low;
        }

        findName(bytecode) {
            if (!this.environment) return 'anonymous';
            try {
                for (const key of Object.keys(this.environment)) {
                    const value = this.environment[key];
                    if (value && value.type === 'CLOSURE' && value.code && value.code.bytecode === bytecode) return key;
                }
            } catch (_) {}
            return 'anonymous';
        }

        getDivineTrace() {
            const lines = [];
            lines.push(`[Divine Trace] Thread #${this.id} - Status: ${this.status}`);
            lines.push(`  at ${this.findName(this.bytecode)} (IP: ${this.ip}, Bytecode: ${this.bytecode.length} bytes)`);
            for (let index = this.frames.length - 1; index >= 0; index -= 1) {
                const frame = this.frames[index];
                lines.push(`  at ${this.findName(frame.bytecode)} (IP: ${frame.ip}, Bytecode: ${frame.bytecode.length} bytes)`);
            }
            return lines;
        }

        stackSummary() {
            const out = [];
            for (let i = 0; i < 15 && i < this._sp; i++) {
                const value = this.stack[this._sp - 1 - i];
                out.push({
                    slot: `TOP - ${i}`,
                    type: typeof value,
                    value: value && value.type === 'CLOSURE' ? `[Closure: ${value.code.bytecode.length} bytes]` : value
                });
            }
            return out;
        }

        rememberCrash(error) {
            const message = error?.message || String(error);
            this.lastError = {
                message,
                name: error?.name || 'Error',
                stack: error?.stack || '',
                ip: this.ip,
                bytecodeLength: this.bytecode.length,
                threadId: this.id,
                status: this.status,
                trace: this.getDivineTrace(),
                stackSummary: this.stackSummary()
            };
            return this.lastError;
        }

        logCrash(error) {
            const remembered = this.rememberCrash(error);
            console.group('%cB"H - THE VESSELS HAVE SHATTERED', 'color: #ff6b6b; font-weight: bold; font-size: 1.2rem;');
            console.error('Error Soul:', remembered.message);
            remembered.trace.forEach(line => console.log(line));
            console.log('%c[The Stack of Creation]', 'color: #66fcf1; font-weight: bold;');
            console.table(remembered.stackSummary);
            console.groupEnd();
        }

        step() {
            if (this.status !== 'RUNNING') return false;
            // B"H: Fast path — hoist everything into locals to avoid property
            // lookups in the hot loop. Single bounds check per instruction.
            const bc = this.bytecode;
            const bcLen = bc.length;
            let ip = this.ip;
            if (ip >= bcLen) {
                this.status = 'COMPLETED';
                return false;
            }
            const handlers = this._getHandlers();
            if (!handlers) {
                this.status = 'CRASHED';
                throw new Error('[VM Critical] Executor missing from the Palace.');
            }
            const op = bc[ip++];
            this.ip = ip;
            try {
                const handler = handlers[op];
                let result;
                if (handler) {
                    result = handler(this);
                } else if (op === 0x00) {
                    result = undefined; // NOP
                } else {
                    this.status = 'CRASHED';
                    this.rememberCrash(new Error(`Unknown opcode 0x${op.toString(16)} at IP ${ip - 1}`));
                    return false;
                }
                if (result === 'HALT' || result === 'COMPLETED') {
                    this.status = 'COMPLETED';
                    return false;
                }
                if (result === 'UNKNOWN_OP') {
                    this.status = 'CRASHED';
                    this.rememberCrash(new Error(`Unknown opcode at IP ${this.ip - 1}`));
                    return false;
                }
            } catch (error) {
                if (this.catchStack && this.catchStack.length > 0) {
                    const catchAddr = this.catchStack.pop();
                    this.ip = catchAddr;
                    this.push(error.vmValue || error.message || error);
                    return true;
                }
                this.status = 'CRASHED';
                this.logCrash(error);
                return false;
            }
            return true;
        }

        /**
         * B"H (2026-10-09): Batch runner. Eliminates the per-instruction
         * step() method-call overhead by running the dispatch loop inline.
         * Falls back to step() semantics for catch/error paths.
         */
        run(maxSteps) {
            if (this.status !== 'RUNNING') return 0;
            const handlers = this._getHandlers();
            if (!handlers) {
                this.status = 'CRASHED';
                throw new Error('[VM Critical] Executor missing from the Palace.');
            }
            let steps = 0;
            const bc = this.bytecode;
            const bcLen = bc.length;
            while (steps < maxSteps && this.status === 'RUNNING') {
                let ip = this.ip;
                if (ip >= bcLen) { this.status = 'COMPLETED'; break; }
                const op = bc[ip++];
                this.ip = ip;
                const handler = handlers[op];
                try {
                    let result;
                    if (handler) {
                        result = handler(this);
                    } else if (op !== 0x00) {
                        this.status = 'CRASHED';
                        this.rememberCrash(new Error(`Unknown opcode 0x${op.toString(16)} at IP ${ip - 1}`));
                        break;
                    }
                    if (result === 'HALT' || result === 'COMPLETED') {
                        this.status = 'COMPLETED';
                        break;
                    }
                    if (result === 'UNKNOWN_OP') {
                        this.status = 'CRASHED';
                        this.rememberCrash(new Error(`Unknown opcode at IP ${this.ip - 1}`));
                        break;
                    }
                } catch (error) {
                    if (this.catchStack && this.catchStack.length > 0) {
                        const catchAddr = this.catchStack.pop();
                        this.ip = catchAddr;
                        this.push(error.vmValue || error.message || error);
                    } else {
                        this.status = 'CRASHED';
                        this.logCrash(error);
                        break;
                    }
                }
                steps++;
            }
            return steps;
        }
    }

    root.MerkavaVM.Thread = Thread;
    console.log('[MerkavaVM] Thread Class Refined (Stored Tracing Engaged).');
})(typeof self !== 'undefined' ? self : this);
