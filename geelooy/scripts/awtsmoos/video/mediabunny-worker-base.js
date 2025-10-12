
/*
 ב"ה 

B"H */

// --- AudioBuffer Polyfill (Local) ---
const createAudioBufferPolyfill = () => {
	/* ב"ה B"H */
	return function AudioBuffer(options) {
		Object.assign(this, options);
		this.getChannelData = (i) => this.channels[i];
		this.copyFromChannel = (dest, channelNum, start = 0) => {
			const source = this.channels[channelNum];
			if (source) dest.set(source.subarray(start, start + dest.length));
		};
	};
};

/**

Manages the mediabunny Muxer setup, frame/audio data ingestion, and finalization.

This class is the core media interface.
*/
class MediabunnyBaseRenderer {
/* ב"ה B"H */
constructor(mediabunnyExports, resolution, outputFormat) {
	if (!mediabunnyExports.CanvasSource || !mediabunnyExports.MP4Muxer) {
	console.log("got",mediabunnyExports.MP4Muxer);
	
		throw new Error("Mediabunny library did not load necessary components.");
	}
	this.output = new mediabunnyExports.MP4Muxer({
		format: outputFormat
	});
	this.videoSource = new mediabunnyExports.CanvasSource(this.output, {
		width: resolution.width,
		height: resolution.height
	});
	this.AudioBufferSource = mediabunnyExports.AudioBufferSource;
	this.outputFormat = outputFormat;
}

async addFrame(time, duration) {
	await this.videoSource.add(time, duration);
}

async addAudio(audioBufferShim) {
	if (!audioBufferShim || !this.AudioBufferSource) return;
	this.audioSource = new this.AudioBufferSource(this.output, {
		sampleRate: audioBufferShim.sampleRate || 44100,
	});
	self.postMessage({
		type: 'STATUS_UPDATE',
		payload: {
			message: 'Encoding audio...'
		}
	});
	await this.audioSource.add(audioBufferShim);
	this.audioSource.close();
}

async finalize() {
	this.videoSource.close();
	self.postMessage({
		type: 'STATUS_UPDATE',
		payload: {
			message: 'Finalizing video file...'
		}
	});
	self.postMessage({
		type: 'PROGRESS_UPDATE',
		payload: {
			percent: 98
		}
	});
	await this.output.finalize();
	self.postMessage({
		type: 'PROGRESS_UPDATE',
		payload: {
			percent: 100
		}
	});
	return new Blob([this.output.target.buffer], {
		type: this.outputFormat.mimeType
	});
}
}

/**

Holds all pre-configured environment objects for the custom rendering logic.
*/
class RenderingContext {
/* ב"ה B"H */
constructor(M, payload, renderer) {
	const {
		resolution,
		settings,
		portalBitmaps
	} = payload;

	code
	Code
	download
	content_copy
	expand_less
	// 1. Mediabunny Exports & Data
	this.M = M;
	this.payload = payload;

	// 2. Base Renderer
	this.renderer = renderer;

	// 3. Project-Specific Instantiation (Boilerplate)
	this.EinSofRenderer = M.EinSofRenderer;
	this.einSofRenderer = new M.EinSofRenderer();

	// 4. Canvas Context (Required for renderCompositeFrame)
	this.canvas = new OffscreenCanvas(resolution.width, resolution.height);
	this.ctx = this.canvas.getContext('2d');

	// 5. Pre-rendered Assets (Boilerplate)
	self.postMessage({
		type: 'STATUS_UPDATE',
		payload: {
			message: 'Pre-rendering background...'
		}
	});
	const bgData = this.einSofRenderer.generateBackgroundCanvas(
		this.einSofRenderer.resolveSettings(settings, false), resolution, portalBitmaps
	);
	this.masterBg = bgData.canvas;
	this.masterPalette = bgData.palette;

}
}

/**

The main bootstrap function for the worker.

@param {function(RenderingContext)} workerLogic - The function


that contains the project's specific rendering loop. It receives

the pre-configured RenderingContext object.

@param {Object} [options] - Configuration options.

@param {string} [options.libraryPath='./mediabunny-library.js'] - Path to the library.
*/
function bootstrapMediabunnyWorker(workerLogic, options = {}) {

/* ב"ה
 B"H */

if (typeof self !== 'undefined' && self.importScripts) {

	
	
	const libraryPath = options.libraryPath || './mediabunny-library.js';
	self.AudioBuffer = createAudioBufferPolyfill();

	let M = null; // M is short for mediabunnyExports
	

	self.onmessage = async (event) => {
	if(!M) {
	    try {
		self.exports = {};
		self.importScripts(libraryPath);
		M = self.exports;
		console.log("x",M)
	} catch (e) {
		const error = {
			message: `FATAL: Could not load mediabunny library from ${libraryPath}.`,
			error: e
		};
		self.postMessage({
			type: 'FATAL_ERROR',
			payload: error
		});
		return;
	}
	}
		if (event.data.type === 'START_RENDERING' && M) {
			const payload = event.data.payload;

			try {
				// 1. Setup Base Renderer
				const baseRenderer = new MediabunnyBaseRenderer(M, payload.resolution, payload.outputFormat);

				// 2. Setup Full Context (includes EinSofRenderer, Canvas, Context, MasterBG)
				const context = new RenderingContext(M, payload, baseRenderer);

				// 3. Execute the project-specific rendering logic
				await workerLogic(context);

				// 4. Handle audio and Finalize (Boilerplate)
				await baseRenderer.addAudio(payload.audioBufferShim);
				const finalBlob = await baseRenderer.finalize();

				self.postMessage({
					type: 'VIDEO_COMPLETE',
					payload: {
						blob: finalBlob
					}
				});

			} catch (e) {
				const error = {
					message: `Worker execution failed during rendering.`,
					error: e
				};
				console.error(error.message, e);
				self.postMessage({
					type: 'FATAL_ERROR',
					payload: error
				});
			}
		}
	};

} else {
	console.error("bootstrapMediabunnyWorker must be run in a Web Worker environment.");
}
}

// Expose the bootstrap function
if (typeof self !== 'undefined') {
	self.bootstrapMediabunnyWorker = bootstrapMediabunnyWorker;
}


