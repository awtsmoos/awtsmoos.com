
// B"H
const Tokenizer = require('./tokenizer.js');
const GemmaModel = require('./models/gemma.js');
const Ops = require('./math/ops.js');
const WasmBackend = require('./math/wasm_jit.js');

class InferenceEngine {
    constructor(db, modelHandle, options = {}) {
        this.db = db;
        this.modelHandle = modelHandle;
        this.tokenizer = new Tokenizer(modelHandle);
        this.params = {
            n_embd: 0, n_layer: 0, n_head: 0, n_head_kv: 0, head_dim: 0, norm_eps: 1e-6,
            sliding_window_pattern: 0, 
            sliding_window: 0, 
            rope_freq_global: 10000.0,
            rope_freq_local: 0.0,
            rope_scale: 1.0,
            arch: 'llama',
            act_fn: 'silu',
            useEmbScale: false,
            rope_is_neox: false
        };
        this.kv_cache = [];
        this.history = [];
        this.model = null;
        this.vocabSize = 0;
        
        this.compiledLayers = [];
        this.globalWeights = {};
        this.layerTensorMap = []; 
        this.globalTensorMap = {};

        this.useWasm = options.useWasm || false;
        this.wasm = null;
    }

    async init() {
        const mappedLayers = await this.mapTensors();

        const getVal = async (k) => await this.modelHandle.config.get(k);
        const archVal = await getVal('general.architecture');
        this.params.arch = (archVal || 'llama').toLowerCase();
        const isGemma = this.params.arch.includes('gemma');
        
        if (isGemma) {
            this.params.act_fn = 'gelu';
            this.params.rope_is_neox = true;
            this.params.useEmbScale = true;
        } else {
            this.params.act_fn = 'silu';
        }

        const embKey = this.globalTensorMap['embed'];
        const embInfo = embKey ? await this.modelHandle.tensors.get(embKey) : null;
        if (embInfo) this.params.n_embd = Number(embInfo.dims[0]); 
        
        const metaLayers = await getVal('llama.block_count');
        this.params.n_layer = mappedLayers > 0 ? mappedLayers : (metaLayers || 0);

        const metaHeadCount = await getVal('llama.attention.head_count');
        const metaHeadCountKV = await getVal('llama.attention.head_count_kv');
        const metaKeyLength = await getVal('llama.attention.key_length');
        const metaHeadDim = await getVal('llama.attention.head_dim');

        // B"H - Enhanced Head Dim Inference (Matching awtsmoos-gguf logic)
        let qInfo = null;
        if (this.layerTensorMap[0] && this.layerTensorMap[0]['attn_q']) {
            qInfo = await this.modelHandle.tensors.get(this.layerTensorMap[0]['attn_q']);
        }

        if (metaKeyLength) {
            this.params.head_dim = metaKeyLength;
        } else if (metaHeadDim) {
            this.params.head_dim = metaHeadDim;
        } else if (qInfo) {
            const q_out = Number(qInfo.dims[1]);
            
            // Try to infer from head count first
            if (metaHeadCount) {
                this.params.head_dim = Math.round(q_out / metaHeadCount);
            } 
            // Else heuristic based on divisibility (like model_stats.js)
            else if (q_out % 128 === 0) {
                this.params.head_dim = 128;
            } else if (q_out % 64 === 0) {
                this.params.head_dim = 64;
            } else {
                this.params.head_dim = isGemma ? 256 : 128;
            }
        } else {
            this.params.head_dim = 128;
        }

        if (qInfo) {
            const q_out = Number(qInfo.dims[1]);
            this.params.n_head = Math.round(q_out / this.params.head_dim);
        } else {
            this.params.n_head = metaHeadCount || (this.params.n_embd / 128);
        }

        if (this.layerTensorMap[0] && this.layerTensorMap[0]['attn_k']) {
            const kInfo = await this.modelHandle.tensors.get(this.layerTensorMap[0]['attn_k']);
            if (kInfo) {
                const k_out = Number(kInfo.dims[1]);
                this.params.n_head_kv = Math.round(k_out / this.params.head_dim);
            }
        }
        if (!this.params.n_head_kv) this.params.n_head_kv = metaHeadCountKV || this.params.n_head;

        this.params.q_dim = this.params.n_head * this.params.head_dim;
        this.params.kv_dim = this.params.n_head_kv * this.params.head_dim;

        // RoPE & Norm
        this.params.norm_eps = (await getVal('llama.attention.layer_norm_rms_epsilon')) || 1e-5;
        this.params.rope_freq_global = (await getVal('rope.freq_base')) || 10000.0;
        
        const ropeLocal = (await getVal('rope.freq_base.local')) || (await getVal('rope_freq_base_local'));
        if (ropeLocal) this.params.rope_freq_local = ropeLocal;
        else if (isGemma && this.params.rope_freq_global > 50000.0) this.params.rope_freq_local = 10000.0;
        else this.params.rope_freq_local = this.params.rope_freq_global;

        const scaleFactor = await getVal('rope.scaling.factor');
        if (scaleFactor && scaleFactor > 0) this.params.rope_scale = 1.0 / scaleFactor;

        this.params.sliding_window = (await getVal('attention.sliding_window')) || 0;
        this.params.sliding_window_pattern = (await getVal('attention.sliding_window_pattern')) || 0;
        if (isGemma && this.params.sliding_window > 0 && this.params.sliding_window_pattern === 0) this.params.sliding_window_pattern = 6;

        console.log(`B"H [AI] Init ${this.params.arch}: L=${this.params.n_layer} Embd=${this.params.n_embd} Heads=${this.params.n_head}/${this.params.n_head_kv} Dim=${this.params.head_dim}`);
        
        if (this.useWasm) {
            this.wasm = new WasmBackend();
            await this.wasm.init();
        }

        await this.preloadWeights();
        this.model = new GemmaModel(this);
    }

