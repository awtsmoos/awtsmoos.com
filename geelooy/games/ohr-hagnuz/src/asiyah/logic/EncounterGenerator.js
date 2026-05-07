
import { StateRegister } from '../../binah/StateRegister.js';
import { resolveEnemy } from '../../data/debate/EnemyLexicon.js';
import { DimensionalDirector } from '../../binah/DimensionalDirector.js';

/**
 * B"H
 * @class EncounterGenerator
 * @chapter The Architect of Trials
 * @description
 * Instead of instantly tossing the Tzaddik into the severity of Gevurah (Battle),
 * this module first summons the adversary to speak, rendering their essence into dialogue!
 */
export class EncounterGenerator {
    /**
     * @description Rolls the dice of providence to manifest a Klipah.
     */
    static manifestWildKlipah() {
        // Randomize the elemental Klipah
        const klipot = ['🌑', '🧱', '🌀', '🔥'];
        const selectedKlipah = klipot[Math.floor(Math.random() * klipot.length)];
        
        StateRegister.DialogBankId = selectedKlipah;
        const profile = resolveEnemy(selectedKlipah);

        // Scale the enemy slightly based on hero level
        const pLevel = StateRegister.HeroStats.level;
        const eLevel = Math.max(1, pLevel + Math.floor(Math.random() * 2) - 1);
        
        const maxHP = profile.baseHp + (eLevel * 10);
        const yieldXp = profile.baseXp + (eLevel * 5);

        StateRegister.EnemyStats = {
            klipah: maxHP,
            maxKlipah: maxHP,
            yieldXp: yieldXp,
            level: eLevel
        };
        
        // Open the Dialogue dimension to let the Klipah announce its presence!
        DimensionalDirector.elevateState('DIALOGUE');
        window.dispatchEvent(new Event('awtsmoos-dialogue-open'));
    }
}
