
// B"H
const { dequantize, F16_TABLE } = require('../../math/quant.js');
const { getByteSize, GGML_TYPE } = require('../../math/types.js');

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
            else if (suffix.match(/^(self_attn\.|attention\.|attn_)q\.bias$/) || suffix.match(/q_proj\.bias$/)) layerTensorMap[l]['attn_q_bias'] = key;
            else if (suffix.match(/^(self_attn\.|attention\.|attn_)k\.weight$/) || suffix.match(/k_proj\.weight$/)) layerTensorMap[l]['attn_k'] = key;
            else if (suffix.match(/^(self_attn\.|attention\.|attn_)k\.bias$/) || suffix.match(/k_proj\.bias$/)) layerTensorMap[l]['attn_k_bias'] = key;
            else if (suffix.match(/^(self_attn\.|attention\.|attn_)v\.weight$/) || suffix.match(/v_proj\.weight$/)) layerTensorMap[l]['attn_v'] = key;
            else if (suffix.match(/^(self_attn\.|attention\.|attn_)v\.bias$/) || suffix.match(/v_proj\.bias$/)) layerTensorMap[l]['attn_v_bias'] = key;
            else if (suffix.match(/^(self_attn\.|attention\.|attn_)output\.weight$/) || suffix.match(/o_proj\.weight$/)) layerTensorMap[l]['attn_out'] = key;
            else if (suffix.match(/^(self_attn\.|attention\.|attn_)output\.bias$/) || suffix.match(/o_proj\.bias$/)) layerTensorMap[l]['attn_out_bias'] = key;
            else if (suffix.match(/^(attn_q_norm|q_norm)\.weight$/)) layerTensorMap[l]['attn_q_norm'] = key;
            else if (suffix.match(/^(attn_k_norm|k_norm)\.weight$/)) layerTensorMap[l]['attn_k_norm'] = key;
            else if (suffix.match(/^(input_layernorm|attn_norm|pre_attention_layernorm)\.weight$/)) layerTensorMap[l]['attn_norm'] = key;
            else if (suffix.match(/^(input_layernorm|attn_norm|pre_attention_layernorm)\.bias$/)) layerTensorMap[l]['attn_norm_bias'] = key;
            else if (suffix === 'post_attention_norm.weight' || suffix.match(/^(post_attention_layernorm|attn_post_norm)\.weight$/)) layerTensorMap[l]['attn_post_norm'] = key;
            else if (suffix === 'post_attention_norm.bias' || suffix.match(/^(post_attention_layernorm|attn_post_norm)\.bias$/)) layerTensorMap[l]['attn_post_norm_bias'] = key;
            else if (suffix === 'ffn_norm.weight' || suffix.match(/^(pre_feedforward_layernorm|pre_mlp_layernorm|ffn_norm)\.weight$/)) layerTensorMap[l]['ffn_norm'] = key;
            else if (suffix === 'ffn_norm.bias' || suffix.match(/^(pre_feedforward_layernorm|pre_mlp_layernorm|ffn_norm)\.bias$/)) layerTensorMap[l]['ffn_norm_bias'] = key;
            else if (suffix === 'post_ffw_norm.weight' || suffix.match(/^(post_feedforward_layernorm|post_mlp_layernorm|ffn_post_norm)\.weight$/)) layerTensorMap[l]['ffn_post_norm'] = key;
            else if (suffix === 'post_ffw_norm.bias' || suffix.match(/^(post_feedforward_layernorm|post_mlp_layernorm|ffn_post_norm)\.bias$/)) layerTensorMap[l]['ffn_post_norm_bias'] = key;
            else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)gate\.weight$/) || suffix.match(/w1\.weight$/) || suffix.match(/gate_proj\.weight$/)) layerTensorMap[l]['ffn_gate'] = key;
            else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)down\.weight$/) || suffix.match(/w2\.weight$/) || suffix.match(/down_proj\.weight$/)) layerTensorMap[l]['ffn_down'] = key;
            else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)down\.bias$/) || suffix.match(/w2\.bias$/) || suffix.match(/down_proj\.bias$/)) layerTensorMap[l]['ffn_down_bias'] = key;
            else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)up\.weight$/) || suffix.match(/w3\.weight$/) || suffix.match(/up_proj\.weight$/)) layerTensorMap[l]['ffn_up'] = key;
            else if (suffix.match(/^(mlp\.|feed_forward\.|ffn_)up\.bias$/) || suffix.match(/w3\.bias$/) || suffix.match(/up_proj\.bias$/)) layerTensorMap[l]['ffn_up_bias'] = key;
        } else {
            if (key.match(/^(token_embd|model\.embed_tokens|bert\.embeddings\.word_embeddings|embeddings\.word_embeddings)\.weight$/)) globalTensorMap['embed'] = key;
            else if (key.match(/^(position_embd|bert\.embeddings\.position_embeddings|embeddings\.position_embeddings)\.weight$/)) globalTensorMap['position_embed'] = key;
            else if (key.match(/^(token_types|token_type_embd|bert\.embeddings\.token_type_embeddings|embeddings\.token_type_embeddings)\.weight$/)) globalTensorMap['token_type_embed'] = key;
            else if (key.match(/^(output_norm|model\.norm|bert\.embeddings\.LayerNorm|embeddings\.LayerNorm)\.bias$/)) globalTensorMap['output_norm_bias'] = key;
            else if (key.match(/^(output_norm|model\.norm|bert\.embeddings\.LayerNorm|embeddings\.LayerNorm)\.weight$/)) globalTensorMap['output_norm'] = key;
            else if (key.match(/^(output|lm_head)\.weight$/)) globalTensorMap['output'] = key;
        }
    }
    return { layerTensorMap, globalTensorMap };
}

