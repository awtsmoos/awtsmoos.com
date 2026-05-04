
import { StateRegister } from './StateRegister.js';
import { OverworldLogic } from '../asiyah/OverworldLogic.js';
import { DialogueLogic } from '../netzach/DialogueLogic.js';
import { MenuLogic } from '../netzach/MenuLogic.js';

/**
 * B"H
 * DimensionalDirector: Orchestrator of the Multi-World structure.
 * Routes current pulse processing based on the Active Realm.
 */
export class DimensionalDirector {
    
    static digestTimeflow() {
        // Continuous Menu Check for Settings bar
        MenuLogic.digestTick();
        
        if (StateRegister.ActiveRealm === 'OVERWORLD') {
            OverworldLogic.digestTick();
        } else if (StateRegister.ActiveRealm === 'DIALOGUE') {
            DialogueLogic.digestTick();
        } else if (StateRegister.ActiveRealm === 'SETTINGS_MENU') {
            // Managed within logic toggle
        }
    }

    static elevateState(newState) {
        StateRegister.ActiveRealm = newState;
    }
}
