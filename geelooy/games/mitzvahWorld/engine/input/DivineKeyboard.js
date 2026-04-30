
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file DivineKeyboard.js
 * 
 * Chapter: The Reins of Free Will.
 * The Awtsmoos granted mankind Bechirah (Free Will). In the digital realm,
 * this is expressed through keystrokes. We do not use messy event listeners
 * directly in the game loop; instead, we catch the "sparks" of intention
 * asynchronously and store them in a pure JSON Map, representing the 
 * current state of the player's Will.
 */

/**
 * @class DivineKeyboard
 * @extends SederHishtalshelusNode
 * @description Translates physical keystrokes into pure boolean data states.
 */
export default class DivineKeyboard extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Yetzirah_Keyboard_Mapping" });
        
        /**
         * The pure ledger of active intentions.
         * @type {Object.<string, boolean>}
         */
        this.activeKeys = {};
        
        this.bindPhysicalVessels();
    }

    /**
     * @method bindPhysicalVessels
     * @description Attaches listeners to the physical window to trap key events.
     * @returns {void}
     */
    bindPhysicalVessels() {
        this.acknowledgeCreator();
        
        window.addEventListener('keydown', (e) => {
            this.activeKeys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.activeKeys[e.code] = false;
        });

        console.log(`B"H - ⌨️ Divine Keyboard matrix initialized and bound.`);
    }

    /**
     * @method isIntentActive
     * @description Checks the ledger for a specific free-will intention.
     * @param {string} keyCode - e.g., 'KeyW', 'ArrowUp'
     * @returns {boolean}
     */
    isIntentActive(keyCode) {
        return !!this.activeKeys[keyCode];
    }

    /**
     * @method getMovementVector
     * @description Synthesizes a pure directional vector from WASD/Arrows.
     * @returns {Object} { x, y } ranging from -1 to 1.
     */
    getMovementVector() {
        let vx = 0;
        let vy = 0;

        if (this.isIntentActive('KeyW') || this.isIntentActive('ArrowUp')) vy -= 1;
        if (this.isIntentActive('KeyS') || this.isIntentActive('ArrowDown')) vy += 1;
        if (this.isIntentActive('KeyA') || this.isIntentActive('ArrowLeft')) vx -= 1;
        if (this.isIntentActive('KeyD') || this.isIntentActive('ArrowRight')) vx += 1;

        // Normalize diagonal movement so the vessel doesn't travel faster diagonally
        if (vx !== 0 && vy !== 0) {
            const length = Math.sqrt(vx * vx + vy * vy);
            vx /= length;
            vy /= length;
        }

        return { x: vx, y: vy };
    }
}
