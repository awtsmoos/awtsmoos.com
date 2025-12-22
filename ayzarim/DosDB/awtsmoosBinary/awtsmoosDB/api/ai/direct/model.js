
// B"H
const Stats = require('../math/stats.js');
const Matrix = require('../math/matrix.js');
const Act = require('../math/act.js');
const Layers = require('./layers.js');
const Logger = require('../utils/logger.js');

class Model {
    constructor(engine) {
        this.engine = engine;
        this.layers = new Layers(engine);
    }

    async forward(token_id, pos) {
        const stats = this.engine.params;
        const loader = this.engine.loader;

        // 1. Embedding
        // getEmbeddingRow logic from model_loader.js
        const embInfo = loader.tensorMap.get('token_embd.weight') || loader.tensorMap.get('model.embed_tokens.weight');
        if (!embInfo) throw new Error("Embedding Missing");
        
        let x = loader.getTensor(embInfo.name, token_id * stats.n_embd, stats.n_embd);
        if (!x) throw new Error("Embedding Missing for ID: " + token_id);

        // Scale (Gemma)
        if (stats.useEmbScale) {
            const embScale = Math.sqrt(stats.n_embd);
            for(let i=0; i<x.length; i++) x[i] *= embScale;
        }

        // 2. Layers
        for (let l = 0; l < stats.n_layer; l++) {
            x = this.layers.forward(x, l, pos);
        }

        // 3. Final Norm
        let w_norm = loader.getTensor(loader.globalTensorMap.output_norm);
        if (w_norm) x = Stats.rmsNorm(x, w_norm, stats.norm_eps, 0.0);
        
        return x;
    }

    computeLogits(hidden) {
        const stats = this.engine.params;
        const loader = this.engine.loader;
        
        const w_out_name = loader.globalTensorMap.output || loader.globalTensorMap.embed;
        const w_out = loader.getTensor(w_out_name); // This will read the whole tensor?
        // Note: matVecMul takes (x, w, n_out). w must be the full matrix.
        // If w_out is huge (e.g. 256k vocab), loading it all into memory is heavy.
        // But the browser implementation loads it: self.loadWeight('output.weight', false)
        // If we want to match, we must load it.
        
        const vocabSize = this.engine.vocab.length;
        const logits = Matrix.matVecMul(hidden, w_out, vocabSize);

        // FINAL SOFT CAPPING (Gemma 3)
        if (stats.final_soft_cap > 0) {
            const cap = stats.final_soft_cap;
            const invCap = 1.0 / cap;
            for(let i=0; i<logits.length; i++) {
                logits[i] = cap * Math.tanh(logits[i] * invCap);
            }
        }
        
        return logits;
    }
}

module.exports = Model;
