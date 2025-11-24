/**
 * B"H
 * File: trim-worker.js
 * Description: A web worker to handle audio trimming in the background.
 */

self.onmessage = (e) => {
    const { type, payload } = e.data;

    if (type === 'TRIM_AUDIO') {
        try {
            const {
                channelData,
                sampleRate,
                startTime,
                endTime,
                formats,
                originalFileName
            } = payload;

            // 1. Calculate the start and end samples
            const startSample = Math.floor(startTime * sampleRate);
            const endSample = Math.floor(endTime * sampleRate);
            const durationSamples = endSample - startSample;

            if (durationSamples <= 0) {
                throw new Error("Trim duration is zero or negative.");
            }

            // 2. Create the new (trimmed) AudioBuffer data
            const numChannels = channelData.length;
            const trimmedChannels = [];
            for (let i = 0; i < numChannels; i++) {
                trimmedChannels.push(channelData[i].slice(startSample, endSample));
            }

            // 3. Convert the trimmed data to a WAV blob (most universally supported)
            const wavBlob = audioBufferToWav(trimmedChannels, numChannels, sampleRate);
            
            // For simplicity, this example directly creates a WAV. 
            // Encoding to MP3 or OGG in a worker requires external libraries like lamejs or opus.js.
            // We will send back the WAV for all selected formats in this basic example.
            
            formats.forEach(format => {
                 const extension = format.split('/')[1] === 'mpeg' ? 'mp3' : format.split('/')[1];
                 const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                 const fileName = `BH_${timestamp}_${originalFileName}_trimmed.${extension}`;
                 
                 // Note: The blob type is set to the selected format, but the data is WAV.
                 // For true multi-format export, an encoding step is needed here.
                 const finalBlob = new Blob([wavBlob], { type: format });

                 self.postMessage({
                     type: 'TRIM_COMPLETE',
                     payload: { blob: finalBlob, fileName }
                 });
            });

        } catch (error) {
            self.postMessage({ type: 'ERROR', payload: { message: error.message } });
        }
    }
};

// --- WAV Encoding Helper Function ---
// This function converts raw audio channel data into a valid WAV file blob.
function audioBufferToWav(channels, numChannels, sampleRate) {
    const buffer = new ArrayBuffer(44 + channels[0].length * numChannels * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + channels[0].length * numChannels * 2, true);
    writeString(view, 8, 'WAVE');
    // FMT sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
    view.setUint16(32, numChannels * 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    // Data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, channels[0].length * numChannels * 2, true);

    // Write the interleaved audio data
    let offset = 44;
    for (let i = 0; i < channels[0].length; i++) {
        for (let j = 0; j < numChannels; j++) {
            const sample = Math.max(-1, Math.min(1, channels[j][i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
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