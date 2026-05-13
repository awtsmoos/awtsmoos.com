
import { StateRegister } from '../../binah/StateRegister.js';
import { resolveEnemy } from '../../data/debate/EnemyLexicon.js';
import { DimensionalDirector } from '../../binah/DimensionalDirector.js';

/**
 * B"H
 * @class EncounterGenerator
 * @chapter The Architect of Trials
 * @description
 * Rolls the dice of providence to pull a Klipah or a stray Holy Letter from the void.
 */
export class EncounterGenerator {
    static manifestWildKlipah() {
        // Base Klipot
        const klipot = ['🌑', '🧱', '🌀', '🔥', '🐺', '🐍'];
        
        // Rare chance to encounter the floating Otiot (Letters of Truth)
        const otiot = ['א', 'מ', 'ת'];
        
        let selectedId = '';
        if (Math.random() < 0.05) {
            selectedId = otiot[Math.floor(Math.random() * otiot.length)];
            console.log(`B"H - A floating letter [${selectedId}] has descended!`);
        } else {
            selectedId = klipot[Math.floor(Math.random() * klipot.length)];
        }
        
        StateRegister.DialogBankId = selectedId;
        const profile = resolveEnemy(selectedId);

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
        
        DimensionalDirector.elevateState('DIALOGUE');
        window.dispatchEvent(new Event('awtsmoos-dialogue-open'));
    }
}
