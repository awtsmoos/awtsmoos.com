
// B"H
export const EnvSource = () => {
    // Global State for the Worker
    self.env = {
        buffer: null,
        dataOffset: 0,
        vocab: [],
        metaKV: {}, 
        stats: null,
        kv: [], 
        pos: 0,
        tensorMap: new Map(),
        isInitialized: false,
        stop: false,
        debugMode: true,
        // Turbo Flag
        useWasm: false
    };

    /**
     * Awtsmoos Numerical Health Monitor
     */
    self.logStats = function(name, vec) {
        if (!vec || vec.length === 0) return;
        let min = 1e18, max = -1e18, sum = 0, sumSq = 0;
        let hasNaN = false;
        
        for(let i=0; i<vec.length; i++) {
            const v = vec[i];
            if (isNaN(v) || !isFinite(v)) { hasNaN = true; continue; }
            if (v < min) min = v;
            if (v > max) max = v;
            sum += v;
            sumSq += v * v;
        }
        
        if (hasNaN) {
             self.logDB(`[MATH] ${name}: !!! SIGNAL COLLAPSED (NaN/Inf) !!!`, 'error');
             return;
        }

        const rms = Math.sqrt(sumSq / vec.length);
        const msg = `[LAYER] ${name}: RMS=${rms.toExponential(3)} Min=${min.toFixed(3)} Max=${max.toFixed(3)}`;
        // Only log if anomalous
        if (rms > 50.0 || rms < 0.0001) self.logDB(msg, 'calc');
    }
};
