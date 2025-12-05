// B"H
(function(root) {
    // Ensure Namespace
    // B"H - Capture existing object which might contain 'Thread' if loaded first
    const previousNamespace = root.MerkavaVM || {};
    
    class MerkavaVM {
        constructor(memoryManager, hostAPI = {}, context = {}) {
            this.memory = memoryManager;
            this.hostAPI = hostAPI;
            this.context = context;
            this.threads = [];
        }

        spawn(codeObject) {
            // B"H - Create the Main Thread
            // Pass the VM instance, the Code Object, and the Context
            
            // B"H - Safe Thread Resolution
            // We check root.MerkavaVM.Thread (Static property on the class)
            // Or fallback to MerkavaVM.Thread if accessible in scope
            const ThreadClass = root.MerkavaVM.Thread || MerkavaVM.Thread;
            
            if (!ThreadClass) {
                throw new Error("MerkavaVM.Thread is not defined. Check module load order.");
            }

            const thread = new ThreadClass(this, codeObject, this.context);
            thread.status = 'RUNNING';
            this.threads.push(thread);
            return thread;
        }

        run(cycles = 1000) {
            // B"H - Run logic
            for (let i = 0; i < cycles; i++) {
                let active = false;
                // Round-robin execution of threads
                for (const thread of this.threads) {
                    if (thread.status === 'RUNNING') {
                        thread.step();
                        active = true;
                    }
                }
                // If no threads were running this cycle, break the cycle loop
                // (to avoid busy-waiting if all are WAITING)
                if (!active) break;
            }

            // B"H - Return TRUE if any thread is still ALIVE (RUNNING, WAITING, BLOCKED, etc.)
            // Return FALSE only if all threads are definitely finished (COMPLETED, HALTED, TERMINATED).
            // This ensures the SDK loop keeps running for interactive apps waiting on input.
            return this.threads.some(t => {
                const s = t.status;
                return s !== 'COMPLETED' && s !== 'TERMINATED' && s !== 'HALTED' && s !== 'KILLED';
            });
        }
    }

    // B"H - Restore properties (like Thread) to the new Class Object
    // This ensures that if Thread was defined before this file ran, it is re-attached to the Class.
    for (let key in previousNamespace) {
        if (Object.prototype.hasOwnProperty.call(previousNamespace, key)) {
            MerkavaVM[key] = previousNamespace[key];
        }
    }

    // Export
    root.MerkavaVM = MerkavaVM;

})(typeof self !== 'undefined' ? self : this);