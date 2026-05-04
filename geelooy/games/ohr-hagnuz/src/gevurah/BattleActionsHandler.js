
import { StateRegister } from '../binah/StateRegister.js';
import { ControllerOfWill } from '../keter/ControllerOfWill.js';
import { DimensionalDirector } from '../binah/DimensionalDirector.js';

/**
 * B"H
 * Utterly data-driven behavior object matrix. 
 * Just as every specific Hebrew word corresponds to a physical chemical bond,
 * every 'SubState' string corresponds perfectly to a handler matrix evaluating intentions.
 */
export const BattleActionsHandler = {
    StateMap: {
        'MAIN_MENU': {
            evaluateIntents: () => {
                if (ControllerOfWill.isFreshAwakening('U')) StateRegister.MenuCursorSelection = Math.max(0, StateRegister.MenuCursorSelection - 2);
                if (ControllerOfWill.isFreshAwakening('D')) StateRegister.MenuCursorSelection = Math.min(3, StateRegister.MenuCursorSelection + 2);
                if (ControllerOfWill.isFreshAwakening('L')) StateRegister.MenuCursorSelection = Math.max(0, StateRegister.MenuCursorSelection - 1);
                if (ControllerOfWill.isFreshAwakening('R')) StateRegister.MenuCursorSelection = Math.min(3, StateRegister.MenuCursorSelection + 1);
                
                if (ControllerOfWill.isFreshAwakening('A')) {
                    const IntentExecutionMap = {
                        0: () => { StateRegister.BattleSubState = 'FIGHT_MENU'; StateRegister.MenuCursorSelection = 0; }, // FIGHT
                        1: () => { StateRegister.BattleSubState = 'TEXT_FEED'; StateRegister.BattleLogQueue = ["Elevating spark!"]; }, // TIKUN
                        2: () => { StateRegister.BattleSubState = 'TEXT_FEED'; StateRegister.BattleLogQueue = ["Neshama Team checked."]; }, // PARTY
                        3: () => { DimensionalDirector.elevateState('OVERWORLD'); } // RUN
                    };
                    const execNode = IntentExecutionMap[StateRegister.MenuCursorSelection];
                    if (execNode) execNode();
                }
            }
        },
        'FIGHT_MENU': {
            evaluateIntents: () => {
                if (ControllerOfWill.isFreshAwakening('U')) StateRegister.MenuCursorSelection = Math.max(0, StateRegister.MenuCursorSelection - 2);
                if (ControllerOfWill.isFreshAwakening('D')) StateRegister.MenuCursorSelection = Math.min(3, StateRegister.MenuCursorSelection + 2);
                if (ControllerOfWill.isFreshAwakening('L')) StateRegister.MenuCursorSelection = Math.max(0, StateRegister.MenuCursorSelection - 1);
                if (ControllerOfWill.isFreshAwakening('R')) StateRegister.MenuCursorSelection = Math.min(3, StateRegister.MenuCursorSelection + 1);
                
                if (ControllerOfWill.isFreshAwakening('B')) {
                    StateRegister.BattleSubState = 'MAIN_MENU';
                    StateRegister.MenuCursorSelection = 0;
                }
                
                if (ControllerOfWill.isFreshAwakening('A')) {
                    StateRegister.BattleSubState = 'TEXT_FEED';
                    StateRegister.BattleLogQueue = ["Golem struck deeply!", "Enemy Klippah scattered!"];
                }
            }
        },
        'TEXT_FEED': {
            evaluateIntents: () => {
                if (ControllerOfWill.isFreshAwakening('A')) {
                    StateRegister.BattleLogQueue.shift();
                    if (StateRegister.BattleLogQueue.length === 0) {
                        DimensionalDirector.elevateState('OVERWORLD');
                        StateRegister.BattleSubState = 'MAIN_MENU';
                    }
                }
            }
        },
        'DEFAULT': { evaluateIntents: () => { StateRegister.BattleSubState = 'MAIN_MENU'; } }
    }
};
