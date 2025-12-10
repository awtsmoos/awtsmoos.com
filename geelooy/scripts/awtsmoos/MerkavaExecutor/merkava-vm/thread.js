// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    const OPCODES = (root.MerkavaOpcodes && root.MerkavaOpcodes.OPCODES) || {};

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
            this.currentFrame = null;
            this.currentScope = {};
            this.environment = context; 
            this.catchStack = []; // B"H - Stack of catch block addresses
        }

        read8() {
            if (this.ip >= this.bytecode.length) { this.status = 'COMPLETED'; return 0; }
            return this.bytecode[this.ip++];
        }

        read16() {
            if (this.ip + 1 >= this.bytecode.length) { this.status = 'COMPLETED'; return 0; }
            const low = this.read8();
            const high = this.read8();
            let val = (high << 8) | low;
            if (val >= 0x8000) val = val - 0x10000;
            return val;
        }

        push(val) { this.stack.push(val); }
        pop() { return this.stack.pop(); }
        peek() { return this.stack[this.stack.length - 1]; }

        step() {
            if (this.status !== 'RUNNING') return false;
            try {
                const op = this.read8();
                const result = root.MerkavaVM.Executor.exec(op, this, OPCODES);
                if (result === 'HALT' || result === 'COMPLETED') {
                    this.status = 'COMPLETED';
                    return false;
                }
            } catch(e) {
                // B"H - Exception Handling Logic
                if (this.catchStack && this.catchStack.length > 0) {
                    const catchAddr = this.catchStack.pop();
                    this.ip = catchAddr;
                    // Push the error object onto the stack for the catch block
                    this.push(e.vmValue || e.message || e);
                    return true;
                } else {
                    console.error("VM Exception (Uncaught):", e);
                    this.status = 'CRASHED';
                    return false;
                }
            }
            return true;
        }
    }
    root.MerkavaVM.Thread = Thread;
})(typeof self !== 'undefined' ? self : this);