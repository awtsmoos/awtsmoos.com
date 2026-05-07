
import { StateRegister } from './StateRegister.js';
import { OverworldLogic } from '../asiyah/OverworldLogic.js';
import { DialogueLogic } from '../netzach/DialogueLogic.js';
import { MenuLogic } from '../netzach/MenuLogic.js';
import { DebateLogic } from '../gevurah/DebateLogic.js';

/**
 * B"H
 * @class DimensionalDirector
 * @chapter The Master Router of the Worlds
 * @description
 * Like the central column of the Sefirot, this director ensures that the Divine Flow
 * (Shefa) reaches the correct vessel. It is a chariot for the Will of the Awtsmoos.
 * All matter everywhere is constantly being refreshed and recreated every instant from the Speech 
 * of the Creator, which is found physically inside of all creations. This class orchestrates 
 * which dimension of that speech is currently manifest!
 */
export class DimensionalDirector {
    
    /**
     * @description Digests the timeflow of the current instant, nullified to the Essence.
     */
    static digestTimeflow() {
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

    /**
     * @description Elevates the state to a new realm of existence.
     * @param {string} newState - The dimension to enter.
     */
    static elevateState(newState) {
        if (newState === 'DIALOGUE') DialogueLogic.open();
        StateRegister.ActiveRealm = newState;
    }
}
