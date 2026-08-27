// B"H
import { getTensorInfo } from './tensor_scan.js';

export function inferStats() {
    const params = {
        n_embd: 0, n_layer: 0, n_head: 0, n_head_kv: 0,
        head_dim: 128, norm_eps: 1e-5, rope_freq: 10000.0
    };

    const emb = getTensorInfo('token_embd.weight');
    if (emb) params.n_embd = Number(emb.dims[0]);

    let l = 0;
    while(getTensorInfo(`blk.${l}.attn_q.weight`) || getTensorInfo(`layers.${l}.attention.wq.weight`)) l++;
    params.n_layer = l;

    const q0 = getTensorInfo('blk.0.attn_q.weight') || getTensorInfo('layers.0.attention.wq.weight');
    const k0 = getTensorInfo('blk.0.attn_k.weight') || getTensorInfo('layers.0.attention.wk.weight');
    
    if (q0 && k0) {
        const q_out = Number(q0.dims[1]); 
        const k_out = Number(k0.dims[1]);
        
        // Infer head dimension
        if (q_out % 128 === 0) params.head_dim = 128;
        else if (q_out % 64 === 0) params.head_dim = 64;
        else params.head_dim = params.n_embd / (params.n_embd/128); // Fallback

        params.n_head = q_out / params.head_dim;
        params.n_head_kv = k_out / params.head_dim;
    } else {
        // Fallback for some architectures
        params.n_head = params.n_embd / 128;
        params.n_head_kv = params.n_head;
    }

    return params;
}