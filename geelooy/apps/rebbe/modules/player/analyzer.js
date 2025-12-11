//B"H
// modules/player/analyzer.js
import { pState } from './core.js';

let dataArray = null;

export function getFreqData() {
    if (!pState.analyser) return new Uint8Array(0);
    
    // Lazy init or resize if needed (though binCount is usually constant)
    if (!dataArray || dataArray.length !== pState.analyser.frequencyBinCount) {
        dataArray = new Uint8Array(pState.analyser.frequencyBinCount);
    }
    
    pState.analyser.getByteFrequencyData(dataArray);
    return dataArray;
}