    async preloadWeights() {
        console.log(`B"H [AI] Preloading Weights into RAM...`);
        const load = async (key) => {
            if (!key) return null;
            const t = await this.modelHandle.tensors.get(key);
            if (!t) return null;
            if (t.chunked) {
                const totalSize = t.rowSize * t.dims[1]; 
                const combined = new Uint8Array(totalSize);
                let offset = 0;
                for(let i=0; i<t.chunkCount; i++) {
                    const chunk = await this.modelHandle.tensors.get(`${key}.chunk.${i}`);
                    if(chunk && chunk.data) {
                        combined.set(chunk.data, offset);
                        offset += chunk.data.length;
                    }
                }
                return { data: combined, type: t.type, dims: t.dims };
            }
            return { data: t.data, type: t.type, dims: t.dims };
        };

        this.globalWeights.embed = await load(this.globalTensorMap.embed);
        this.globalWeights.output_norm = await load(this.globalTensorMap.output_norm);
        this.globalWeights.output = await load(this.globalTensorMap.output);

        for (let i = 0; i < this.params.n_layer; i++) {
            if (i % 2 === 0) process.stdout.write(`\rB"H [AI] Loading Layer ${i+1}/${this.params.n_layer}...`);
            const map = this.layerTensorMap[i] || {};
            const layerObj = {};
            const keys = Object.keys(map);
            const promises = keys.map(k => load(map[k]).then(d => ({ key: k, val: d })));
            const results = await Promise.all(promises);
            for(const res of results) layerObj[res.key] = res.val;
            this.compiledLayers[i] = layerObj;
        }
        process.stdout.write('\nB"H [AI] Weights Loaded.\n');
    }

