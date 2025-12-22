
// B"H
export const ModelAttnSource = () => {
    
    function getRoPEConfig(l, params) {
        // Gemma 3 Sliding Window Logic
        let isSliding = false;
        
        if (params.sliding_window > 0 && params.sliding_window_pattern > 0) {
            isSliding = ((l + 1) % params.sliding_window_pattern) !== 0;
        } 
        
        const freq = isSliding ? params.rope_freq_local : params.rope_freq;
        const scale = isSliding ? 1.0 : params.rope_scale;
        
        return { freq, scale, isSliding };
    }

    self.computeAttention = function(x, l, params, prefix, pos) {
        const p = `blk.${l}.`;
        
        let q_w = self.loadWeight(`${p}attn_q.weight`);
        let k_w = self.loadWeight(`${p}attn_k.weight`);
        let v_w = self.loadWeight(`${p}attn_v.weight`);
        
        if (!q_w || !k_w || !v_w) return new Float32Array(params.n_embd);

        // Projections
        let q = self.matVecMul(x, q_w, params.q_dim);
        let k = self.matVecMul(x, k_w, params.kv_dim);
        let v = self.matVecMul(x, v_w, params.kv_dim);
        
        // --- QK NORM (Gemma 2/3) ---
        if (params.arch.includes('gemma')) {
             let w_qn = self.loadWeight(`${p}attn_q_norm.weight`);
             let w_kn = self.loadWeight(`${p}attn_k_norm.weight`);
             
             // Gemma 3 QK Norm is applied per-head (RMS Norm)
             // w_qn dims are [head_dim]. GGUF might store it as [head_dim] or [head_dim * n_head]
             // Usually it's just [head_dim] and broadcasted.
             
             if (w_qn) {
                 for (let h = 0; h < params.n_head; h++) {
                     const start = h * params.head_dim;
                     const q_head = q.subarray(start, start + params.head_dim);
                     // If w_qn is big enough, slice it. Otherwise reuse it.
                     const w_slice = (w_qn.length >= params.q_dim) ? w_qn.subarray(start, start + params.head_dim) : w_qn;
                     
                     const normed = self.rmsNorm(q_head, w_slice, params.norm_eps, 0.0);
                     q.set(normed, start);
                 }
             }

             if (w_kn) {
                 for (let h = 0; h < params.n_head_kv; h++) {
                     const start = h * params.head_dim;
                     const k_head = k.subarray(start, start + params.head_dim);
                     const w_slice = (w_kn.length >= params.kv_dim) ? w_kn.subarray(start, start + params.head_dim) : w_kn;
                     
                     const normed = self.rmsNorm(k_head, w_slice, params.norm_eps, 0.0);
                     k.set(normed, start);
                 }
             }
        }
        
        // --- RoPE ---
        const ropeConfig = getRoPEConfig(l, params);
        // Debug L0
        if (pos === 0 && l === 0 && !self.env.rope_debug_done) {
            self.logDB(`[L0] RoPE: ${ropeConfig.isSliding ? 'Sliding (Local)' : 'Full (Global)'} | Freq: ${ropeConfig.freq} | Scale: ${ropeConfig.scale} | Neox: ${params.rope_is_neox}`, 'debug');
            self.env.rope_debug_done = true;
        }

        const q_r = self.rope(q, params.head_dim, pos, ropeConfig.freq, ropeConfig.scale, params.rope_is_neox);
        const k_r = self.rope(k, params.head_dim, pos, ropeConfig.freq, ropeConfig.scale, params.rope_is_neox);

        if (!self.env.kv[l]) self.env.kv[l] = { k: [], v: [] };
        self.env.kv[l].k[pos] = k_r;
        self.env.kv[l].v[pos] = v;

        // --- SCALE ---
        let scale;
        if (params.query_pre_attn_scalar > 0) {
            scale = 1.0 / Math.sqrt(params.query_pre_attn_scalar);
        } else {
            scale = 1.0 / Math.sqrt(params.head_dim);
        }

        // --- ATTENTION LOOP ---
        // Sliding Window Masking
        let startPos = 0;
        if (ropeConfig.isSliding && params.sliding_window > 0) {
            startPos = Math.max(0, pos - params.sliding_window + 1);
        }
        
        const out_attn = new Float32Array(params.q_dim);
        const ratio = Math.floor(params.n_head / params.n_head_kv);
        
        for (let h = 0; h < params.n_head; h++) {
            const h_off = h * params.head_dim;
            const q_h = q_r.subarray(h_off, h_off + params.head_dim);
            
            const kv_h = Math.floor(h / ratio);
            const kv_off = kv_h * params.head_dim; 
            
            const validLen = pos - startPos + 1;
            const scores = new Float32Array(validLen);
            
            for (let i = 0; i < validLen; i++) {
                const p = startPos + i;
                const k_h = self.env.kv[l].k[p].subarray(kv_off, kv_off + params.head_dim);
                
                let dot = 0;
                for(let j=0; j<params.head_dim; j++) dot += q_h[j] * k_h[j];
                
                scores[i] = dot * scale;
            }

            // SOFT CAPPING (Attn) - Disabled for Gemma 3
            let cap_scores = scores;
            if (params.attn_soft_cap > 0) {
                cap_scores = self.softCap(scores, params.attn_soft_cap);
            }
            
            const probs = self.softmax(cap_scores);
            const out_h = out_attn.subarray(h_off, h_off + params.head_dim);
            
            for (let i = 0; i < validLen; i++) {
                const p = startPos + i;
                const val = probs[i];
                const v_h = self.env.kv[l].v[p].subarray(kv_off, kv_off + params.head_dim);
                for(let j=0; j<params.head_dim; j++) out_h[j] += val * v_h[j];
            }
        }
        
        let attn_proj_w = self.loadWeight(`${p}attn_out.weight`);
        return self.matVecMul(out_attn, attn_proj_w, params.n_embd);
    };
};
