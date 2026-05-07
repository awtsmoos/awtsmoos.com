
import { WorldMapAssembler } from '../../data/WorldMapAssembler.js';

/**
 * B"H
 * @class AbyssTargetValidator
 * @chapter The Folding of Intention
 */
export class AbyssTargetValidator {
    static resolve(rawX, rawY) {
        const MAX_W = 25;
        const MAX_H = 14;

        if (rawX >= 0 && rawX < MAX_W && rawY >= 0 && rawY < MAX_H) return null;

        let edgeX = rawX;
        let edgeY = rawY;
        
        if (edgeX < 0) edgeX = 0;
        if (edgeX >= MAX_W) edgeX = MAX_W - 1;
        if (edgeY < 0) edgeY = 0;
        if (edgeY >= MAX_H) edgeY = MAX_H - 1;

        const edgeNode = WorldMapAssembler.WorldRegistry.find(n => n.x === edgeX && n.y === edgeY);

        // If the edge tile is a road/portal, we permit the snap!
        if (edgeNode && edgeNode.t === 'G_DIRT_PATH') {
            return { x: edgeX, y: edgeY };
        }

        return null;
    }
}
