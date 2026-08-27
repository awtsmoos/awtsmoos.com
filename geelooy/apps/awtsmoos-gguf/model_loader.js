// B"H
/**
 * Model Loader
 */
import { getTensorInfo, scanTensors } from './tensor_scan.js';
import { readTensor } from './tensor_io.js';

let fullBuffer = null;
let dataBaseOffset = 0;
let vocabList = [];

export function initLoader(buffer, metaData) {
    fullBuffer = buffer;
    vocabList = metaData.vocab;
    // Pass alignment found in header
    dataBaseOffset = scanTensors(buffer, metaData.endOffset, metaData.tensorCount, metaData.alignment);
    return { vocab: vocabList };
}

export function loadWeight(name) {
    let info = getTensorInfo(name);
    if (!info) info = getTensorInfo(name.replace('blk.', 'layers.'));
    if (!info) return null;

    return readTensor(fullBuffer, dataBaseOffset, info);
}

export function getEmbeddingRow(tokenID, n_embd) {
    let info = getTensorInfo('token_embd.weight');
    if (!info) return null;

    const startIdx = tokenID * n_embd;
    const total = info.dims.reduce((a,b)=>a*b,1);
    
    if (startIdx >= total) {
        return new Float32Array(n_embd);
    }

    return readTensor(fullBuffer, dataBaseOffset, info, startIdx, n_embd);
}

export function getVocab() {
    return vocabList;
}