
import { StateRegister } from '../binah/StateRegister.js';
import { ShlichusLedger } from './ShlichusLedger.js';
import { GarmentLedger } from '../chochmah/GarmentLedger.js';
import { NiggunimLedger } from '../chochmah/NiggunimLedger.js';
import { WeaponLedger } from '../chochmah/WeaponLedger.js';

/**
 * B"H
 * @class ShlichusManager
 * @chapter The Master of Decrees
 */
export class ShlichusManager {
    
    static assignShlichus(id) {
        if (!StateRegister.ActiveShlichus.includes(id) && !StateRegister.CompletedShlichus.includes(id)) {
            StateRegister.ActiveShlichus.push(id);
            console.log(`B"H - Divine Shlichus Assigned: ${ShlichusLedger[id].title}`);
            window.dispatchEvent(new CustomEvent('awtsmoos-shlichus-update', { detail: 'NEW' }));
        }
    }

    static evaluateProgress(eventType = null, eventDetail = null) {
        const active = StateRegister.ActiveShlichus;
        if (active.length === 0) return;

        active.forEach((id, index) => {
            const quest = ShlichusLedger[id];
            let isComplete = false;

            if (quest.reqType === 'GATHER_ITEM') {
                const item = StateRegister.MaterialBag.find(i => i.id === quest.reqId);
                if (item && item.qty >= quest.reqAmount) isComplete = true;
            } 
            else if (quest.reqType === 'GATHER_TIME_ITEM') {
                if (StateRegister.TimeState.timeOfDay === quest.reqTime) {
                    const item = StateRegister.MaterialBag.find(i => i.id === quest.reqId);
                    if (item && item.qty >= quest.reqAmount) isComplete = true;
                }
            }
            else if (quest.reqType === 'REACH_MAP') {
                if (StateRegister.CurrentMapId === quest.reqId) isComplete = true;
            }
            else if (quest.reqType === 'EQUIP_NIGGUN') {
                if (StateRegister.Equipment.niggun === quest.reqId) isComplete = true;
            }
            else if (quest.reqType === 'DEFEAT_ENEMY' && eventType === 'DEFEAT_ENEMY') {
                // Evaluated explicitly when an enemy is defeated
                if (eventDetail === quest.reqId) {
                    // For now, defeating it once triggers it. Can track tallies later.
                    isComplete = true; 
                }
            }

            if (isComplete) {
                this.completeShlichus(id, index, quest);
            }
        });
    }

    static completeShlichus(id, index, quest) {
        StateRegister.ActiveShlichus.splice(index, 1);
        StateRegister.CompletedShlichus.push(id);
        StateRegister.Gelt += quest.rewardGelt;

        if (quest.rewardItem) {
            if (GarmentLedger[quest.rewardItem]) {
                if (!StateRegister.Outfits.owned.includes(quest.rewardItem)) StateRegister.Outfits.owned.push(quest.rewardItem);
            } else if (NiggunimLedger[quest.rewardItem]) {
                if (!StateRegister.Inventory.niggunim.includes(quest.rewardItem)) StateRegister.Inventory.niggunim.push(quest.rewardItem);
            } else if (WeaponLedger[quest.rewardItem]) {
                if (!StateRegister.Weapons.owned.includes(quest.rewardItem)) StateRegister.Weapons.owned.push(quest.rewardItem);
            } else {
                // Fallback for Sefarim
                if (!StateRegister.Inventory.chassidus) StateRegister.Inventory.chassidus =[];
                if (!StateRegister.Inventory.chassidus.includes(quest.rewardItem)) StateRegister.Inventory.chassidus.push(quest.rewardItem);
            }
        }

        console.log(`B"H - Shlichus Completed: ${quest.title}! Rewarded ${quest.rewardGelt} Gelt and ${quest.rewardItem || 'nothing'}.`);
        window.dispatchEvent(new CustomEvent('awtsmoos-shlichus-update', { detail: 'COMPLETE' }));
    }
}
