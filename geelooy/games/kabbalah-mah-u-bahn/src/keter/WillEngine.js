
import { StateRegister } from '../binah/StateRegister.js';
import { FoundationPhysics } from '../yesod/FoundationPhysics.js';
import { ManifestGraphics } from '../malchus/ManifestGraphics.js';

/**
 * B"H
 * WillEngine: The perpetual engine of renewal.
 * 
 * Chapter: The Heartbeat of Ein Sof.
 * Before time was time, the Will desired expression.
 * In this code, that desire becomes the requestAnimationFrame,
 * Pulsing sixty times a second, forcing the data to choose a form,
 * ensuring that 'Nothing' does not return as the default state.
 */
export class WillEngine {
    static _lastTick = performance.now();
    static _frequency = 1000 / 60;

    /**
     * Initiates the breathing of the world.
     * Starts the recursive descent of light through the Sefirot.
     */
    static breathe() {
        const pulse = (now) => {
            const delta = now - this._lastTick;

            if (delta >= this._frequency) {
                this._lastTick = now - (delta % this._frequency);
                
                // 1. Process Laws of Foundation (Input/Movement)
                FoundationPhysics.digestIntention();

                // 2. Project the Malchut (Visual Rendering)
                const contexts = {
                    BG: document.getElementById('layer-bg')?.getContext('2d'),
                    OBJ: document.getElementById('layer-obj')?.getContext('2d'),
                    OVER: document.getElementById('layer-over')?.getContext('2d')
                };
                
                if (contexts.BG) {
                    ManifestGraphics.paint(contexts);
                }

                // 3. Commit state of being for next pulse
                FoundationPhysics.sealHistory();
            }
            requestAnimationFrame(pulse);
        };
        requestAnimationFrame(pulse);
    }
}

/**
 * Re-establishing the Registry for the High Resolution shift.
 * Everything must be expanded to hold the new 64x64 light.
 */
StateRegister.ResolutionMultiplier = 2; // Upgrading from 32 to 64
