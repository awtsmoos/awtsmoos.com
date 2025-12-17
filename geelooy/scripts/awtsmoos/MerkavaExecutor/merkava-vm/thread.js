
// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};

    // B"H - Robust Opcode Resolution for Thread
    const getOpcodes = () => {
        const g = typeof globalThis !== 'undefined' ? globalThis : 
                  (typeof self !== 'undefined' ? self : 
                  (typeof window !== 'undefined' ? window : root));
                  
        if (g.MerkavaOpcodes && g.MerkavaOpcodes.OPCODES) {
            return g.MerkavaOpcodes.OPCODES;
        }
        if (g.MerkavaOpcodes && g.MerkavaOpcodes.default && g.MerkavaOpcodes.default.OPCODES) {
            return g.MerkavaOpcodes.default.OPCODES;
        }
        console.warn("[Thread] OPCODES Missing! Fallback to empty.");
        return {}; 
    };

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
            this.currentScope = { 'this': context };
            this.environment = context; 
            this.catchStack = []; 
            
            // B"H - Cache Opcodes once per thread to avoid repeated lookups
            this.OPCODES = getOpcodes();
        }

        read8() {
            if (this.ip >= this.bytecode.length) { 
                this.status = 'COMPLETED'; 
                return 0; 
            }
            return this.bytecode[this.ip++];
        }

        read16() {
            if (this.ip + 1 >= this.bytecode.length) { 
                this.status = 'COMPLETED'; 
                return 0; 
            }
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
                // B"H - Safe Read
                if (this.ip >= this.bytecode.length) {
                    this.status = 'COMPLETED';
                    return false;
                }

                const op = this.read8();
                
                // B"H - Pass the robustly resolved OPCODES to the executor
                const result = root.MerkavaVM.Executor.exec(op, this, this.OPCODES);
                
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
                    
                    // B"H - CRASH DUMP
                    try {
                        const badIP = this.ip - 1; // IP was incremented by read8
                        const start = Math.max(0, badIP - 5);
                        const end = Math.min(this.bytecode.length, badIP + 5);
                        const slice = this.bytecode.slice(start, end);
                        const hex = Array.from(slice).map(b => b.toString(16).padStart(2, '0')).join(' ');
                        console.error(`CRASH DUMP @ IP ${badIP.toString(16)}: [ ${hex} ]`);
                        console.error(`Opcode was: ${this.bytecode[badIP] ? this.bytecode[badIP].toString(16) : 'N/A'} (0x${(badIP < this.bytecode.length ? this.bytecode[badIP] : 0).toString(16)})`);
                    } catch(dumpErr) { console.error("Dump failed", dumpErr); }

                    this.status = 'CRASHED';
                    return false;
                }
            }
            return true;
        }
    }
    root.MerkavaVM.Thread = Thread;
})(typeof self !== 'undefined' ? self : this);
