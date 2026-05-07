
import { StateRegister } from '../../binah/StateRegister.js';
import { LevelingLogic } from '../../logic/LevelingLogic.js';
import { EnemyLootTable } from '../../data/debate/EnemyLootTable.js';
import { resolveEnemy } from '../../data/debate/EnemyLexicon.js';

/**
 * B"H
 * @class DebateExecutor
 */
export class DebateExecutor {
    static async strike(action, logCb, refreshCb, resolveCb) {
        logCb(`"${action.quote}"`);
        await this.wait(500);
        
        window.dispatchEvent(new CustomEvent('awtsmoos-battle-anim', { detail: 'HERO_ATTACK' }));
        await this.wait(200);
        window.dispatchEvent(new CustomEvent('awtsmoos-battle-vfx', { detail: action.vfx }));
        
        const profile = resolveEnemy(StateRegister.DialogBankId);
        let dmg = action.power;
        
        // Element Synergy (Sod damages all, etc.)
        if (action.vfx === 'VFX_LIGHT' && profile.type === 'AIR') dmg = Math.floor(dmg * 1.5);
        if (action.vfx === 'VFX_FIRE' && profile.type === 'EARTH') dmg = Math.floor(dmg * 1.5);
        if (action.vfx === 'VFX_WATER' && profile.type === 'FIRE') dmg = Math.floor(dmg * 1.5);

        StateRegister.EnemyStats.klipah -= dmg;
        window.dispatchEvent(new Event('awtsmoos-battle-update'));
        await this.wait(1000);

        if (StateRegister.EnemyStats.klipah <= 0) await this.win(logCb, resolveCb);
        else await this.enemyTurn(logCb, resolveCb);
        refreshCb();
    }

    static async tryRedeem(logCb, refreshCb, resolveCb) {
        logCb("You channel pure intention to sift the spark...");
        await this.wait(800);
        
        const S = StateRegister.EnemyStats;
        const profile = resolveEnemy(StateRegister.DialogBankId);
        
        const hpRatio = S.klipah / S.maxKlipah;
        let catchChance = 1.0 - hpRatio; 
        
        if (profile.alignment === 'NOGAH') catchChance += 0.3;
        if (profile.alignment === 'KLIPAH') catchChance -= 0.2;

        if (Math.random() < catchChance || catchChance >= 1) {
            logCb(`The spark of ${profile.label} is redeemed and bound to your soul!`);
            window.dispatchEvent(new Event('awtsmoos-battle-enemy-vanquished')); 
            await this.wait(2000);
            
            this._addItemToBag(`${profile.name}_ESSENCE`);
            
            if (LevelingLogic.gainSparks(Math.floor(S.yieldXp * 0.5))) {
                logCb(`Vessel expanded to Level ${StateRegister.HeroStats.level}!`);
                window.dispatchEvent(new Event('awtsmoos-battle-level-up'));
                await this.wait(3000);
            }
            resolveCb(false);
        } else {
            logCb("The shell is too rigid! The spark refuses to rise.");
            await this.wait(1000);
            await this.enemyTurn(logCb, resolveCb);
            refreshCb();
        }
    }

    static async win(logCb, resolveCb) {
        const xp = StateRegister.EnemyStats.yieldXp;
        const enemyId = StateRegister.DialogBankId;
        
        logCb(`The Klipah shatters! Released ${xp} sparks!`);
        
        const possibleLoot = EnemyLootTable[enemyId] || [];
        if (possibleLoot.length > 0 && Math.random() < 0.7) {
            const itemId = possibleLoot[Math.floor(Math.random() * possibleLoot.length)];
            this._addItemToBag(itemId);
            logCb(`Redeemed item: ${itemId.replace('_', ' ')}!`);
        }

        window.dispatchEvent(new Event('awtsmoos-battle-enemy-vanquished'));
        await this.wait(1500);
        if (LevelingLogic.gainSparks(xp)) {
            logCb(`Vessel expanded to Level ${StateRegister.HeroStats.level}!`);
            window.dispatchEvent(new Event('awtsmoos-battle-level-up'));
            await this.wait(3000);
        }
        resolveCb(false);
    }

    static _addItemToBag(itemId) {
        const existing = StateRegister.MaterialBag.find(i => i.id === itemId);
        if (existing) existing.qty++;
        else StateRegister.MaterialBag.push({ id: itemId, qty: 1 });
    }

    static async enemyTurn(logCb, resolveCb) {
        const profile = resolveEnemy(StateRegister.DialogBankId);
        logCb(`${profile.label} strikes back with unmitigated Din!`);
        await this.wait(800);
        
        window.dispatchEvent(new CustomEvent('awtsmoos-battle-anim', { detail: 'ENEMY_ATTACK' }));
        await this.wait(200); 
        window.dispatchEvent(new CustomEvent('awtsmoos-battle-anim', { detail: 'SLASH_FLASH' }));
        
        const dmg = 10 + ((StateRegister.EnemyStats.level || 1) * 5);
        StateRegister.HeroStats.light -= dmg;
        window.dispatchEvent(new Event('awtsmoos-battle-update'));
        
        if (StateRegister.HeroStats.light <= 0) {
            logCb("Your light is depleted. You must retreat and rebuild.");
            await this.wait(1500);
            resolveCb(true);
        }
    }

    static wait(ms) { return new Promise(r => setTimeout(r, ms)); }
}
