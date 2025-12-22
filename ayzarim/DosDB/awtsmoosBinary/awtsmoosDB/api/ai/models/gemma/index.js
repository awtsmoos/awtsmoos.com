
// B"H
const Ops = require('../../math/ops.js');
const { asF32 } = require('./utils.js');
const forwardLayer = require('./layer.js');

class GemmaModel {
    constructor(engine) {
        this.engine = engine;
        this.params = engine.params;
    }

    forward(x, pos, kv_cache) {
        this.engine.history.push(x);

        // 1. Embedding
        const w_emb = this.engine.getGlobalWeight('embed');
        if (!w_emb) throw new Error("Missing Embedding");

        const n_embd = this.params.n_embd;
        
        // Dequantize embedding row
        const rowId = x;
        let hidden;
        
        if (w_emb.type === 2) { // Q4_0
            const blockSize = 18;
            const blockEls = 32;
            const rowBytes = (n_embd / blockEls) * blockSize;
            const offset = rowId * rowBytes;
            
            if (offset + rowBytes > w_emb.data.length) {
                hidden = new Float32Array(n_embd); 
            } else {
                const rowBuf = w_emb.data.subarray(offset, offset + rowBytes);
                hidden = Ops.dequantizeQ4_0(rowBuf, n_embd);
            }
        } else {
            const rowBytes = n_embd * 4;
            const offset = rowId * rowBytes;
            hidden = asF32(w_emb.data.subarray(offset, offset + rowBytes));
        }

        const scale = Math.sqrt(n_embd);
        for(let i=0; i<hidden.length; i++) hidden[i] *= scale;

        // 2. Layers
        for (let l = 0; l < this.params.n_layer; l++) {
            hidden = forwardLayer(this.engine, hidden, l, pos, kv_cache);
        }

        // 3. Final Norm
        const w_norm = this.engine.getGlobalWeight('output_norm');
        if (w_norm) {
            const norm_v = asF32(w_norm.data);
            hidden = Ops.rmsNorm(hidden, norm_v, this.params.norm_eps);
        }

        return hidden;
    }
}

module.exports = GemmaModel;
