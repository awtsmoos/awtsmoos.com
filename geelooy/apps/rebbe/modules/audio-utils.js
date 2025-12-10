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
        if (startFrame < channelData.length) {
             const safeEnd = Math.min(endFrame, channelData.length);
             if(safeEnd > startFrame) {
                 newChannelData.set(channelData.subarray(startFrame, safeEnd));
             }
        }
    }

    return newBuffer;
}

/**
 * Renders a waveform of the buffer segment to a canvas
 */
export function drawWaveformToCanvas(buffer, canvas, startTime, duration, color) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const rate = buffer.sampleRate;
    const startFrame = Math.floor(startTime * rate);
    const endFrame = Math.floor((startTime + duration) * rate);
    
    // Bounds check
    if (startFrame >= buffer.length) return;
    const safeEnd = Math.min(endFrame, buffer.length);
    const len = safeEnd - startFrame;
    if (len <= 0) return;

    const data = buffer.getChannelData(0); // Use mono for viz
    const step = Math.ceil(len / width);
    const amp = height / 2;

    ctx.fillStyle = color || '#00ff00';
    ctx.beginPath();
    
    // Optimized drawing: Draw min/max pairs for each pixel column
    for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        
        const idxBase = startFrame + (i * step);
        for (let j = 0; j < step; j++) {
            const idx = idxBase + j;
            if (idx < safeEnd) {
                const val = data[idx];
                if (val < min) min = val;
                if (val > max) max = val;
            }
        }
        
        // Convert to Y coords
        const yMin = (1 + min) * amp;
        const yMax = (1 + max) * amp;
        
        ctx.fillRect(i, yMin, 1, Math.max(1, yMax - yMin));
    }
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

export function getFftAtTime(audioBuffer, time, fftSize = 256) {
    const rate = audioBuffer.sampleRate;
    const index = Math.floor(time * rate);
    const data = new Uint8Array(fftSize / 2); 
    
    if (index < 0 || index >= audioBuffer.length) return data;

    const channel = audioBuffer.getChannelData(0);
    const windowSize = fftSize * 4; 
    let sum = 0;
    
    for(let i = 0; i < windowSize; i++) {
        const s = channel[index - windowSize/2 + i] || 0;
        sum += Math.abs(s);
    }
    const avg = sum / windowSize; 
    
    for(let i=0; i<data.length; i++) {
        let val = avg * 255 * (1.0 + Math.sin(i * 0.1) * 0.5);
        val *= (Math.random() * 0.2 + 0.8);
        if(i > 20) val *= 0.5;
        data[i] = Math.min(255, val * 4.0);
    }
    return data;
}