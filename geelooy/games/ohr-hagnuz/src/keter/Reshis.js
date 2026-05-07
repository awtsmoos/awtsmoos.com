
import { Speech } from '../malchus/Speech.js';
import { GraphicsProjector } from '../tiferet/GraphicsProjector.js';
import { UIManifestor } from '../render/UIManifestor.js';
import { FoundationPhysics } from '../yesod/FoundationPhysics.js';
import { HolyEngine } from '../atzmus/HolyEngine.js';

/**
 * B"H
 * @chapter The Genesis Point
 * @description
 * Keter is the Crown, the point between the Infinite and the Finite. 
 * This class orchestrates the Seder Histalshelus—the sequential 
 * descent of systems into action.
 */
export class Reshis {
    /**
     * @description Awakens the simulation.
     */
    static ignite() {
        console.log("B\"H - Illuminating the Hidden Light...");

        // 1. Create the canvases (Speech)
        Speech.manifest();

        // 2. Locate canvases and prepare pens (GraphicsProjector)
        GraphicsProjector.warmupCanvases();

        // 3. Connect user will to logic (FoundationPhysics)
        FoundationPhysics.bindMortalInteraction();

        // 4. Build the UI overlays (UIManifestor)
        UIManifestor.initialize();

        // 5. Start the perpetual pulse (HolyEngine)
        HolyEngine.breathe();

        console.log("B\"H - The Orchard of Asiyah is in full bloom.");
    }
}
