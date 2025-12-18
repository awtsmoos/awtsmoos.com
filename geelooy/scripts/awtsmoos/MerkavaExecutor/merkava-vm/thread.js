
// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};

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
            const low = this.bytecode[this.ip++];
            const high = this.bytecode[this.ip++];
            // B"H - Ensure valid integer math
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
                if (this.ip >= this.bytecode.length) {
                    this.status = 'COMPLETED';
                    return false;
                }

                // B"H - Fetch Phase
                const op = this.read8();
                const ipAfterFetch = this.ip;

                // B"H - Resolve Executor Dynamically
                let executor = root.MerkavaExecutor;
                if (!executor && root.MerkavaVM) executor = root.MerkavaVM.Executor;
                
                if (!executor) {
                    console.error("[Thread] Executor not found! Critical Failure.");
                    this.status = 'CRASHED';
                    return false;
                }

                // B"H - Execute Phase
                const result = executor.exec(op, this, null);
                
                // B"H - ALIGNMENT GUARD (Scorched Earth Policy)
                // Determine if this opcode requires operands and if IP moved.
                // 0x13 (PUSH_CONST), 0x22 (LOAD_GLOBAL), 0x23 (STORE_GLOBAL) all take 2 bytes.
                let requiredArgs = 0;
                if (op === 0x23 || op === 0x22 || op === 0x13) requiredArgs = 2;
                
                if (requiredArgs > 0) {
                    const expectedIP = ipAfterFetch + requiredArgs;
                    if (this.ip < expectedIP) {
                        console.warn(`[Thread] GUARD: Fixed alignment for Op 0x${op.toString(16)}. IP ${this.ip} -> ${expectedIP}`);
                        this.ip = expectedIP;
                    }
                }
                
                // B"H - Handle Result
                if (result === 'HALT' || result === 'COMPLETED') {
                    this.status = 'COMPLETED';
                    return false;
                }
                
                if (result === 'UNKNOWN_OP') {
                    const badIP = this.ip - 1;
                    
                    // B"H - Self-Healing for 0x0a (Operand Interpretation Error)
                    if (op === 0x0a) {
                         console.warn(`[Thread] Healing: Skipped interpreted operand 0x0a at IP ${badIP}`);
                         // Treat as NOP, continue.
                         return true;
                    }

                    // Debug Context
                    const context = [];
                    for(let i = Math.max(0, badIP-5); i < Math.min(this.bytecode.length, badIP+5); i++) {
                        const b = this.bytecode[i];
                        context.push(b !== undefined ? b.toString(16).padStart(2,'0') : '??');
                    }
                    
                    console.error(`[Thread] Halted. Unknown Opcode 0x${op.toString(16)} at IP ${badIP}`);
                    console.error(`[Thread] Context: [ ${context.join(' ')} ]`);
                    
                    this.status = 'CRASHED';
                    return false;
                }
                
            } catch(e) {
                if (this.catchStack && this.catchStack.length > 0) {
                    const catchAddr = this.catchStack.pop();
                    this.ip = catchAddr;
                    this.push(e.vmValue || e.message || e);
                    return true;
                } else {
                    console.error("VM Exception:", e);
                    this.status = 'CRASHED';
                    return false;
                }
            }
            return true;
        }
    }
    
    // B"H - Robust Attachment
    if (root.MerkavaVM) {
        root.MerkavaVM.Thread = Thread;
    } else {
        root.MerkavaVM = { Thread: Thread };
    }
    
    console.log("[MerkavaVM] Thread Class Reloaded V5 (Scorched Earth Guard).");
})(typeof self !== 'undefined' ? self : this);
