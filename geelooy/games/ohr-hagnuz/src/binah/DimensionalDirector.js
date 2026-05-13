
import { StateRegister } from './StateRegister.js';
import { OverworldLogic } from '../asiyah/OverworldLogic.js';
import { DialogueLogic } from '../netzach/DialogueLogic.js';
import { MenuLogic } from '../netzach/MenuLogic.js';
import { DebateLogic } from '../gevurah/DebateLogic.js';
import { ShlichusManager } from '../shlichus/ShlichusManager.js';

/**
 * B"H
 * @class DimensionalDirector
 * @chapter The Master Router of the Worlds
 */
export class DimensionalDirector {
    
    static digestTimeflow() {
        // Continuous Check for Quests (Pass null to denote a standard time-tick evaluation)
        ShlichusManager.evaluateProgress(null, null);

        // Continuous Menu Check for Settings bar
        MenuLogic.digestTick();
        
        if (StateRegister.ActiveRealm === 'OVERWORLD') {
            OverworldLogic.digestTick();
        } else if (StateRegister.ActiveRealm === 'DIALOGUE') {
            DialogueLogic.digestTick();
        } else if (StateRegister.ActiveRealm === 'BATTLE') {
            DebateLogic.digestTick();
        }
    }

    static elevateState(newState) {
        if (newState === 'DIALOGUE') DialogueLogic.open();
        StateRegister.ActiveRealm = newState;
    }
}
