/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/mediabunny-worker-base.js
Description: A refactored, reusable base worker for real-time video rendering.
VERSION 3.0 - The Correct and Final Initialization Logic.
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
        self.postMessage({ type: 'FATAL_ERROR', payload: { message: `FATAL: Could not load mediabunny library from ${libraryPath}.`, error: e }});
        return;
    }

    let workerContext = null;
    let lastFrameTime = 0;

    self.onmessage = async (event) => {
        const data = event.data;

        // --- HANDLER 1: INITIALIZE_RENDERER ---
        if (data.type === 'INITIALIZE_RENDERER') {
            const payload = data.payload;
            const { resolution } = payload;
            try {
                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Initializing encoders...' } });

                const output = new mediabunny.Output({ format: new mediabunny.Mp4OutputFormat(), target: new mediabunny.BufferTarget() });

                // 1. Configure and add VIDEO track
                let videoCodec = 'avc1.42001E';
                try {
                    videoCodec = await mediabunny.getFirstEncodableVideoCodec(output.format.getSupportedVideoCodecs(), { width: resolution.width, height: resolution.height });
                } catch (e) { console.warn("Video codec check failed, using default.", e.message); }
                const renderCanvas = new OffscreenCanvas(resolution.width, resolution.height);
                const ctx = renderCanvas.getContext('2d', { alpha: false });
                const canvasSource = new mediabunny.CanvasSource(renderCanvas, { codec: videoCodec, bitrate: 4_000_000 });
                output.addVideoTrack(canvasSource);

                // 2. Configure and add AUDIO track (with a standard default codec)
                const audioBufferSource = new mediabunny.AudioBufferSource({ codec: 'aac', bitrate: 128_000 });
                output.addAudioTrack(audioBufferSource);
                
                // 3. START the output now that all tracks are added
                await output.start();
                
                // 4. Store context for future messages
                workerContext = { payload, output, canvasSource, audioBufferSource, canvas: renderCanvas, ctx };
                lastFrameTime = 0;

                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Renderer Ready.' } });

            } catch (e) {
                self.postMessage({ type: 'FATAL_ERROR', payload: { message: `Worker initialization failed: ${e.message}`, error: e } });
            }
        }

        // --- HANDLER 2: RENDER_FRAME ---
        else if (data.type === 'RENDER_FRAME' && workerContext) {
            try {
                const timestamp = data.payload.time;
                const duration = Math.max(0, timestamp - lastFrameTime);
                data.payload.duration = duration; // Add delta time to payload for animations

                await frameDrawingFunction(workerContext, data.payload);
                
                // This will now succeed because the output has been started
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
                // 1. Finalize the video track
                const totalDuration = audioBufferShim.duration;
                const timeRemaining = totalDuration - lastFrameTime;
                if (timeRemaining > 0.001) {
                    await frameDrawingFunction(workerContext, null); // Draw one last static frame
                    await workerContext.canvasSource.add(lastFrameTime, timeRemaining);
                }
                workerContext.canvasSource.close();

                // 2. Add data to the already-existing audio track
                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Encoding audio...' } });
                const finalAudioBufferShim = new self.AudioBuffer(audioBufferShim);
                await workerContext.audioBufferSource.add(finalAudioBufferShim);
                workerContext.audioBufferSource.close();

                // 3. Finalize the entire file
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