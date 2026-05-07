
import { ProceduralEnvironment } from './ProceduralEnvironment.js';

/**
 * B"H
 * @chapter The Proxy of the Field
 * @description
 * This class coordinates the botanical manifestation calls. 
 * We have resolved the diagonal grass issue by utilizing the 
 * ProceduralEnvironment's jittered field logic.
 */
export class NatureManifest {
    /**
     * @description Proxies to the procedural tree logic.
     */
    static drawTree(ctx, x, y, size) {
        ProceduralEnvironment.drawTree(ctx, x, y, size);
    }

    /**
     * @description Proxies to the organic grass field logic.
     */
    static drawGrass(ctx, x, y, size, detailed = false) {
        ProceduralEnvironment.drawField(ctx, x, y, size, detailed);
    }
}
