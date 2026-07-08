
/**
 * @file AudioEngine.js
 * @description
 * THE HARMONY OF THE SPHERES (RENA)
 * 
 * Chapter 5: The Detectable Sound.
 * "A voice is heard in the heights." (Yirmiyahu 31:14)
 * This engine has been purified. It no longer attempts to manifest 
 * physical sound (AudioContext) when it resides in the spiritual realm (Worker).
 * It detects its environment and routes the holy frequency accordingly.
 */
import Synthesizer from "./Synthesizer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import SOUND_DATA from "./SoundData.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class AudioEngine {
    static _context = null;
    static _masterGain = null;

    /**
     * @function init
     * @description Detects the environment and initializes if in Asiyah (Main Thread).
     */
    static init() {
        if (typeof window === 'undefined') return false; // In Worker, cannot init.
        if (this._context) return true;
        
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return false;

            this._context = new AudioContextClass();
            this._masterGain = this._context.createGain();
            this._masterGain.gain.value = 0.7;
            this._masterGain.connect(this._context.destination);
            
            Synthesizer.setContext(this._context, this._masterGain);
            return true;
        } catch (e) {
            console.warn("B\"H - 🔇 Audio initialization deferred.", e);
            return false;
        }
    }

    /**
     * @function play
     * @description Manifests the sound or sends a decree to the physical world.
     */
    static play(soundKey, options = {}) {
        const isWorker = typeof window === 'undefined';

        if (isWorker) {
            /**
             * B"H: IN THE WORKER
             * We cannot speak physically, so we emit a 'peula' (action) 
             * to the Main Thread via the Olam's bridge.
             */
            if (self.OlamInstance) {
                self.OlamInstance.ayshPeula("ui event", "effectsOverlay", { 
                    playProceduralSound: { key: soundKey, options } 
                });
            }
            return;
        }

        // B"H: IN THE MAIN THREAD
        if (this.init()) {
            if (this._context.state === 'suspended') this._context.resume();
            const data = SOUND_DATA[soundKey];
            if (data) Synthesizer.manifest(data, options);
        }
    }
}
