
// B"H
/**
 * @class MouseStateMaster
 * @description
 * 🖱️ THE VESSEL OF DIRECTION 🖱️
 * 
 * The mouse is the guiding hand. This class tracks its absolute coordinates 
 * and button states in the void.
 */
export default class MouseStateMaster {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.buttons = new Map();
        this.isLocked = false;
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
    }

    pressButton(btnCode) {
        this.buttons.set(btnCode, true);
    }

    releaseButton(btnCode) {
        this.buttons.set(btnCode, false);
    }

    isPressed(btnCode) {
        return !!this.buttons.get(btnCode);
    }
}
