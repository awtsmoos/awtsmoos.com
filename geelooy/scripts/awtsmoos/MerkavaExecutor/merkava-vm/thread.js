// B"H
(function(root) {
    // Ensure namespace exists
    root.MerkavaVM = root.MerkavaVM || {};

    const OPCODES = (root.MerkavaOpcodes && root.MerkavaOpcodes.OPCODES) || {};

    class Thread {
        constructor(vm, codeObject, context = {}) {
            this.id = Math.floor(Math.random() * 100000);
            this.vm = vm;
            this.bytecode = codeObject.bytecode;
            this.constants = codeObject.constants || [];
            this.ip = 0; // Instruction Pointer
            this.sp = 0; // Stack Pointer
            this.status = 'READY';
            
            this.frames = []; 
            this.currentFrame = null;
            this.stack = []; 
            this.environment = context; 
        }

        read8() {
            if (this.ip >= this.bytecode.length) {
                this.status = 'COMPLETED';
                return 0;
            }
            return this.bytecode[this.ip++];
        }

        read16() {
            // Check bounds for 2 bytes
            if (this.ip + 1 >= this.bytecode.length) {
                this.status = 'COMPLETED';
                return 0;
            }
            const low = this.read8();
            const high = this.read8();
            let val = (high << 8) | low;
            
            // B"H - EXPLICIT SIGNED CONVERSION
            // If the sign bit (15th bit) is set, subtract 2^16 to get negative value
            if (val >= 0x8000) {
                val = val - 0x10000;
            }
            return val;
        }

        push(val) {
            this.stack.push(val);
        }

        pop() {
            return this.stack.pop();
        }

        peek() {
            return this.stack[this.stack.length - 1];
        }

        step() {
            if (this.status !== 'RUNNING') return false;
            
            const op = this.read8();
            
            try {
                switch (op) {
                    case OPCODES.HALT:
                        this.status = 'COMPLETED';
                        return false;

                    case OPCODES.PUSH_CONST:
                        this.push(this.constants[this.read16()]);
                        break;
                        
                    case OPCODES.PUSH_UNDEFINED: this.push(undefined); break;
                    case OPCODES.PUSH_NULL: this.push(null); break;
                    case OPCODES.PUSH_TRUE: this.push(true); break;
                    case OPCODES.PUSH_FALSE: this.push(false); break;
                    
                    case OPCODES.POP: this.pop(); break;
                    case OPCODES.DUP: this.push(this.peek()); break;
                    case OPCODES.SWAP: {
                        const a = this.pop();
                        const b = this.pop();
                        this.push(a);
                        this.push(b);
                        break;
                    }

                    // --- ARITHMETIC ---
                    case OPCODES.ADD: { const b = this.pop(); const a = this.pop(); this.push(a + b); break; }
                    case OPCODES.SUB: { const b = this.pop(); const a = this.pop(); this.push(a - b); break; }
                    case OPCODES.MUL: { const b = this.pop(); const a = this.pop(); this.push(a * b); break; }
                    case OPCODES.DIV: { const b = this.pop(); const a = this.pop(); this.push(a / b); break; }
                    case OPCODES.MOD: { const b = this.pop(); const a = this.pop(); this.push(a % b); break; }
                    case OPCODES.LT:  { const b = this.pop(); const a = this.pop(); this.push(a < b); break; }
                    case OPCODES.LTE: { const b = this.pop(); const a = this.pop(); this.push(a <= b); break; }
                    case OPCODES.GT:  { const b = this.pop(); const a = this.pop(); this.push(a > b); break; }
                    case OPCODES.GTE: { const b = this.pop(); const a = this.pop(); this.push(a >= b); break; }
                    case OPCODES.EQ:  { const b = this.pop(); const a = this.pop(); this.push(a == b); break; }
                    case OPCODES.STRICT_EQ: { const b = this.pop(); const a = this.pop(); this.push(a === b); break; }
                    case OPCODES.NEQ: { const b = this.pop(); const a = this.pop(); this.push(a != b); break; }
                    
                    // --- FLOW CONTROL ---
                    case OPCODES.JUMP: {
                        const offset = this.read16();
                        this.ip += offset;
                        break;
                    }
                    case OPCODES.JUMP_IF_FALSE: {
                        const offset = this.read16();
                        const val = this.pop();
                        if (!val) this.ip += offset;
                        break;
                    }

                    // --- VARIABLES ---
                    case OPCODES.STORE_GLOBAL: {
                        const nameIdx = this.read16();
                        const name = this.constants[nameIdx];
                        const val = this.pop();
                        this.vm.memory.setGlobal(name, val);
                        break;
                    }
                    case OPCODES.LOAD_GLOBAL: {
                        const nameIdx = this.read16();
                        const name = this.constants[nameIdx];
                        this.push(this.vm.memory.getGlobal(name));
                        break;
                    }
                    
                    case OPCODES.STORE_LOCAL: {
                        const idx = this.read8();
                        if (!this.currentScope) this.currentScope = {};
                        this.currentScope[idx] = this.pop();
                        break;
                    }
                    case OPCODES.LOAD_LOCAL: {
                         const idx = this.read8();
                         if (!this.currentScope) this.push(undefined);
                         else this.push(this.currentScope[idx]);
                         break;
                    }

                    // --- SYSCALLS ---
                    case OPCODES.SYSCALL: {
                        const id = this.read8();
                        const argCount = this.read8();
                        const args = [];
                        for(let i=0; i<argCount; i++) args.unshift(this.pop());
                        
                        if (this.vm.hostAPI[id]) {
                            const res = this.vm.hostAPI[id](...args);
                            this.push(res);
                        } else {
                            this.push(undefined);
                        }
                        break;
                    }

                    // --- FUNCTIONS ---
                    case OPCODES.CLOSURE: {
                        const idx = this.read16();
                        const codeObj = this.constants[idx];
                        this.push({ type: 'CLOSURE', code: codeObj });
                        break;
                    }
                    case OPCODES.CALL: {
                        const argCount = this.read8();
                        const args = [];
                        for(let i=0; i<argCount; i++) args.unshift(this.pop());
                        const callee = this.pop();
                        
                        if (callee && callee.type === 'CLOSURE') {
                            this.frames.push({
                                ip: this.ip,
                                bytecode: this.bytecode,
                                constants: this.constants,
                                scope: this.currentScope
                            });
                            
                            this.bytecode = callee.code.bytecode;
                            this.constants = callee.code.constants;
                            this.ip = 0;
                            
                            // B"H - Map Arguments to Local Scope Indices
                            this.currentScope = {};
                            args.forEach((arg, i) => {
                                this.currentScope[i] = arg;
                            });
                            
                        } else if (typeof callee === 'function') {
                             const res = callee(...args);
                             this.push(res);
                        }
                        break;
                    }
                    case OPCODES.RETURN: {
                        const result = this.pop();
                        if (this.frames.length > 0) {
                            const frame = this.frames.pop();
                            this.ip = frame.ip;
                            this.bytecode = frame.bytecode;
                            this.constants = frame.constants;
                            this.currentScope = frame.scope;
                            this.push(result);
                        } else {
                            this.push(result);
                            this.status = 'COMPLETED';
                        }
                        break;
                    }

                    default:
                        // Ignore unknown or no-ops
                        break;
                }
            } catch(e) {
                console.error("VM Exception:", e);
                this.status = 'CRASHED';
            }
            
            return true;
        }
    }

    root.MerkavaVM.Thread = Thread;

})(typeof self !== 'undefined' ? self : this);