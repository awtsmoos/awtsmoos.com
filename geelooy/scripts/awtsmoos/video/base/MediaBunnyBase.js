/* B"H */
class MediaBunnyBase {
    constructor(config, frameDrawingFunction, options = {}) {
        this.config = config; this.frameDrawingFunction = frameDrawingFunction;
        this.libraryPath = options.libraryPath || '/scripts/awtsmoos/video/mediabunny-library.js';
        this.mediabunny = AwtsVideoBase.loadMediabunny(this.libraryPath);
        this.isStarted = false; this.frameQueue = []; this.maxCacheFrames = Math.max(2, config.maxCacheFrames || 8);
        this.isEncoding = false; this.lastQueuedTime = 0;
    }
    async start() {
        if (this.isStarted) return;
        this._postStatus('Initializing encoders...');
        const { resolution, outputFormat } = this.config;
        try {
            this.output = AwtsVideoBase.createOutput(this.mediabunny);
            this.canvas = new OffscreenCanvas(resolution.width, resolution.height);
            this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true });
            const codec = await AwtsVideoBase.pickVideoCodec(this.mediabunny, this.output, resolution);
            this.videoSampleSource = AwtsVideoBase.createVideoSource(this.mediabunny, codec, outputFormat);
            this.output.addVideoTrack(this.videoSampleSource, { frameRate: outputFormat.fps || 30 });
            this.audioBufferSource = AwtsVideoBase.createAudioSource(this.mediabunny);
            this.output.addAudioTrack(this.audioBufferSource);
            await this.output.start(); this.isStarted = true; this._postStatus('Renderer Ready. Codec: ' + codec);
        } catch (e) { this._postFatalError(`Worker initialization failed: ${e.message}`, e); throw e; }
    }
    async addFrame(framePayload) {
        if (!this.isStarted) throw new Error('Renderer must be started before adding frames.');
        return AwtsVideoBase.addCanvasFrame(this, framePayload);
    }
    async _processFrameQueue() { return AwtsVideoBase.processFrameQueue(this); }
    async finalize(audioBufferShim) {
        if (!this.isStarted) throw new Error('Renderer must be started before finalization.');
        return AwtsVideoBase.finalizeOutput(this, audioBufferShim);
    }
    _postStatus(message) { return AwtsVideoBase.postStatus(message); }
    _postComplete(blob, options) { return AwtsVideoBase.postComplete(blob, options); }
    _postFatalError(message, error) { return AwtsVideoBase.postFatalError(message, error); }
}
self.MediaBunnyBase = MediaBunnyBase;
