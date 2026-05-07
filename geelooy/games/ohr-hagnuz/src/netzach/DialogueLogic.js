
import { StateRegister } from '../binah/StateRegister.js';
import { DialogueTrees } from '../data/DialogueTrees.js';
import { DialogueTransmitter } from './logic/DialogueTransmitter.js';
import { DimensionalDirector } from '../binah/DimensionalDirector.js';

/**
 * B"H
 * @class DialogueLogic
 * @chapter The Transmission of Wisdom
 * @description
 * Oversees the progression of text and choices. Handles the new 'awtsmoos-dialogue-skip' event
 * so that both keyboard intents and pointer intents can rapidly reveal the hidden light.
 */
export class DialogueLogic {
    static _aHeld = true; 
    static _uHeld = false;
    static _dHeld = false;
    static _bound = false;
    static _skipTriggered = false; // Tracks pointer skips

    static open() {
        StateRegister.DialogNodeId = 'START';
        StateRegister.DialogLineIdx = 0;
        StateRegister.DialogOptionCursor = 0;
        DialogueTransmitter.reset();
        this._aHeld = true; 
        this._skipTriggered = false;
        console.log(`B"H - Dialogue opened for entity: ${StateRegister.DialogBankId}`);
        window.dispatchEvent(new Event('awtsmoos-dialogue-update'));
    }

    static digestTick() {
        if (!this._bound) {
            window.addEventListener('awtsmoos-dialogue-option-click', (e) => {
                let tree = DialogueTrees[StateRegister.DialogBankId] || DialogueTrees['DEFAULT'];
                const currentNode = tree[StateRegister.DialogNodeId];
                if (currentNode && currentNode.options) {
                    this.executeChoice(currentNode.options[e.detail]);
                }
            });

            // Listen for pointer clicks outside the options
            window.addEventListener('awtsmoos-dialogue-skip', () => {
                this._skipTriggered = true;
            });

            this._bound = true;
        }

        const intents = window.AwtsmoosIntents || {};
        let tree = DialogueTrees[StateRegister.DialogBankId] || DialogueTrees['DEFAULT'];

        const currentNode = tree[StateRegister.DialogNodeId];
        if (!currentNode) { this.close('OVERWORLD'); return; }

        const lines = currentNode.lines || ["..."];
        const currentLine = lines[StateRegister.DialogLineIdx] || "";
        const isLastLine = StateRegister.DialogLineIdx >= lines.length - 1;

        // Is there a fresh expression of the A-intent or a pointer skip?
        const isFreshA = (intents.A && !this._aHeld) || this._skipTriggered;
        
        this._aHeld = !!intents.A;
        this._skipTriggered = false; // Consume the skip flag

        // 1. TRANSMISSION PHASE
        if (!DialogueTransmitter.isFinished) {
            if (DialogueTransmitter.pulse(currentLine, isFreshA)) {
                window.dispatchEvent(new Event('awtsmoos-dialogue-update'));
            }
            return;
        }

        // 2. INTERACTIVE/ADVANCE PHASE
        if (isLastLine && currentNode.options && currentNode.options.length > 0) {
            this._handleNav(intents, currentNode.options.length);
        }

        if (isFreshA) {
            if (!isLastLine) {
                // Next sentence in current node
                StateRegister.DialogLineIdx++;
                DialogueTransmitter.reset();
            } else {
                // Node complete. Check options or close.
                if (currentNode.options && currentNode.options.length > 0) {
                    this.executeChoice(currentNode.options[StateRegister.DialogOptionCursor]);
                } else {
                    this.close('OVERWORLD');
                }
            }
            window.dispatchEvent(new Event('awtsmoos-dialogue-update'));
        }
    }

    static _handleNav(intents, max) {
        let moved = false;
        if ((intents.U || intents.W) && !this._uHeld) {
            StateRegister.DialogOptionCursor = (StateRegister.DialogOptionCursor - 1 + max) % max;
            this._uHeld = true; moved = true;
        } else if (!intents.U && !intents.W) this._uHeld = false;

        if ((intents.D || intents.S) && !this._dHeld) {
            StateRegister.DialogOptionCursor = (StateRegister.DialogOptionCursor + 1) % max;
            this._dHeld = true; moved = true;
        } else if (!intents.D && !intents.S) this._dHeld = false;

        if (moved) window.dispatchEvent(new Event('awtsmoos-dialogue-update'));
    }

    static executeChoice(choice) {
        if (choice.action === 'BATTLE') {
            this.close('BATTLE');
            return;
        }
        if (choice.next && choice.next !== 'END') {
            StateRegister.DialogNodeId = choice.next;
            StateRegister.DialogLineIdx = 0;
            StateRegister.DialogOptionCursor = 0;
            DialogueTransmitter.reset();
            window.dispatchEvent(new Event('awtsmoos-dialogue-update'));
        } else {
            this.close('OVERWORLD');
        }
    }

    /**
     * @description Dismantles the dialogue vessel and elevates the soul to the next realm.
     * @param {string} nextRealm - The dimension to shift into ('OVERWORLD' or 'BATTLE').
     */
    static close(nextRealm) {
        StateRegister.ActiveRealm = nextRealm;
        window.dispatchEvent(new Event('awtsmoos-dialogue-close'));
        
        if (nextRealm === 'BATTLE') {
            DimensionalDirector.elevateState('BATTLE');
            window.dispatchEvent(new Event('awtsmoos-battle-open'));
        }

        setTimeout(() => { if (window.AwtsmoosIntents) window.AwtsmoosIntents.A = 0; }, 300);
    }
}
