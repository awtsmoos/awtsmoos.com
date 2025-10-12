/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/mediabunny-worker-base.js
Description: A class-based, reusable base worker with restored core logic.
VERSION 4.1 - The "Definitive Fix" Architecture
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

    async addFrame(framePayload) {
        if (!this.isStarted) throw new Error("Renderer must be started before adding frames.");
        
        await this.frameDrawingFunction({ payload: this.config, ctx: this.ctx, canvas: this.canvas }, framePayload);
        
        if (framePayload.duration > 0) {
            await this.canvasSource.add(this.lastFrameTime, framePayload.duration);
        }
        this.lastFrameTime = framePayload.time;
    }

    async finalize(audioBufferShim) {
        if (!this.isStarted) throw new Error("Renderer must be started before finalization.");
        this._postStatus('Finalizing video track...');
        
        const totalDuration = audioBufferShim.duration;
        const timeRemaining = totalDuration - this.lastFrameTime;
        if (timeRemaining > 0.001) {
            await this.addFrame({ time: totalDuration, duration: timeRemaining });
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