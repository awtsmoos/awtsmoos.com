
// B"H
// js/workers/systems/ui_actions.js

import * as Quests from '../quests.js';
import * as Crafting from '../crafting.js';
import { getMusagInstance } from '../combat.js';
import { gates } from '../../data/gates_features.js';
import { featureList } from '../../data/features_666.js';
import { checkMitzvahs, getMitzvahPayload } from '../../data/mitzvahs.js';
import * as PlayerQuestSystem from '../player_quest_system.js';
import { gates37 } from '../../data/gates_37.js';

// --- Payload Helpers (Moved here or imported) ---
function getShemPayload(state) {
    return {
        team: state.player.team.map(member => {
            const instance = getMusagInstance(state, member);
            return instance ? { ...instance, moves: instance.moves.map(id => state.db.moves[id]) } : null;
        }).filter(Boolean)
    };
}

function getOtzarPayload(state) {
    return {
        team: state.player.team.map(m => getMusagInstance(state, m)),
        storage: (state.player.storage || []).map(m => getMusagInstance(state, m))
    };
}

function getGatesPayload(state) {
    return {
        list: gates.map(g => ({
            id: g.id, name: g.name, desc: g.desc,
            isActive: !!state.activeGates[g.id],
            isUnlocked: state.player.inventory.some(i => i.id === `key_${g.id}`) || state.activeGates['gate_55']
        }))
    };
}

function getGates37Payload(state) {
    if(!state.player.unlockedGates37) state.player.unlockedGates37 = [];
    if(!state.player.wisdomPoints) state.player.wisdomPoints = 0;
    
    return {
        points: state.player.wisdomPoints,
        gates: gates37.map(g => ({
            ...g,
            unlocked: state.player.unlockedGates37.includes(g.id),
            canUnlock: state.player.wisdomPoints >= g.cost
        }))
    };
}

