
// B"H
export const MathStatsSource = () => {
    
    self.rmsNorm = (x, weight, epsilon, unitOffset = 0.0) => {
        const size = x.length;
        if (!size) return x;
        
        // 1. Calculate RMS
        let ss = 0;
        for(let i=0; i<size; i++) {
            ss += x[i] * x[i];
        }
        const rms = Math.sqrt((ss / size) + epsilon);
        const invRms = 1.0 / (rms || 1e-9); // Prevent div by zero
        
        const out = new Float32Array(size);
        const wLen = weight ? weight.length : 0;
        const useWeight = wLen > 0;
        
        // Unroll loop slightly for speed
        for(let i=0; i<size; i++) {
            let w = 1.0;
            if (useWeight) {
                // Modulo protection, though weight should match size
                w = weight[i % wLen];
            } 
            w += unitOffset;
            
            out[i] = x[i] * invRms * w;
        }
        return out;
    };

    self.softmax = (x) => {
        const size = x.length;
        if (!size) return x;
        
        let max = -Infinity;
        for(let i=0; i<size; i++) {
            if (x[i] > max) max = x[i];
        }
        
        let sum = 0;
        const out = new Float32Array(size);
        for(let i=0; i<size; i++) {
            // Stability: exp(x - max)
            const v = Math.exp(x[i] - max);
            out[i] = v;
            sum += v;
        }
        
        const invSum = 1.0 / (sum || 1e-9);
        for(let i=0; i<size; i++) out[i] *= invSum;
        
        return out;
    };
    
    self.silu = (x) => {
        const out = new Float32Array(x.length);
        for(let i=0; i<x.length; i++) out[i] = x[i] / (1.0 + Math.exp(-x[i]));
        return out;
    };
};
