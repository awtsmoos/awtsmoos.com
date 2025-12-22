
// B"H
const GGUFParser = require('../utils/gguf_parser.js');
const Ops = require('../math/ops.js');

class Loader {
    constructor(engine) {
        this.engine = engine;
        this.tensorMap = null;
        this.dataOffset = 0;
        
        this.layerTensorMap = [];
        this.globalTensorMap = {};
    }

    async load(buffer) {
        console.log(`B"H [Direct] Parsing GGUF Header...`);
        const parsed = GGUFParser.parse(buffer);
        
        this.engine.metadata = parsed.kv;
        this.engine.vocab = parsed.vocab;
        this.scores = parsed.scores;
        
        this.tensorMap = parsed.tensorMap;
        this.dataOffset = parsed.dataOffset;
        
        // Debug: Print relevant keys to find soft_cap
        const debugKeys = Object.keys(this.engine.metadata).filter(k => k.includes('softcap') || k.includes('rope') || k.includes('sliding'));
        console.log(`B"H [Loader] Debug Metadata Keys:`, debugKeys);

        this._mapWeights();
        this._inferParams();
        
        // B"H - Sanity Check: Inspect Embedding
        if (this.globalTensorMap['embed']) {
            const name = this.globalTensorMap['embed'];
            const t = this.getTensor(name, 0, 10); 
            console.log(`B"H [Sanity] ${name}: [${t.join(', ')}]`);
        }
    }

    getTensor(name, sliceStart = 0, sliceLength = null) {
        let info = this.tensorMap.get(name);
        if (!info) {
            return null;
        }
        
        const numElements = info.dims.reduce((a,b)=>a*b,1);
        const readLen = sliceLength !== null ? sliceLength : numElements;
        const type = info.type;
        
        const { blockElements, blockSize } = this._getTypeSize(type);
        
        const blockIndexStart = Math.floor(sliceStart / blockElements);
        const blockIndexEnd = Math.ceil((sliceStart + readLen) / blockElements);
        const totalBlocks = blockIndexEnd - blockIndexStart;
        
        const byteStart = this.dataOffset + info.dataOffset + (blockIndexStart * blockSize);
        const byteLength = totalBlocks * blockSize;
        
        if (byteStart >= this.engine.buffer.length) {
            // console.warn(`B"H [Loader] OOB Read for ${name}. Start:${byteStart} Len:${byteLength} File:${this.engine.buffer.length}`);
            return new Float32Array(readLen);
        }
        
        let safeByteLength = byteLength;
        if (byteStart + byteLength > this.engine.buffer.length) {
            safeByteLength = this.engine.buffer.length - byteStart;
        }
        
        const raw = this.engine.buffer.subarray(byteStart, byteStart + safeByteLength);
        const totalElementsExpanded = totalBlocks * blockElements;
        
        // Use updated dequantize that matches reference
        const fullBlockResult = Ops.dequantize(raw, type, totalElementsExpanded);
        
        const relativeStart = sliceStart - (blockIndexStart * blockElements);
        const finalOutput = new Float32Array(readLen);
        
        const copyLen = Math.min(finalOutput.length, fullBlockResult.length - relativeStart);
        if (copyLen > 0) {
            finalOutput.set(fullBlockResult.subarray(relativeStart, relativeStart + copyLen));
        }
        
        return finalOutput;
    }
    
    getRawTensorView(info) {
        if (!info) return null;
        
        const { blockElements, blockSize } = this._getTypeSize(info.type);
        const blocks = Math.ceil(info.dims.reduce((a,b)=>a*b,1) / blockElements);
        const byteSize = blocks * blockSize;
        
        const offset = this.dataOffset + info.dataOffset;
        if (offset >= this.engine.buffer.length) return null;
        
        const safeLen = Math.min(byteSize, this.engine.buffer.length - offset);
        return this.engine.buffer.subarray(offset, offset + safeLen);
    }
    
    getRawTensor(name) {
        let info = this.tensorMap.get(name);
        if (!info) return null;
        return { data: this.getRawTensorView(info), type: info.type, dims: info.dims };
    }

