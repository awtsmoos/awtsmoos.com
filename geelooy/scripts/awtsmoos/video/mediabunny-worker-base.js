/*
 ב"ה 

B"H 
File: /scripts/awtsmoos/video/mediabunny-wirker-base.js
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
 * Holds all pre-configured environment objects for the custom rendering logic.
 */
class RenderingContext {
/* ב"ה B"H */
constructor(payload, output, canvasSource, audioBufferSource, renderCanvas, ctx) {
	this.payload = payload;

	this.output = output; 
	this.canvasSource = canvasSource;
	this.audioBufferSource = audioBufferSource;

	this.canvas = renderCanvas;
	this.ctx = ctx;
}
}


/**
 * The main bootstrap function for the worker.
 */
function bootstrapMediabunnyWorker(workerLogic, options = {}) {

/* ב"ה B"H */

if (typeof self !== 'undefined' && self.importScripts) {

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

	self.onmessage = async (event) => {
		if (event.data.type === 'START_RENDERING') {
			const payload = event.data.payload;
            const { resolution, audioBufferShim } = payload;
            
			try {
                
                self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Initializing video encoder...' } });

                // 1. Setup Canvas
                const renderCanvas = new OffscreenCanvas(resolution.width, resolution.height);
	            const ctx = renderCanvas.getContext('2d', { alpha: false });

				// 2. Instantiate the Mediabunny Components
                
                // Output setup
                const output = new mediabunny.Output({
                    format: new mediabunny.Mp4OutputFormat(), 
                    target: new mediabunny.BufferTarget()
                });

                // --- CRITICAL CORRECTION: MIRROR DYNAMIC CODEC LOGIC ---
                let videoCodec = 'avc1.42001E'; // Default from original snippet
                try {
                    videoCodec = await mediabunny.getFirstEncodableVideoCodec(output.format.getSupportedVideoCodecs(), { width: resolution.width, height: resolution.height });
                } catch (e) { 
                    console.warn("Codec check failed, using default (which may be invalid).", e.message); 
                }
                // If the check fails, videoCodec is 'avc1.42001E', which will then cause the error.
                // The user must ensure this dynamic check returns a valid simple codec like 'vp8' or 'avc'.
                
				const canvasSource = new mediabunny.CanvasSource(renderCanvas, { 
                    codec: videoCodec, 
                    bitrate: 4_000_000 
                });
                output.addVideoTrack(canvasSource);

                let audioBufferSource = null;
                let finalAudioBufferShim = null;
                
                if (audioBufferShim) {
                    finalAudioBufferShim = new self.AudioBuffer(audioBufferShim);
                    
                    // --- CRITICAL CORRECTION: MIRROR DYNAMIC AUDIO CODEC LOGIC ---
                    const audioCodec = await mediabunny.getFirstEncodableAudioCodec(output.format.getSupportedAudioCodecs(), finalAudioBufferShim);
                    
                    audioBufferSource = new mediabunny.AudioBufferSource({ codec: audioCodec, bitrate: 128_000 });
                    output.addAudioTrack(audioBufferSource);
                }
                
                // Start the muxer
                await output.start();
                
				// 3. Setup Context 
				const context = new RenderingContext(payload, output, canvasSource, audioBufferSource, renderCanvas, ctx);

				// 4. Execute the project-specific rendering logic
				await workerLogic(context);

				// 5. Finalize Video
                
                context.canvasSource.close();
    
                if (context.audioBufferSource) {
                    self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Encoding audio...' } });
                    await context.audioBufferSource.add(finalAudioBufferShim);
                    context.audioBufferSource.close();
                }

				self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Finalizing video file...' } });
				self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: 98 } });
				await context.output.finalize();

				self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: 100 } });
				
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