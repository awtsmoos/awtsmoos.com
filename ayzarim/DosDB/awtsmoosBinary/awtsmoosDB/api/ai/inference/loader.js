
// B"H
const Ops = require('../math/ops.js');

class Loader {
    constructor(engine) {
        this.engine = engine;
    }

    async mapTensors() {
        this.engine.layerTensorMap = [];
        this.engine.globalTensorMap = {};
        let maxLayer = -1;
        const layerRegex = /^(?:model\.|blk\.|)(?:layers\.|)(\d+)\.(.+)$/;

        for await (const key of this.engine.db.streamKeys(this.engine.modelHandle.tensors)) {
            if (key.includes('.chunk')) continue;
            const match = key.match(layerRegex);
            if (match) {
                const l = parseInt(match[1]);
                if (l > maxLayer) maxLayer = l;
                const suffix = match[2]; 
                if (!this.engine.layerTensorMap[l]) this.engine.layerTensorMap[l] = {};
                const map = this.engine.layerTensorMap[l];

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
                if (key.match(/^(token_embd|model\.embed_tokens)\.weight$/)) this.engine.globalTensorMap['embed'] = key;
                else if (key.match(/^(output_norm|model\.norm)\.weight$/)) this.engine.globalTensorMap['output_norm'] = key;
                else if (key.match(/^(output|lm_head)\.weight$/)) this.engine.globalTensorMap['output'] = key;
            }
        }
        return maxLayer + 1;
    }

    async preloadWeights() {
        console.log(`B"H [AI] Preloading Weights into RAM... (WASM: ${this.engine.useWasm})`);
        const load = async (key) => {
            if (!key) return null;
            const t = await this.engine.modelHandle.tensors.get(key);
            if (!t) return null;
            
            let rawData = t.data;
            if (t.chunked) {
                const totalSize = t.rowSize * t.dims[1]; 
                const combined = new Uint8Array(totalSize);
                let offset = 0;
                for(let i=0; i<t.chunkCount; i++) {
                    const chunk = await this.engine.modelHandle.tensors.get(`${key}.chunk.${i}`);
                    if(chunk && chunk.data) {
                        combined.set(chunk.data, offset);
                        offset += chunk.data.length;
                    }
                }
                rawData = combined;
            }
            
            // B"H - Turbo Dequantization
            // If WASM is active, we must convert Q4 to F32 here because the WASM backend 
            // currently expects F32 pointers. This trades RAM for Speed.
            if (this.engine.useWasm && t.type === 2) { 
                 const n_elements = t.dims.reduce((a,b)=>a*b, 1);
                 const f32Data = Ops.dequantizeQ4_0(rawData, n_elements);
                 return { data: f32Data, type: 0, dims: t.dims }; // Type 0 = F32
            }

            return { data: rawData, type: t.type, dims: t.dims };
        };

        this.engine.globalWeights.embed = await load(this.engine.globalTensorMap.embed);
        this.engine.globalWeights.output_norm = await load(this.engine.globalTensorMap.output_norm);
        this.engine.globalWeights.output = await load(this.engine.globalTensorMap.output);

        for (let i = 0; i < this.engine.params.n_layer; i++) {
            if (i % 2 === 0) process.stdout.write(`\rB"H [AI] Loading Layer ${i+1}/${this.engine.params.n_layer}...`);
            const map = this.engine.layerTensorMap[i] || {};
            const layerObj = {};
            const keys = Object.keys(map);
            const promises = keys.map(k => load(map[k]).then(d => ({ key: k, val: d })));
            const results = await Promise.all(promises);
            for(const res of results) layerObj[res.key] = res.val;
            this.engine.compiledLayers[i] = layerObj;
        }
        process.stdout.write('\nB"H [AI] Weights Loaded.\n');
    }
}

module.exports = Loader;
