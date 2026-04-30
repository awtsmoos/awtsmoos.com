
import { StateRegister } from '../binah/StateRegister.js';
import { ControllerOfWill } from '../keter/ControllerOfWill.js';
import { WisdomStrings } from '../data/WisdomStrings.js';
import { DimensionalDirector } from '../binah/DimensionalDirector.js';

/**
 * B"H
 * "Victory" - The endurance of the conversation.
 */
export class DialogueLogic {
    
    static digestTick() {
        if (ControllerOfWill.isFreshAwakening('A')) {
            // Consume the intent so it doesn't double-fire
            ControllerOfWill.consumeIntent('A');
            
            const arr = WisdomStrings[StateRegister.DialogBankId] || [];
            StateRegister.DialogLineIdx++;
            
            if (StateRegister.DialogLineIdx >= arr.length) {
                // Return to overworld
                DimensionalDirector.elevateState('OVERWORLD');
                StateRegister.DialogBankId = null;
                StateRegister.DialogLineIdx = 0;
            }
        }
    }
}
