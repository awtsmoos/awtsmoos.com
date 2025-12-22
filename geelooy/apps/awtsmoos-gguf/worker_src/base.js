
// B"H
export const BaseSource = () => {
    // Global Logging Utility
    self.logDB = function(msg, type = 'debug') {
        if (type === 'debug' && !self.env.debugMode) return;
        self.postMessage({ type: 'LOG', payload: { msg: msg, level: type } });
    };

    self.console.log = function(...args) { self.logDB(args.join(' '), 'debug'); };
    self.console.error = function(...args) { self.logDB(args.join(' '), 'error'); };

    /**
     * B"H
     * Converts a Uint8Array into a readable hex string for debugging the binary soul.
     */
    self.toHex = function(bytes) {
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
    };

    // Concise Vector Trace
    self.traceVec = function(label, data, count = 5) {
        if (!data || data.length === 0) {
            self.logDB(`[TRACE] ${label}: EMPTY`, 'warn');
            return;
        }
        let str = "";
        const limit = Math.min(data.length, count);
        for(let i=0; i<limit; i++) {
            str += data[i].toFixed(4);
            if(i < limit-1) str += ", ";
        }
        // RMS for health check
        let sumSq = 0;
        for(let i=0; i<data.length; i++) sumSq += data[i]*data[i];
        const rms = Math.sqrt(sumSq / data.length);
        
        self.logDB(`[TRACE] ${label} (RMS:${rms.toFixed(3)}): [${str}...]`, 'tensor');
    };

    self.hexDump = function(data, label) {
        if (!self.env.debugMode) return;
        const slice = data.subarray ? data.subarray(0, 32) : data.slice(0, 32);
        self.logDB(`[HEX] ${label}: ${self.toHex(slice)}...`, 'tensor');
    };
};
