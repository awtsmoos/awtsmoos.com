
// B"H
const Logger = require('../../utils/logger.js');

function inferParams(metadata, tensorMap) {
    const kv = metadata;
    const findVal = (suffix) => {
         for(const k in kv) {
             if(k.endsWith(suffix)) return kv[k];
         }
         return undefined;
    };

    const p = {
        n_embd: 0, n_layer: 0, n_head: 0, n_head_kv: 0, head_dim: 0,
        norm_eps: 1e-5, rope_freq: 10000.0, rope_freq_local: 0.0,
        rope_scale: 1.0,
        arch: 'llama',
        useEmbScale: false, attn_soft_cap: 0.0, final_soft_cap: 0.0,
        sliding_window: 0, sliding_window_pattern: 0,
        query_pre_attn_scalar: 0,
        act_fn: 'silu',
        rope_is_neox: false,
        norm_offset: 0.0
    };

    const kvArch = kv['general.architecture'];
    if (kvArch) p.arch = kvArch.toLowerCase();
    const isGemma = p.arch.includes('gemma');
    const isGemma3 = p.arch === 'gemma3';
    
    if (isGemma) {
        p.act_fn = 'gelu';
        p.rope_is_neox = true; 
        p.norm_offset = 0.0;
    }

    const embInfo = tensorMap.get('token_embd.weight') || tensorMap.get('model.embed_tokens.weight');
    if (embInfo) p.n_embd = Number(embInfo.dims[0]);

    const qInfo = tensorMap.get('blk.0.attn_q.weight') || tensorMap.get('model.layers.0.self_attn.q_proj.weight');
    const kInfo = tensorMap.get('blk.0.attn_k.weight') || tensorMap.get('model.layers.0.self_attn.k_proj.weight');

    let metaHeadDim = findVal('.attention.key_length') || findVal('.attention.head_dim');
    
    if (metaHeadDim) {
        p.head_dim = metaHeadDim;
    } else if (qInfo) {
         const q_out = Number(qInfo.dims[1]);
         const count = findVal('.attention.head_count');
         if (count) p.head_dim = q_out / count;
         else p.head_dim = isGemma ? 256 : 128;
    }

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
    
    p.norm_eps = findVal('.attention.layer_norm_rms_epsilon') || 1e-5; 
    p.rope_freq = findVal('.rope.freq_base') || 10000.0;
    
    const scaleFactor = findVal('.rope.scaling.factor');
    if (scaleFactor && scaleFactor > 0) p.rope_scale = 1.0 / scaleFactor; 

    const localFreq = findVal('rope.freq_base.local') || findVal('rope_freq_base_local');
    if (localFreq) p.rope_freq_local = localFreq;
    else if (isGemma && p.rope_freq > 50000.0) p.rope_freq_local = 10000.0;
    else p.rope_freq_local = p.rope_freq;
    
    if (isGemma) {
        p.useEmbScale = true; 
        p.sliding_window = findVal('.attention.sliding_window') || 0;
        p.sliding_window_pattern = findVal('.attention.sliding_window_pattern') || (isGemma3 ? 6 : 0); 
        p.query_pre_attn_scalar = findVal('.attention.query_pre_attn_scalar');
        if (!p.query_pre_attn_scalar) p.query_pre_attn_scalar = p.head_dim; 
        p.attn_soft_cap = isGemma3 ? 0.0 : (findVal('attn_logit_softcapping') || 0.0);
        p.final_soft_cap = findVal('final_logit_softcapping') || 0.0;
    } 
    
    let l = 0;
    while(tensorMap.has(`blk.${l}.attn_q.weight`) || tensorMap.has(`model.layers.${l}.self_attn.q_proj.weight`)) l++;
    p.n_layer = l;

    p.q_dim = p.n_head * p.head_dim;
    p.kv_dim = p.n_head_kv * p.head_dim;
    
    Logger.log(`[CONFIG] ${p.arch} | L:${p.n_layer} | Emb:${p.n_embd} | Heads:${p.n_head}/${p.n_head_kv} | Dim:${p.head_dim} | Eps:${p.norm_eps} | Offset:${p.norm_offset}`);
    
    return p;
}

module.exports = { inferParams };