    _inferParams() {
        const kv = this.engine.metadata;
        const findVal = (suffix) => {
             for(const k in kv) {
                 if(k.endsWith(suffix)) return kv[k];
             }
             return undefined;
        };

        const p = {
            n_embd: 0, n_layer: 0, head_dim: 0, n_head: 0, n_head_kv: 0,
            norm_eps: findVal('.attention.layer_norm_rms_epsilon') || 1e-6,
            rope_freq_global: findVal('.rope.freq_base') || 10000.0,
            rope_scale: 1.0,
            arch: (kv['general.architecture'] || 'llama').toLowerCase(),
            act_fn: 'silu',
            sliding_window: findVal('.attention.sliding_window') || 0,
            sliding_window_pattern: findVal('.attention.sliding_window_pattern') || 0,
            query_pre_attn_scalar: findVal('.attention.query_pre_attn_scalar') || 0,
            final_soft_cap: findVal('final_logit_softcapping') || 0.0,
            attn_soft_cap: findVal('attn_logit_softcapping') || 0.0
        };

        // 1. Dimensions
        const embInfo = this.tensorMap.get('token_embd.weight') || this.tensorMap.get('model.embed_tokens.weight');
        if (embInfo) p.n_embd = Number(embInfo.dims[0]);

        const qInfo = this._getTensorBySuffix('attn_q.weight') || this._getTensorBySuffix('q_proj.weight');
        const kInfo = this._getTensorBySuffix('attn_k.weight') || this._getTensorBySuffix('k_proj.weight');
        
        const metaHeadDim = findVal('.attention.key_length') || findVal('.attention.head_dim');
        const isGemma = p.arch.includes('gemma');

        if (isGemma) {
            p.act_fn = 'gelu';
            p.rope_is_neox = true;
            p.useEmbScale = true;
        }

        // Logic from reference worker_src/config.js
        if (metaHeadDim) {
             p.head_dim = metaHeadDim;
        } else if (qInfo) {
             const q_out = Number(qInfo.dims[1]);
             const count = findVal('.attention.head_count');
             if (count) {
                 p.head_dim = q_out / count;
             } else {
                 p.head_dim = isGemma ? 256 : 128; 
             }
        }
        
        // Fallback for some architectures (reference logic)
        if (!p.head_dim) p.head_dim = 128;

        if (qInfo) {
             const q_out = Number(qInfo.dims[1]);
             p.n_head = Math.round(q_out / p.head_dim);
        } else {
             p.n_head = findVal('.attention.head_count') || (p.n_embd / 128);
        }

        if (kInfo) {
            const k_out = Number(kInfo.dims[1]);
            p.n_head_kv = Math.round(k_out / p.head_dim);
        } else {
            p.n_head_kv = findVal('.attention.head_count_kv') || p.n_head;
        }
        
        const scaleFactor = findVal('.rope.scaling.factor');
        if (scaleFactor && scaleFactor > 0) p.rope_scale = 1.0 / scaleFactor;

        // RoPE Local
        const localFreq = findVal('rope.freq_base.local') || findVal('rope_freq_base_local');
        if (localFreq) {
            p.rope_freq_local = localFreq;
        } else if (isGemma && p.rope_freq_global > 50000.0) {
            p.rope_freq_local = 10000.0;
            console.log('B"H [Loader] Inferred rope_freq_local: 10000.0');
        } else {
            p.rope_freq_local = p.rope_freq_global;
        }

        // Gemma Specific Configs
        if (isGemma) {
            if (p.sliding_window > 0 && p.sliding_window_pattern === 0) {
                 p.sliding_window_pattern = 6;
                 console.log('B"H [Loader] Config: Gemma 3 Sliding Window Pattern set to 6.');
            }
            if (!p.query_pre_attn_scalar) {
                 p.query_pre_attn_scalar = p.head_dim;
            }
            // Gemma 3 explicitly disables attention soft capping
            if (p.arch === 'gemma3') {
                console.log('B"H [Loader] Config: Gemma 3 detected. Disabling Attention Soft Cap.');
                p.attn_soft_cap = 0.0;
            }
        }
        
        // Calculate Q/KV dimensions
        p.q_dim = p.n_head * p.head_dim;
        p.kv_dim = p.n_head_kv * p.head_dim;
        
        // Infer layers count
        p.n_layer = this.layerTensorMap.length;
        if (p.n_layer === 0) {
             // Try to count manually if map not ready or weird naming
             let l = 0;
             while(this._getTensorBySuffix(`blk.${l}.attn_q.weight`) || this._getTensorBySuffix(`layers.${l}.self_attn.q_proj.weight`)) l++;
             p.n_layer = l;
        }

        this.engine.params = p;
        
        console.log(`B"H [Loader] Inferred Params: Heads=${p.n_head}, Dim=${p.head_dim}, Layers=${p.n_layer}, Embd=${p.n_embd}`);
        console.log(`B"H [Loader] Config: SoftCap(Attn)=${p.attn_soft_cap}, SoftCap(Final)=${p.final_soft_cap}, Sliding=${p.sliding_window}, Pattern=${p.sliding_window_pattern}`);
        console.log(`B"H [Loader] RoPE: Global=${p.rope_freq_global}, Local=${p.rope_freq_local}`);
    }
    
