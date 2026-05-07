
import { StateRegister } from '../../binah/StateRegister.js';
import { resolveEnemy } from '../../data/debate/EnemyLexicon.js';

/**
 * B"H
 * @class ArenaManifest
 */
export class ArenaManifest {
    static refresh() {
        const shell = document.getElementById('awtsmoos-battle-ui');
        const bgLayer = document.getElementById('awtsmoos-battle-bg');
        const enemySprite = document.getElementById('sprite-klipah');
        const heroSprite = document.getElementById('sprite-tzaddik');
        const enemyLabel = document.querySelector('.battle-hud-panel[style*="d500f9"] div');
        
        if (!shell || !enemySprite || !bgLayer || !heroSprite) return;

        const enemyID = StateRegister.DialogBankId || '🌑';
        const profile = resolveEnemy(enemyID);

        shell.className = 'awtsmoos-battle-shell'; 
        bgLayer.className = profile.bgClass || 'bg-void-anim';

        // Update Sprite Form
        enemySprite.innerText = profile.sprite;
        enemySprite.style.color = profile.accent;
        enemySprite.style.textShadow = `0 0 50px ${profile.accent}, 0 0 100px ${profile.accent}`;

        // Manifest the active Vessel for the Tzaddik!
        const vesselId = StateRegister.Vessels.active;
        const vessel = StateRegister.VesselCatalog[vesselId];
        heroSprite.innerText = vessel.icon;

        // Update HUD accent
        if (enemyLabel) {
            enemyLabel.innerText = profile.label;
            enemyLabel.style.color = profile.accent;
        }
    }
}
