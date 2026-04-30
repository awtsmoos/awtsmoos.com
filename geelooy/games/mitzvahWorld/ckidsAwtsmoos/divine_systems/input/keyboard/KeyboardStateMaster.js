
// B"H
/**
 * @class KeyboardStateMaster
 * @description
 * 🎹 THE VESSELS OF CONSCIOUSNESS (DA'AS) 🎹
 * 
 * Every key pressed is an intent, a desire flowing from the soul. 
 * This map stores those desires. It has no connection to the physical DOM, 
 * existing purely in the abstract realm to be read by the physical engines.
 * 
 * "With knowledge, the chambers are filled." (Mishlei 24:4)
 */
export default class KeyboardStateMaster {
    constructor() {
        this.activeKeys = new Map();
    }

    /**
     * @method pressKey
     * @description Registers the active intention of the soul.
     * @param {string} keyCode - The code of the intention.
     */
    pressKey(keyCode) {
        this.activeKeys.set(keyCode, true);
    }

    /**
     * @method releaseKey
     * @description Nullifies the intention, returning the state to the void.
     * @param {string} keyCode - The code of the intention.
     */
    releaseKey(keyCode) {
        this.activeKeys.set(keyCode, false);
    }

    /**
     * @method isPressed
     * @description Queries the current existence of an intention.
     * @param {string} keyCode 
     * @returns {boolean}
     */
    isPressed(keyCode) {
        return !!this.activeKeys.get(keyCode);
    }
    
    /**
     * @method clearAll
     * @description Resets all intentions to absolute zero.
     */
    clearAll() {
        this.activeKeys.clear();
    }
}
