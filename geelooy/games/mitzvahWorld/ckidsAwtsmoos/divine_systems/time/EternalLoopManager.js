
// B"H
/**
 * @class EternalLoopManager
 * @description
 * 🔄 THE ENGINE OF RECREATION 🔄
 * 
 * Holds the list of systems that must be pulsed every frame.
 */
export default class EternalLoopManager {
    constructor() {
        this.systems =[];
        this.isRunning = false;
    }

    registerSystem(sysUpdateFn) {
        this.systems.push(sysUpdateFn);
    }

    tick(dt) {
        if (!this.isRunning) return;
        for (let i = 0; i < this.systems.length; i++) {
            try {
                this.systems[i](dt);
            } catch(e) {
                console.error("B\"H - System crashed during eternal loop:", e);
            }
        }
    }
}
