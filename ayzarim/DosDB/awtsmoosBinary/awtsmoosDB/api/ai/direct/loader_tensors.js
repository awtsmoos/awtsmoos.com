// B"H
const fs = require('fs');
const { dequantize } = require('../math/quant.js');
const { getByteSize, GGML_TYPE } = require('../math/types.js');

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

// B"H: FIXED SIGNATURE (7 arguments)
function readTensor(fd, headerBuf, baseOffset, info, sliceStart = 0, sliceLength = null, raw = false) {
    if (!info) return null;

    const cacheKey = raw ? info.name + "_raw" : info.name;
    const isFullRead = (sliceStart === 0 && sliceLength === null);
    
    // 1. Check Cache
    if (isFullRead && tensorCache.has(cacheKey)) {
        return tensorCache.get(cacheKey);
    }

    const numElements = info.dims.reduce((a, b) => a * b, 1);
    const readLen = sliceLength !== null ? sliceLength : numElements;
    const type = info.type;
    const { blockElements, blockSize } = getByteSize(type);
    
    const blockIndexStart = Math.floor(sliceStart / blockElements);
    
    // File Position
    const absoluteStart = baseOffset + info.dataOffset + (blockIndexStart * blockSize);
    const byteLength = Math.ceil(readLen / blockElements) * blockSize;
    
    // 2. Read Bytes (Header Cache vs Disk)
    let rawView;
    let tempBuf = null;

    // Check if within header buffer bounds
    if (headerBuf && absoluteStart + byteLength <= headerBuf.length) {
        rawView = new Uint8Array(headerBuf.buffer, headerBuf.byteOffset + absoluteStart, byteLength);
    } else {
        // Read from Disk
        tempBuf = Buffer.allocUnsafe(byteLength);
        const bytesRead = fs.readSync(fd, tempBuf, 0, byteLength, absoluteStart);
        if (bytesRead < byteLength) {
            tempBuf.fill(0, bytesRead); // Zero padding if partial read
        }
        rawView = new Uint8Array(tempBuf.buffer, tempBuf.byteOffset, byteLength);
    }

    // 3. Return Raw (For Output Head Chunking)
    if (raw) {
        if (isFullRead) {
            // Clone if needed to ensure cache persistence
            const cachedCopy = new Uint8Array(byteLength);
            cachedCopy.set(rawView);
            tensorCache.set(cacheKey, cachedCopy);
            return cachedCopy;
        }
        // If slice and tempBuf exists, returning rawView relies on tempBuf. 
        // JS will keep tempBuf alive as long as rawView is alive.
        return rawView;
    }

    // 4. Dequantize to Float32 (Standard Path)
    const fullResult = dequantize(rawView, type, byteLength / blockSize * blockElements);
    
    const relativeStart = sliceStart - (blockIndexStart * blockElements);
    let final;
    
    if (relativeStart === 0 && readLen === fullResult.length) final = fullResult;
    else final = fullResult.subarray(relativeStart, relativeStart + readLen);

    // 5. Smart Cache
    // Cache float tensors only if < 20MB. This prevents RAM explosion.
    if (isFullRead && final.byteLength < 20 * 1024 * 1024) {
        tensorCache.set(cacheKey, final);
    }
    
    return final;
}

module.exports = { mapWeights, readTensor };