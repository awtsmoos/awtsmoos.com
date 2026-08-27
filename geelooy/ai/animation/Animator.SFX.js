//B"H
// Animator.SFX.js (NEW FILE - Simple Sound Effects Player)

window.AnimatorSFX = {
    audioContext: null,
    soundCache: new Map(), // soundId -> AudioBuffer
    activeSources: new Map(), // soundId -> [AudioBufferSourceNode, gainNode] (to manage multiple plays of same sound)
    sfxLibrary: {}, // Populated by Animator.Core from SCENE_DATA

    initialize: function(sfxLibraryData = {}) {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.sfxLibrary = sfxLibraryData;
            console.log("[AnimatorSFX] AudioContext initialized. SFX Library:", this.sfxLibrary);
            // Preload sounds if desired (can be selective)
            // Object.keys(this.sfxLibrary).forEach(id => this.loadSound(id, this.sfxLibrary[id]));
        } catch (e) {
            console.warn("[AnimatorSFX] AudioContext not supported or failed to initialize.", e);
            this.audioContext = null;
        }
    },

    loadSound: async function(soundId, url) {
        if (!this.audioContext || !url) return;
        if (this.soundCache.has(soundId)) return this.soundCache.get(soundId);

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.soundCache.set(soundId, audioBuffer);
            console.log(`[AnimatorSFX] Loaded sound: ${soundId}`);
            return audioBuffer;
        } catch (error) {
            console.error(`[AnimatorSFX] Error loading sound ${soundId} from ${url}:`, error);
            return null;
        }
    },

    play: async function(soundId, volume = 1.0, loop = false, pan = 0) { // Pan: -1 (L) to 1 (R)
        if (!this.audioContext) return;
        
        let audioBuffer = this.soundCache.get(soundId);
        if (!audioBuffer && this.sfxLibrary[soundId]) {
            audioBuffer = await this.loadSound(soundId, this.sfxLibrary[soundId]);
        }

        if (!audioBuffer) {
            console.warn(`[AnimatorSFX] Sound not found or not loaded: ${soundId}`);
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = loop;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.audioContext.currentTime);

        let stereoPannerNode;
        if (this.audioContext.createStereoPanner) {
            stereoPannerNode = this.audioContext.createStereoPanner();
            stereoPannerNode.pan.setValueAtTime(pan, this.audioContext.currentTime);
            source.connect(stereoPannerNode).connect(gainNode).connect(this.audioContext.destination);
        } else { // Fallback for browsers not supporting StereoPannerNode (less likely these days)
            source.connect(gainNode).connect(this.audioContext.destination);
        }
        
        source.start(0);

        if (!this.activeSources.has(soundId)) {
            this.activeSources.set(soundId, []);
        }
        const sourceEntry = { sourceNode: source, gainNode: gainNode, pannerNode: stereoPannerNode, isLooping: loop };
        this.activeSources.get(soundId).push(sourceEntry);

        source.onended = () => {
            const sourcesList = this.activeSources.get(soundId);
            if (sourcesList) {
                const index = sourcesList.indexOf(sourceEntry);
                if (index > -1) sourcesList.splice(index, 1);
                if (sourcesList.length === 0) this.activeSources.delete(soundId);
            }
            source.disconnect();
            gainNode.disconnect();
            if(stereoPannerNode) stereoPannerNode.disconnect();
        };
    },

    stop: function(soundId) {
        if (!this.audioContext || !this.activeSources.has(soundId)) return;
        
        const sourcesList = this.activeSources.get(soundId);
        sourcesList.forEach(entry => {
            try {
                entry.sourceNode.stop(0); // Stop immediately
                // onended will handle cleanup
            } catch (e) { /* Might already be stopped or disconnected */ }
        });
        this.activeSources.delete(soundId); // Clear list as all are stopped
    },

    stopAll: function() {
        if (!this.audioContext) return;
        this.activeSources.forEach((sourcesList, soundId) => {
            sourcesList.forEach(entry => {
                try {
                    entry.sourceNode.stop(0);
                } catch (e) { /* */ }
            });
        });
        this.activeSources.clear();
    },

    setVolume: function(soundId, volume = 1.0) {
        if (!this.audioContext || !this.activeSources.has(soundId)) return;
        const sourcesList = this.activeSources.get(soundId);
        sourcesList.forEach(entry => {
            entry.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.audioContext.currentTime);
        });
    }
};