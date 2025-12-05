// B"H
/**
 * @file merkava-debugger.js
 * @version 1.0.0
 */

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./merkava-opcodes.js'), require('./merkava-memory.js'));
    } else {
        root.MerkavaDebugger = factory(root.MerkavaOpcodes, root.MerkavaMemory);
    }
}(typeof self !== 'undefined' ? self : this, function(OpcodesModule, MemoryModule) {

    const { OPCODES, getOpName, VM_THREAD_STATUS } = OpcodesModule;

    class MerkavaDebugger {
        constructor(vm) {
            this.vm = vm;
            this.memory = vm.memory;
            this.breakpoints = new Set();
            this.isPaused = false;
        }

        attach() {
            this.vm.onStep = (thread, opcode) => this._handleStep(thread, opcode);
        }

        _handleStep(thread, opcode) {
            if (this.breakpoints.has(thread.ip)) {
                console.warn(`[Debugger] Hit Breakpoint at IP: ${thread.ip}`);
                this.pause();
            }
            if (this.isPaused) {
                thread.status = VM_THREAD_STATUS.PAUSED_BY_DEBUGGER;
                throw { type: "DEBUGGER_PAUSE", threadId: thread.id };
            }
        }

        pause() { this.isPaused = true; }
        resume() {
            this.isPaused = false;
            this.vm.threads.forEach(t => {
                if (t.status === VM_THREAD_STATUS.PAUSED_BY_DEBUGGER) t.status = VM_THREAD_STATUS.RUNNING;
            });
        }

        setBreakpoint(ip) { this.breakpoints.add(ip); }

        inspectThread(threadId) {
            const thread = this.vm.threads.find(t => t.id === threadId);
            if (!thread) return "Thread not found.";
            return {
                id: thread.id,
                status: Object.keys(VM_THREAD_STATUS).find(k => VM_THREAD_STATUS[k] === thread.status),
                ip: thread.ip,
                stackDepth: thread.stack.length,
                topOfStack: thread.stack.slice(-5),
                currentOp: getOpName(thread.code[thread.ip])
            };
        }

        async scanMemory(predicate) {
            const results = [];
            for (const [ptr, val] of this.memory.ram.entries()) {
                if (predicate(val)) results.push({ source: 'RAM', ptr, val });
            }
            const db = this.memory.db.db;
            if (db) {
                await new Promise((resolve) => {
                    const tx = db.transaction("heap_objects", "readonly");
                    const store = tx.objectStore("heap_objects");
                    const req = store.openCursor();
                    req.onsuccess = (e) => {
                        const cursor = e.target.result;
                        if (cursor) {
                            if (!this.memory.ram.has(cursor.key) && predicate(cursor.value)) {
                                results.push({ source: 'DISK', ptr: cursor.key, val: cursor.value });
                            }
                            cursor.continue();
                        } else resolve();
                    };
                });
            }
            return results;
        }

        async createCheckpoint() {
            const wasPaused = this.isPaused;
            this.pause();
            await this.memory.flush();
            const threadsDump = this.vm.threads.map(t => ({
                id: t.id, status: t.status, ip: t.ip, bp: t.bp,
                stack: t.stack, frames: t.frames, code: Array.from(t.code), constants: t.constants
            }));
            const snapshot = {
                timestamp: Date.now(),
                nextPtr: this.memory.nextPtr,
                threads: threadsDump
            };
            if (!wasPaused) this.resume();
            return JSON.stringify(snapshot);
        }
    }

    return MerkavaDebugger;
}));