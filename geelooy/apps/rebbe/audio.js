//B"H
// audio.js - AGGREGATOR
import { init, getBuffer } from './modules/player/core.js';
import { setCallbacks, playUrl, playBlob, togglePlay, seek, isPlaying, audioEl } from './modules/player/transport.js';
import { getFreqData } from './modules/player/analyzer.js';

export { 
    init, 
    setCallbacks, 
    getBuffer, 
    playUrl, 
    playBlob, 
    togglePlay, 
    seek, 
    isPlaying, 
    getFreqData, 
    audioEl 
};