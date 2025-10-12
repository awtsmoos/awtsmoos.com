
/* ב"ה
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
 * Manages the mediabunny Muxer setup, frame/audio data ingestion, and finalization.
 * It is completely agnostic of HOW frames are generated.
 */
class MediabunnyBaseRenderer {
    /* ב"ה B"H */
    constructor(mediabunnyExports, resolution, outputFormat) {
        // Post-load check
        if (!mediabunnyExports.CanvasSource || !mediabunnyExports.MP4Muxer) {
            throw new Error("Mediabunny library did not load necessary components.");
        }

        // Initialize Muxers
        this.output = new mediabunnyExports.MP4Muxer({ format: outputFormat });
        this.canvasSource = new mediabunnyExports.CanvasSource(this.output, { 
            width: resolution.width, 
            height: resolution.height 
        });
        this.AudioBufferSource = mediabunnyExports.AudioBufferSource; // Keep the class for later use
        this.audioSource = null; // Will be initialized by caller if audio is needed
    }

    /**
     * Ingests a video frame. The worker logic ensures the OffscreenCanvas is 
     * ready before calling this.
     * @param {number} time - Presentation timestamp of the frame.
     * @param {number} duration - Duration of the frame/segment.
     */
    async addFrame(time, duration) {
        /* ב"ה B"H */
        await this.canvasSource.add(time, duration);
    }

    /**
     * Initializes and ingests audio data.
     * @param {Object} audioBufferShim - The polyfilled AudioBuffer object.
     */
    async addAudio(audioBufferShim) {
        /* ב"ה B"H */
        if (!audioBufferShim || !this.AudioBufferSource) return;
        
        // Initialize the AudioBufferSource stream
        this.audioSource = new this.AudioBufferSource(this.output, { 
            sampleRate: audioBufferShim.sampleRate || 44100, 
        });
        
        self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Encoding audio...' } });
        await this.audioSource.add(audioBufferShim);
        this.audioSource.close();
    }

    /**
     * Finalizes the output file and returns the blob result.
     * @param {string} mimeType - The final MIME type for the Blob.
     * @returns {Blob} The final video Blob.
     */
    async finalize(mimeType) {
        /* ב"ה B"H */
        this.canvasSource.close(); // Close the video stream
        
        self.postMessage({ type: 'STATUS_UPDATE', payload: { message: 'Finalizing video file...' } });
        self.postMessage({ type: 'PROGRESS_UPDATE', payload: { percent: 98 } });
        
        await this.output.finalize();

        return new Blob([this.output.target.buffer], { type: mimeType });
    }
}


/**
 * The main bootstrap function for the worker.
 * @param {string} libraryPath - Path to the mediabunny library.
 * @param {function(MediabunnyBaseRenderer, Object)} workerLogic - The function 
 *        that contains the project's specific rendering loop.
 */
function bootstrapMediabunnyWorker(libraryPath, workerLogic) {
    /* ב"ה B"H */
    
    if (typeof self !== 'undefined' && self.importScripts) {
        // Polyfill is placed on self *only* for the library's 'instanceof' check.
        self.AudioBuffer = createAudioBufferPolyfill(); 
        
        let mediabunnyExports = null;
        try {
            self.exports = {};
            self.importScripts(libraryPath);
            mediabunnyExports = self.exports;
        } catch (e) {
            const error = { message: `FATAL: Could not load mediabunny library from ${libraryPath}.`, error: e };
            console.error(error.message, e);
            self.postMessage({ type: 'FATAL_ERROR', payload: error });
            return;
        }

        self.onmessage = async (event) => {
            if (event.data.type === 'START_RENDERING' && mediabunnyExports) {
                try {
                    // Pass the base renderer class and the payload to the custom logic
                    await workerLogic(mediabunnyExports, event.data.payload);
                } catch (e) {
                    const error = { message: `Worker execution failed during rendering.`, error: e };
                    console.error(error.message, e);
                    self.postMessage({ type: 'FATAL_ERROR', payload: error });
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