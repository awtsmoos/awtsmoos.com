// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};

    /**
     * B"H
     * Chapter 104: when the vessel shatters, it keeps the shard.
     *
     * The VM is bytecode, but bytecode is not amnesia. Every crash stores the
     * thrown error, instruction pointer, bytecode length, stack summary, and the
     * current divine trace so upper layers can report a real runtime failure
     * instead of a vague module-collapse rumor.
     */
    class Thread {
        constructor(vm, codeObject, context = {}) {
            this.id = Math.floor(Math.random() * 100000);
            this.vm = vm;
            this.bytecode = codeObject.bytecode;
            this.constants = codeObject.constants || [];
            this.ip = 0;
            this.stack = [];
            this.status = 'READY';
            this.frames = [];
            this.currentScope = { 'this': context };
            this.environment = context;
            this.catchStack = [];
            this.lastError = null;
        }

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

        push(val) { this.stack.push(val); }
        pop() { return this.stack.pop(); }
        peek() { return this.stack[this.stack.length - 1]; }

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
            return this.stack.slice(-15).reverse().map((value, index) => ({
                slot: `TOP - ${index}`,
                type: typeof value,
                value: value && value.type === 'CLOSURE' ? `[Closure: ${value.code.bytecode.length} bytes]` : value
            }));
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
            try {
                if (this.ip >= this.bytecode.length) {
                    this.status = 'COMPLETED';
                    return false;
                }
                const op = this.read8();
                const executor = root.MerkavaExecutor || (root.MerkavaVM && root.MerkavaVM.Executor);
                if (!executor) {
                    this.status = 'CRASHED';
                    throw new Error('[VM Critical] Executor missing from the Palace.');
                }
                const result = executor.exec(op, this);
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
    }

    root.MerkavaVM.Thread = Thread;
    console.log('[MerkavaVM] Thread Class Refined (Stored Tracing Engaged).');
})(typeof self !== 'undefined' ? self : this);
