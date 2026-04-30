
import { StateRegister } from '../binah/StateRegister.js';
import { ControllerOfWill } from '../keter/ControllerOfWill.js';
import { WorldMapAssembler } from '../data/WorldMapAssembler.js';
import { DimensionalDirector } from '../binah/DimensionalDirector.js';

/**
 * B"H
 * InteractionValidator: The Conduit of Speech.
 * 
 * Chapter: Face to Face.
 * When Moses spoke to G-d, it was "Panim el Panim" (Face to Face).
 * To interact in Asiyah, the Hero must face the target vessel exactly.
 * This validator projects a ray of intent one unit forward in the current direction.
 * If it strikes a soul capable of speech (eid), it elevates the active dimension
 * from physical movement (OVERWORLD) to the spiritual transmission (DIALOGUE).
 * 
 * @class InteractionValidator
 */
export class InteractionValidator {
    
    /**
     * @returns {boolean} True if a speech action was successfully engaged.
     */
    static checkSpeechAction() {
        if (!ControllerOfWill.isFreshAwakening('A')) return false;

        const HR = StateRegister.HeroPos;
        // Identify the focal point based on current direction
        let vX = HR.cx; 
        let vY = HR.cy;
        
        if (HR.dir === 'u') vY -= 1; 
        if (HR.dir === 'd') vY += 1;
        if (HR.dir === 'l') vX -= 1; 
        if (HR.dir === 'r') vX += 1;

        // Scan the matrix for the specific coordinates
        const focusEntity = WorldMapAssembler.WorldRegistry.find(t => t.x === vX && t.y === vY);
        
        // If an Entity ID exists, the vessel has something to say
        if (focusEntity && focusEntity.eid) {
            StateRegister.DialogBankId = focusEntity.eid;
            StateRegister.DialogLineIdx = 0;
            DimensionalDirector.elevateState('DIALOGUE');
            return true;
        }

        return false;
    }
}
