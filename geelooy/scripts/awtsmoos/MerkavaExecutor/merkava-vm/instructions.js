
// B"H
(function(root) {
    root.MerkavaExecutor = {
        exec(op, thread) {
            const handlers = root.MerkavaVM.OpHandlers;
            
            if (!handlers) {
                console.error("[VM Critical] OpHandlers table is missing! Check module loading order.");
                return 'CRASHED';
            }

            // Dispatch to registered handler
            if (handlers[op]) {
                const result = handlers[op](thread);
                if (result) return result; // Return flow signals (e.g. HALT)
                return;
            }

            // Fallback for NOP or Unknown
            if (op === 0x00) return;
            
            console.error(`[VM] Unknown Opcode: 0x${op.toString(16)}`);
            return 'UNKNOWN_OP';
        }
    };
    
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.Executor = root.MerkavaExecutor;
    
    console.log("[MerkavaVM] Dispatcher Installed (Modular V7 - Debug).");
})(typeof self !== 'undefined' ? self : this);
