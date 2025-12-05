//B"H
// modules/audio-utils.js

/**
 * Extracts a portion of an AudioBuffer.
 */
export function sliceAudioBuffer(originalBuffer, startTime, endTime) {
    const rate = originalBuffer.sampleRate;
    const startFrame = Math.floor(startTime * rate);
    const endFrame = Math.floor(endTime * rate);
    const frameCount = endFrame - startFrame;

    if (frameCount <= 0) throw new Error("Invalid slice duration");

    const newBuffer = new AudioBuffer({
        length: frameCount,
        numberOfChannels: originalBuffer.numberOfChannels,
        sampleRate: rate
    });

    for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
        const channelData = originalBuffer.getChannelData(i);
        const newChannelData = newBuffer.getChannelData(i);
        // Copy segment
        newChannelData.set(channelData.subarray(startFrame, endFrame));
    }

    return newBuffer;
}

/**
 * Converts AudioBuffer to Blob (WAV) for API upload.
 */
export async function bufferToWaveBlob(audioBuffer) {
    const length = audioBuffer.length * audioBuffer.numberOfChannels * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(audioBuffer.numberOfChannels);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * 2 * audioBuffer.numberOfChannels); // avg. bytes/sec
    setUint16(audioBuffer.numberOfChannels * 2);   // block-align
    setUint16(16);                                 // 16-bit (hardcoded in this encoder)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // Interleave channels
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
    }

    while (pos < length) {
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset])); // Clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true); 
            pos += 2;
        }
        offset++;
    }

    function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
    function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }

    return new Blob([buffer], { type: "audio/wav" });
}

/**
 * Gets frequency data for a specific time in the buffer.
 * Simulates the AnalyserNode behavior but offline.
 */
export function getFftAtTime(audioBuffer, time, fftSize = 256) {
    const rate = audioBuffer.sampleRate;
    const index = Math.floor(time * rate);
    const data = new Uint8Array(fftSize / 2); // 128 bins
    
    // Simple Time-Domain to Frequency approximation (Quick & Dirty Magnitude)
    // Real FFT is expensive in JS main thread loop, so we map amplitude envelope 
    // and some noise to simulate visualizer look for the video generation
    
    if (index < 0 || index >= audioBuffer.length) return data;

    const channel = audioBuffer.getChannelData(0);
    // Look at a window around the time
    const windowSize = fftSize * 4; 
    let sum = 0;
    
    for(let i = 0; i < windowSize; i++) {
        const s = channel[index - windowSize/2 + i] || 0;
        sum += Math.abs(s);
    }
    const avg = sum / windowSize; // 0 to 1
    
    // Fill bins
    for(let i=0; i<data.length; i++) {
        // Bass is stronger
        let val = avg * 255 * (1.0 + Math.sin(i * 0.1) * 0.5);
        
        // Add noise/variation based on index to look like FFT
        val *= (Math.random() * 0.2 + 0.8);
        
        // Decay high freqs
        if(i > 20) val *= 0.5;
        
        data[i] = Math.min(255, val * 4.0); // Boost
    }
    
    return data;
}