
import { StateRegister } from '../../binah/StateRegister.js';
import { PortalValidator } from '../PortalValidator.js';
import { EncounterValidator } from '../EncounterValidator.js';

/**
 * B"H
 * @class MovementLogic
 * @chapter The Kinetic Breath
 */
export class MovementLogic {
    static processKineticShift() {
        const HR = StateRegister.HeroPos;
        const baseSpeed = 4; 
        const speed = baseSpeed * (StateRegister.GameSpeedMultiplier || 1);
        const RES = StateRegister.Resolution || 64;

        if (HR.dir === 'u') HR.dy -= speed; 
        if (HR.dir === 'd') HR.dy += speed;
        if (HR.dir === 'l') HR.dx -= speed; 
        if (HR.dir === 'r') HR.dx += speed;
        
        HR.stepTick += speed;
        
        if (HR.dx % RES === 0 && HR.dy % RES === 0) {
            HR.moving = false;
            HR.stepTick = 0;
            HR.cx = Math.round(HR.dx / RES);
            HR.cy = Math.round(HR.dy / RES);
            
            // 1. Check for Unique Portals (Doors AND Sector Edges)
            if (PortalValidator.check()) {
                StateRegister.HeroPath = [];
                StateRegister.PathTarget = null;
                return true; 
            }

            // 2. Check for wild Klipot
            EncounterValidator.check();
            return true;
        }
        return false;
    }
}
