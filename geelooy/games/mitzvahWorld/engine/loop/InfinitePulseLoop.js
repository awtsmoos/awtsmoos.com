
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file InfinitePulseLoop.js
 * 
 * Chapter: The Heartbeat of Reality.
 * "Forever, O Lord, Your word stands firm in the heavens."
 * For existence to persist, it must be recreated rapidly.
 * 
 * This class isolates the `requestAnimationFrame` mechanics. It acts as the 
 * Divine Will (Ratzon) pushing the flow of time forward, allowing any 
 * sub-module to subscribe to its pulse.
 */

/**
 * @class InfinitePulseLoop
 * @extends SederHishtalshelusNode
 * @description A highly modular engine loop utilizing a pure functional subscription array.
 */
export default class InfinitePulseLoop extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Atzilut_Temporal_Engine" });
        this.isPulsing = false;
        this.lastTime = performance.now();
        this.animationFrameId = null;
        
        /**
         * Pure array of functions to call every frame.
         * @type {Array<Function>}
         */
        this.subscribers =[];
    }

    /**
     * @method subscribe
     * @description Allows a system (like the Renderer or NPC Brain) to receive the tick.
     * @param {Function} callbackFn - The pure function expecting deltaTime.
     */
    subscribe(callbackFn) {
        if (typeof callbackFn === 'function') {
            this.subscribers.push(callbackFn);
            console.log(`B"H - 🕰️ New entity bound to the temporal pulse. Total: ${this.subscribers.length}`);
        }
    }

    /**
     * @method start
     * @description Commences the flow of time.
     */
    start() {
        if (this.isPulsing) return;
        this.acknowledgeCreator();
        this.isPulsing = true;
        this.lastTime = performance.now();
        console.log(`B"H - ⚡ The Heartbeat begins. Reality is now in motion.`);
        this.tick(performance.now());
    }

    /**
     * @method stop
     * @description Halts time entirely. The universe enters Tohu (suspension).
     */
    stop() {
        this.isPulsing = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        console.log(`B"H - 🛑 The Heartbeat has stopped.`);
    }

    /**
     * @method tick
     * @description Internal method that calculates the delta time and dispatches to subscribers.
     * @param {number} currentTime - Provided by requestAnimationFrame.
     */
    tick(currentTime) {
        if (!this.isPulsing) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Dispatch the divine energy to all vessels
        for (let i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i](deltaTime);
        }

        // Request the next cycle of creation
        this.animationFrameId = requestAnimationFrame((newTime) => this.tick(newTime));
    }
}
