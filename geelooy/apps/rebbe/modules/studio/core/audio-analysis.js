//B"H
// modules/studio/core/audio-analysis.js
import { ctx } from '../context.js';

export function preAnalyzeAudio(audioBuffer) {
    if (!audioBuffer) return [];
    
    const rawData = audioBuffer.getChannelData(0); // Use mono for analysis
    const sampleRate = audioBuffer.sampleRate;
    const fps = 30; // Analysis resolution
    const samplesPerFrame = Math.floor(sampleRate / fps);
    const totalFrames = Math.ceil(rawData.length / samplesPerFrame);
    
    const analysis = new Array(totalFrames);
    
    for (let i = 0; i < totalFrames; i++) {
        const start = i * samplesPerFrame;
        const end = Math.min(start + samplesPerFrame, rawData.length);
        
        let sum = 0;
        // Calculate RMS (Root Mean Square) for volume/energy
        for (let j = start; j < end; j++) {
            const s = rawData[j];
            sum += s * s;
        }
        
        const rms = Math.sqrt(sum / (end - start));
        
        // Simple mapping to bass/mid/treble simulation for visualizer
        // Real FFT on full buffer is too heavy, RMS is good proxy for "energy"
        // We boost it slightly to match the live analyser feel
        const energy = Math.min(1, rms * 5); 
        
        analysis[i] = {
            bass: energy,
            mid: Math.min(1, energy * 0.8),
            treble: Math.min(1, energy * 0.5),
            vol: rms
        };
    }
    
    ctx.analysisData = analysis;
    return analysis;
}