
// B"H
// js/workers/systems/triggers.js

import * as Combat from '../combat.js';
import * as Quests from '../quests.js';
import * as World from '../world.js';
import { checkMitzvahs } from '../../data/mitzvahs.js';
import * as CalendarSystem from './calendar.js';

export function createTriggers(GAME_STATE, callbacks) {
    const trigger = {
        sendToast: (msg, type) => callbacks.onToast({ message: msg, type }),
        
        startBattle: (opponentData, context = {}) => {
            if(GAME_STATE.gateEffects?.combat?.autoWin) {
                callbacks.onToast({ message: "PACIFIST CRUSH: Enemy Annihilated.", type: "success" });
                callbacks.onUIUpdate({ fx: { type: 'particles', amount: 50, color: '#f0f' } });
                return;
            }
            GAME_STATE.mode = 'battle';
            Combat.initiate(GAME_STATE, opponentData, context, callbacks.onUIUpdate);
        },

        endBattle: (isWin) => {
            Combat.end(GAME_STATE, isWin, callbacks.onUIUpdate, (msg, type) => callbacks.onToast({message:msg, type:type}), trigger);
            if(isWin) {
                GAME_STATE.stats.battlesWon++;
                callbacks.onUIUpdate({ fx: { type: 'particles', amount: 100, color: '#0f0' } }); 
                checkMitzvahs(GAME_STATE, (msg, type) => callbacks.onToast({message:msg, type:type}));
            }
        },

        startDialogue: (entity, startingBranch = 'start') => {
            World.startDialogue(GAME_STATE, entity, startingBranch, callbacks.onUIUpdate);
        },

        openGemach: () => {
            GAME_STATE.mode = 'gemach';
            callbacks.onUIUpdate({ screen: 'gemach-screen', gemach: { playerMoney: GAME_STATE.player.money.perutah || 0, balance: GAME_STATE.player.gemachBalance || 0 } });
        },

        acceptQuest: (questId) => Quests.accept(GAME_STATE, questId, (msg, type) => callbacks.onToast({message:msg, type:type})),
        finalizeQuest: (questId) => Quests.finalize(GAME_STATE, questId, (msg, type) => callbacks.onToast({message:msg, type:type})),

        playDreidel: () => {
            GAME_STATE.mode = 'dreidel';
            callbacks.onUIUpdate({ screen: 'dreidel-screen', dreidel: { pot: 0, playerMoney: GAME_STATE.player.money.perutah || 0 } });
        },

        smash_idol: (id) => {
            const mapId = GAME_STATE.currentMapId;
            
            // Logic to mark as deleted in mapChanges
            if(!GAME_STATE.player.mapChanges[mapId]) GAME_STATE.player.mapChanges[mapId] = {};
            
            // We need to find the key for this idol. 
            // In a real scenario, the entity calling this would pass its key.
            // For now, we scan the active map cache in gameWorker (accessed via state context if we had it, or we infer).
            // Simplified: The interaction logic in World passes the key, we should update World to pass key to trigger.
            // For now, assumes gameWorker handles the map cache invalidation via the 'action' loop or we just give the item.
            
            Quests.giveItem(GAME_STATE, `idol_fragment_${id}`);
            GAME_STATE.lightLevel = Math.min(1000, GAME_STATE.lightLevel + 150);
            callbacks.onToast({ message: `SMASHED IDOL #${id}!`, type: 'success' });
            callbacks.onUIUpdate({ fx: { type: 'shake' } });
        },

        useItemOverworld: (itemId) => {
            const item = GAME_STATE.db.items[itemId];
            if(!item) return;
            const idx = GAME_STATE.player.inventory.findIndex(i => i.id === itemId);
            if(idx === -1) return;

            if (item.type === 'consumable') {
                GAME_STATE.player.inventory.splice(idx, 1);
                if(item.effect.type === 'restore_light') {
                    GAME_STATE.lightLevel = Math.min(1000, GAME_STATE.lightLevel + item.effect.amount);
                    callbacks.onToast({ message: "LIGHT RESTORED!", type: "success" });
                }
                if(item.effect.stat === 'hp') {
                    GAME_STATE.player.team.forEach(m => m.currentHp = Math.min(m.maxHp, m.currentHp + item.effect.amount));
                    callbacks.onToast({ message: "PARTY HEALED!", type: "success" });
                }
                callbacks.onUIUpdate({ screen: 'inventory-screen', inventory: Quests.getInventoryPayload(GAME_STATE) });
            }
        },

        meditate: () => {
            GAME_STATE.player.team.forEach(musag => { musag.currentKavanah = musag.maxKavanah; musag.currentHp = Math.min(musag.maxHp, musag.currentHp + 20); });
            GAME_STATE.lightLevel = Math.min(1000, GAME_STATE.lightLevel + 50);
            callbacks.onToast({ message: "MEDITATION COMPLETE.", type: "info" });
        },

        meditate_ohel: () => {
            GAME_STATE.player.team.forEach(musag => { musag.currentKavanah = musag.maxKavanah; musag.currentHp = musag.maxHp; });
            callbacks.onToast({ message: "OHEL BLESSING RECEIVED.", type: "success" });
        },

        study_daily: () => {
            if(!GAME_STATE.player.flags['studied_today']) {
                GAME_STATE.player.flags['studied_today'] = true;
                GAME_STATE.stats.booksRead = (GAME_STATE.stats.booksRead || 0) + 1;
                GAME_STATE.player.team.forEach(m => m.xp = (m.xp||0) + 50);
                callbacks.onToast({ message: "DAILY TORAH STUDY COMPLETE! +50 XP.", type: "success" });
                checkMitzvahs(GAME_STATE, (msg, type) => callbacks.onToast({message:msg, type:type}));
            } else {
                callbacks.onToast({ message: "REVIEWING STUDIES...", type: "info" });
            }
        },

        read_parsha: () => {
            const parsha = CalendarSystem.getCurrentParsha(GAME_STATE.time.day);
            callbacks.onToast({ message: `READING PARSHAT ${parsha.name.toUpperCase()}.`, type: "success" });
        },

        farbrengen_heal: () => {
            GAME_STATE.player.team.forEach(musag => { musag.currentHp = musag.maxHp; musag.currentKavanah = musag.maxKavanah; musag.stats.diligence += 2; });
            callbacks.onToast({ message: "FARBRENGEN! SOULS ON FIRE!", type: "success" });
        },

        giveRandomItem: (poolName) => {
            let pool = [];
            if(poolName === 'seforim_pool') pool = Object.keys(GAME_STATE.db.items).filter(k => k.startsWith('likkutei_sichos') || k.startsWith('igros'));
            else if (poolName === 'spark_pool') pool = Object.keys(GAME_STATE.db.items).filter(k => k.startsWith('spark_'));
            const randomId = pool[Math.floor(Math.random() * pool.length)];
            if(randomId) {
                Quests.giveItem(GAME_STATE, randomId);
                callbacks.onToast({ message: `FOUND: ${GAME_STATE.db.items[randomId].name}`, type: 'info' });
            }
        },

        teleport: (destination) => {
            GAME_STATE.currentMapId = destination.map;
            GAME_STATE.player.x = destination.x; GAME_STATE.player.y = destination.y;
            GAME_STATE.player.targetX = destination.x; GAME_STATE.player.targetY = destination.y;
            GAME_STATE.player.pixelX = destination.x * 40; GAME_STATE.player.pixelY = destination.y * 40;
            checkMitzvahs(GAME_STATE, (msg, type) => callbacks.onToast({message:msg, type:type}));
        },

        gemach_deposit: (amount) => {
            if((GAME_STATE.player.money.perutah || 0) >= amount) {
                GAME_STATE.player.money.perutah -= amount;
                GAME_STATE.player.gemachBalance = (GAME_STATE.player.gemachBalance || 0) + amount;
                callbacks.onToast({ message: `DEPOSITED ${amount}.`, type: "success" });
                checkMitzvahs(GAME_STATE, (msg, type) => callbacks.onToast({message:msg, type:type}));
            } else { callbacks.onToast({ message: "INSUFFICIENT FUNDS!", type: "error" }); }
        },

        gemach_withdraw: (amount) => {
            if((GAME_STATE.player.gemachBalance || 0) >= amount) {
                GAME_STATE.player.gemachBalance -= amount;
                GAME_STATE.player.money.perutah += amount;
                callbacks.onToast({ message: `WITHDREW ${amount}.`, type: "success" });
            } else { callbacks.onToast({ message: "GEMACH FUNDS LOW.", type: "error" }); }
        },

        openOtzar: () => {
            GAME_STATE.mode = 'otzar';
            // Note: getOtzarPayload needs to be imported or passed. 
            // For simplicity in this split, we'll let the main worker handle UI payload generation 
            // or we'd need to move payload generators to a shared utils file. 
            // We'll invoke a UI update with a flag that GameWorker handles? 
            // No, triggers are authoritative. We need to move getters to a shared place or import them.
            // Let's assume GameWorker handles the specific payload generation in the ui_actions.
            callbacks.onUIUpdate({ screen: 'otzar-screen', fetchPayload: 'otzar' }); 
        }
    };
    return trigger;
}
