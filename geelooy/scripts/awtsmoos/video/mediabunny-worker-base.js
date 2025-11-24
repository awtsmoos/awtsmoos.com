/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/mediabunny-worker-base.js
Description: A class-based, reusable base worker with a high-performance, "zero-copy" frame cache.
VERSION 6.0 - The "Zero-Copy" Architecture
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

        // --- HIGH-PERFORMANCE CACHE ---
        // A queue to hold lightweight VideoSample objects before encoding.
        this.frameQueue = [];
        // A simple frame count limit for the cache, as byte size is not easily available.
        this.maxCacheFrames = 300; // Cache up to 300 frames.
        // A lock to ensure only one encoding process runs at a time.
        this.isEncoding = false;
        // Tracks the timestamp of the most recently added frame to correctly calculate total duration.
        this.lastQueuedTime = 0;
        // --- END HIGH-PERFORMANCE CACHE ---


        // Load the core library immediately
        try {
            self.exports = {};
            self.importScripts(this.libraryPath);
            this.mediabunny = self.exports;
            if (!this.mediabunny || !this.mediabunny.Output || !this.mediabunny.VideoSample) {
                throw new Error("Mediabunny library failed to load or expose necessary classes.");
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

            // --- VIDEO TRACK ---
            this.canvas = new OffscreenCanvas(resolution.width, resolution.height);
            this.ctx = this.canvas.getContext('2d', { alpha: false });
            
            let videoCodec = 'avc1.42001E'; // A sensible default
            try {
                videoCodec = await this.mediabunny.getFirstEncodableVideoCodec(
                    this.output.format.getSupportedVideoCodecs(),
                    { width: resolution.width, height: resolution.height }
                );
            } catch (e) {
                console.warn("Dynamic video codec check failed, using default.", e.message);
            }
            
            // --- OPTIMIZATION: Use VideoSampleSource instead of CanvasSource ---
            // This is the key to unlocking "zero-copy" performance. It's a direct pipe for VideoSample objects.
            this.videoSampleSource = new this.mediabunny.VideoSampleSource({
                codec: videoCodec,
                bitrate: (outputFormat.quality || 0.5) * 8_000_000
            });
            this.output.addVideoTrack(this.videoSampleSource);

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
     * Draws a frame, captures it as a GPU-resident VideoFrame, wraps it,
     * and adds it to the encoding queue. This is extremely fast.
     */
    async addFrame(framePayload) {
        if (!this.isStarted) throw new Error("Renderer must be started before adding frames.");

        // --- BACKPRESSURE ---
        while (this.frameQueue.length >= this.maxCacheFrames) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Draw the frame onto the offscreen canvas.
        await this.frameDrawingFunction({ payload: this.config, ctx: this.ctx, canvas: this.canvas }, framePayload);

        // --- OPTIMIZATION: Create a VideoFrame directly from the canvas ---
        // This is a very fast operation that avoids copying pixels from GPU to CPU.
        const videoFrame = new VideoFrame(this.canvas, {
            // VideoFrame API requires timestamps and durations in microseconds.
            timestamp: framePayload.time * 1_000_000, 
            duration: framePayload.duration * 1_000_000
        });

        // Wrap the VideoFrame in the library's required VideoSample object.
        const videoSample = new this.mediabunny.VideoSample(videoFrame);

        // Add the lightweight sample object to our queue.
        this.frameQueue.push(videoSample);
        this.lastQueuedTime = framePayload.time + framePayload.duration;

        // Start the background encoding process if it's not already running.
        if (!this.isEncoding) {
            this._processFrameQueue(); // Intentionally not awaited.
        }
    }

    /**
     * A background task that encodes VideoSamples from the queue.
     */
    async _processFrameQueue() {
        if (this.isEncoding) return;
        this.isEncoding = true;

        try {
            while (this.frameQueue.length > 0) {
                const sample = this.frameQueue.shift();

                // --- OPTIMIZATION: Pass the VideoSample directly to the source ---
                // This is the zero-copy path to the hardware encoder.
                await this.videoSampleSource.add(sample);

                // IMPORTANT: Close the sample to release its underlying GPU resources.
                sample.close();
            }
        } catch (e) {
            this._postFatalError(`Frame encoding failed: ${e.message}`, e);
            this.frameQueue.forEach(sample => sample.close()); // Clean up remaining frames
            this.frameQueue = [];
        } finally {
            this.isEncoding = false;
        }
    }

    async finalize(audioBufferShim) {
        if (!this.isStarted) throw new Error("Renderer must be started before finalization.");
        this._postStatus('Finalizing video track...');

        // Calculate if a final "hold" frame is needed to match audio duration.
        const totalDuration = audioBufferShim.duration;
        const timeRemaining = totalDuration - this.lastQueuedTime;

        if (timeRemaining > 0.001) {
            // Create a final, empty frame payload. The drawing function will handle the last drawn state.
            await this.addFrame({ time: this.lastQueuedTime, duration: timeRemaining });
        }

        // --- WAIT FOR CACHE ---
        // Wait for the encoding queue to be completely empty before proceeding.
        while (this.frameQueue.length > 0 || this.isEncoding) {
             if (!this.isEncoding && this.frameQueue.length > 0) {
                this._processFrameQueue();
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        this.videoSampleSource.close();

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