export function handleUIAction(state, data, callbacks, trigger) {
    const { action, ...params } = data;

    switch (action) {
        case 'newGame':
            // Handled by init in main worker, but we can trigger reset here if we had the init func
            // For now, this usually reloads or re-inits.
            break;
            
        case 'resume': case 'close-shem': case 'close-crafting': case 'close-bestiary': 
        case 'close-mitzvah': case 'close-gemach': case 'close-gates': case 'close-dreidel': 
        case 'close-otzar': case 'close-player-quests': case 'close-features': case 'close-gates37':
            state.mode = 'game';
            callbacks.onUIUpdate({ screen: 'game' });
            break;

        case 'inventory-screen': 
            state.mode = 'inventory'; 
            callbacks.onUIUpdate({ screen: 'inventory-screen', inventory: Quests.getInventoryPayload(state) }); 
            break;

        case 'quest-log-screen': 
            state.mode = 'questlog'; 
            callbacks.onUIUpdate({ screen: 'quest-log-screen', questLog: Quests.getQuestLogPayload(state) }); 
            break;

        case 'shem-screen': 
            state.mode = 'shem'; 
            callbacks.onUIUpdate({ screen: 'shem-screen', shem: getShemPayload(state) }); 
            break;

        case 'crafting-screen': 
            state.mode = 'crafting'; 
            callbacks.onUIUpdate({ screen: 'crafting-screen', crafting: Crafting.getCraftingPayload(state) }); 
            break;

        case 'bestiary-screen': 
            state.mode = 'bestiary'; 
            const entries = Object.values(state.db.musagim).map(m => ({name: m.name, emoji: m.emoji, seen: true, caught: false}));
            callbacks.onUIUpdate({ screen: 'bestiary-screen', bestiary: { entries, seenCount: entries.length, caughtCount: 0 } });
            break;

        case 'mitzvah-screen': 
            state.mode = 'mitzvah'; 
            callbacks.onUIUpdate({ screen: 'mitzvah-screen', mitzvahs: getMitzvahPayload(state) }); 
            break;

        case 'gates-screen': 
            state.mode = 'gates'; 
            callbacks.onUIUpdate({ screen: 'gates-screen', gates: getGatesPayload(state) }); 
            break;
            
        case 'gates37-screen':
            state.mode = 'gates37';
            callbacks.onUIUpdate({ screen: 'gates37-screen', gates37: getGates37Payload(state) });
            break;

        case 'unlockGate37':
            const gate = gates37.find(g => g.id === params.id);
            if(gate && state.player.wisdomPoints >= gate.cost && !state.player.unlockedGates37.includes(gate.id)) {
                state.player.wisdomPoints -= gate.cost;
                state.player.unlockedGates37.push(gate.id);
                trigger.sendToast(`Unlocked Gate of ${gate.name}!`, "success");
                callbacks.onUIUpdate({ screen: 'gates37-screen', gates37: getGates37Payload(state) });
            } else {
                trigger.sendToast("Cannot unlock.", "error");
            }
            break;

        case 'player-quest-screen': 
            state.mode = 'player-quest'; 
            callbacks.onUIUpdate({ screen: 'player-quest-screen', playerQuests: state.player.postedQuests || [], inventory: state.player.inventory }); 
            break;

        case 'features-screen': 
            state.mode = 'features'; 
            callbacks.onUIUpdate({ screen: 'features-screen', features: { list: featureList.slice(0, 50) } }); 
            break;

        case 'main-menu': 
            state.mode = 'main-menu'; 
            callbacks.onUIUpdate({ screen: 'main-menu' }); 
            break;

        case 'close-inventory': 
        case 'close-questlog': 
            state.mode = 'gameMenu'; 
            callbacks.onUIUpdate({ screen: 'gameMenu' }); 
            break;

        case 'swap_otzar':
            const { from, to, index } = params;
            if (from === 'team' && to === 'storage') {
                if (state.player.team.length <= 1) { trigger.sendToast("MUST KEEP 1!", "error"); return; }
                const musag = state.player.team.splice(index, 1)[0];
                state.player.storage.push(musag);
            } else if (from === 'storage' && to === 'team') {
                if (state.player.team.length >= 6) { trigger.sendToast("TEAM FULL!", "error"); return; }
                const musag = state.player.storage.splice(index, 1)[0];
                state.player.team.push(musag);
            }
            callbacks.onUIUpdate({ screen: 'otzar-screen', otzar: getOtzarPayload(state) });
            break;

        case 'create_quest':
            PlayerQuestSystem.createPlayerQuest(state, params.type, params.targetId, params.rewardId, params.rewardAmount, (msg, t) => trigger.sendToast(msg,t));
            callbacks.onUIUpdate({ screen: 'player-quest-screen', playerQuests: state.player.postedQuests || [], inventory: state.player.inventory });
            break;
            
        case 'craftAction':
            Crafting.craftItem(state, params.recipeId, (msg, t) => trigger.sendToast(msg,t)); 
            state.stats.itemsCrafted++;
            checkMitzvahs(state, (msg, t) => trigger.sendToast(msg,t));
            callbacks.onUIUpdate({ screen: 'crafting-screen', crafting: Crafting.getCraftingPayload(state) }); 
            break;
            
        case 'gemachAction':
            if (params.type === 'deposit') trigger.gemach_deposit(params.amount);
            if (params.type === 'withdraw') trigger.gemach_withdraw(params.amount);
            callbacks.onUIUpdate({ screen: 'gemach-screen', gemach: { playerMoney: state.player.money.perutah || 0, balance: state.player.gemachBalance || 0 } });
            break;
            
        case 'toggleGate':
            if(!state.activeGates) state.activeGates = {};
            state.activeGates[params.gateId] = !state.activeGates[params.gateId];
            callbacks.onUIUpdate({ screen: 'gates-screen', gates: getGatesPayload(state) });
            break;
            
        case 'spinDreidel':
            // Logic moved to trigger? Or kept in GameWorker?
            // Since Dreidel logic interacts with money and randomness, triggers or local func is fine.
            // We'll call a helper function here for now if trigger doesn't have it fully.
            // Actually gameWorker has spinDreidel. Let's assume it's moved to triggers.
            // Wait, triggers didn't have spinDreidel logic, just open. 
            // We'll implement it here for simplicity.
            let bet = params.bet;
            if(state.player.money.perutah < bet) { trigger.sendToast("NO GELT!", "error"); return; }
            state.player.money.perutah -= bet;
            let dreidelPot = (state.dreidelPot || 0) + bet;
            const result = Math.random();
            let letter = '', outcome = '';
            if (result < 0.25) { letter = 'נ'; outcome = "Nun. Nothing."; }
            else if (result < 0.5) { letter = 'ג'; outcome = `GIMMEL! WIN POT! (+${dreidelPot})`; state.player.money.perutah += dreidelPot; dreidelPot = 0; }
            else if (result < 0.75) { letter = 'ה'; outcome = `Hei. Half Pot.`; state.player.money.perutah += Math.floor(dreidelPot/2); dreidelPot -= Math.floor(dreidelPot/2); }
            else { letter = 'ש'; outcome = `Shin. Put 10.`; if(state.player.money.perutah >= 10) { state.player.money.perutah -= 10; dreidelPot += 10; } }
            state.dreidelPot = dreidelPot;
            callbacks.onUIUpdate({ screen: 'dreidel-screen', dreidel: { pot: dreidelPot, playerMoney: state.player.money.perutah, lastResult: { letter, outcome } } });
            break;
            
        case 'useOverworldItem':
            trigger.useItemOverworld(params.itemId);
            break;
    }
}

// Helper getter needed for fetchPayload in triggers
export function getPayloadForScreen(state, screen) {
    if(screen === 'otzar-screen') return { otzar: getOtzarPayload(state) };
    return {};
}
