// B"H
const { dequantize } = require('../math/quant.js');
const { getByteSize, GGML_TYPE } = require('../math/types.js');

// GLOBAL WEIGHT CACHE (Map<StringName, Float32Array>)
const tensorCache = new Map();

function mapWeights(tensorMap) {
    const layerTensorMap = [];
    const globalTensorMap = {};
    const keys = Array.from(tensorMap.keys());
    const layerRegex = /^(?:model\.|blk\.|)(?:layers\.|)(\d+)\.(.+)$/;
    
    for (const key of keys) {
        if (key.includes('.chunk')) continue;
        const match = key.match(layerRegex);
        if (match) {
            const l = parseInt(match[1]);
            const suffix = match[2];
            if (!layerTensorMap[l]) layerTensorMap[l] = {};
            if (suffix.match(/^(self_attn\.|attention\.|attn_)q\.weight$/) || suffix.match(/q_proj\.weight$/)) layerTensorMap[l]['attn_q'] = key;
            else if (suffix.match(/^(self_attn\.|attention\.|attn_)k\.weight$/) || suffix.match(/k_proj\.weight$/)) layerTensorMap[l]['attn_k'] = key;
            else if (suffix.match(/^(self_attn\.|attention\.|attn_)v\.weight$/) || suffix.match(/v_proj\.weight$/)) layerTensorMap[l]['attn_v'] = key;
            else if (suffix.match(/^(self_attn\.|attention\.|attn_)output\.weight$/) || suffix.match(/o_proj\.weight$/)) layerTensorMap[l]['attn_out'] = key;
            else if (suffix.match(/^(attn_q_norm|q_norm)\.weight$/)) layerTensorMap[l]['attn_q_norm'] = key;
            else if (suffix.match(/^(attn_k_norm|k_norm)\.weight$/)) layerTensorMap[l]['attn_k_norm'] = key;
            else if (suffix.match(/^(input_layernorm|attn_norm|pre_attention_layernorm)\.weight$/)) layerTensorMap[l]['attn_norm'] = key;
            else if (suffix === 'post_attention_norm.weight' || suffix.match(/^(post_attention_layernorm|attn_post_norm)\.weight$/)) layerTensorMap[l]['attn_post_norm'] = key;
            else if (suffix === 'ffn_norm.weight' || suffix.match(/^(pre_feedforward_layernorm|pre_mlp_layernorm|ffn_norm)\.weight$/)) layerTensorMap[l]['ffn_norm'] = key;
            else if (suffix === 'post_ffw_norm.weight' || suffix.match(/^(post_feedforward_layernorm|post_mlp_layernorm|ffn_post_norm)\.weight$/)) layerTensorMap[l]['ffn_post_norm'] = key;
            else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)gate\.weight$/) || suffix.match(/w1\.weight$/) || suffix.match(/gate_proj\.weight$/)) layerTensorMap[l]['ffn_gate'] = key;
            else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)down\.weight$/) || suffix.match(/w2\.weight$/) || suffix.match(/down_proj\.weight$/)) layerTensorMap[l]['ffn_down'] = key;
            else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)up\.weight$/) || suffix.match(/w3\.weight$/) || suffix.match(/up_proj\.weight$/)) layerTensorMap[l]['ffn_up'] = key;
        } else {
            if (key.match(/^(token_embd|model\.embed_tokens)\.weight$/)) globalTensorMap['embed'] = key;
            else if (key.match(/^(output_norm|model\.norm)\.weight$/)) globalTensorMap['output_norm'] = key;
            else if (key.match(/^(output|lm_head)\.weight$/)) globalTensorMap['output'] = key;
        }
    }
    return { layerTensorMap, globalTensorMap };
}

// B"H: 5 Arguments (Standard)
function readTensor(buffer, baseOffset, info, sliceStart = 0, sliceLength = null) {
    if (!info) return null;

    const isFullRead = (sliceStart === 0 && sliceLength === null);
    if (isFullRead && tensorCache.has(info.name)) {
        return tensorCache.get(info.name);
    }

    const numElements = info.dims.reduce((a, b) => a * b, 1);
    const readLen = sliceLength !== null ? sliceLength : numElements;
    const type = info.type;
    const { blockElements, blockSize } = getByteSize(type);
    
    const blockIndexStart = Math.floor(sliceStart / blockElements);
    const byteStart = baseOffset + info.dataOffset + (blockIndexStart * blockSize);
    const byteLength = Math.ceil(readLen / blockElements) * blockSize;
    
    if (byteStart >= buffer.byteLength) return new Float32Array(readLen);

    let safeByteLength = byteLength;
    if (byteStart + byteLength > buffer.byteLength) {
         safeByteLength = buffer.byteLength - byteStart;
    }

    // Direct View
    const rawView = new Uint8Array(buffer.buffer, buffer.byteOffset + byteStart, safeByteLength);

    // Dequantize (Always Float32)
    const fullResult = dequantize(rawView, type, safeByteLength / blockSize * blockElements);
    
    const relativeStart = sliceStart - (blockIndexStart * blockElements);
    let final;
    
    if (relativeStart === 0 && readLen === fullResult.length) final = fullResult;
    else final = fullResult.subarray(relativeStart, relativeStart + readLen);

    // B"H: OPTIMIZATION - Cache ALL tensors regardless of size.
    // The cost of re-dequantizing 500MB+ Output Tensors per token is far higher than RAM cost.
    if (isFullRead) {
        tensorCache.set(info.name, final);
    }
    
    return final;
}

module.exports = { mapWeights, readTensor };