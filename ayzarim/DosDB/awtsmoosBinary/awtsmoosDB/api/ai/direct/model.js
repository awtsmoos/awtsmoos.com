// B"H
const Stats = require('../math/stats.js');
const Matrix = require('../math/matrix.js');
const Act = require('../math/act.js');
const { dequantize } = require('../math/quant.js');
const { getByteSize, GGML_TYPE } = require('../math/types.js');
const Layers = require('./layers.js');
const Logger = require('../utils/logger.js');

class Model {
    constructor(engine) {
        this.engine = engine;
        this.layers = new Layers(engine);
        this.logitScratch = null;
    }

    async forward(token_id, pos) {
        const stats = this.engine.params;
        const loader = this.engine.loader;

        // Embedding
        const embInfo = loader.tensorMap.get('token_embd.weight') || loader.tensorMap.get('model.embed_tokens.weight');
        if (!embInfo) throw new Error("Embedding Missing");
        
        let x = loader.getTensor(embInfo.name, token_id * stats.n_embd, stats.n_embd);
        if (!x) throw new Error("Embedding Missing for ID: " + token_id);

        if (stats.useEmbScale) {
            const embScale = Math.sqrt(stats.n_embd);
            for(let i=0; i<x.length; i++) x[i] *= embScale;
        }

        for (let l = 0; l < stats.n_layer; l++) {
            x = this.layers.forward(x, l, pos);
        }

        let w_norm = loader.getTensor(loader.globalTensorMap.output_norm);
        if (w_norm) {
            // Gemma +1.0 Offset
            const unitOffset = stats.arch.includes('gemma') ? 1.0 : 0.0;
            x = Stats.rmsNorm(x, w_norm, stats.norm_eps, unitOffset);
        }
        
        return x;
    }

    computeLogits(hidden) {
        const stats = this.engine.params;
        const loader = this.engine.loader;
        
        const w_out_name = loader.globalTensorMap.output || loader.globalTensorMap.embed;
        const vocabSize = this.engine.vocab.length;
        const dim = hidden.length;
        
        // 1. Get RAW Compressed Output Head (80MB)
        const w_raw = loader.getTensor(w_out_name, 0, null, true); 
        const info = loader.tensorMap.get(w_out_name);
        
        const logits = new Float32Array(vocabSize);
        const CHUNK_ROWS = 1024;
        
        const type = info.type;
        const { blockElements, blockSize } = getByteSize(type);
        const bytesPerRow = (dim / blockElements) * blockSize;
        
        const neededSize = CHUNK_ROWS * dim;
        if (!this.logitScratch || this.logitScratch.length < neededSize) {
            this.logitScratch = new Float32Array(neededSize);
        }
        
        for (let i = 0; i < vocabSize; i += CHUNK_ROWS) {
            const count = Math.min(CHUNK_ROWS, vocabSize - i);
            
            const startByte = i * bytesPerRow;
            const chunkBytes = count * bytesPerRow;
            const chunkRaw = w_raw.subarray(startByte, startByte + chunkBytes);
            
            // 2. Dequantize
            dequantize(chunkRaw, type, count * dim, this.logitScratch);
            
            // 3. Multiply
            const activeWeights = this.logitScratch.subarray(0, count * dim);
            const chunkLogits = Matrix.matVecMul(hidden, activeWeights, count);
            
            logits.set(chunkLogits, i);
        }

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