
import { StateRegister } from '../binah/StateRegister.js';
import { Intents } from '../keter/ControllerOfWill.js';
import { WorldMapAssembler } from '../data/WorldMapAssembler.js';
import { InteractionValidator } from './InteractionValidator.js';

/**
 * B"H
 * OverworldLogic: Governing the locomotion of the soul.
 */
export class OverworldLogic {
    
    static digestTick() {
        const HR = StateRegister.HeroPos;
        // Basic Velocity modified by the Wisdom of the Menu
        const baseSpeed = 2; 
        const speed = baseSpeed * StateRegister.GameSpeedMultiplier; 
        
        if (HR.moving) {
            // Movement aligned with direction and modified by divine speed
            if (HR.dir === 'u') HR.dy -= speed; if (HR.dir === 'd') HR.dy += speed;
            if (HR.dir === 'l') HR.dx -= speed; if (HR.dir === 'r') HR.dx += speed;
            
            HR.stepTick += speed;
            
            // Re-alignment perfection: 32px is the fundamental border
            if (HR.dx % 32 === 0 && HR.dy % 32 === 0) {
                HR.moving = false; 
                HR.stepTick = 0; 
                HR.cx = HR.dx / 32; 
                HR.cy = HR.dy / 32;
            }
            return;
        }

        // Logic branching: Arousing movement vs Speech
        if (InteractionValidator.checkSpeechAction()) return;

        let nDx = 0, nDy = 0, rD = HR.dir;
        if (Intents.U) { nDy = -1; rD = 'u'; } else if (Intents.D) { nDy = 1; rD = 'd'; }
        else if (Intents.L) { nDx = -1; rD = 'l'; } else if (Intents.R) { nDx = 1; rD = 'r'; }
        
        if (nDx !== 0 || nDy !== 0) {
            HR.dir = rD;
            const tx = HR.cx + nDx; 
            const ty = HR.cy + nDy;
            const target = WorldMapAssembler.WorldRegistry.find(g => g.x === tx && g.y === ty);
            // Obstacles in Asiyah (Blocks)
            if (target && !target.block) {
                HR.moving = true;
            }
        }
    }
}
