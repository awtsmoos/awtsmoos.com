
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
    }

    ignite() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        console.log('B"H - 🕒 Pulsator: Heartbeat initialized. The Olam is breathing.');
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
                // Recreate the universe for this specific temporal slice
                this.olam.updateStep(dt);
            }
        } catch (error) {
             // Logic shard errors logged minimally
             if(Math.random() < 0.01) console.error("B\"H - Heartbeat shard issue:", error.message);
        }

        this._reqId = self.requestAnimationFrame(time => this._tick(time));
    }
}
