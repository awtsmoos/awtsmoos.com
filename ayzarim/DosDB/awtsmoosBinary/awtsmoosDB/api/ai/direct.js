
// B"H
const fs = require('fs');
const GGUFParser = require('./utils/gguf_parser.js');
const Tokenizer = require('./tokenizer.js');
const Ops = require('./math/ops.js');
const { asF32, applyRoPE } = require('./models/gemma/utils.js');

class DirectEngine {
    constructor(filePath) {
        this.filePath = filePath;
        this.buffer = null;
        this.metadata = null;
        this.tensorMap = null;
        this.vocab = [];
        this.scores = [];
        this.tokenizer = null;
        this.params = {};
        
        // State
        this.kv_cache = [];
        this.history = [];
        
        // Mappings
        this.layerTensorMap = [];
        this.globalTensorMap = {};
    }

    async init() {
        console.log(`B"H [Direct] Reading file: ${this.filePath}`);
        // 1. Read file into RAM
        this.buffer = fs.readFileSync(this.filePath);
        
        // 2. Parse GGUF
        console.log(`B"H [Direct] Parsing GGUF...`);
        const parsed = GGUFParser.parse(this.buffer);
        this.metadata = parsed.kv;
        this.tensorMap = parsed.tensorMap;
        this.vocab = parsed.vocab;
        this.scores = parsed.scores;
        this.dataOffset = parsed.dataOffset;
        
        // 3. Init Tokenizer
        const mockHandle = {
            config: { get: async (k) => {
                if(k==='vocab_size') return this.vocab.length;
                if(k==='tokenizer.ggml.add_space_prefix') return this.metadata['tokenizer.ggml.add_space_prefix'];
                return null;
            }},
            vocab_data: { get: async () => null }
        };
        
        this.tokenizer = new Tokenizer(mockHandle);
        this.tokenizer.vocab = this.vocab;
        this.tokenizer.scores = new Float32Array(this.scores);
        this.tokenizer.initialized = true;
        await this.tokenizer.init(); 
        
        this.tokenizer.vocab.forEach((t, i) => {
            this.tokenizer.tokenMap.set(t, i);
            if (t.length === 6 && t.startsWith('<0x')) {
                const b = parseInt(t.substring(3,5), 16);
                if(!isNaN(b)) this.tokenizer.byteTokens.set(b, i);
            }
        });
        
        // 4. Map Weights (Dynamic)
        this._mapWeights();

        // 5. Infer Params
        this._inferParams();
        
        console.log(`B"H [Direct] Ready. Arch: ${this.params.arch}, Layers: ${this.params.n_layer}, Embd: ${this.params.n_embd}, HeadDim: ${this.params.head_dim}, Heads: ${this.params.n_head}`);
    }

    _inferParams() {
        const kv = this.metadata;
        // Basic Init
        this.params = {
            n_embd: 0,
            n_layer: 0,
            head_dim: 0,
            n_head: 0,
            n_head_kv: 0,
            norm_eps: kv['llama.attention.layer_norm_rms_epsilon'] || 1e-6,
            rope_freq_global: kv['rope.freq_base'] || 10000.0,
            rope_scale: 1.0,
            arch: (kv['general.architecture'] || 'llama').toLowerCase(),
            act_fn: 'silu',
            sliding_window: kv['attention.sliding_window'] || 0,
            sliding_window_pattern: kv['attention.sliding_window_pattern'] || 0,
            final_soft_cap: kv['final_logit_softcapping'] || 0.0,
            attn_soft_cap: kv['attn_logit_softcapping'] || 0.0
        };

        // Get Dimensions from Tensors
        // Since we mapped weights first, we can use the map
        const embInfo = this.getTensorInfo(this.globalTensorMap['embed']);
        if (embInfo) this.params.n_embd = embInfo.dims[0];

        // Layer Count (Max mapped layer + 1)
        this.params.n_layer = this.layerTensorMap.length;

        // Head Dimensions
        let qInfo = null;
        if (this.layerTensorMap[0] && this.layerTensorMap[0]['attn_q']) {
            qInfo = this.getTensorInfo(this.layerTensorMap[0]['attn_q']);
        }

        const headCount = kv['llama.attention.head_count'];
        const headDim = kv['llama.attention.head_dim'];
        
        if (headDim) {
            this.params.head_dim = headDim;
        } else if (qInfo) {
            const q_out = qInfo.dims[1];
            // Intelligent Guess
            if (q_out % 256 === 0) this.params.head_dim = 256;
            else if (q_out % 128 === 0) this.params.head_dim = 128;
            else if (q_out % 64 === 0) this.params.head_dim = 64;
            else this.params.head_dim = 256; 
        } else {
            this.params.head_dim = 128;
        }
        
        if (qInfo) {
            this.params.n_head = Math.round(qInfo.dims[1] / this.params.head_dim);
        } else {
            this.params.n_head = headCount || (this.params.n_embd / 128);
        }
        
        const kvHeadCount = kv['llama.attention.head_count_kv'];
        // Try to infer from k_weight if available
        let kInfo = null;
        if (this.layerTensorMap[0] && this.layerTensorMap[0]['attn_k']) {
            kInfo = this.getTensorInfo(this.layerTensorMap[0]['attn_k']);
        }
        if (kInfo) {
            this.params.n_head_kv = Math.round(kInfo.dims[1] / this.params.head_dim);
        } else {
            this.params.n_head_kv = kvHeadCount || this.params.n_head;
        }
        
        if (this.params.arch.includes('gemma')) {
            this.params.act_fn = 'gelu';
            this.params.rope_is_neox = true;
            this.params.useEmbScale = true;
            if (this.params.arch === 'gemma3') this.params.attn_soft_cap = 0.0;
        }
        
        this.params.q_dim = this.params.n_head * this.params.head_dim;
        this.params.kv_dim = this.params.n_head_kv * this.params.head_dim;
        
        // Rope Fix
        if (this.params.arch.includes('gemma') && this.params.rope_freq_global > 50000) {
            this.params.rope_freq_local = 10000.0;
        } else {
            this.params.rope_freq_local = this.params.rope_freq_global;
        }
    }

