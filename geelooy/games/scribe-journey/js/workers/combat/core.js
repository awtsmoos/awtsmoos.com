
// B"H
// js/workers/combat/core.js
import { getMusagInstance, getBattleUIPayload } from './utils.js';
import * as Actions from './actions.js';
import { giveItem, updateObjective } from '../quests.js';
import { checkMitzvahs } from '../../data/mitzvahs.js';
import { TYPE_CHART, getTypeEffectiveness } from '../../data/types.js';
import { evolutions } from '../../data/evolutions.js';
import { debateFx } from './debateEffects.js';

let BATTLE_STATE = {};

export function initiate(state, opponentData, context, sendUIUpdate) {
	const playerInstance = getMusagInstance(state, state.player.team[0]);
    let opponentInstance;
    if (opponentData[0].id === 'yetzer_hara') {
        opponentInstance = JSON.parse(JSON.stringify(playerInstance));
        opponentInstance.name = "Yetzer Hara";
        opponentInstance.emoji = '👤';
        opponentInstance.currentHp = opponentInstance.maxHp;
        opponentInstance.currentKavanah = opponentInstance.maxKavanah;
    } else {
	    opponentInstance = getMusagInstance(state, opponentData[0]);
    }

    if (!playerInstance || !opponentInstance) return;
    
	state.battle = BATTLE_STATE = {
		player: playerInstance,
		opponent: opponentInstance,
		turn: 'player',
		log: `A wild ${opponentInstance.name} appeared!`,
		awaitingConfirm: true,
		context,
        pendingDrops: [],
        pendingRewards: { xp: 0, money: 0 },
        weather: state.weather || 'clear',
        gateEffects: state.gateEffects?.combat || {} // Snapshot effects
	};
    
    // Apply Gate of Joy (Full Kavanah)
    if(state.player.unlockedGates37 && state.player.unlockedGates37.includes('gate_37_10')) {
        playerInstance.currentKavanah = playerInstance.maxKavanah;
        state.battle.log += " (Gate of Joy: Kavanah Restored)";
    }

    if (opponentInstance.id.includes('hellenist') && Math.random() < 0.3) {
        state.battle.log += ` The Greek influence tries to hellenize you!`;
        if (Math.random() < 0.5) {
            playerInstance.status = 'hellenized';
            state.battle.log += ` You are Hellenized!`;
        }
    }

	sendUIUpdate({ 
        screen: 'battle', 
        battle: getBattleUIPayload(BATTLE_STATE, false, [], state),
        dialogue: { active: false } // FIX: Ensure overlapping dialogue is closed
    });
}

export function handleAction(state, data, sendUIUpdate, trigger) {
    if (data.action === 'ultimate') {
        executeUltimate(state, sendUIUpdate);
        return;
    }

    Actions.handlePlayerAction(state, data, sendUIUpdate, {
        ...trigger,
        runOpponentTurn: () => runOpponentTurn(state, sendUIUpdate, trigger),
        useItem: (id) => useItem(state, id, sendUIUpdate)
    }, executeTurn);
}

function executeUltimate(state, sendUIUpdate) {
    const battle = state.battle;
    battle.log = "GATE OF REDEMPTION UNLOCKED!";
    battle.log += "\nTHE GREAT SHOFAR BLOWS!";
    battle.opponent.currentHp = 0;
    battle.winner = 'player';
    battle.awaitingConfirm = true;
    
    sendUIUpdate({ 
        battle: getBattleUIPayload(battle, false, [], state),
        fx: debateFx('bittulCrown', { amount: 500 }) // Intense gold explosion
    });
}