function readTensor(buffer, baseOffset, info, sliceStart = 0, sliceLength = null) {
    if (!info) return null;

    const isFullRead = (sliceStart === 0 && sliceLength === null);
    if (isFullRead && tensorCache.has(info.name)) return tensorCache.get(info.name);
    
    const type = info.type;
    const { blockElements, blockSize } = getByteSize(type);
    
    const numElements = info.dims.reduce((a, b) => a * b, 1);
    const readLen = sliceLength !== null ? sliceLength : numElements;
    
    const blockIndexStart = Math.floor(sliceStart / blockElements);
    const byteStart = baseOffset + info.dataOffset + (blockIndexStart * blockSize);
    const byteLength = Math.ceil(readLen / blockElements) * blockSize;
    
    let safeByteLength = byteLength;
    if (byteStart + byteLength > buffer.byteLength) safeByteLength = buffer.byteLength - byteStart;

    const rawView = new Uint8Array(buffer.buffer, buffer.byteOffset + byteStart, safeByteLength);
    const fullResult = dequantize(rawView, type, safeByteLength / blockSize * blockElements);
    
    const relativeStart = sliceStart - (blockIndexStart * blockElements);
    let final;
    if (relativeStart === 0 && readLen === fullResult.length) final = fullResult;
    else final = fullResult.subarray(relativeStart, relativeStart + readLen);

    if (isFullRead) tensorCache.set(info.name, final);
    return final;
}

function dequantizeSingle(rawBuffer, type) {
    const { blockElements, blockSize } = getByteSize(type);
    const numElements = (rawBuffer.length / blockSize) * blockElements;
    return dequantize(rawBuffer, type, numElements);
}

function readQuantizedTensor(buffer, baseOffset, info) {
    if (!info || info.type !== GGML_TYPE.Q4_0) return null;
    if (tensorCache.has(info.name + "_QUANT")) return tensorCache.get(info.name + "_QUANT");

    const numElements = info.dims.reduce((a, b) => a * b, 1);
    const { blockSize } = getByteSize(info.type);
    const blockCount = numElements / 32;
    const byteLength = blockCount * blockSize;
    const byteStart = baseOffset + info.dataOffset;
    
    const rawData = new Uint8Array(buffer.buffer, buffer.byteOffset + byteStart, byteLength);
    
    const res = parseQuantizedBuffer(rawData, numElements);
    tensorCache.set(info.name + "_QUANT", res);
    return res;
}

function parseQuantizedBuffer(rawData, numElementsOverride = null) {
    const blockCount = rawData.length / 18; 
    const numElements = numElementsOverride || (blockCount * 32);

    const scales = new Float32Array(blockCount);
    const quants = new Uint8Array(blockCount * 16);
    
    let rawIdx = 0;
    let qIdx = 0;
    
    for (let i = 0; i < blockCount; i++) {
        const f16 = rawData[rawIdx] | (rawData[rawIdx+1] << 8);
        scales[i] = F16_TABLE[f16];
        rawIdx += 2;
        for(let j=0; j<16; j++) {
            quants[qIdx++] = rawData[rawIdx++];
        }
    }
    
    return { scales, quants, n_out: numElements, n_in: numElements, type: 'Q4_0' };
}

module.exports = { mapWeights, readTensor, readQuantizedTensor, dequantizeSingle, parseQuantizedBuffer };
