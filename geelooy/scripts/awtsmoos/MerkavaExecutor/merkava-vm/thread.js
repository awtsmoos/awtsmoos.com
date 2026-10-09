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
            // B"H (RAM): start at 64 slots (was 256); _growStack doubles
            // on demand. Saves ~1.5KB per thread; threads are numerous
            // and short-lived.
            this.stack = new Array(64);
            this._sp = 0;
            this.status = 'READY';
            this.frames = [];
            this.currentScope = { 'this': context };
            this.environment = context;
            this.catchStack = [];
            this.lastError = null;
            // B"H (2026-10-09): cache the strict-mode flag once. The old code
            // walked root.MerkavaVM.Security -> policy() -> vm.securityPolicy
            // on EVERY property get/set. securityPolicy is fixed at VM build
            // time and never mutated afterwards (verified: no setters exist).
            this._strict = !!(vm && vm.securityPolicy && vm.securityPolicy.strict === true);
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

        // B"H 2026-10-09: restores a try-context saved by ENTER_TRY after a
        // throw. Unwinds call frames opened after the try, restores that
        // frame's bytecode/constants/scope, and resets the operand stack —
        // so a throw across call frames lands in the right function with a
        // clean stack. Returns the error value to push for the catch block.
        _unwindToCatch(entry, error) {
            while (this.frames.length > entry[2]) this.frames.pop();
            this.ip = entry[0];
            this._sp = entry[1];
            this.bytecode = entry[3];
            this.constants = entry[4];
            this.currentScope = entry[5];
            this.currentUpvalues = entry[6];
            this.environment = entry[7];
            return error && error.vmValue !== undefined ? error.vmValue
                : error && error.message !== undefined ? error.message
                : error;
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
                    this.push(this._unwindToCatch(this.catchStack.pop(), error));
                    return true;
                }
                this.status = 'CRASHED';
                this.logCrash(error);
                return false;
            }
            return true;
        }

        /**
         * B"H (2026-10-09): Inline-threaded batch runner. The hottest opcodes
         * execute directly on hoisted locals (ip/bc/constants/stack/sp) with
         * zero handler-call overhead and zero per-instruction property
         * traffic. Cold/complex opcodes sync state and fall through to the
         * handler table; frame switches (CALL/RETURN) re-sync bc/constants/
         * stack/env afterwards. Every inline fast path is bit-identical to
         * its handler in executors/*.js (see notes per opcode). try/catch
         * semantics, catchStack, and HALT/COMPLETED/UNKNOWN_OP signals are
         * preserved exactly.
         */
        run(maxSteps) {
            if (this.status !== 'RUNNING') return 0;
            const handlers = this._getHandlers();
            if (!handlers) {
                this.status = 'CRASHED';
                throw new Error('[VM Critical] Executor missing from the Palace.');
            }
            // B"H: hoist hot state into locals. this.ip/this._sp are the
            // authoritative copies; locals are synced before every cold
            // handler call, every catch, and every loop exit.
            let steps = 0;
            let ip = this.ip;
            let bc = this.bytecode;
            let bcLen = bc.length;
            let constants = this.constants;
            let stack = this.stack;
            let sp = this._sp;
            let env = this.environment;
            const vm = this.vm;
            const mem = vm ? vm.memory : null;
            const memGlobals = mem ? mem.globals : undefined;
            const vmCtx = vm ? vm.context : undefined;
            // B"H: when no Security module is installed and the thread is not
            // strict, property fast paths skip guard/prepare calls (they are
            // no-ops without Security). Otherwise fall back to handlers.
            const noSecurity = !root.MerkavaVM.Security && !this._strict;
            const hasSelf = typeof self !== 'undefined';
            const cssStyleDecl = typeof CSSStyleDeclaration !== 'undefined' ? CSSStyleDeclaration : null;
            let coldResult;
            while (steps < maxSteps && this.status === 'RUNNING') {
                if (ip >= bcLen) { this.status = 'COMPLETED'; break; }
                const op = bc[ip++];
                try {
                    // ---- stack primitives (mirrors executors/stack.js) ----
                    if (op === 0x13) { // PUSH_CONST u16
                        if (ip + 1 >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        const idx = bc[ip] | (bc[ip + 1] << 8); ip += 2;
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        stack[sp++] = idx < constants.length ? constants[idx] : undefined;
                        steps++; continue;
                    }
                    if (op === 0x11) { // DUP
                        if (sp === 0) throw new Error('[VM Critical] Stack Underflow (DUP)');
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        stack[sp] = stack[sp - 1]; sp++;
                        steps++; continue;
                    }
                    if (op === 0x10) { // POP (clears slot; no-op on empty — mirrors pop())
                        if (sp > 0) { sp--; stack[sp] = undefined; }
                        steps++; continue;
                    }
                    if (op === 0x12) { // SWAP (underflow: exact pop/pop/push/push via cold path)
                        if (sp >= 2) {
                            const a = stack[sp - 1]; stack[sp - 1] = stack[sp - 2]; stack[sp - 2] = a;
                            steps++; continue;
                        }
                    } else if (op === 0x14) { // PUSH_UNDEFINED
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        stack[sp++] = undefined;
                        steps++; continue;
                    } else if (op === 0x15) { // PUSH_NULL
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        stack[sp++] = null;
                        steps++; continue;
                    } else if (op === 0x16) { // PUSH_TRUE
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        stack[sp++] = true;
                        steps++; continue;
                    } else if (op === 0x17) { // PUSH_FALSE
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        stack[sp++] = false;
                        steps++; continue;
                    } else if (op === 0x20) { // LOAD_LOCAL u8 (mirrors 0x20: currentScope?.[slot])
                        if (ip >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        const slot = bc[ip++];
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        const cs = this.currentScope;
                        stack[sp++] = cs == null ? undefined : cs[slot];
                        steps++; continue;
                    } else if (op === 0x21) { // STORE_LOCAL u8 (mirrors 0x21)
                        if (ip >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        const slot = bc[ip++];
                        let cs = this.currentScope;
                        if (!cs) cs = this.currentScope = {};
                        sp--; cs[slot] = stack[sp]; stack[sp] = undefined;
                        steps++; continue;
                    // ---- control flow (mirrors executors/flow.js) ----
                    } else if (op === 0x03) { // JUMP s16
                        if (ip + 1 >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        let off = bc[ip] | (bc[ip + 1] << 8); ip += 2;
                        if (off >= 0x8000) off -= 0x10000;
                        ip += off;
                        steps++; continue;
                    } else if (op === 0x04) { // JUMP_IF_FALSE s16 (mirrors pop() truthiness)
                        if (ip + 1 >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        let off = bc[ip] | (bc[ip + 1] << 8); ip += 2;
                        let cond;
                        if (sp > 0) { sp--; cond = stack[sp]; stack[sp] = undefined; }
                        if (!cond) {
                            if (off >= 0x8000) off -= 0x10000;
                            ip += off;
                        }
                        steps++; continue;
                    } else if (op === 0x05) { // JUMP_IF_TRUE s16
                        if (ip + 1 >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        let off = bc[ip] | (bc[ip + 1] << 8); ip += 2;
                        let cond;
                        if (sp > 0) { sp--; cond = stack[sp]; stack[sp] = undefined; }
                        if (cond) {
                            if (off >= 0x8000) off -= 0x10000;
                            ip += off;
                        }
                        steps++; continue;
                    } else if (op === 0x01) { // HALT
                        this.ip = ip; this._sp = sp;
                        this.status = 'COMPLETED';
                        break;
                    } else if (op === 0x00 || op === 0x0a) { // NOP / Crumple Zone
                        steps++; continue;
                    // ---- arithmetic (mirrors executors/math.js: no method calls, in-place) ----
                    } else if (op === 0x40) { // ADD
                        stack[sp - 2] = stack[sp - 2] + stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x41) { // SUB
                        stack[sp - 2] = stack[sp - 2] - stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x42) { // MUL
                        stack[sp - 2] = stack[sp - 2] * stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x43) { // DIV
                        stack[sp - 2] = stack[sp - 2] / stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x44) { // MOD
                        stack[sp - 2] = stack[sp - 2] % stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x45) { // POW
                        stack[sp - 2] = Math.pow(stack[sp - 2], stack[sp - 1]); sp--;
                        steps++; continue;
                    } else if (op === 0x46) { // AND
                        stack[sp - 2] = stack[sp - 2] & stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x47) { // OR
                        stack[sp - 2] = stack[sp - 2] | stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x48) { // XOR
                        stack[sp - 2] = stack[sp - 2] ^ stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x49) { // SHL
                        stack[sp - 2] = stack[sp - 2] << stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x4a) { // SHR
                        stack[sp - 2] = stack[sp - 2] >> stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x4b) { // USHR
                        stack[sp - 2] = stack[sp - 2] >>> stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x4c) { // EQ
                        stack[sp - 2] = stack[sp - 2] == stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x4d) { // NEQ
                        stack[sp - 2] = stack[sp - 2] != stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x4e) { // STRICT EQ
                        stack[sp - 2] = stack[sp - 2] === stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x4f) { // STRICT NEQ
                        stack[sp - 2] = stack[sp - 2] !== stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x50) { // GT
                        stack[sp - 2] = stack[sp - 2] > stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x51) { // GTE
                        stack[sp - 2] = stack[sp - 2] >= stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x52) { // LT
                        stack[sp - 2] = stack[sp - 2] < stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x53) { // LTE
                        stack[sp - 2] = stack[sp - 2] <= stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x60) { // NOT (in-place)
                        stack[sp - 1] = !stack[sp - 1];
                        steps++; continue;
                    } else if (op === 0x61) { // BIT NOT (in-place)
                        stack[sp - 1] = ~stack[sp - 1];
                        steps++; continue;
                    } else if (op === 0x62) { // NEGATE (in-place)
                        stack[sp - 1] = -stack[sp - 1];
                        steps++; continue;
                    } else if (op === 0x63) { // TYPEOF (in-place)
                        stack[sp - 1] = typeof stack[sp - 1];
                        steps++; continue;
                    } else if (op === 0x64) { // VOID (pop, no guard — mirrors t._sp--)
                        sp--;
                        steps++; continue;
                    // ---- globals (mirrors stack.js readGlobal/storeGlobal fast path) ----
                    } else if (op === 0x22) { // LOAD_GLOBAL u16
                        if (ip + 1 >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        const idx = bc[ip] | (bc[ip + 1] << 8); ip += 2;
                        const name = constants[idx];
                        let v;
                        if (!noSecurity || (this.withStack && this.withStack.length > 0) || name === 'exports') {
                            // B"H: security/with-scope/exports need the full handler.
                            this.ip = ip; this._sp = sp;
                            coldResult = handlers[op](this);
                            ip = this.ip; sp = this._sp;
                            if (this.bytecode !== bc) { bc = this.bytecode; bcLen = bc.length; constants = this.constants; }
                            if (this.stack !== stack) stack = this.stack;
                            env = this.environment;
                            if (coldResult === 'HALT' || coldResult === 'COMPLETED') { this.status = 'COMPLETED'; break; }
                            if (coldResult === 'UNKNOWN_OP') { this.status = 'CRASHED'; this.rememberCrash(new Error(`Unknown opcode at IP ${this.ip - 1}`)); break; }
                            steps++; continue;
                        }
                        if (name === 'undefined') v = undefined;
                        else if (env && (name in env)) v = env[name];
                        else if (memGlobals && Object.prototype.hasOwnProperty.call(memGlobals, name)) v = mem.getGlobal(name);
                        else if (vmCtx && (name in vmCtx)) v = vmCtx[name];
                        else throw new ReferenceError(`${String(name)} is not defined`);
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        stack[sp++] = v;
                        steps++; continue;
                    } else if (op === 0x23) { // STORE_GLOBAL u16
                        if (ip + 1 >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        const idx = bc[ip] | (bc[ip + 1] << 8); ip += 2;
                        const name = constants[idx];
                        let v;
                        if (sp > 0) { sp--; v = stack[sp]; stack[sp] = undefined; }
                        if (!noSecurity || (this.withStack && this.withStack.length > 0)) {
                            // B"H: full handler for security/with-scope.
                            if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                            stack[sp++] = v;
                            this.ip = ip; this._sp = sp;
                            coldResult = handlers[op](this);
                            ip = this.ip; sp = this._sp;
                            if (this.bytecode !== bc) { bc = this.bytecode; bcLen = bc.length; constants = this.constants; }
                            if (this.stack !== stack) stack = this.stack;
                            env = this.environment;
                            if (coldResult === 'HALT' || coldResult === 'COMPLETED') { this.status = 'COMPLETED'; break; }
                            if (coldResult === 'UNKNOWN_OP') { this.status = 'CRASHED'; this.rememberCrash(new Error(`Unknown opcode at IP ${this.ip - 1}`)); break; }
                            steps++; continue;
                        }
                        if (env) env[name] = v;
                        else if (mem) mem.setGlobal(name, v);
                        steps++; continue;
                    // ---- properties (mirrors executors/objects.js fast path) ----
                    } else if (op === 0x32 && noSecurity) { // GET_PROP
                        const key = stack[sp - 1], target = stack[sp - 2];
                        if (target == null || (hasSelf && typeof key === 'string' &&
                            (key === 'values' || key === 'keys' || key === 'entries'))) {
                            // B"H: null warn / legacy Object[key] fallback need the handler.
                        } else {
                            let v = target[key];
                            if (typeof v !== 'function') {
                                stack[sp - 2] = v; stack[sp - 1] = undefined; sp--;
                                steps++; continue;
                            }
                            // B"H: function values may need native-bind (legacyProperty) — cold.
                        }
                    } else if (op === 0x33 && noSecurity) { // SET_PROP
                        const value = stack[sp - 1], key = stack[sp - 2], target = stack[sp - 3];
                        const needsCold = target == null ||
                            (value && value.type === 'CLOSURE' && typeof key === 'string' &&
                                key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110) || // 'on*' + CLOSURE: eventClosure
                            (cssStyleDecl && target instanceof cssStyleDecl);
                        if (!needsCold) {
                            target[key] = value;
                            stack[sp - 3] = value; stack[sp - 2] = undefined; stack[sp - 1] = undefined;
                            sp -= 2;
                            steps++; continue;
                        }
                    }
                    // ---- cold/complex opcodes: sync state, delegate to handler table ----
                    this.ip = ip; this._sp = sp;
                    const handler = handlers[op];
                    if (handler) {
                        coldResult = handler(this);
                    } else if (op === 0x00 || op === 0x0a) {
                        coldResult = undefined;
                    } else {
                        this.status = 'CRASHED';
                        this.rememberCrash(new Error(`Unknown opcode 0x${op.toString(16)} at IP ${ip - 1}`));
                        break;
                    }
                    if (coldResult === 'HALT' || coldResult === 'COMPLETED') {
                        this.status = 'COMPLETED';
                        break;
                    }
                    if (coldResult === 'UNKNOWN_OP') {
                        this.status = 'CRASHED';
                        this.rememberCrash(new Error(`Unknown opcode at IP ${this.ip - 1}`));
                        break;
                    }
                    // B"H: re-sync — CALL/RETURN may have swapped bytecode,
                    // constants, stack, and environment (frame switch).
                    ip = this.ip; sp = this._sp;
                    if (this.bytecode !== bc) { bc = this.bytecode; bcLen = bc.length; constants = this.constants; }
                    if (this.stack !== stack) stack = this.stack;
                    env = this.environment;
                } catch (error) {
                    // B"H: sync before crash bookkeeping so trace/ip/push see truth.
                    this.ip = ip; this._sp = sp;
                    if (this.catchStack && this.catchStack.length > 0) {
                        this.push(this._unwindToCatch(this.catchStack.pop(), error));
                        ip = this.ip; sp = this._sp;
                        bc = this.bytecode; bcLen = bc.length; constants = this.constants;
                        if (this.stack !== stack) stack = this.stack;
                        env = this.environment;
                    } else {
                        this.status = 'CRASHED';
                        this.logCrash(error);
                        break;
                    }
                }
                steps++;
            }
            this.ip = ip; this._sp = sp;
            return steps;
        }
    }

    root.MerkavaVM.Thread = Thread;
    console.log('[MerkavaVM] Thread Class Refined (Stored Tracing Engaged).');
})(typeof self !== 'undefined' ? self : this);
