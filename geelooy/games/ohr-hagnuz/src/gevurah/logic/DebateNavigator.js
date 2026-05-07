
import { StateRegister } from '../../binah/StateRegister.js';

/**
 * B"H
 * @class DebateNavigator
 * @description Mathematics of the Chariot. Translates intent matrices into valid index shifts.
 */
export class DebateNavigator {
    static _navHeld = { u:0, d:0, l:0, r:0 };

    static process(intents, cursorIdx, listSize) {
        let newIdx = cursorIdx;
        let changed = false;
        const S = StateRegister;
        
        const check = (intentKey, dir) => {
            const pressed = intents[intentKey];
            if (pressed && !this._navHeld[dir]) { this._navHeld[dir]=1; return true; }
            if (!pressed) this._navHeld[dir]=0;
            return false;
        };

        if (S.BattleMenuState === 'ROOT' || S.BattleMenuState === 'CATEGORY') {
            if (check('U', 'u') && newIdx >= 2) { newIdx -= 2; changed = true; }
            if (check('D', 'd') && newIdx < 2) { newIdx += 2; changed = true; }
            if (check('L', 'l') && newIdx % 2 === 1) { newIdx -= 1; changed = true; }
            if (check('R', 'r') && newIdx % 2 === 0) { newIdx += 1; changed = true; }
        } else if (S.BattleMenuState === 'LIST') {
            if (listSize > 0) {
                if (check('U', 'u')) { newIdx = (newIdx - 1 + listSize) % listSize; changed = true; }
                if (check('D', 'd')) { newIdx = (newIdx + 1) % listSize; changed = true; }
            }
        }
        
        return { changed, newIdx };
    }
}
