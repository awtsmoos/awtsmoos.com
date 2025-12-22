
// B"H
const Tokenizer = require('../tokenizer.js');
const GemmaModel = require('../models/gemma/index.js');
const Ops = require('../math/ops.js');
const WasmBackend = require('../math/wasm_jit.js');
const Loader = require('./loader.js');
const Sampler = require('./sampler.js');
const initConfig = require('./config.js');

class InferenceEngine {
    constructor(db, modelHandle, options = {}) {
        this.db = db;
        this.modelHandle = modelHandle;
        this.tokenizer = new Tokenizer(modelHandle);
        
        this.params = {
            n_embd: 0, n_layer: 0, n_head: 0, n_head_kv: 0, head_dim: 0, norm_eps: 1e-6,
            sliding_window_pattern: 0, sliding_window: 0, 
            rope_freq_global: 10000.0, rope_freq_local: 0.0, rope_scale: 1.0,
            arch: 'llama', act_fn: 'silu', useEmbScale: false, rope_is_neox: false,
            attn_soft_cap: 0.0, final_soft_cap: 0.0
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
        
        this.loader = new Loader(this);
        this.sampler = new Sampler(this);
    }

    async init() {
        this.mappedLayers = await this.loader.mapTensors();
        await initConfig(this);
        
        if (this.useWasm) {
            this.wasm = new WasmBackend();
            await this.wasm.init();
        }

        await this.loader.preloadWeights();
        this.model = new GemmaModel(this);
    }

    getLayerWeight(layerIdx, logicalName) {
        if (this.compiledLayers[layerIdx]) return this.compiledLayers[layerIdx][logicalName];
        return null;
    }

    getGlobalWeight(logicalName) {
        return this.globalWeights[logicalName];
    }

    linear(x, wObj) {
        if (!wObj || !wObj.data) return null;
        const n_out = wObj.dims[1]; 
        
        // B"H - Dynamic Kernel Dispatch
        // If data is F32 (loaded via useWasm mode), use WASM or JS F32 fallback
        if (wObj.data instanceof Float32Array) {
            if (this.wasm) {
                return this.wasm.matVecMul(x, wObj.data, n_out);
            }
            return Ops.matVecMul(x, wObj.data, n_out);
        }
        
        // Default: Q4_0 Compressed (Memory Saving Mode)
        // WASM backend does NOT support Q4 on-the-fly yet, so we use JS.
        return Ops.matVecMulQ4_0(x, wObj.data, n_out);
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
            lastHidden = this.model.forward(tokens[i], this.history.length, this.kv_cache);
        }
        process.stdout.write('\n');

        for (let i = 0; i < config.max_tokens; i++) {
            const logits = this.sampler.computeLogitsFromHidden(lastHidden);
            const next = this.sampler.sample(logits, config, this.history);
            if (next === 1 || next === 107 || next === 2) break;
            
            const word = await this.tokenizer.detokenize([next]);
            callback(word);
            lastHidden = this.model.forward(next, this.history.length, this.kv_cache);
        }
        process.stdout.write('\n');
    }
}

module.exports = InferenceEngine;
