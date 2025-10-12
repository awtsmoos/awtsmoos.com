/*
 ב"ה 

B"H 
File: /scripts/awtsmoos/video/mediabunny-wirker-base.js
*/

// --- AudioBuffer Polyfill (Local) ---
const createAudioBufferPolyfill = () => {
	/* ב"ה B"H */
	// This polyfill allows passing raw channel data buffers (like the audioBufferShim)
	return function AudioBuffer(options) {
		// Note: The original implementation in your snippet uses a getter 
        // that's incompatible with plain object properties, so this polyfill 
        // must expose getChannelData correctly for Mediabunny.
        
        // Ensure options.channels is an array of Float32Array (which it is)
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
 * Holds all pre-configured environment objects for the custom rendering logic.
 * This context is passed to the workerLogic function.
 */
class RenderingContext {
/* ב"ה B"H */
constructor(payload, output, canvasSource, audioBufferSource, renderCanvas, ctx) {
	this.payload = payload;

	// Mediabunny Components
	this.output = output; 
	this.canvasSource = canvasSource;
	this.audioBufferSource = audioBufferSource;

	// Canvas Context
    this.canvas = renderCanvas;
	this.ctx = ctx;
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

	// The mediabunny library is expected to load components into the global `mediabunny` object.
	try {
        // NOTE: We rely on the library to expose itself as 'mediabunny' globally
		self.importScripts(libraryPath);
        if (typeof mediabunny === 'undefined' || !mediabunny.Output) {
            throw new Error("Mediabunny library did not expose 'mediabunny' object correctly.");
        }
	} catch (e) {
		self.postMessage({
			type: 'FATAL_ERROR',
			payload: { message: `FATAL: Could not load mediabunny library from ${libraryPath}.`, error: e }
		});
		return;
	}

	self.onmessage = async (event) => {
		if (event.data.type === 'START_RENDERING') {
			const payload = event.data.payload;
            const { resolution, audioBufferShim } = payload;
            
			try {
                
                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Initializing video encoder...' } });

                // 1. Setup Canvas
                const renderCanvas = new OffscreenCanvas(resolution.width, resolution.height);
	            const ctx = renderCanvas.getContext('2d', { alpha: false });

				// 2. Instantiate the Mediabunny Components (using explicit names from snippet)
                
                // CRITICAL: Output setup
                const output = new mediabunny.Output({
                    // CRITICAL: Determine format based on payload, assuming Mp4OutputFormat exists
                    format: new mediabunny.Mp4OutputFormat(), 
                    target: new mediabunny.BufferTarget()
                });

                // Video Codec Check (Simplified - always use default)
                // In a real scenario, we'd copy the check from your snippet, but for a base worker, 
                // we'll use a direct codec path or rely on Mediabunny defaults.
                let videoCodec = 'avc1.42001E'; // Default H.264
                
				const canvasSource = new mediabunny.CanvasSource(renderCanvas, { 
                    codec: videoCodec, 
                    bitrate: 4_000_000 // Placeholder for good quality
                });
                output.addVideoTrack(canvasSource);

                let audioBufferSource = null;
                let finalAudioBufferShim = null;

                if (audioBufferShim) {
                    // CRITICAL: Create the AudioBuffer from the shim
                    finalAudioBufferShim = new self.AudioBuffer(audioBufferShim);
                    
                    // Audio Codec Check (Simplified - assuming a default AAC codec is used)
                    // We must guess a bitrate since it wasn't passed in payload
                    audioBufferSource = new mediabunny.AudioBufferSource({ codec: 'aac', bitrate: 128_000 });
                    output.addAudioTrack(audioBufferSource);
                }
                
                // CRITICAL: Start the muxer
                await output.start();
                
				// 3. Setup Context 
				const context = new RenderingContext(payload, output, canvasSource, audioBufferSource, renderCanvas, ctx);

				// 4. Execute the project-specific rendering logic
				await workerLogic(context);

				// 5. Finalize Video (Boilerplate directly from user's working snippet structure)
                
                // 1. Close the video source
                context.canvasSource.close();
    
                // 2. Add and close the audio source
                if (context.audioBufferSource) {
                    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Encoding audio...' } });
                    // CRITICAL: Use the created finalAudioBufferShim for encoding
                    await context.audioBufferSource.add(finalAudioBufferShim);
                    context.audioBufferSource.close();
                }

                // 3. Finalize the main output
				self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Finalizing video file...' } });
				self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: 98 } });
				await context.output.finalize();

				self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: 100 } });
				
				// 4. Send the final blob back
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