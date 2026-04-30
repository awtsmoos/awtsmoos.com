
// B"H
/**
 * @class TimeDeltaCalculator
 * @description
 * ⏳ THE MEASURER OF MOMENTS ⏳
 * 
 * Computes the temporal slice between recreations.
 */
export default class TimeDeltaCalculator {
    constructor() {
        this.lastTime = 0;
    }

    start(time) {
        this.lastTime = time;
    }

    getDelta(currentTime) {
        const delta = (currentTime - this.lastTime) / 1000; // In seconds
        this.lastTime = currentTime;
        return Math.min(delta, 0.1); // Cap at 100ms to prevent massive jumps
    }
}