    _mapWeights() {
        // Robust Mapping (Parity with Browser)
        this.layerTensorMap = [];
        this.globalTensorMap = {};
        
        const keys = Array.from(this.tensorMap.keys());
        const layerRegex = /^(?:model\.|blk\.|)(?:layers\.|)(\d+)\.(.+)$/;
        
        for (const key of keys) {
            // Ignore chunks for now
            if (key.includes('.chunk')) continue;

            const match = key.match(layerRegex);
            if (match) {
                const l = parseInt(match[1]);
                const suffix = match[2];
                
                if (!this.layerTensorMap[l]) this.layerTensorMap[l] = {};
                const map = this.layerTensorMap[l];

                // Attention
                if (suffix.match(/^(self_attn\.|attention\.|attn_)q\.weight$/) || suffix.match(/q_proj\.weight$/)) 
                    map['attn_q'] = key;
                else if (suffix.match(/^(self_attn\.|attention\.|attn_)k\.weight$/) || suffix.match(/k_proj\.weight$/)) 
                    map['attn_k'] = key;
                else if (suffix.match(/^(self_attn\.|attention\.|attn_)v\.weight$/) || suffix.match(/v_proj\.weight$/)) 
                    map['attn_v'] = key;
                else if (suffix.match(/^(self_attn\.|attention\.|attn_)output\.weight$/) || suffix.match(/o_proj\.weight$/)) 
                    map['attn_output'] = key;

                // Norms
                else if (suffix.match(/^(input_layernorm|attn_norm|pre_attention_layernorm)\.weight$/)) 
                    map['attn_norm'] = key;
                else if (suffix.match(/^(post_attention_layernorm|attn_post_norm)\.weight$/)) 
                    map['attn_post_norm'] = key;
                else if (suffix.match(/^(pre_feedforward_layernorm|pre_mlp_layernorm|ffn_norm)\.weight$/)) 
                    map['ffn_norm'] = key;
                else if (suffix.match(/^(post_feedforward_layernorm|post_mlp_layernorm|ffn_post_norm)\.weight$/)) 
                    map['ffn_post_norm'] = key;
                
                // QK Norms (Gemma 2/3)
                else if (suffix.match(/^(attn_q_norm|q_norm)\.weight$/)) map['attn_q_norm'] = key;
                else if (suffix.match(/^(attn_k_norm|k_norm)\.weight$/)) map['attn_k_norm'] = key;

                // FFN
                else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)gate\.weight$/) || suffix.match(/w1\.weight$/) || suffix.match(/gate_proj\.weight$/)) 
                    map['ffn_gate'] = key;
                else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)down\.weight$/) || suffix.match(/w2\.weight$/) || suffix.match(/down_proj\.weight$/)) 
                    map['ffn_down'] = key;
                else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)up\.weight$/) || suffix.match(/w3\.weight$/) || suffix.match(/up_proj\.weight$/)) 
                    map['ffn_up'] = key;

            } else {
                if (key.match(/^(token_embd|model\.embed_tokens)\.weight$/)) this.globalTensorMap['embed'] = key;
                else if (key.match(/^(output_norm|model\.norm)\.weight$/)) this.globalTensorMap['output_norm'] = key;
                else if (key.match(/^(output|lm_head)\.weight$/)) this.globalTensorMap['output'] = key;
            }
        }
    }

    getTensorInfo(name) {
        if (!name) return null;
        return this.tensorMap.get(name);
    }

    getTensor(name) {
        let info = this.tensorMap.get(name);
        if (!info) return null;
        
        const { blockElements, blockSize } = this._getTypeSize(info.type);
        const numElements = info.dims.reduce((a,b)=>a*b,1);
        const blocks = Math.ceil(numElements / blockElements);
        const byteSize = blocks * blockSize;
        
        const offset = this.dataOffset + info.dataOffset;
        
        // Safe Slicing
        const raw = this.buffer.subarray(offset, offset + byteSize);
        
        if (info.type === 2) { // Q4_0
            return Ops.dequantizeQ4_0(raw, numElements);
        } else if (info.type === 0) { // F32
            return new Float32Array(raw.buffer, raw.byteOffset, numElements);
        } else if (info.type === 1) { // F16
            return Ops.dequantizeF16(raw, numElements);
        }
        
        return { data: raw, type: info.type, dims: info.dims }; 
    }

    // --- EXECUTION ---

    linear(x, wName) {
        let w = this.getTensor(wName);
        if (!w) return null;
        
        let n_out = 0;
        let info = this.tensorMap.get(wName);
        n_out = info.dims[1]; 
        
        if (w instanceof Float32Array) {
            return Ops.matVecMul(x, w, n_out);
        } else {
            return Ops.matVecMulQ4_0(x, w.data, n_out);
        }
    }

    async generate(prompt, callback) {
        let tokens = await this.tokenizer.tokenize(prompt);
        // B"H - Gemma specific BOS check
        if (this.params.arch.includes('gemma') && tokens[0] !== 2) tokens.unshift(2); 
        
        let lastHidden = null;
        
        // Context
        for (let i = 0; i < tokens.length; i++) {
            lastHidden = this.forward(tokens[i], this.history.length);
            this.history.push(tokens[i]);
        }
        
        // Gen
        for (let i = 0; i < 20; i++) {
            const logits = this.computeLogits(lastHidden);
            const next = this.sample(logits);
            if (next === 1 || next === 107 || next === 2) break;
            
            const word = await this.tokenizer.detokenize([next]);
            callback(word);
            
            this.history.push(next);
            lastHidden = this.forward(next, this.history.length - 1); 
        }
    }

    forward(token_id, pos) {
        const p = this.params;
        
        // Embedding
        const w_emb = this.getTensor(this.globalTensorMap.embed);
        let x;
        
        if (w_emb instanceof Float32Array) {
            const off = token_id * p.n_embd;
            x = w_emb.slice(off, off + p.n_embd); 
        } else {
            const { blockElements, blockSize } = this._getTypeSize(2);
            const rowBytes = (p.n_embd / blockElements) * blockSize;
            const start = token_id * rowBytes;
            const chunk = w_emb.data.subarray(start, start + rowBytes);
            x = Ops.dequantizeQ4_0(chunk, p.n_embd);
        }
        
        if (p.useEmbScale) {
            const scale = Math.sqrt(p.n_embd);
            for(let i=0; i<x.length; i++) x[i] *= scale;
        }

        for (let l = 0; l < p.n_layer; l++) {
            x = this.forwardLayer(x, l, pos);
        }

        const w_norm = this.getTensor(this.globalTensorMap.output_norm);
        if (w_norm) x = Ops.rmsNorm(x, w_norm, p.norm_eps);
        
        return x;
    }

    forwardLayer(x, l, pos) {
        const p = this.params;
        const map = this.layerTensorMap[l];
        
        const w_norm = this.getTensor(map.attn_norm);
        const x_norm = Ops.rmsNorm(x, w_norm, p.norm_eps);
        
        let q = this.linear(x_norm, map.attn_q);
        let k = this.linear(x_norm, map.attn_k);
        const v = this.linear(x_norm, map.attn_v);
        
        if (map.attn_q_norm) {
            const w_qn = this.getTensor(map.attn_q_norm);
            if(w_qn) this._headNorm(q, w_qn, p.n_head, p.head_dim, p.norm_eps);
        }
        if (map.attn_k_norm) {
            const w_kn = this.getTensor(map.attn_k_norm);
            if(w_kn) this._headNorm(k, w_kn, p.n_head_kv, p.head_dim, p.norm_eps);
        }
        
        const freq = (p.sliding_window > 0 && ((l+1)%p.sliding_window_pattern)!==0) ? p.rope_freq_local : p.rope_freq_global;
        const scale = (p.sliding_window > 0 && ((l+1)%p.sliding_window_pattern)!==0) ? 1.0 : p.rope_scale;
        
        applyRoPE(q, k, pos, p.head_dim, freq, scale, p.rope_is_neox);
        
        if(!this.kv_cache[l]) this.kv_cache[l] = {k:[], v:[]};
        this.kv_cache[l].k[pos] = k;
        this.kv_cache[l].v[pos] = v;
        
        const attn_out = this._attention(q, l, pos, p);
        const attn_proj = this.linear(attn_out, map.attn_output);
        
        let res = attn_proj;
        if(map.attn_post_norm) {
            const w_pan = this.getTensor(map.attn_post_norm);
            res = Ops.rmsNorm(res, w_pan, p.norm_eps);
        }
        for(let i=0; i<x.length; i++) x[i] += res[i];
        
        const w_ffn_norm = this.getTensor(map.ffn_norm);
        const x_ffn_norm = Ops.rmsNorm(x, w_ffn_norm, p.norm_eps);
        
        const gate = this.linear(x_ffn_norm, map.ffn_gate);
        const up = this.linear(x_ffn_norm, map.ffn_up);
        
        const act = (p.act_fn === 'gelu') ? Ops.gelu(gate) : Ops.silu(gate);
        for(let i=0; i<act.length; i++) act[i] *= up[i];
        
        const down = this.linear(act, map.ffn_down);
        
        let res2 = down;
        if(map.ffn_post_norm) {
            const w_pfn = this.getTensor(map.ffn_post_norm);
            res2 = Ops.rmsNorm(res2, w_pfn, p.norm_eps);
        }
        for(let i=0; i<x.length; i++) x[i] += res2[i];
        
        return x;
    }

    _headNorm(vec, w, n_heads, dim, eps) {
        for(let h=0; h<n_heads; h++) {
            const off = h*dim;
            if (off + dim > vec.length) break; // Safety
            
            const sub = vec.subarray(off, off+dim);
            const w_sub = (w.length === dim) ? w : w.subarray(off, off+dim);
            const res = Ops.rmsNorm(sub, w_sub, eps);
            vec.set(res, off);
        }
    }

    _attention(q, l, pos, p) {
        const out = new Float32Array(p.n_embd);
        const scale = 1.0 / Math.sqrt(p.head_dim);
        const ratio = Math.floor(p.n_head / p.n_head_kv);
        
        let startPos = 0;
        if (p.sliding_window > 0) startPos = Math.max(0, pos - p.sliding_window + 1);

        for (let h = 0; h < p.n_head; h++) {
            const h_off = h * p.head_dim;
            const q_h = q.subarray(h_off, h_off + p.head_dim);
            
            const kv_h = Math.floor(h / ratio);
            const kv_off = kv_h * p.head_dim;
            
            const scores = new Float32Array(pos + 1);
            for(let t=startPos; t<=pos; t++) {
                const k_t = this.kv_cache[l].k[t].subarray(kv_off, kv_off + p.head_dim);
                let dot = 0;
                for(let i=0; i<p.head_dim; i++) dot += q_h[i] * k_t[i];
                scores[t] = dot * scale;
            }
            
            let max = -Infinity;
            for(let t=startPos; t<=pos; t++) if(scores[t] > max) max = scores[t];
            let sum = 0;
            for(let t=startPos; t<=pos; t++) {
                scores[t] = Math.exp(scores[t] - max);
                sum += scores[t];
            }
            for(let t=startPos; t<=pos; t++) scores[t] /= sum;
            
            const o_h = out.subarray(h_off, h_off + p.head_dim);
            for(let t=startPos; t<=pos; t++) {
                const val = scores[t];
                const v_t = this.kv_cache[l].v[t].subarray(kv_off, kv_off + p.head_dim);
                for(let i=0; i<p.head_dim; i++) o_h[i] += val * v_t[i];
            }
        }
        return out;
    }

    computeLogits(hidden) {
        let w = this.getTensor(this.globalTensorMap.output);
        if (!w) w = this.getTensor(this.globalTensorMap.embed);
        
        const logits = this.linear(hidden, this.globalTensorMap.output || this.globalTensorMap.embed);
        
        if (this.params.final_soft_cap > 0) {
            const cap = this.params.final_soft_cap;
            for(let i=0; i<logits.length; i++) logits[i] = cap * Math.tanh(logits[i]/cap);
        }
        return logits;
    }

    sample(logits) {
        let max = -Infinity, idx = 0;
        for(let i=0; i<logits.length; i++) {
            if(logits[i] > max) { max = logits[i]; idx = i; }
        }
        return idx;
    }

    _getTypeSize(type) {
        if(type === 2) return { blockElements: 32, blockSize: 18 };
        if(type === 1) return { blockElements: 1, blockSize: 2 };
        return { blockElements: 1, blockSize: 4 }; 
    }
}

module.exports = DirectEngine;
