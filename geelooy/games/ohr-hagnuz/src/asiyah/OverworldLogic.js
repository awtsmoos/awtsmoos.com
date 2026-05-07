
import { StateRegister } from '../binah/StateRegister.js';
import { WorldMapAssembler } from '../data/WorldMapAssembler.js';
import { InteractionValidator } from './InteractionValidator.js';
import { MovementLogic } from './logic/MovementLogic.js';
import { PathLogic } from './logic/PathLogic.js';

/**
 * B"H
 * @class OverworldLogic
 * @chapter Governing the Locomotion of the Soul
 */
export class OverworldLogic {
    static digestTick() {
        const HR = StateRegister.HeroPos;
        const intents = window.AwtsmoosIntents || { U:0, D:0, L:0, R:0, A:0 }; 

        if (HR.moving) {
            MovementLogic.processKineticShift();
            return;
        }

        if (intents.U || intents.D || intents.L || intents.R) {
            StateRegister.HeroPath = [];
            StateRegister.PathTarget = null;
        }

        if (intents.A) {
            StateRegister.HeroPath = [];
            StateRegister.PathTarget = null;
            if (InteractionValidator.checkSpeechAction()) return;
        }

        if (StateRegister.HeroPath.length > 0) {
            PathLogic.resolvePathStep();
            return;
        }

        let nDx = 0, nDy = 0, rD = HR.dir;
        if (intents.U) { nDy = -1; rD = 'u'; } 
        else if (intents.D) { nDy = 1; rD = 'd'; }
        else if (intents.L) { nDx = -1; rD = 'l'; } 
        else if (intents.R) { nDx = 1; rD = 'r'; }
        
        if (nDx !== 0 || nDy !== 0) {
            HR.dir = rD;
            const target = WorldMapAssembler.WorldRegistry.find(g => g.x === HR.cx + nDx && g.y === HR.cy + nDy);
            
            // If the target exists and is not a solid object, move onto it.
            // Edge portals are solid:false, so we simply walk onto them, 
            // and the PortalValidator handles the dimensional fold at the end of the step.
            if (target && !target.solid) {
                HR.moving = true;
            }
        }
    }
}
