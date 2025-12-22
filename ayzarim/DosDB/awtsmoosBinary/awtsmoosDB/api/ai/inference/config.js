
// B"H
module.exports = async function initConfig(engine) {
    const getVal = async (k) => await engine.modelHandle.config.get(k);
    const archVal = await getVal('general.architecture');
    engine.params.arch = (archVal || 'llama').toLowerCase();
    const isGemma = engine.params.arch.includes('gemma');
    
    if (isGemma) {
        engine.params.act_fn = 'gelu';
        engine.params.rope_is_neox = true;
        engine.params.useEmbScale = true;
    } else {
        engine.params.act_fn = 'silu';
    }

    const embKey = engine.globalTensorMap['embed'];
    const embInfo = embKey ? await engine.modelHandle.tensors.get(embKey) : null;
    if (embInfo) engine.params.n_embd = Number(embInfo.dims[0]); 
    
    const metaLayers = await getVal('llama.block_count');
    engine.params.n_layer = engine.mappedLayers > 0 ? engine.mappedLayers : (metaLayers || 0);

    const metaHeadCount = await getVal('llama.attention.head_count');
    const metaHeadCountKV = await getVal('llama.attention.head_count_kv');
    const metaKeyLength = await getVal('llama.attention.key_length');
    const metaHeadDim = await getVal('llama.attention.head_dim');

    let qInfo = null;
    if (engine.layerTensorMap[0] && engine.layerTensorMap[0]['attn_q']) {
        qInfo = await engine.modelHandle.tensors.get(engine.layerTensorMap[0]['attn_q']);
    }

    if (metaKeyLength) {
        engine.params.head_dim = metaKeyLength;
    } else if (metaHeadDim) {
        engine.params.head_dim = metaHeadDim;
    } else if (qInfo) {
        const q_out = Number(qInfo.dims[1]);
        if (metaHeadCount) {
            engine.params.head_dim = Math.round(q_out / metaHeadCount);
        } else if (q_out % 128 === 0) {
            engine.params.head_dim = 128;
        } else if (q_out % 64 === 0) {
            engine.params.head_dim = 64;
        } else {
            engine.params.head_dim = isGemma ? 256 : 128;
        }
    } else {
        engine.params.head_dim = 128;
    }

    if (qInfo) {
        const q_out = Number(qInfo.dims[1]);
        engine.params.n_head = Math.round(q_out / engine.params.head_dim);
    } else {
        engine.params.n_head = metaHeadCount || (engine.params.n_embd / 128);
    }

    if (engine.layerTensorMap[0] && engine.layerTensorMap[0]['attn_k']) {
        const kInfo = await engine.modelHandle.tensors.get(engine.layerTensorMap[0]['attn_k']);
        if (kInfo) {
            const k_out = Number(kInfo.dims[1]);
            engine.params.n_head_kv = Math.round(k_out / engine.params.head_dim);
        }
    }
    if (!engine.params.n_head_kv) engine.params.n_head_kv = metaHeadCountKV || engine.params.n_head;

    engine.params.q_dim = engine.params.n_head * engine.params.head_dim;
    engine.params.kv_dim = engine.params.n_head_kv * engine.params.head_dim;

    // RoPE & Norm
    engine.params.norm_eps = (await getVal('llama.attention.layer_norm_rms_epsilon')) || 1e-5;
    engine.params.rope_freq_global = (await getVal('rope.freq_base')) || 10000.0;
    
    const ropeLocal = (await getVal('rope.freq_base.local')) || (await getVal('rope_freq_base_local'));
    if (ropeLocal) engine.params.rope_freq_local = ropeLocal;
    else if (isGemma && engine.params.rope_freq_global > 50000.0) engine.params.rope_freq_local = 10000.0;
    else engine.params.rope_freq_local = engine.params.rope_freq_global;

    const scaleFactor = await getVal('rope.scaling.factor');
    if (scaleFactor && scaleFactor > 0) engine.params.rope_scale = 1.0 / scaleFactor;

    engine.params.sliding_window = (await getVal('attention.sliding_window')) || 0;
    engine.params.sliding_window_pattern = (await getVal('attention.sliding_window_pattern')) || 0;
    if (isGemma && engine.params.sliding_window > 0 && engine.params.sliding_window_pattern === 0) engine.params.sliding_window_pattern = 6;

    // Soft Capping
    engine.params.attn_soft_cap = (await getVal('attn_logit_softcapping')) || 0.0;
    engine.params.final_soft_cap = (await getVal('final_logit_softcapping')) || 0.0;
    
    if (engine.params.arch === 'gemma3') {
         engine.params.attn_soft_cap = 0.0; 
    }

    console.log(`B"H\n [AI] Init ${engine.params.arch}: L=${engine.params.n_layer} Embd=${engine.params.n_embd} Heads=${engine.params.n_head}/${engine.params.n_head_kv} Dim=${engine.params.head_dim} SoftCaps=${engine.params.attn_soft_cap}/${engine.params.final_soft_cap}`);
};
