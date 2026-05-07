
import { StateRegister } from '../../binah/StateRegister.js';

/**
 * B"H
 * @class DialogueTransmitter
 * @chapter The Unfolding of the Scroll
 * @description
 * Just as the Awtsmoos spoke the world into existence letter by letter, 
 * this class handles the rhythmic manifestation of NPC dialogue.
 */
export class DialogueTransmitter {
    static _charIdx = 0;
    static _tickCounter = 0;
    static _isFinished = false;

    /**
     * @description Resets the transmission vessel for a new revelation.
     */
    static reset() {
        this._charIdx = 0;
        this._tickCounter = 0;
        this._isFinished = false;
        StateRegister.VisibleDialogText = "";
    }

    /**
     * @description The heartbeat of the typewriter.
     * @param {string} fullText - The complete utterance.
     * @param {boolean} accelerated - If the user is pressing 'confirm'.
     * @returns {boolean} True if the visible text has updated this tick.
     */
    static pulse(fullText, accelerated) {
        if (this._isFinished || !fullText) return false;

        // Instant manifestation if Will is strong
        if (accelerated) {
            this._charIdx = fullText.length;
            this._isFinished = true;
            StateRegister.VisibleDialogText = fullText;
            return true;
        }

        this._tickCounter++;
        // Speed of revelation: 1 character every 3 ticks
        const revelationThreshold = 3; 

        if (this._tickCounter >= revelationThreshold) {
            this._tickCounter = 0;
            this._charIdx++;
            StateRegister.VisibleDialogText = fullText.substring(0, this._charIdx);
            
            if (this._charIdx >= fullText.length) {
                this._isFinished = true;
            }
            return true; 
        }

        return false;
    }

    static get isFinished() { return this._isFinished; }
}
