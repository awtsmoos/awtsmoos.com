
import { StateRegister } from '../../binah/StateRegister.js';
import { WorldMapAssembler } from '../../data/WorldMapAssembler.js';

/**
 * B"H
 * @class PathLogic
 * @chapter The Guiding Light
 */
export class PathLogic {
    /**
     * @description Resolves the next automated intent from the current path.
     */
    static resolvePathStep() {
        const HR = StateRegister.HeroPos;
        const path = StateRegister.HeroPath;
        
        if (path.length === 0) return;

        const nextStep = path[0];
        let nDx = 0, nDy = 0, rD = HR.dir;

        if (nextStep.x > HR.cx) { nDx = 1; rD = 'r'; }
        else if (nextStep.x < HR.cx) { nDx = -1; rD = 'l'; }
        else if (nextStep.y > HR.cy) { nDy = 1; rD = 'd'; }
        else if (nextStep.y < HR.cy) { nDy = -1; rD = 'u'; }

        if (nDx !== 0 || nDy !== 0) {
            HR.dir = rD;
            const target = WorldMapAssembler.WorldRegistry.find(g => g.x === HR.cx + nDx && g.y === HR.cy + nDy);
            
            if (target && !target.solid) {
                HR.moving = true;
                path.shift(); // Step consumed
                if (path.length === 0) StateRegister.PathTarget = null;
            } else {
                // Obstructed! Cancel automated providence.
                StateRegister.HeroPath = [];
                StateRegister.PathTarget = null;
            }
        }
    }
}