    _getTensorBySuffix(suffix) {
        for(const [name, info] of this.tensorMap) {
            if (name.endsWith(suffix)) return info;
        }
        return null;
    }

    _mapWeights() {
        const keys = Array.from(this.tensorMap.keys());
        const layerRegex = /^(?:model\.|blk\.|)(?:layers\.|)(\d+)\.(.+)$/;
        
        this.layerTensorMap = [];
        this.globalTensorMap = {};
        
        for (const key of keys) {
            if (key.includes('.chunk')) continue;
            const match = key.match(layerRegex);
            if (match) {
                const l = parseInt(match[1]);
                const suffix = match[2];
                if (!this.layerTensorMap[l]) this.layerTensorMap[l] = {};
                const map = this.layerTensorMap[l];

                // B"H - Strict C++ Pattern Matching from weights.js
                if (suffix.match(/^(self_attn\.|attention\.|attn_)q\.weight$/) || suffix.match(/q_proj\.weight$/)) map['attn_q'] = key;
                else if (suffix.match(/^(self_attn\.|attention\.|attn_)k\.weight$/) || suffix.match(/k_proj\.weight$/)) map['attn_k'] = key;
                else if (suffix.match(/^(self_attn\.|attention\.|attn_)v\.weight$/) || suffix.match(/v_proj\.weight$/)) map['attn_v'] = key;
                else if (suffix.match(/^(self_attn\.|attention\.|attn_)output\.weight$/) || suffix.match(/o_proj\.weight$/)) map['attn_output'] = key;
                
                else if (suffix.match(/^(input_layernorm|attn_norm|pre_attention_layernorm)\.weight$/)) map['attn_norm'] = key;
                else if (suffix === 'post_attention_norm.weight' || suffix.match(/^(post_attention_layernorm|attn_post_norm)\.weight$/)) map['attn_post_norm'] = key;
                
                else if (suffix === 'ffn_norm.weight' || suffix.match(/^(pre_feedforward_layernorm|pre_mlp_layernorm|ffn_norm)\.weight$/)) map['ffn_norm'] = key;
                else if (suffix === 'post_ffw_norm.weight' || suffix.match(/^(post_feedforward_layernorm|post_mlp_layernorm|ffn_post_norm)\.weight$/)) map['ffn_post_norm'] = key;
                
                else if (suffix.match(/^(attn_q_norm|q_norm)\.weight$/)) map['attn_q_norm'] = key;
                else if (suffix.match(/^(attn_k_norm|k_norm)\.weight$/)) map['attn_k_norm'] = key;
                
                else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)gate\.weight$/) || suffix.match(/w1\.weight$/) || suffix.match(/gate_proj\.weight$/)) map['ffn_gate'] = key;
                else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)down\.weight$/) || suffix.match(/w2\.weight$/) || suffix.match(/down_proj\.weight$/)) map['ffn_down'] = key;
                else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)up\.weight$/) || suffix.match(/w3\.weight$/) || suffix.match(/up_proj\.weight$/)) map['ffn_up'] = key;
            } else {
                if (key.match(/^(token_embd|model\.embed_tokens)\.weight$/)) this.globalTensorMap['embed'] = key;
                else if (key.match(/^(output_norm|model\.norm)\.weight$/)) this.globalTensorMap['output_norm'] = key;
                else if (key.match(/^(output|lm_head)\.weight$/)) this.globalTensorMap['output'] = key;
            }
        }
    }

    _getTypeSize(type) {
        switch (type) {
            case 0:  return { blockElements: 1, blockSize: 4 };    // F32
            case 1:  return { blockElements: 1, blockSize: 2 };    // F16
            case 2:  return { blockElements: 32, blockSize: 18 };   // Q4_0
            case 3:  return { blockElements: 32, blockSize: 20 };   // Q4_1
            case 6:  return { blockElements: 32, blockSize: 22 };   // Q5_0
            case 7:  return { blockElements: 32, blockSize: 24 };   // Q5_1
            case 8:  return { blockElements: 32, blockSize: 34 };   // Q8_0
            case 9:  return { blockElements: 32, blockSize: 40 };   // Q8_1
            default: return { blockElements: 1, blockSize: 4 };     // Fallback
        }
    }
}

module.exports = Loader;
