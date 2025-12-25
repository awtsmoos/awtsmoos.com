
// B"H
(function(root) {
    const previousNamespace = root.MerkavaVM || {};
    
    class MerkavaVM {
        constructor(memoryManager, hostAPI = {}, context = {}, importResolver = null) {
            this.memory = memoryManager;
            this.hostAPI = hostAPI;
            this.context = context;
            this.importResolver = importResolver;
            this.threads = [];
            this.pendingAsyncCount = 0; 
            this.cycleCount = 0;
            this.MAX_THREADS = 128; // B"H - Expanded for density
        }

        spawn(codeObject) {
            if (this.threads.length >= this.MAX_THREADS) {
                console.warn(`[MerkavaVM] Thread limit reached (${this.MAX_THREADS}). Emanation suppressed.`);
                return { status: 'SUPPRESSED' };
            }

            const ThreadClass = root.MerkavaVM.Thread || MerkavaVM.Thread;
            if (!ThreadClass) throw new Error("MerkavaVM.Thread is not defined.");

            const thread = new ThreadClass(this, codeObject, this.context);
            thread.status = 'RUNNING';
            this.threads.push(thread);
            return thread;
        }

        run(cycles = 1000) {
            let totalStepsInRun = 0;
            
            // B"H - Distributed Cycle Allocation
            while (totalStepsInRun < cycles) {
                let ranSomething = false;
                for (const thread of this.threads) {
                    if (thread.status === 'RUNNING') {
                        thread.step();
                        totalStepsInRun++;
                        this.cycleCount++;
                        ranSomething = true;
                        // Yield if we hit the budget, but ensure the next loop starts from current position
                        if (totalStepsInRun >= cycles) break;
                    }
                }
                if (!ranSomething) break;
            }

            // B"H - Efficient Thread Reaping
            this.threads = this.threads.filter(t => {
                const s = t.status;
                return s === 'RUNNING' || s === 'READY' || s === 'YIELDED' || s === 'AWAITING' || s === 'SUSPENDED';
            });

            return this.threads.length > 0 || this.pendingAsyncCount > 0;
        }
    }

    for (let key in previousNamespace) {
        if (Object.prototype.hasOwnProperty.call(previousNamespace, key)) {
            MerkavaVM[key] = previousNamespace[key];
        }
    }

    root.MerkavaVM = MerkavaVM;
})(typeof self !== 'undefined' ? self : this);
