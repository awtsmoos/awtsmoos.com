/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/mediabunny-worker-base.js
Description: A refactored, reusable base worker for real-time video rendering.
*/

// --- AudioBuffer Polyfill (Local) ---
const createAudioBufferPolyfill = () => {
    /* ב"ה B"H */
    return function AudioBuffer(options) {
        this.channels = options.channels || [];
        this.sampleRate = options.sampleRate;
        this.length = options.length;
        this.duration = options.duration;
        this.numberOfChannels = options.numberOfChannels;

        this.getChannelData = (i) => this.channels[i];
        this.copyFromChannel = (dest, channelNum, start = 0) => {
            const source = this.channels[channelNum];
            if (source) dest.set(source.subarray(start, start + dest.length));
        };
    };
};

/**
 * The main bootstrap function for the worker.
 * It now accepts a function that will be used to draw each individual frame.
 * @param {function} frameDrawingFunction - A function that takes (context, payload) and draws a single frame.
 * @param {object} options - Configuration options like the library path.
 */
function bootstrapMediabunnyWorker(frameDrawingFunction, options = {}) {
    /* ב"ה B"H */

    if (typeof self === 'undefined' || !self.importScripts) {
        console.error("bootstrapMediabunnyWorker must be run in a Web Worker environment.");
        return;
    }

    const libraryPath = options.libraryPath || './mediabunny-library.js';
    self.AudioBuffer = createAudioBufferPolyfill();

    let mediabunny = null;
    try {
        self.exports = {};
        self.importScripts(libraryPath);
        mediabunny = self.exports;

        if (typeof mediabunny === 'undefined' || !mediabunny.Output) {
            throw new Error("Mediabunny library failed to load or expose 'Output' class.");
        }
    } catch (e) {
        self.postMessage({
            type: 'FATAL_ERROR',
            payload: { message: `FATAL: Could not load mediabunny library from ${libraryPath}.`, error: e }
        });
        return;
    }

    // --- NEW: Global state for the real-time renderer ---
    let workerContext = null;
    let lastFrameTime = 0;

    self.onmessage = async (event) => {
        const data = event.data;

        // --- HANDLER 1: INITIALIZE_RENDERER ---
        if (data.type === 'INITIALIZE_RENDERER') {
            const payload = data.payload;
            const { resolution } = payload;
            try {
                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Initializing video encoder...' } });

                const output = new mediabunny.Output({ format: new mediabunny.Mp4OutputFormat(), target: new mediabunny.BufferTarget() });

                let videoCodec = 'avc1.42001E';
                try {
                    videoCodec = await mediabunny.getFirstEncodableVideoCodec(output.format.getSupportedVideoCodecs(), { width: resolution.width, height: resolution.height });
                } catch (e) {
                    console.warn("Video codec check failed, using default.", e.message);
                }

                const renderCanvas = new OffscreenCanvas(resolution.width, resolution.height);
                const ctx = renderCanvas.getContext('2d', { alpha: false });
                const canvasSource = new mediabunny.CanvasSource(renderCanvas, { codec: videoCodec, bitrate: 4_000_000 });
                output.addVideoTrack(canvasSource);

                await output.start();

                // Store everything in the global context for other handlers to use
                workerContext = { payload, output, canvasSource, canvas: renderCanvas, ctx };
                lastFrameTime = 0; // Reset frame time

                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Renderer Ready.' } });

            } catch (e) {
                self.postMessage({ type: 'FATAL_ERROR', payload: { message: `Worker initialization failed: ${e.message}`, error: e } });
            }
        }

        // --- HANDLER 2: RENDER_FRAME ---
        else if (data.type === 'RENDER_FRAME' && workerContext) {
            try {
                // Calculate the duration of this frame based on the last one
                const timestamp = data.payload.time;
                const duration = Math.max(0, timestamp - lastFrameTime);

                // Call the user-provided drawing function
                await frameDrawingFunction(workerContext, data.payload);
                
                // Add the drawn frame to the video stream
                if (duration > 0) {
                    await workerContext.canvasSource.add(lastFrameTime, duration);
                }
                lastFrameTime = timestamp;

            } catch (e) {
                 self.postMessage({ type: 'FATAL_ERROR', payload: { message: `Frame rendering failed: ${e.message}`, error: e } });
            }
        }

        // --- HANDLER 3: FINALIZE_MUXING ---
        else if (data.type === 'FINALIZE_MUXING' && workerContext) {
            const { audioBufferShim } = data.payload;
            try {
                // Close the video track, adding any remaining duration
                const totalDuration = audioBufferShim.duration;
                const timeRemaining = totalDuration - lastFrameTime;
                if (timeRemaining > 0.001) {
                    await frameDrawingFunction(workerContext, null); // Draw one last static frame
                    await workerContext.canvasSource.add(lastFrameTime, timeRemaining);
                }
                workerContext.canvasSource.close();

                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Initializing Audio Encoder...' } });

                // --- ROBUST AUDIO CODEC NEGOTIATION WITH FALLBACK ---
                const finalAudioBufferShim = new self.AudioBuffer(audioBufferShim);
                let audioCodec = 'aac'; // Default fallback
                try {
                    const foundCodec = await mediabunny.getFirstEncodableAudioCodec(workerContext.output.format.getSupportedAudioCodecs(), finalAudioBufferShim);
                    if (foundCodec) {
                        audioCodec = foundCodec;
                    } else {
                        console.warn("Could not find an encodable audio codec. Falling back to 'aac'.");
                    }
                } catch (e) {
                    console.warn(`Audio Codec negotiation failed: ${e.message}. Using default 'aac'.`);
                }
                // --- END OF FIX ---

                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: `Using audio codec: ${audioCodec}` } });
                const audioBufferSource = new mediabunny.AudioBufferSource({ codec: audioCodec, bitrate: 128_000 }); // The bitrate was missing
                
                workerContext.output.addAudioTrack(audioBufferSource);
                
                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Encoding audio...' } });
                await audioBufferSource.add(finalAudioBufferShim);
                audioBufferSource.close();

                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Finalizing video file...' } });
                await workerContext.output.finalize();

                self.postMessage({
                    type: 'VIDEO_COMPLETE',
                    payload: { blob: new Blob([workerContext.output.target.buffer], { type: workerContext.output.format.mimeType }) }
                });

            } catch (e) {
                self.postMessage({ type: 'FATAL_ERROR', payload: { message: `Finalization failed: ${e.message}`, error: e } });
            }
        }
    };
}

// Expose the bootstrap function globally
if (typeof self !== 'undefined') {
    self.bootstrapMediabunnyWorker = bootstrapMediabunnyWorker;
}