    async mapTensors() {
        this.layerTensorMap = [];
        this.globalTensorMap = {};
        let maxLayer = -1;
        const layerRegex = /^(?:model\.|blk\.|)(?:layers\.|)(\d+)\.(.+)$/;

        for await (const key of this.db.streamKeys(this.modelHandle.tensors)) {
            if (key.includes('.chunk')) continue;
            const match = key.match(layerRegex);
            if (match) {
                const l = parseInt(match[1]);
                if (l > maxLayer) maxLayer = l;
                const suffix = match[2]; 
                if (!this.layerTensorMap[l]) this.layerTensorMap[l] = {};
                const map = this.layerTensorMap[l];

                if (suffix.match(/^(self_attn\.|attention\.|attn_)q\.weight$/) || suffix.match(/q_proj\.weight$/)) map['attn_q'] = key;
                else if (suffix.match(/^(self_attn\.|attention\.|attn_)k\.weight$/) || suffix.match(/k_proj\.weight$/)) map['attn_k'] = key;
                else if (suffix.match(/^(self_attn\.|attention\.|attn_)v\.weight$/) || suffix.match(/v_proj\.weight$/)) map['attn_v'] = key;
                else if (suffix.match(/^(self_attn\.|attention\.|attn_)output\.weight$/) || suffix.match(/o_proj\.weight$/)) map['attn_output'] = key;
                else if (suffix.match(/^(attn_q_norm|q_norm)\.weight$/)) map['attn_q_norm'] = key;
                else if (suffix.match(/^(attn_k_norm|k_norm)\.weight$/)) map['attn_k_norm'] = key;
                else if (suffix.match(/^(input_layernorm|attn_norm|pre_attention_layernorm)\.weight$/)) map['attn_norm'] = key;
                else if (suffix.match(/^(post_attention_layernorm|attn_post_norm)\.weight$/)) map['attn_post_norm'] = key;
                else if (suffix.match(/^(pre_feedforward_layernorm|pre_mlp_layernorm|ffn_norm)\.weight$/)) map['ffn_norm'] = key;
                else if (suffix.match(/^(post_feedforward_layernorm|post_mlp_layernorm|ffn_post_norm)\.weight$/)) map['ffn_post_norm'] = key;
                else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)gate\.weight$/) || suffix.match(/w1\.weight$/) || suffix.match(/gate_proj\.weight$/)) map['ffn_gate'] = key;
                else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)down\.weight$/) || suffix.match(/w2\.weight$/) || suffix.match(/down_proj\.weight$/)) map['ffn_down'] = key;
                else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)up\.weight$/) || suffix.match(/w3\.weight$/) || suffix.match(/up_proj\.weight$/)) map['ffn_up'] = key;
            } else {
                if (key.match(/^(token_embd|model\.embed_tokens)\.weight$/)) this.globalTensorMap['embed'] = key;
                else if (key.match(/^(output_norm|model\.norm)\.weight$/)) this.globalTensorMap['output_norm'] = key;
                else if (key.match(/^(output|lm_head)\.weight$/)) this.globalTensorMap['output'] = key;
            }
        }
        return maxLayer + 1;
    }

    getLayerWeight(layerIdx, logicalName) {
        if (this.compiledLayers[layerIdx]) {
            return this.compiledLayers[layerIdx][logicalName];
        }
        return null;
    }

    getGlobalWeight(logicalName) {
        return this.globalWeights[logicalName];
    }

    linear(x, wObj) {
        if (!wObj || !wObj.data) return null;
        const n_out = wObj.dims[1]; 
        const rows = n_out; 
        
        if (this.wasm) {
            return Ops.matVecMulQ4_0(x, wObj.data, rows);
        } else {
            return Ops.matVecMulQ4_0(x, wObj.data, rows);
        }
    }

    async generate(prompt, callback, options = {}) {
        const config = {
            temp: options.temp || 0.8,
            top_p: options.top_p || 0.9,
            max_tokens: options.max_tokens || 100,
            repeat_penalty: options.repeat_penalty || 1.1
        };

        let fullPrompt = prompt;
        if (this.params.arch.includes('gemma')) {
            fullPrompt = `<start_of_turn>user\n${prompt}<end_of_turn>\n<start_of_turn>model\n`;
        }

        let tokens = await this.tokenizer.tokenize(fullPrompt);
        if (this.params.arch.includes('gemma') && tokens[0] !== 2) tokens.unshift(2);
        
        console.log(`B"H [AI] Generating...`);
        let lastHidden = null;

        for (let i = 0; i < tokens.length; i++) {
            if (i % 10 === 0) process.stdout.write(`\r[Context ${i}/${tokens.length}]`);
            lastHidden = this.forward(tokens[i]); 
        }
        process.stdout.write('\n');

        for (let i = 0; i < config.max_tokens; i++) {
            const logits = this.computeLogitsFromHidden(lastHidden);
            const next = this.sample(logits, config, this.history);
            if (next === 1 || next === 107 || next === 2) break;
            
            const word = await this.tokenizer.detokenize([next]);
            callback(word);
            lastHidden = this.forward(next);
        }
        process.stdout.write('\n');
    }

    forward(token) {
        return this.model.forward(token, this.history.length, this.kv_cache);
    }

    computeLogitsFromHidden(hidden) {
        let w = this.getGlobalWeight('output') || this.getGlobalWeight('embed');
        if (!w) throw new Error("Logits weight missing");
        
        const logits = this.linear(hidden, w);
        if (logits) this.vocabSize = logits.length;
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
        
        for (const id of seen) {
            if (logits[id] > 0) logits[id] /= penalty;
            else logits[id] *= penalty;
        }

        if (temp < 0.01) {
            let max = -Infinity;
            let idx = 0;
            for (let i = 0; i < logits.length; i++) {
                if (logits[i] > max) { max = logits[i]; idx = i; }
            }
            return idx;
        }

        let maxLogit = -Infinity;
        for (let i = 0; i < logits.length; i++) {
            logits[i] /= temp;
            if (logits[i] > maxLogit) maxLogit = logits[i];
        }

        const probs = new Float32Array(logits.length);
        let sum = 0;
        for (let i = 0; i < logits.length; i++) {
            const p = Math.exp(logits[i] - maxLogit);
            probs[i] = p;
            sum += p;
        }
        
        const candidates = [];
        for (let i = 0; i < probs.length; i++) {
            const p = probs[i] / sum;
            if (p > 0.0001) candidates.push({ id: i, p: p });
        }
        
        candidates.sort((a, b) => b.p - a.p);
        
        let cumSum = 0;
        let cutoff = 0;
        for (let i = 0; i < candidates.length; i++) {
            cumSum += candidates[i].p;
            if (cumSum >= top_p) {
                cutoff = i;
                break;
            }
        }
        
        const r = Math.random() * cumSum;
        let acc = 0;
        for (let i = 0; i <= cutoff; i++) {
            acc += candidates[i].p;
            if (acc >= r) return candidates[i].id;
        }
        
        return candidates[0].id;
    }
}

module.exports = InferenceEngine;
