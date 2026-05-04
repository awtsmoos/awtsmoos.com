
// B"H
/**
 * @module UniversePulsator
 * @description
 * 🎼 THE CONSTANT RHYTHM OF EXISTENCE 🎼
 */
export default class UniversePulsator {
    constructor(olam) {
        this.olam = olam;
        this.lastTime = 0;
        this.isRunning = false;
        this._reqId = null;
        this._frameCount = 0;
    }

    ignite() {
        if (this.isRunning) return;
        
        // B"H: The requestAnimationFrame polyfill for the Worker abyss
        if (typeof self !== 'undefined' && !self.requestAnimationFrame) {
            // B"H: silent

            self.requestAnimationFrame = (callback) => setTimeout(() => callback(performance.now()), 16);
        }

        this.isRunning = true;
        this.lastTime = performance.now();
        // B"H: silent

        this._tick(this.lastTime);
    }

    stop() {
        this.isRunning = false;
        if (this._reqId) cancelAnimationFrame(this._reqId);
    }

    _tick(currentTime) {
        if (!this.isRunning) return;

        // Sacred Delta Calculation
        let dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Protection: Standard 60fps heartbeat fallback
        if (isNaN(dt) || dt > 0.05 || dt <= 0) {
            dt = 0.0166; 
        }

        this.olam.deltaTime = dt;

        try {
            if (this.olam.updateStep) {
                // B"H: silent

                this.olam.updateStep(dt);
            } else {
                console.warn('B"H - ⚠️ Pulsator: updateStep is missing on Olam instance!');
            }
        } catch (error) {
             // B"H: REVEAL ALL ERRORS IN THE FIRST 100 FRAMES
             console.error("B\"H - 🚨 Heartbeat shard issue:", error);
        }

        if (this.isRunning) {
            this._reqId = self.requestAnimationFrame(time => this._tick(time));
        }
    }
}
