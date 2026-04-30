
// B"H
/**
 * @module UniversePulsator
 * @description
 * * Chapter 108: The Breath of Recreation
 * All existence is refreshed every millisecond by the Word.
 * This class is the engine of that refresh cycle within the worker.
 * * It calculates the delta time (the slice of existence) and 
 * pulses the Olam's systems.
 * * TIKKUN: It now includes a 'Stability Valve' (NaN check) to prevent 
 * the entire world from vanishing if a single coordinate shatters.
 */
export default class UniversePulsator {
    constructor(olam) {
        this.olam = olam;
        this.lastPulse = performance.now();
        this.isRunning = false;
        this.frameCounter = 0;
        this.lastDiagnostic = performance.now();
    }

    /**
     * @method ignite
     * @description Sets the eternal cycle in motion.
     */
    ignite() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastPulse = performance.now();
        console.log('B"H - ⚡ Eternal Engine Ignited. Pulse flowing.');
        this.beat();
    }

    /**
     * @method beat
     * @private
     * @description The actual moment of recreation.
     */
    beat() {
        if (!this.isRunning) return;

        const now = performance.now();
        let dt = (now - this.lastPulse) / 1000;
        this.lastPulse = now;

        // 1. The Divine Shield: No gaps in time, no massive leaps.
        if (isNaN(dt) || dt > 0.1) dt = 0.016; 
        if (dt < 0.001) dt = 0.001;

        this.olam.deltaTime = dt;

        try {
            // 2. Pulse the Olam
            if (this.olam.updateStep) {
                this.olam.updateStep(dt);
            }

            // 3. Occasionally report the state of the vibrations
            this.frameCounter++;
            if (now - this.lastDiagnostic > 5000) {
                 const fps = Math.round((this.frameCounter * 1000) / (now - this.lastDiagnostic));
                 console.log(`B"H - 🔄 Pulsation: ${fps} FPS. ${this.olam.nivrayim.length} Souls present.`);
                 this.frameCounter = 0;
                 this.lastDiagnostic = now;
            }
        } catch (e) {
            console.error('B"H - 🚫 The Pulsation shattered!', e);
        }

        // 4. Request the next breath
        requestAnimationFrame(() => this.beat());
    }

    stop() {
        this.isRunning = false;
    }
}
