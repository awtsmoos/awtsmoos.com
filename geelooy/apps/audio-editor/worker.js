/**
 * B"H
 * Advanced Audio Mixing Worker
 */

self.onmessage = (e) => {
    const { type, payload } = e.data;

    if (type === 'EXPORT') {
        mixAndExport(payload);
    }
};

function mixAndExport(data) {
    const { clips, totalDuration, sampleRate } = data;
    const masterSampleRate = sampleRate;
    const totalLength = Math.ceil(totalDuration * masterSampleRate);
    
    // Create Stereo Buffer
    const leftBuffer = new Float32Array(totalLength);
    const rightBuffer = new Float32Array(totalLength);

    // Mix Loop
    clips.forEach(clip => {
        const clipSampleRate = clip.sampleRate;
        
        // Where to start writing in the master buffer (Master Time)
        const startSample = Math.floor(clip.start * masterSampleRate);
        
        // Where to start reading from the source buffer (Source Time)
        const offsetSample = Math.floor(clip.offset * clipSampleRate); 
        
        // How long to write for (Master Time)
        const durationSamples = Math.floor(clip.duration * masterSampleRate);
        
        // Process Left Channel
        mixChannel(leftBuffer, clip.channels[0], startSample, offsetSample, durationSamples, clipSampleRate, masterSampleRate);
        
        // Process Right Channel (if exists, else copy left, or silence)
        if (clip.channels.length > 1) {
            mixChannel(rightBuffer, clip.channels[1], startSample, offsetSample, durationSamples, clipSampleRate, masterSampleRate);
        } else {
            mixChannel(rightBuffer, clip.channels[0], startSample, offsetSample, durationSamples, clipSampleRate, masterSampleRate);
        }
    });

    // Convert to WAV
    const wavBlob = encodeWAV([leftBuffer, rightBuffer], masterSampleRate);
    
    self.postMessage({
        type: 'EXPORT_COMPLETE',
        payload: { blob: wavBlob }
    });
}

function mixChannel(master, source, masterStart, sourceStart, length, sourceRate, masterRate) {
    // Calculate pitch ratio
    const ratio = sourceRate / masterRate;

    for (let i = 0; i < length; i++) {
        // Calculate the exact position in the source buffer for this master sample
        const sourceIndex = sourceStart + (i * ratio);
        
        // Linear Interpolation (Resampling)
        // This fixes the "Tone/Pitch is lower" issue
        const idx = Math.floor(sourceIndex);
        const frac = sourceIndex - idx;
        
        if (masterStart + i < master.length) {
            let sampleValue = 0;

            // Check bounds to prevent NaN
            if (idx + 1 < source.length) {
                const p0 = source[idx];
                const p1 = source[idx + 1];
                // Interpolate between current sample and next sample
                sampleValue = p0 + (p1 - p0) * frac;
            } else if (idx < source.length) {
                // Edge case: End of buffer
                sampleValue = source[idx];
            }

            // Additive Mixing
            master[masterStart + i] += sampleValue;
        }
    }
}

// --- WAV Encoder ---
function encodeWAV(channels, sampleRate) {
    const numChannels = channels.length;
    const length = channels[0].length;
    const buffer = new ArrayBuffer(44 + length * numChannels * 2);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length * numChannels * 2, true);

    let offset = 44;
    for (let i = 0; i < length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            let sample = channels[ch][i];
            
            // Hard limiter to prevent digital distortion (Clipping)
            sample = Math.max(-1, Math.min(1, sample));
            
            // 16-bit PCM conversion
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, sample, true);
            offset += 2;
        }
    }
    
    return new Blob([view], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}