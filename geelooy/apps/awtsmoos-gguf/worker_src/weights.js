

// B"H
/**
 * @module WeightsSource
 */
export const WeightsSource = () => {

    self.weightCache = new Map();
    // B"H - Increased to 2GB to hold unquantized tensors for small models
    const CACHE_LIMIT = 2 * 1024 * 1024 * 1024; 
    let cacheUsed = 0;
    
    self.layerTensorMap = []; 
    self.globalTensorMap = {};

    self.autoMapWeights = function() {
        self.logDB(`[WEIGHTS] Starting Auto-Map (Strict C++ Pattern Matching)...`, 'info');
        self.layerTensorMap = [];
        self.globalTensorMap = {};
        self.env.debug_hex_dump = false; 

        const keys = Array.from(self.env.tensorMap.keys());
        const layerRegex = /^(?:model\.|blk\.|)(?:layers\.|)(\d+)\.(.+)$/;
        
        for (const key of keys) {
            const match = key.match(layerRegex);
            if (match) {
                const l = parseInt(match[1]);
                const suffix = match[2];
                
                if (!self.layerTensorMap[l]) self.layerTensorMap[l] = {};
                
                // --- ATTENTION ---
                if (suffix.match(/^(self_attn\.|attention\.|attn_)q\.weight$/) || suffix.match(/q_proj\.weight$/)) 
                    self.layerTensorMap[l]['attn_q'] = key;
                else if (suffix.match(/^(self_attn\.|attention\.|attn_)k\.weight$/) || suffix.match(/k_proj\.weight$/)) 
                    self.layerTensorMap[l]['attn_k'] = key;
                else if (suffix.match(/^(self_attn\.|attention\.|attn_)v\.weight$/) || suffix.match(/v_proj\.weight$/)) 
                    self.layerTensorMap[l]['attn_v'] = key;
                else if (suffix.match(/^(self_attn\.|attention\.|attn_)output\.weight$/) || suffix.match(/o_proj\.weight$/)) 
                    self.layerTensorMap[l]['attn_out'] = key;

                // --- QK NORMS (Gemma 2/3) ---
                else if (suffix.match(/^(attn_q_norm|q_norm)\.weight$/))
                    self.layerTensorMap[l]['attn_q_norm'] = key;
                else if (suffix.match(/^(attn_k_norm|k_norm)\.weight$/))
                    self.layerTensorMap[l]['attn_k_norm'] = key;

                // --- LAYER NORMS ---
                else if (suffix.match(/^(input_layernorm|attn_norm|pre_attention_layernorm)\.weight$/)) 
                    self.layerTensorMap[l]['attn_norm'] = key;
                else if (suffix === 'post_attention_norm.weight' || suffix.match(/^(post_attention_layernorm|attn_post_norm)\.weight$/)) 
                    self.layerTensorMap[l]['attn_post_norm'] = key;
                else if (suffix === 'ffn_norm.weight' || suffix.match(/^(pre_feedforward_layernorm|pre_mlp_layernorm)\.weight$/)) 
                    self.layerTensorMap[l]['ffn_norm'] = key;
                else if (suffix === 'post_ffw_norm.weight' || suffix.match(/^(post_feedforward_layernorm|post_mlp_layernorm|ffn_post_norm)\.weight$/)) 
                    self.layerTensorMap[l]['ffn_post_norm'] = key;

                // --- FFN ---
                else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)gate\.weight$/) || suffix.match(/w1\.weight$/) || suffix.match(/gate_proj\.weight$/)) 
                    self.layerTensorMap[l]['ffn_gate'] = key;
                else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)down\.weight$/) || suffix.match(/w2\.weight$/) || suffix.match(/down_proj\.weight$/)) 
                    self.layerTensorMap[l]['ffn_down'] = key;
                else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)up\.weight$/) || suffix.match(/w3\.weight$/) || suffix.match(/up_proj\.weight$/)) 
                    self.layerTensorMap[l]['ffn_up'] = key;

            } else {
                // Global Tensors
                if (key.match(/^(token_embd|model\.embed_tokens)\.weight$/)) self.globalTensorMap['embed'] = key;
                else if (key.match(/^(output_norm|model\.norm)\.weight$/)) self.globalTensorMap['output_norm'] = key;
                else if (key.match(/^(output|lm_head)\.weight$/)) self.globalTensorMap['output'] = key;
            }
        }
        
        self.logDB(`[WEIGHTS] Mapped ${self.layerTensorMap.length} layers.`, 'info');
    };

    self.loadWeight = function(name, noCache = false) {
        let realName = name;
        
        // 1. Try Direct Lookup
        let info = self.env.tensorMap.get(name);
        
        // 2. Try Layer Map Lookup (Aliasing)
        if (!info) {
            const match = name.match(/^(?:blk\.|layers\.|)(\d+)\.(.+)\.weight$/);
            if (match) {
                const l = parseInt(match[1]);
                const alias = match[2];
                
                if (self.layerTensorMap[l] && self.layerTensorMap[l][alias]) {
                    realName = self.layerTensorMap[l][alias];
                    info = self.env.tensorMap.get(realName);
                }
            } else {
                if (name === 'output_norm.weight' && self.globalTensorMap['output_norm']) {
                    realName = self.globalTensorMap['output_norm'];
                    info = self.env.tensorMap.get(realName);
                } else if (name === 'output.weight' && self.globalTensorMap['output']) {
                    realName = self.globalTensorMap['output'];
                    info = self.env.tensorMap.get(realName);
                } else if (name === 'token_embd.weight' && self.globalTensorMap['embed']) {
                    realName = self.globalTensorMap['embed'];
                    info = self.env.tensorMap.get(realName);
                }
            }
        }

        if (!info) return null;

        if (!noCache && self.weightCache.has(realName)) {
            return self.weightCache.get(realName);
        }

        const tensor = self.readTensor(info); 
        
        if (!noCache && tensor) {
            const size = tensor.byteLength;
            if (cacheUsed + size > CACHE_LIMIT) {
                self.logDB("[WEIGHTS] Cache Limit Reached. Clearing cache & Resetting WASM Heap...", "warn");
                self.weightCache.clear();
                cacheUsed = 0;
                // B"H - Reset WASM Heap to prevent leak
                if (self.resetWasmHeap) self.resetWasmHeap();
            }
            self.weightCache.set(realName, tensor);
            cacheUsed += size;
        }
        
        return tensor;
    };
};
