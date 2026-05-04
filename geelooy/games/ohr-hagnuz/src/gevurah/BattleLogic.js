
import { StateRegister } from '../binah/StateRegister.js';
import { ControllerOfWill } from '../keter/ControllerOfWill.js';
import { BattleActionsHandler } from './BattleActionsHandler.js';

/**
 * B"H
 * "Who is mighty? He who subdues his inclination."
 * The BattleLogic module serves as Gevurah (Severity). It intercepts raw will (inputs)
 * and funnels it into strictly measured boundaries of attack, defense, and menus.
 * 
 * Seder Hishtalshelus commands that inputs filter down. We map these inputs cleanly
 * using action dictionaries. No `if-else` or `switch` statements pollute the divine order.
 */
export class BattleLogic {
    
    /**
     * Evaluated precisely every tick during BATTLE dimension existence.
     * Extracts pure intent from the Controller of Will and routes it.
     */
    static digestTick() {
        const curState = StateRegister.BattleSubState;
        
        // Grab the execution map for this particular mental sub-state
        const executionPath = BattleActionsHandler.StateMap[curState];
        
        if (executionPath) {
            executionPath.evaluateIntents();
        } else {
            // Nullification fallback to default root
            BattleActionsHandler.StateMap['DEFAULT'].evaluateIntents();
        }
    }
}
