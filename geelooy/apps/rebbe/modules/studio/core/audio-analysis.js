//B"H
// modules/studio/core/audio-analysis.js
import { ctx } from '../context.js';

export function preAnalyzeAudio(audioBuffer) {
    if (!audioBuffer) return [];
    
    const rawData = audioBuffer.getChannelData(0); // Use mono for analysis
    const sampleRate = audioBuffer.sampleRate;
    const fps = 60; // INCREASED FPS FOR SMOOTHER PARTICLES
    const samplesPerFrame = Math.floor(sampleRate / fps);
    const totalFrames = Math.ceil(rawData.length / samplesPerFrame);
    
    const analysis = new Array(totalFrames);
    
    for (let i = 0; i < totalFrames; i++) {
        const start = i * samplesPerFrame;
        const end = Math.min(start + samplesPerFrame, rawData.length);
        
        let sum = 0;
        // Calculate RMS (Root Mean Square) for volume/energy
        // Optimization: Step through samples to avoid heavy loop on large buffers
        const step = 2; // Check every 2nd sample
        let count = 0;
        for (let j = start; j < end; j += step) {
            const s = rawData[j];
            sum += s * s;
            count++;
        }
        
        const rms = Math.sqrt(sum / count);
        
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