
import { StateRegister } from '../binah/StateRegister.js';
import { WorldMapAssembler } from '../data/WorldMapAssembler.js';
import { DimensionalDirector } from '../binah/DimensionalDirector.js';
import { resolveEnemy } from '../data/debate/EnemyLexicon.js';

/**
 * B"H
 * @class InteractionValidator
 * @chapter Panim el Panim (Face to Face)
 * @description
 * "And the Lord spoke to Moses face to face..."
 * Here we capture the localized collision of souls. Every single entity,
 * whether holy sage or dark husk, must now declare its essence in Dialogue
 * before entering the Gevurah of Debate!
 */
export class InteractionValidator {
    static _aHeld = false;

    /**
     * @description Throttles the intent to prevent rapid-fire speech via keyboard.
     * @returns {boolean} True if interaction occurred.
     */
    static checkSpeechAction() {
        const intents = window.AwtsmoosIntents || {};
        if (intents.A && !this._aHeld) {
            this._aHeld = true;
            return this.attemptInteraction();
        } else if (!intents.A) {
            this._aHeld = false;
        }
        return false;
    }

    /**
     * @description Casts a focused beam of intent exactly one tile forward.
     * @returns {boolean} True if an entity was struck by the ray of intent.
     */
    static attemptInteraction() {
        const HR = StateRegister.HeroPos;
        let tx = HR.cx, ty = HR.cy;

        if (HR.dir === 'u') ty -= 1;
        else if (HR.dir === 'd') ty += 1;
        else if (HR.dir === 'l') tx -= 1;
        else if (HR.dir === 'r') tx += 1;

        const tile = WorldMapAssembler.WorldRegistry.find(t => t.x === tx && t.y === ty);
        
        if (tile && tile.isSoul) {
            this.directInteract(tile);
            return true;
        }
        return false;
    }

    /**
     * @description Initiates the transmission of wisdom or the prelude to logic clash directly.
     * @param {Object} tile The localized node object containing the specific soul.
     */
    static directInteract(tile) {
        const HR = StateRegister.HeroPos;
        
        // Panim el Panim: The soul turns to face the Tzaddik
        const faceOpposite = { 'u': 'd', 'd': 'u', 'l': 'r', 'r': 'l' };
        tile.dir = faceOpposite[HR.dir];

        // Store the ID of the encountered soul
        StateRegister.DialogBankId = tile.char;

        // Pre-calculate EnemyStats for ALL interacted souls!
        // Because any conversation might end in a Debate!
        const profile = resolveEnemy(tile.char);
        const pLevel = StateRegister.HeroStats.level;
        
        // Enemies are harder (+2), normal NPCs (like trainers) are matched (+0)
        const levelMod = tile.isEnemy ? 2 : 0;
        const eLevel = Math.max(1, pLevel + levelMod);
        
        const maxHP = profile.baseHp + (eLevel * 15);
        const yieldXp = profile.baseXp + (eLevel * 10);

        StateRegister.EnemyStats = {
            klipah: maxHP,
            maxKlipah: maxHP,
            yieldXp: yieldXp,
            level: eLevel
        };

        // ALWAYS begin with Speech! The Klipah must articulate its void.
        DimensionalDirector.elevateState('DIALOGUE');
        window.dispatchEvent(new Event('awtsmoos-dialogue-open'));
    }
}
