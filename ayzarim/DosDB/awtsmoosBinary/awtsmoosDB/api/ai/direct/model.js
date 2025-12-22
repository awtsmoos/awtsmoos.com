
// B"H
const Ops = require('../math/ops.js');
const Layers = require('./layers.js');
const Logger = require('../utils/logger.js');

class Model {
    constructor(engine) {
        this.engine = engine;
        this.layers = new Layers(engine);
    }

    async forward(token_id, pos) {
        const p = this.engine.params;
        
        // 1. Embedding
        const w_emb_raw = this.engine.loader.getRawTensor(
            this.engine.loader.globalTensorMap.embed || 'token_embd.weight'
        );
        
        if (!w_emb_raw) throw new Error("Embedding tensor missing");

        let x;
        if (w_emb_raw.type === 2) { // Q4_0
            const { blockElements, blockSize } = { blockElements: 32, blockSize: 18 };
            const rowBytes = (p.n_embd / blockElements) * blockSize;
            const start = token_id * rowBytes;
            
            if (start + rowBytes <= w_emb_raw.data.length) {
                const chunk = w_emb_raw.data.subarray(start, start + rowBytes);
                x = Ops.dequantizeQ4_0(chunk, p.n_embd);
            } else {
                x = new Float32Array(p.n_embd);
            }
        } else {
             x = this.engine.loader.getTensor(
                this.engine.loader.globalTensorMap.embed, 
                token_id * p.n_embd, 
                p.n_embd
            );
        }
        
        // Scale (Gemma)
        if (p.useEmbScale) {
            const scale = Math.sqrt(p.n_embd);
            for(let i=0; i<x.length; i++) x[i] *= scale;
        }

        // 2. Layers
        for (let l = 0; l < p.n_layer; l++) {
            x = this.layers.forward(x, l, pos);
        }

        // 3. Final Norm
        const w_norm = this.engine.loader.getTensor(this.engine.loader.globalTensorMap.output_norm);
        if (w_norm) {
            const unitOffset = p.arch === 'gemma3' ? 1.0 : 0.0;
            x = Ops.rmsNorm(x, w_norm, p.norm_eps, unitOffset);
        }
        
        return x;
    }

    computeLogits(hidden) {
        const p = this.engine.params;
        let w_name = this.engine.loader.globalTensorMap.output || this.engine.loader.globalTensorMap.embed;
        const n_vocab = this.engine.vocab.length;
        
        const w_out = this.engine.loader.getTensor(w_name);
        
        let logits;
        if (w_out) {
             logits = Ops.matVecMul(hidden, w_out, n_vocab);
        } else {
             logits = new Float32Array(n_vocab);
        }
        
        if (p.final_soft_cap > 0) {
            logits = Ops.softCap(logits, p.final_soft_cap);
        }
        
        return logits;
    }
}

module.exports = Model;
