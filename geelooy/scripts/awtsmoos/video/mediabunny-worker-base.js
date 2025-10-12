/*
 ב"ה 

B"H 
File: /scripts/awtsmoos/video/mediabunny-wirker-base.js
*/

// --- AudioBuffer Polyfill (Local) ---
const createAudioBufferPolyfill = () => {
	/* ב"ה B"H */
	// This polyfill allows passing raw channel data buffers
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
 * Holds all pre-configured environment objects for the custom rendering logic.
 * This replaces the previous MediabunnyBaseRenderer and the complex RenderingContext.
 */
class RenderingContext {
/* ב"ה B"H */
constructor(M, payload, output, canvasSource, audioBufferSource) {
	const { resolution } = payload;

	// 1. Mediabunny Exports & Data
	this.M = M;
	this.payload = payload;

	// 2. Mediabunny Components (Instantiated)
	this.output = output;
	this.canvasSource = canvasSource;
	this.audioBufferSource = audioBufferSource;

	// 3. Canvas Context
	this.canvas = new OffscreenCanvas(resolution.width, resolution.height);
	this.ctx = this.canvas.getContext('2d');
}
}


/**
 * The main bootstrap function for the worker.
 *
 * @param {function(RenderingContext)} workerLogic - The function that contains 
 * the project's specific rendering loop.
 * @param {Object} [options] - Configuration options.
 * @param {string} [options.libraryPath='./mediabunny-library.js'] - Path to the library.
 */
function bootstrapMediabunnyWorker(workerLogic, options = {}) {

/* ב"ה B"H */

if (typeof self !== 'undefined' && self.importScripts) {

	const libraryPath = options.libraryPath || './mediabunny-library.js';
	self.AudioBuffer = createAudioBufferPolyfill(); // Register the polyfill

	let M = null; // M is short for mediabunnyExports
	try {
		// Attempt to load library. Assumes it populates 'self.exports'
		self.exports = {};
		self.importScripts(libraryPath);
		M = self.exports;
	} catch (e) {
		self.postMessage({
			type: 'FATAL_ERROR',
			payload: { message: `FATAL: Could not load mediabunny library from ${libraryPath}.`, error: e }
		});
		return;
	}

	self.onmessage = async (event) => {
		if (event.data.type === 'START_RENDERING' && M) {
			const payload = event.data.payload;
            const { resolution, audioBufferShim } = payload;
            
			try {
                
                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Initializing Mediabunny...' } });

				// 1. Instantiate the Mediabunny Components
                // NOTE: Using MP4Encoder as the most likely name for the top-level container/muxer
				const output = new (M.MP4Encoder || M.Muxer)({ 
					format: payload.outputFormat.format // e.g., 'mp4'
				});
                
				const canvasSource = new M.CanvasSource(output, {
					width: resolution.width,
					height: resolution.height
				});
                
                // AudioBufferSource is only initialized if there's audio data
                let audioBufferSource = null;
                if (audioBufferShim) {
                    audioBufferSource = new M.AudioBufferSource(output, {
                        sampleRate: audioBufferShim.sampleRate || 44100,
                    });
                }
                
				// 2. Setup Full Context 
				const context = new RenderingContext(M, payload, output, canvasSource, audioBufferSource);

				// 3. Execute the project-specific rendering logic
				await workerLogic(context);

				// 4. Finalize Video (Boilerplate from user's working snippet)
                context.canvasSource.close();
    
                if (context.audioBufferSource) {
                    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Encoding audio...' } });
                    await context.audioBufferSource.add(audioBufferShim);
                    context.audioBufferSource.close();
                }

				self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Finalizing video file...' } });
				self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: 98 } });
				await context.output.finalize();

				self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: 100 } });
				
				// Send the final blob back (using properties from the user's snippet)
				self.postMessage({ 
                    type: 'VIDEO_COMPLETE', 
                    payload: { 
                        blob: new Blob([context.output.target.buffer], { 
                            type: context.output.format.mimeType 
                        }) 
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

// Expose the bootstrap function globally for the synth worker to call
if (typeof self !== 'undefined') {
	self.bootstrapMediabunnyWorker = bootstrapMediabunnyWorker;
}