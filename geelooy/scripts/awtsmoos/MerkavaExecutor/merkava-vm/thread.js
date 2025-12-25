
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
            if (this.ip >= this.bytecode.length) { this.status = 'COMPLETED'; return 0; }
            return this.bytecode[this.ip++];
        }

        read16() {
            if (this.ip + 1 >= this.bytecode.length) { this.status = 'COMPLETED'; return 0; }
            const low = this.bytecode[this.ip++];
            const high = this.bytecode[this.ip++];
            let val = (high << 8) | low;
            if (val >= 0x8000) val = val - 0x10000;
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

        /**
         * B"H - getDivineTrace
         * Reconstructs the spiritual path taken by this thread.
         * It traverses the frames of logic to reveal the call stack of the VM itself.
         */
        getDivineTrace() {
            const lines = [];
            lines.push(`%c[Divine Trace] Thread #${this.id} - Status: ${this.status}`, "color: #66fcf1; font-weight: bold;");
            
            const findName = (bytecode) => {
                if (!this.environment) return "anonymous";
                // Reflect on the environment to find the spark
                try {
                    const keys = Object.keys(this.environment);
                    for (let k of keys) {
                        const v = this.environment[k];
                        if (v && v.type === 'CLOSURE' && v.code && v.code.bytecode === bytecode) return k;
                    }
                } catch(e) {}
                return "anonymous";
            };

            // Current Frame
            lines.push(`  at %c${findName(this.bytecode)}%c (IP: ${this.ip}, Bytecode: ${this.bytecode.length} bytes)`);

            // Previous Frames
            for (let i = this.frames.length - 1; i >= 0; i--) {
                const f = this.frames[i];
                lines.push(`  at %c${findName(f.bytecode)}%c (IP: ${f.ip}, Bytecode: ${f.bytecode.length} bytes)`);
            }
            
            return lines;
        }

        step() {
            if (this.status !== 'RUNNING') return false;
            try {
                if (this.ip >= this.bytecode.length) {
                    this.status = 'COMPLETED';
                    return false;
                }

                const op = this.read8();
                let executor = root.MerkavaExecutor || (root.MerkavaVM && root.MerkavaVM.Executor);
                
                if (!executor) {
                    this.status = 'CRASHED';
                    throw new Error("[VM Critical] Executor missing from the Palace.");
                }

                const result = executor.exec(op, this);
                
                if (result === 'HALT' || result === 'COMPLETED') {
                    this.status = 'COMPLETED';
                    return false;
                }
                
                if (result === 'UNKNOWN_OP') {
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
                    this.status = 'CRASHED';
                    console.group("%cB\"H - THE VESSELS HAVE SHATTERED", "color: #ff6b6b; font-weight: bold; font-size: 1.2rem;");
                    console.error("Error Soul:", e.message || e);
                    
                    const trace = this.getDivineTrace();
                    trace.forEach(line => {
                        if (line.includes("%c")) {
                            const parts = line.split("%c");
                            console.log(line, "color: #45a29e; font-weight: bold;", "color: inherit;", "color: #45a29e; font-weight: bold;", "color: inherit;");
                        } else {
                            console.log(line);
                        }
                    });

                    console.log("%c[The Stack of Creation]", "color: #66fcf1; font-weight: bold;");
                    const stackView = {};
                    this.stack.slice(-15).reverse().forEach((v, i) => {
                        stackView[`TOP - ${i}`] = { 
                            type: typeof v, 
                            value: (v && v.type === 'CLOSURE') ? `[Closure: ${v.code.bytecode.length} bytes]` : v 
                        };
                    });
                    console.table(stackView);
                    console.groupEnd();
                    return false;
                }
            }
            return true;
        }
    }
    
    root.MerkavaVM.Thread = Thread;
    console.log("[MerkavaVM] Thread Class Refined (Tracing Engaged).");
})(typeof self !== 'undefined' ? self : this);
