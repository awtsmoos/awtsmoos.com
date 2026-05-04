
import { Speech } from '../malchus/Speech.js';
import { Wisdom } from '../chochmah/Wisdom.js';
import { Beauty } from '../tiferet/Beauty.js';

/**
 * B"H
 * HolyEngine: The Heartbeat of Creation.
 * 
 * "He renews in His goodness, every day, the work of creation."
 * Not just every day, but every millisecond.
 * If the Speech were to cease for a single instant, all would vanish into Nothing.
 * 
 * @class HolyEngine
 */
export class HolyEngine {
    static lastTime = 0;

    /**
     * Start the eternal cycle of recreation.
     */
    static breathe() {
        const loop = (timestamp) => {
            const deltaTime = timestamp - this.lastTime;
            this.lastTime = timestamp;

            this.pulse(deltaTime);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    /**
     * A single beat of the world's heart.
     * @param {number} dt The time elapsed since the last pulse.
     */
    static pulse(dt) {
        // 1. Clear the vessel
        Speech.clear();

        // 2. Process Wisdom (Logic/Input)
        Wisdom.process(dt);

        // 3. Reveal Beauty (Rendering)
        Beauty.reveal(Speech.getPen());
    }
}
