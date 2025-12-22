
// B"H
export const ConfigSource = () => {
    
    self.inferStats = function(meta) {
        const params = { 
            n_embd: 0, n_layer: 0, n_head: 0, n_head_kv: 0, head_dim: 0, 
            norm_eps: 1e-6, rope_freq: 10000.0, rope_freq_local: 0.0,
            rope_scale: 1.0, 
            arch: 'llama',      
            useEmbScale: false, attn_soft_cap: 0.0, final_soft_cap: 0.0, 
            sliding_window: 0, sliding_window_pattern: 0, 
            query_pre_attn_scalar: 0, 
            act_fn: 'silu',
            rope_is_neox: false 
        };
        
        const findVal = (suffix) => {
             for(const k in meta.kv) {
                 if(k.endsWith(suffix)) return meta.kv[k];
             }
             return undefined;
        };

        // 1. Architecture
        const kvArch = meta.kv['general.architecture'];
        if (kvArch) params.arch = kvArch.toLowerCase();
        const isGemma = params.arch.includes('gemma');
        
        if (isGemma) {
            params.act_fn = 'gelu';
            params.rope_is_neox = true; // Gemma uses Neox style RoPE
        }

        // 2. Dimensions
        const embInfo = self.env.tensorMap.get('token_embd.weight') || self.env.tensorMap.get('model.embed_tokens.weight');
        if (embInfo) params.n_embd = Number(embInfo.dims[0]); 

        const qInfo = self.env.tensorMap.get('blk.0.attn_q.weight') || self.env.tensorMap.get('model.layers.0.self_attn.q_proj.weight');
        const kInfo = self.env.tensorMap.get('blk.0.attn_k.weight') || self.env.tensorMap.get('model.layers.0.self_attn.k_proj.weight');

        // Head Dim Inference
        let metaHeadDim = findVal('.attention.key_length') || findVal('.attention.head_dim');
        if (metaHeadDim) {
            params.head_dim = metaHeadDim;
        } else if (qInfo) {
             const q_out = Number(qInfo.dims[1]);
             const count = findVal('.attention.head_count');
             if (count) {
                 params.head_dim = q_out / count;
             } else {
                 params.head_dim = isGemma ? 256 : 128; 
             }
        }

        if (qInfo) {
            const q_out = Number(qInfo.dims[1]);
            params.n_head = Math.round(q_out / params.head_dim);
        } else {
            params.n_head = findVal('.attention.head_count') || (params.n_embd / 128);
        }

        if (kInfo) {
            const k_out = Number(kInfo.dims[1]);
            params.n_head_kv = Math.round(k_out / params.head_dim);
        } else {
            params.n_head_kv = findVal('.attention.head_count_kv') || params.n_head;
        }
        
        // 3. Norm
        params.norm_eps = findVal('.attention.layer_norm_rms_epsilon') || 1e-5;
        
        // 4. RoPE
        params.rope_freq = findVal('.rope.freq_base') || 10000.0;
        
        const scaleFactor = findVal('.rope.scaling.factor');
        if (scaleFactor && scaleFactor > 0) params.rope_scale = 1.0 / scaleFactor; 

        // RoPE Local (Gemma 3 Hybrid)
        // If global is 1M, local is usually 10k.
        // We look for explicit key first.
        const localFreq = findVal('rope.freq_base.local') || findVal('rope_freq_base_local');
        if (localFreq) {
            params.rope_freq_local = localFreq;
        } else if (isGemma && params.rope_freq > 50000.0) {
            // CONFIRMED: llama-model.cpp sets hparams.rope_freq_base_train_swa = 10000.0f
            params.rope_freq_local = 10000.0;
            self.logDB(`[CONFIG] inferred rope_freq_local: 10000.0 (Global is ${params.rope_freq})`, 'warn');
        } else {
            params.rope_freq_local = params.rope_freq;
        }

        // 5. GEMMA SPECIFIC
        if (isGemma) {
            params.useEmbScale = true; 
            
            params.sliding_window = findVal('.attention.sliding_window') || 0;
            params.sliding_window_pattern = findVal('.attention.sliding_window_pattern') || 0; 
            
            // CONFIRMED: llama-model.cpp sets pattern to 6 for Gemma 3
            if (params.sliding_window > 0 && params.sliding_window_pattern === 0) {
                 params.sliding_window_pattern = 6; 
                 self.logDB(`[CONFIG] Defaulting sliding_window_pattern to 6 (Gemma 3 Std)`, 'warn');
            }

            params.query_pre_attn_scalar = findVal('.attention.query_pre_attn_scalar');
            if (!params.query_pre_attn_scalar) {
                 params.query_pre_attn_scalar = params.head_dim; 
            }
            
            // Soft Capping
            // CRITICAL FIX: llama-model.cpp DISABLES attn soft capping for Gemma 3, 
            // even if the key exists in GGUF. Only Gemma 2 uses it.
            if (params.arch === 'gemma3') {
                params.attn_soft_cap = 0.0;
                self.logDB(`[CONFIG] Gemma 3: Forcing Attn Soft Cap to 0.0 (matches llama.cpp)`, 'warn');
            } else {
                params.attn_soft_cap = findVal('attn_logit_softcapping') || 0.0; 
            }

            params.final_soft_cap = findVal('final_logit_softcapping') || 0.0;
            
            self.logDB(`[CONFIG] Soft Caps: Attn=${params.attn_soft_cap}, Final=${params.final_soft_cap}`, 'info');
        } 
        
        // 6. Layer Count
        let l = 0;
        while(self.env.tensorMap.has(`blk.${l}.attn_q.weight`) || self.env.tensorMap.has(`model.layers.${l}.self_attn.q_proj.weight`)) l++;
        params.n_layer = l;

        params.q_dim = params.n_head * params.head_dim;
        params.kv_dim = params.n_head_kv * params.head_dim;
        
        self.logDB(`[CONFIG] ${params.arch} | L:${params.n_layer} | Emb:${params.n_embd} | Heads:${params.n_head}/${params.n_head_kv} | Dim:${params.head_dim}`, 'accent');
        self.logDB(`[CONFIG] RoPE Global:${params.rope_freq} | Local:${params.rope_freq_local} | Pattern:${params.sliding_window_pattern} | Neox:${params.rope_is_neox}`, 'accent');
        
        return params;
    }
};
