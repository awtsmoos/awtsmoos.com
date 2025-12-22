
// B"H
const Ops = require('../math/ops.js');

class Sampler {
    constructor(engine) {
        this.engine = engine;
    }

    computeLogitsFromHidden(hidden) {
        let w = this.engine.getGlobalWeight('output') || this.engine.getGlobalWeight('embed');
        if (!w) throw new Error("Logits weight missing");
        
        const logits = this.engine.linear(hidden, w);
        if (logits) {
            this.engine.vocabSize = logits.length;
            
            // Final Soft Capping
            if (this.engine.params.final_soft_cap > 0) {
                const cap = this.engine.params.final_soft_cap;
                const invCap = 1.0 / cap;
                for(let i=0; i<logits.length; i++) {
                    logits[i] = cap * Math.tanh(logits[i] * invCap);
                }
            }
        }
        return logits;
    }

    sample(logits, config, history) {
        const temp = config.temp;
        const top_p = config.top_p;
        const penalty = config.repeat_penalty;
        
        const penalty_window = 64;
        const start = Math.max(0, history.length - penalty_window);
        const context = history.slice(start);
        const seen = new Set(context);
        
        // 1. Penalty
        for (const id of seen) {
            if (logits[id] > 0) logits[id] /= penalty;
            else logits[id] *= penalty;
        }

        // 0. Greedy Bypass
        if (temp < 0.01) {
            let max = -Infinity;
            let idx = 0;
            for (let i = 0; i < logits.length; i++) {
                if (logits[i] > max) { max = logits[i]; idx = i; }
            }
            return idx;
        }

        // 2. Temp Scaling
        let maxLogit = -Infinity;
        for (let i = 0; i < logits.length; i++) {
            logits[i] /= temp;
            if (logits[i] > maxLogit) maxLogit = logits[i];
        }

        // 3. Softmax
        const probs = new Float32Array(logits.length);
        let sum = 0;
        for (let i = 0; i < logits.length; i++) {
            const p = Math.exp(logits[i] - maxLogit);
            probs[i] = p;
            sum += p;
        }
        
        // 4. Top-P
        const candidates = [];
        // Dynamic Threshold to support large vocabs (256k)
        const threshold = 0.0001 / logits.length; 
        
        for (let i = 0; i < probs.length; i++) {
            const norm_p = probs[i] / sum;
            if (norm_p > threshold) candidates.push({ id: i, p: norm_p });
        }
        
        candidates.sort((a, b) => b.p - a.p);
        
        // Robustness: If empty, fallback to argmax
        if (candidates.length === 0) {
            let max = -Infinity;
            let idx = 0;
            for (let i = 0; i < logits.length; i++) {
                if (logits[i] > max) { max = logits[i]; idx = i; }
            }
            return idx;
        }
        
        let cumSum = 0;
        let cutoff = candidates.length - 1; 
        for (let i = 0; i < candidates.length; i++) {
            cumSum += candidates[i].p;
            if (cumSum >= top_p) {
                cutoff = i;
                break;
            }
        }
        
        // 5. Selection
        const r = Math.random() * cumSum;
        let acc = 0;
        for (let i = 0; i <= cutoff; i++) {
            acc += candidates[i].p;
            if (acc >= r) return candidates[i].id;
        }
        
        return candidates[cutoff].id;
    }
}

module.exports = Sampler;