function executeTurn(state, moveId, isOpponent, sendUIUpdate, trigger) {
    const battle = state.battle;
	const attacker = isOpponent ? battle.opponent : battle.player;
	const defender = isOpponent ? battle.player : battle.opponent;
	const move = state.db.moves[moveId];
    const targetTag = isOpponent ? 'player' : 'opponent';
    
    if (attacker.status === 'stun') {
        battle.log = `${attacker.name} is stunned!`;
        attacker.status = null;
        battle.turn = isOpponent ? 'player' : 'opponent';
        sendUIUpdate({ battle: getBattleUIPayload(battle, false, [], state) });
        return;
    }

	if (attacker.currentKavanah < move.cost) {
		battle.log = `${attacker.name} lacks the Kavanah!`;
	} else {
        attacker.currentKavanah -= move.cost;
        const power = move.power || 0;
        let damage = 0;
        let isCrit = false;

        if (power > 0) {
            damage = Math.floor((((2 * attacker.level) / 5 + 2) * power * (attacker.stats.attack / defender.stats.defense)) / 50 + 2);
            
            const typeMult = getTypeEffectiveness(move.type, defender.type);
            damage = Math.floor(damage * typeMult);

            const critChance = 0.0625 + (attacker.stats.diligence / 256);
            if (Math.random() < critChance) {
                damage = Math.floor(damage * 1.5);
                isCrit = true;
            }

            // Apply Gate Modifiers
            if (!isOpponent) { // Player Attacking
                if(battle.gateEffects.damageMult) damage = Math.floor(damage * battle.gateEffects.damageMult);
            } else { // Player Defending
                if(battle.gateEffects.defenseMult) damage = Math.floor(damage / battle.gateEffects.defenseMult); // Higher def mult = less damage
            }

            damage = Math.max(1, damage);
            
            // Gate of Faith: Endure Fatal
            if (!isOpponent && battle.gateEffects.endureFatal && defender.currentHp - damage <= 0 && defender.currentHp > 1) {
                if (!battle.endureUsed) {
                    damage = defender.currentHp - 1;
                    battle.endureUsed = true;
                    battle.log += " (Gate of Faith preserved you!) ";
                }
            }

            defender.currentHp = Math.max(0, defender.currentHp - damage);
            
            sendUIUpdate({ fx: { type: 'floatingText', text: `-${damage}`, style: 'float-damage', x: targetTag } });
            if(isCrit) sendUIUpdate({ fx: { type: 'floatingText', text: 'CRIT!', style: 'float-crit', x: targetTag } });
            sendUIUpdate({ fx: debateFx(isCrit ? 'crit' : 'damage') });
        }
        
        if (move.effect && move.effect.stat === 'inflict_status') {
             // Gate of Silence Check (Immunity)
             if (!isOpponent && battle.gateEffects.immunities && battle.gateEffects.immunities.includes(move.effect.status)) {
                 battle.log += ` (Immune to ${move.effect.status}!)`;
             } else {
                 defender.status = move.effect.status;
                 battle.log += ` ${defender.name} is ${move.effect.status}!`;
                 sendUIUpdate({ fx: { type: 'floatingText', text: move.effect.status, style: 'float-info', x: targetTag } });
             }
        }

        battle.log = `${attacker.name} used ${move.name}!`;
        if (damage > 0) battle.log += ` Dealt ${damage}.`;
    }
    
	battle.awaitingConfirm = true;
    
	if (defender.currentHp <= 0) {
		battle.log += `\n${defender.name} has been refuted!`;
		battle.winner = isOpponent ? 'opponent' : 'player';
	} else {
		battle.turn = isOpponent ? 'player' : 'opponent';
	}
	sendUIUpdate({ battle: getBattleUIPayload(battle, false, [], state) });
}

function runOpponentTurn(state, sendUIUpdate, trigger) {
    const battle = state.battle;
    const moves = battle.opponent.moves;
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    executeTurn(state, randomMove, true, sendUIUpdate, trigger);
}

