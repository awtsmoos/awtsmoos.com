//B"H
// modules/player/analyzer.js
import { pState } from './core.js';

export function getFreqData() {
    const data = new Uint8Array(pState.analyser ? pState.analyser.frequencyBinCount : 0);
    if(pState.analyser) pState.analyser.getByteFrequencyData(data);
    return data;
}