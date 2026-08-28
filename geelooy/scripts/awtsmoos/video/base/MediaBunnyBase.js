//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MediaBunnyBase.js
 * @description The Awtsmoos renews every moving frame while Awtsmoos.com keeps
 * one ordered vessel from drawing through encoding, so no hidden queue outruns the light.
 */
class MediaBunnyBase {
	/**
	 * Creates one renderer whose frame chain resolves only after MediaBunny accepts each sample.
	 * @param {object} config Resolution, codec, and output settings.
	 * @param {Function} frameDrawingFunction Draws one semantic frame into the worker canvas.
	 * @param {object} options Optional MediaBunny library path overrides.
	 */
	constructor(config, frameDrawingFunction, options = {}) {
		this.config = config;
		this.frameDrawingFunction = frameDrawingFunction;
		this.libraryPath = options.libraryPath || '/scripts/awtsmoos/video/mediabunny-library.js';
		this.mediabunny = AwtsVideoBase.loadMediabunny(this.libraryPath);
		AwtsVideoBase.registerStableVideoEncoder?.(this.mediabunny);
		this.isStarted = false;
		this.frameChain = Promise.resolve();
		this.frameEncodingError = null;
		this.encodedFrameCount = 0;
		this.lastQueuedTime = 0;
	}

	/** Initializes MP4 output, video source, audio source, and the worker canvas. */
	async start() {
		if (this.isStarted) {
			return;
		}
		this._postStatus('Initializing encoders...');
		const { resolution, outputFormat } = this.config;
		try {
			this.output = AwtsVideoBase.createOutput(this.mediabunny);
			this.canvas = new OffscreenCanvas(resolution.width, resolution.height);
			this.ctx = this.canvas.getContext('2d', {
				alpha: false,
				desynchronized: true
			});
			const codec = await AwtsVideoBase.pickVideoCodec(
				this.mediabunny,
				this.output,
				resolution
			);
			this.videoSampleSource = AwtsVideoBase.createVideoSource(
				this.mediabunny,
				codec,
				outputFormat
			);
			this.output.addVideoTrack(this.videoSampleSource, {
				frameRate: outputFormat.fps || 30
			});
			this.audioBufferSource = AwtsVideoBase.createAudioSource(this.mediabunny);
			this.output.addAudioTrack(this.audioBufferSource);
			await this.output.start();
			this.isStarted = true;
			this._postStatus(`Renderer Ready. Codec: ${codec}`);
		} catch (error) {
			this._postFatalError(`Worker initialization failed: ${error.message}`, error);
			throw error;
		}
	}

	/** Serializes frame ingestion and resolves only after MediaBunny's own backpressure resolves. */
	async addFrame(framePayload) {
		if (!this.isStarted) {
			throw new Error('Renderer must be started before adding frames.');
		}
		if (this.frameEncodingError) {
			throw this.frameEncodingError;
		}
		const keterFrame = this.frameChain.then(() =>
			AwtsVideoBase.addCanvasFrame(this, framePayload)
		);
		this.frameChain = keterFrame.catch(() => undefined);
		return keterFrame;
	}

	/** Waits for all accepted frame work before video/audio finalization begins. */
	async waitForFrames() {
		await this.frameChain;
		if (this.frameEncodingError) {
			throw this.frameEncodingError;
		}
	}

	/** Finalizes the real MP4 after every frame has crossed the encoder boundary. */
	async finalize(audioBufferShim) {
		if (!this.isStarted) {
			throw new Error('Renderer must be started before finalization.');
		}
		await this.waitForFrames();
		return AwtsVideoBase.finalizeOutput(this, audioBufferShim);
	}

	/** Sends a readable worker status through the shared posting vessel. */
	_postStatus(message) {
		return AwtsVideoBase.postStatus(message);
	}

	/** Preserves the historical completion posting doorway for compatible workers. */
	_postComplete(blob, options) {
		return AwtsVideoBase.postComplete(blob, options);
	}

	/** Sends one fatal encoder error with its original stack and context. */
	_postFatalError(message, error) {
		return AwtsVideoBase.postFatalError(message, error);
	}
}

self.MediaBunnyBase = MediaBunnyBase;
