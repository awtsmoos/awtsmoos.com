
import { ControllerOfWill } from '../keter/ControllerOfWill.js';
import { DimensionalDirector } from '../binah/DimensionalDirector.js';
import { GraphicsProjector } from '../tiferet/GraphicsProjector.js';

/**
 * B"H
 * The engine pulsating reality every 16ms. Just as reality
 * must be continuously spoken into existence, so must the frame buffers
 * be continually re-calculated.
 */
export class SederEngine {
    static lastPulse = performance.now();
    static PulseFrequency = 1000 / 60; // 60hz 

    /** Begins the endless regeneration of the heavens and earths. */
    static igniteEternalPulse() {
        GraphicsProjector.warmupCanvases();
        const executeEternity = (timestamp) => {
            requestAnimationFrame(executeEternity);
            
            let timeFlow = timestamp - SederEngine.lastPulse;
            if (timeFlow > SederEngine.PulseFrequency) {
                SederEngine.lastPulse = timestamp - (timeFlow % SederEngine.PulseFrequency);
                
                // 1. Process Spiritual Shifts (State/Logic)
                DimensionalDirector.digestTimeflow();
                
                // 2. Condense forms via Speech (Render)
                GraphicsProjector.emanateLight();

                // 3. Complete the physical limitation of inputs
                ControllerOfWill.commitWill();
            }
        };
        requestAnimationFrame(executeEternity);
    }
}
