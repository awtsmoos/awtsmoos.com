/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/mediabunny-worker-base.js
Description: A class-based, reusable base worker with a high-performance frame cache.
VERSION 5.0 - The "Performance Cache" Architecture
*/

// --- AudioBuffer Polyfill (Local) ---
self.AudioBuffer = self.AudioBuffer || function AudioBuffer(options) {
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

class MediaBunnyBase {
    constructor(config, frameDrawingFunction, options = {}) {
        this.config = config;
        this.frameDrawingFunction = frameDrawingFunction;
        this.libraryPath = options.libraryPath || './mediabunny-library.js';
        this.mediabunny = null;
        this.isStarted = false;
        this.lastFrameTime = 0;

        // --- PERFORMANCE CACHE ---
        // A queue to hold raw frame data before it's encoded.
        this.frameQueue = [];
        // The current size of the frames stored in the queue, in bytes.
        this.cacheSize = 0;
        // The maximum size for the cache (100 MB).
        this.maxCacheSize = 100 * 1024 * 1024;
        // A lock to ensure only one encoding process runs at a time.
        this.isEncoding = false;
        // Tracks the timestamp of the most recently added frame to correctly calculate total duration.
        this.lastQueuedTime = 0;
        // --- END PERFORMANCE CACHE ---


        // Load the core library immediately
        try {
            self.exports = {};
            self.importScripts(this.libraryPath);
            this.mediabunny = self.exports;
            if (!this.mediabunny || !this.mediabunny.Output) {
                throw new Error("Mediabunny library failed to load or expose 'Output' class.");
            }
        } catch (e) {
            this._postFatalError(`Could not load library from ${this.libraryPath}.`, e);
            throw e;
        }
    }

    async start() {
        if (this.isStarted) return;
        this._postStatus('Initializing encoders...');
        const { resolution, outputFormat } = this.config;
        try {
            this.output = new this.mediabunny.Output({
                format: new this.mediabunny.Mp4OutputFormat(),
                target: new this.mediabunny.BufferTarget()
            });

            // --- VIDEO TRACK WITH RESTORED CORE LOGIC ---
            this.canvas = new OffscreenCanvas(resolution.width, resolution.height);
            this.ctx = this.canvas.getContext('2d', { alpha: false });

            // RESTORED: Dynamically find the best supported video codec.
            let videoCodec = 'avc1.42001E'; // A sensible default
            try {
                videoCodec = await this.mediabunny.getFirstEncodableVideoCodec(
                    this.output.format.getSupportedVideoCodecs(),
                    { width: resolution.width, height: resolution.height }
                );
            } catch (e) {
                console.warn("Dynamic video codec check failed, using default.", e.message);
            }

            this.canvasSource = new this.mediabunny.CanvasSource(this.canvas, {
                codec: videoCodec,
                bitrate: (outputFormat.quality || 0.5) * 8_000_000
            });
            this.output.addVideoTrack(this.canvasSource);

            // --- AUDIO TRACK ---
            this.audioBufferSource = new this.mediabunny.AudioBufferSource({ codec: 'aac', bitrate: 128_000 });
            this.output.addAudioTrack(this.audioBufferSource);

            await this.output.start();
            this.isStarted = true;
            this._postStatus('Renderer Ready.');

        } catch (e) {
            this._postFatalError(`Worker initialization failed: ${e.message}`, e);
            throw e;
        }
    }

    /**
     * Draws a frame and adds it to the encoding queue. This method returns
     * quickly, as the actual encoding happens in a background process.
     */
    async addFrame(framePayload) {
        if (!this.isStarted) throw new Error("Renderer must be started before adding frames.");

        // --- BACKPRESSURE ---
        // If the cache is full, wait for the encoder to process some frames
        // to free up memory. This prevents memory overflow.
        while (this.cacheSize >= this.maxCacheSize) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Draw the frame onto the canvas.
        await this.frameDrawingFunction({ payload: this.config, ctx: this.ctx, canvas: this.canvas }, framePayload);

        // Capture the raw pixel data from the canvas.
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // Add the frame data to our in-memory queue.
        this.frameQueue.push({
            imageData: imageData,
            duration: framePayload.duration,
            time: framePayload.time
        });

        // Update the cache size and the time of the latest frame.
        this.cacheSize += imageData.data.byteLength;
        this.lastQueuedTime = framePayload.time;

        // Start the background encoding process if it's not already running.
        if (!this.isEncoding) {
            this._processFrameQueue(); // This is intentionally not awaited.
        }
    }

    /**
     * [NEW] A background task that encodes frames from the queue.
     * It runs asynchronously and ensures frames are encoded in order.
     */
    async _processFrameQueue() {
        if (this.isEncoding) return; // Ensure only one processor runs.
        this.isEncoding = true;

        try {
            // Process frames until the queue is empty.
            while (this.frameQueue.length > 0) {
                const frame = this.frameQueue.shift(); // Get the next frame.

                // Restore the pixel data to the canvas for encoding.
                this.ctx.putImageData(frame.imageData, 0, 0);

                // Perform the actual, time-consuming encoding step.
                if (frame.duration > 0) {
                    await this.canvasSource.add(this.lastFrameTime, frame.duration);
                }
                this.lastFrameTime = frame.time;

                // Decrease the cache size now that the frame is processed.
                this.cacheSize -= frame.imageData.data.byteLength;
            }
        } catch (e) {
            this._postFatalError(`Frame encoding failed: ${e.message}`, e);
            // On error, clear the queue to prevent further issues.
            this.frameQueue = [];
            this.cacheSize = 0;
        } finally {
            this.isEncoding = false; // Release the lock.
        }
    }

    async finalize(audioBufferShim) {
        if (!this.isStarted) throw new Error("Renderer must be started before finalization.");
        this._postStatus('Finalizing video track...');

        // Calculate if a final frame is needed to match the audio duration,
        // based on the last frame that was QUEUED, not encoded.
        const totalDuration = audioBufferShim.duration;
        const timeRemaining = totalDuration - this.lastQueuedTime;
        if (timeRemaining > 0.001) {
            await this.addFrame({ time: totalDuration, duration: timeRemaining });
        }

        // --- WAIT FOR CACHE ---
        // Wait for the encoding queue to be completely empty before proceeding.
        while (this.frameQueue.length > 0 || this.isEncoding) {
             if (!this.isEncoding && this.frameQueue.length > 0) {
                this._processFrameQueue();
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        this.canvasSource.close();

        this._postStatus('Encoding audio...');
        const finalAudioBuffer = new self.AudioBuffer(audioBufferShim);
        await this.audioBufferSource.add(finalAudioBuffer);
        this.audioBufferSource.close();

        this._postStatus('Muxing video file...');
        await this.output.finalize();

        return new Blob([this.output.target.buffer], { type: this.output.format.mimeType });
    }

    _postStatus(message) { self.postMessage({ type: 'STATUS_UPDATE', payload: { message } }); }
    _postComplete(blob, options) { self.postMessage({ type: 'VIDEO_COMPLETE', payload: { blob, ...options } }); }
    _postFatalError(message, error) { self.postMessage({ type: 'FATAL_ERROR', payload: { message, error: error.toString() } }); }
}