
import { StateRegister } from '../../binah/StateRegister.js';

/**
 * B"H
 * @class StatusPanelManifest
 * @chapter The Measures of Life
 * @description
 * Like the balances of justice, this class weighs the light of the Tzaddik against the
 * Klipah of the opponent, rendering them physically in the HUD. It also fills the XP vessel!
 */
export class StatusPanelManifest {
    static refresh() {
        const S = StateRegister;
        
        // TZADDIK STATS
        const playerHpBar = document.getElementById('player-hp-bar');
        const playerXpBar = document.getElementById('player-xp-bar');
        const playerHpLabel = document.getElementById('player-hp-label');
        const playerLvl = document.getElementById('player-lvl-label');
        
        if (playerHpBar) playerHpBar.style.width = `${Math.max(0, (S.HeroStats.light/S.HeroStats.maxLight)*100)}%`;
        
        // XP Calculation
        if (playerXpBar) {
            const xpPct = Math.min(100, Math.max(0, (S.HeroStats.xp / S.HeroStats.xpNeeded) * 100));
            playerXpBar.style.width = `${xpPct}%`;
        }

        if (playerHpLabel) playerHpLabel.innerText = `${Math.max(0, S.HeroStats.light)}/${S.HeroStats.maxLight}`;
        if (playerLvl) playerLvl.innerText = `LVL ${S.HeroStats.level}`;

        // ENEMY STATS
        const enemyHpBar = document.getElementById('enemy-hp-bar');
        const enemyHpLabel = document.getElementById('enemy-hp-label');
        const enemyLvl = document.getElementById('enemy-lvl-label');
        
        if (enemyHpBar) enemyHpBar.style.width = `${Math.max(0, (S.EnemyStats.klipah/S.EnemyStats.maxKlipah)*100)}%`;
        if (enemyHpLabel) enemyHpLabel.innerText = `${Math.max(0, S.EnemyStats.klipah)}/${S.EnemyStats.maxKlipah}`;
        if (enemyLvl) enemyLvl.innerText = `LVL ${S.EnemyStats.level || 1}`;
    }
}
