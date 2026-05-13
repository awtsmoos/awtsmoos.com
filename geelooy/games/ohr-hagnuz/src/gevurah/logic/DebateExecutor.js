
import { StateRegister } from '../../binah/StateRegister.js';
import { LevelingLogic } from '../../logic/LevelingLogic.js';
import { EnemyLootTable } from '../../data/debate/EnemyLootTable.js';
import { resolveEnemy } from '../../data/debate/EnemyLexicon.js';
import { GarmentLedger } from '../../chochmah/GarmentLedger.js';
import { WeaponLedger } from '../../chochmah/WeaponLedger.js';
import { ShlichusManager } from '../../shlichus/ShlichusManager.js';

/**
 * B"H
 * @class DebateExecutor
 * @chapter The Scales of Absolute Justice
 */
export class DebateExecutor {
    static async strike(action, logCb, refreshCb, resolveCb) {
        logCb(`You channel the Torah: "${action.quote}"`);
        await this.wait(500);
        
        window.dispatchEvent(new CustomEvent('awtsmoos-battle-anim', { detail: 'HERO_ATTACK' }));
        await this.wait(200);
        window.dispatchEvent(new CustomEvent('awtsmoos-battle-vfx', { detail: action.vfx }));
        
        const profile = resolveEnemy(StateRegister.DialogBankId);
        
        // --- SEFIROTIC CALCULATIONS ---
        const gMod = GarmentLedger[StateRegister.Equipment.garment]?.statMod || { chochmah:0, binah:0, daat:0 };
        const wMod = WeaponLedger[StateRegister.Equipment.weapon]?.statMod || { attack:0, defense:0, crit:0 };
        
        const chochmah = StateRegister.EtzChaim.CHOCHMAH + gMod.chochmah;
        const daat = StateRegister.EtzChaim.DAAT + gMod.daat;

        // Base Damage from the Sefer + Weapon Power + (Chochmah multiplier)
        let baseDmg = action.power + wMod.attack + (chochmah * 3);
        
        // Element Synergy
        if (action.vfx === 'VFX_LIGHT' && profile.type === 'AIR') baseDmg = Math.floor(baseDmg * 1.5);
        if (action.vfx === 'VFX_FIRE' && profile.type === 'EARTH') baseDmg = Math.floor(baseDmg * 1.5);
        if (action.vfx === 'VFX_WATER' && profile.type === 'FIRE') baseDmg = Math.floor(baseDmg * 1.5);

        // Critical Hit (Daat + Weapon Crit Chance)
        const critChance = (daat * 2) + wMod.crit; 
        const isCrit = (Math.random() * 100) < critChance;

        if (isCrit) {
            baseDmg = Math.floor(baseDmg * 2.5);
            logCb(`A flash of Daat! CRITICAL UNIFICATION! Dealing ${baseDmg} damage!`);
            window.dispatchEvent(new CustomEvent('awtsmoos-battle-anim', { detail: 'SLASH_FLASH' }));
            await this.wait(600);
        } else {
            logCb(`The letters strike the Klipah, dealing ${baseDmg} damage.`);
        }

        StateRegister.EnemyStats.klipah -= baseDmg;
        window.dispatchEvent(new Event('awtsmoos-battle-update'));
        await this.wait(1000);

        if (StateRegister.EnemyStats.klipah <= 0) {
            await this.win(logCb, resolveCb, profile);
        } else {
            await this.enemyTurn(logCb, resolveCb);
        }
        refreshCb();
    }

    static async tryRedeem(logCb, refreshCb, resolveCb) {
        logCb("You channel pure Daat (Focus) to sift the spark...");
        await this.wait(800);
        
        const S = StateRegister.EnemyStats;
        const profile = resolveEnemy(StateRegister.DialogBankId);
        
        const hpRatio = S.klipah / S.maxKlipah;
        let catchChance = 1.0 - hpRatio; 
        
        if (profile.alignment === 'NOGAH') catchChance += 0.3;
        if (profile.alignment === 'KLIPAH') catchChance -= 0.2;

        const gMod = GarmentLedger[StateRegister.Equipment.garment]?.statMod || { daat:0 };
        const daat = StateRegister.EtzChaim.DAAT + gMod.daat;
        catchChance += (StateRegister.EtzChaim.YESOD * 0.05) + (daat * 0.02);

        if (Math.random() < catchChance || catchChance >= 1) {
            logCb(`SUCCESS! The spark of ${profile.label} is redeemed and bound to your soul!`);
            window.dispatchEvent(new Event('awtsmoos-battle-enemy-vanquished')); 
            await this.wait(2000);
            
            this._addItemToBag(`${profile.name}_ESSENCE`);
            
            // Notify Shlichus Manager!
            ShlichusManager.evaluateProgress('DEFEAT_ENEMY', profile.name);

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

    static async win(logCb, resolveCb, profile) {
        const xp = StateRegister.EnemyStats.yieldXp;
        const enemyId = StateRegister.DialogBankId;
        
        logCb(`The Klipah shatters into nothingness! Released ${xp} sparks!`);
        
        const possibleLoot = EnemyLootTable[enemyId] ||[];
        if (possibleLoot.length > 0 && Math.random() < 0.7) {
            const itemId = possibleLoot[Math.floor(Math.random() * possibleLoot.length)];
            this._addItemToBag(itemId);
            logCb(`Redeemed item: ${itemId.replace('_', ' ')}!`);
        }

        // Notify Shlichus Manager!
        ShlichusManager.evaluateProgress('DEFEAT_ENEMY', profile.name);

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
        
        const rawEnemyDmg = 10 + ((StateRegister.EnemyStats.level || 1) * 6);
        
        const gMod = GarmentLedger[StateRegister.Equipment.garment]?.statMod || { binah:0 };
        const wMod = WeaponLedger[StateRegister.Equipment.weapon]?.statMod || { defense:0 };
        
        const binah = StateRegister.EtzChaim.BINAH + gMod.binah;
        const weaponDef = wMod.defense;
        
        const totalDefense = (binah * 2) + weaponDef + (StateRegister.EtzChaim.NETZACH * 2);
        
        let finalDmg = rawEnemyDmg - totalDefense;
        if (finalDmg < 1) finalDmg = 1; 
        
        if (totalDefense > rawEnemyDmg * 0.8) {
            logCb(`Your Binah (Understanding) shields you! Only taking ${finalDmg} damage!`);
        } else {
            logCb(`You are struck for ${finalDmg} damage!`);
        }

        StateRegister.HeroStats.light -= finalDmg;
        window.dispatchEvent(new Event('awtsmoos-battle-update'));
        
        if (StateRegister.HeroStats.light <= 0) {
            await this.wait(1000);
            logCb("Your light is depleted. The vessel shatters. Retreating...");
            await this.wait(2000);
            resolveCb(true);
        }
    }

    static wait(ms) { return new Promise(r => setTimeout(r, ms)); }
}