function useItem(state, itemId, sendUIUpdate) {
    const battle = state.battle;
    const item = state.db.items[itemId];
    const idx = state.player.inventory.findIndex(i => i.id === itemId);
    if(idx > -1) state.player.inventory.splice(idx, 1);

    battle.log = `You used ${item.name}. `;

    if (item.type === 'kli') {
        const catchRate = item.captureRate || 0.5;
        const hpFactor = (battle.opponent.maxHp - battle.opponent.currentHp) / battle.opponent.maxHp;
        const chance = (catchRate * hpFactor) + (Math.random() * 0.2);
        
        if (Math.random() < chance) {
            battle.log += `Captured!`;
            sendUIUpdate({ fx: debateFx('capture') });
            if (state.player.team.length < 6) {
                state.player.team.push({ id: battle.opponent.id, level: battle.opponent.level });
            } else {
                if (!state.player.storage) state.player.storage = [];
                state.player.storage.push({ id: battle.opponent.id, level: battle.opponent.level });
            }
            battle.winner = 'player';
            updateObjective(state, { type: 'defeat', musagId: battle.opponent.id }, null);
        } else {
            battle.log += `Failed!`;
            battle.turn = 'opponent';
        }
    } else if (item.effect) {
        if(item.effect.stat === 'hp') {
            let heal = item.effect.amount;
            if(battle.gateEffects.healMult) heal *= battle.gateEffects.healMult;
            battle.player.currentHp = Math.min(battle.player.maxHp, battle.player.currentHp + heal);
            sendUIUpdate({ fx: { type: 'floatingText', text: `+${Math.floor(heal)}`, style: 'float-heal', x: 'player' } });
        }
        battle.turn = 'opponent';
    }
    
    battle.awaitingConfirm = true;
    sendUIUpdate({ battle: getBattleUIPayload(battle, false, [], state) });
}

export function end(state, isWin, sendUIUpdate, sendToast, trigger) {
    const battle = state.battle;
    
    // FIX: Sync battle state back to player team
    // This ensures damage/energy usage persists after battle.
    if (state.player.team[0] && battle.player) {
        state.player.team[0].currentHp = battle.player.currentHp;
        state.player.team[0].currentKavanah = battle.player.currentKavanah;
    }

    if (isWin) {
        let money = battle.opponent.moneyYield || { perutah: 10 };
        let xpGain = battle.opponent.xpYield || 20;
        
        // Gate Buffs
        if (battle.gateEffects.moneyMult) money.perutah = Math.floor(money.perutah * battle.gateEffects.moneyMult);
        if (battle.gateEffects.xpMult) xpGain = Math.floor(xpGain * battle.gateEffects.xpMult);

        state.player.money.perutah = (state.player.money.perutah || 0) + money.perutah;
        
        // Gain Wisdom Points
        state.player.wisdomPoints = (state.player.wisdomPoints || 0) + 1;

        state.player.team.forEach((member) => {
            member.xp = (member.xp || 0) + xpGain;
            if(member.xp >= member.level * 100) {
                member.level++;
                member.xp = 0;
                sendToast(`${state.db.musagim[member.id].name} Leveled Up!`, 'success');
                sendUIUpdate({ fx: { type: 'levelup' } });
                
                const evolution = evolutions[member.id];
                if (evolution && member.level >= evolution.level) {
                    member.id = evolution.target;
                    sendToast(`Ascended to ${state.db.musagim[member.id].name}!`, 'success');
                }
            }
        });

        if (battle.opponent.drops) {
            battle.opponent.drops.forEach(drop => {
                let chance = drop.chance;
                if(battle.gateEffects.dropMult) chance *= battle.gateEffects.dropMult;
                if (Math.random() < chance) {
                    giveItem(state, drop.itemId, 1, sendToast);
                }
            });
        }
        updateObjective(state, { type: 'defeat', musagId: battle.opponent.id }, sendToast);
    } else if (battle.winner !== 'fled') {
        state.player.currentMapId = 'malkuth_village';
        state.player.x = 5; state.player.y = 8;
        state.player.pixelX = 5*40; state.player.pixelY = 8*40;
        state.player.team.forEach(m => {
            // FIX: Remove currentHp property to force recalculation of max HP on next retrieval
            // This effectively heals the team on respawn properly based on their level.
            delete m.currentHp;
            delete m.currentKavanah;
        }); 
    }

    state.battle = { active: false };
    state.mode = 'game';
    sendUIUpdate({ screen: 'game' });
}
