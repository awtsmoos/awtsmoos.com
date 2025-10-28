// B"H
// js/workers/combat.js
import * as Quests from './quests.js';

let BATTLE_STATE = {};

function getMusagInstance(state, source) {
    const base = state.db.musagim[source.id];
    const level = source.level;
    const stats = {
        hp: Math.floor(base.baseStats.hp * (1 + level / 20)),
        attack: Math.floor(base.baseStats.attack * (1 + level / 20)),
        defense: Math.floor(base.baseStats.defense * (1 + level / 20)),
        diligence: Math.floor(base.baseStats.diligence * (1 + level / 20)),
    };
    return {
        ...base,
        level,
        maxHp: stats.hp,
        currentHp: source.currentHp || stats.hp,
        maxKavanah: 20 + Math.floor(level / 2),
        currentKavanah: source.currentKavanah || (20 + Math.floor(level / 2)),
        stats,
        id: source.id,
    };
}

export function initiate(state, opponentData, context, sendUIUpdate) {
    const playerInstance = getMusagInstance(state, state.player.team[0]);
    const opponentInstance = getMusagInstance(state, opponentData[0]);

    BATTLE_STATE = {
        player: playerInstance,
        opponent: opponentInstance,
        turn: 'player',
        log: `${opponentInstance.name} appears!`,
        awaitingConfirm: true,
        context,
    };
    sendUIUpdate({ screen: 'battle', battle: getBattleUIPayload() });
}

export function handleAction(state, data, sendUIUpdate, trigger) {
    if (BATTLE_STATE.awaitingConfirm && data.action === 'confirm') {
        BATTLE_STATE.awaitingConfirm = false;
        if (BATTLE_STATE.turn === 'player') showActionMenu(sendUIUpdate);
        else runOpponentTurn(state, sendUIUpdate, trigger);
        return;
    }

    if(BATTLE_STATE.turn !== 'player' || BATTLE_STATE.awaitingConfirm) return;

    if (data.action === 'fight') showMovesMenu(sendUIUpdate);
    if (data.action === 'back') showActionMenu(sendUIUpdate);
    if (data.action === 'move') executeTurn(state, data.value, false, sendUIUpdate, trigger);
}

function executeTurn(state, moveId, isOpponent, sendUIUpdate, trigger) {
    const attacker = isOpponent ? BATTLE_STATE.opponent : BATTLE_STATE.player;
    const defender = isOpponent ? BATTLE_STATE.player : BATTLE_STATE.opponent;
    const move = state.db.moves[moveId];

    if (attacker.currentKavanah < move.cost) {
        BATTLE_STATE.log = `${attacker.name} doesn't have enough Kavanah!`;
        BATTLE_STATE.awaitingConfirm = true;
        sendUIUpdate({ battle: getBattleUIPayload() });
        return;
    }
    
    attacker.currentKavanah -= move.cost;
    let damage = Math.max(1, Math.floor(move.power + attacker.stats.attack - (defender.stats.defense / 2)));
    defender.currentHp = Math.max(0, defender.currentHp - damage);

    BATTLE_STATE.log = `${attacker.name} used ${move.name}! It dealt ${damage} damage.`;
    BATTLE_STATE.awaitingConfirm = true;

    // Check for fainted
    if (defender.currentHp <= 0) {
        BATTLE_STATE.log += `\n${defender.name} has been refuted!`;
        setTimeout(() => trigger.endBattle(!isOpponent), 1500); // End battle after a delay
    } else {
        BATTLE_STATE.turn = isOpponent ? 'player' : 'opponent';
    }

    sendUIUpdate({ battle: getBattleUIPayload() });
}

function runOpponentTurn(state, sendUIUpdate, trigger) {
    const opponent = BATTLE_STATE.opponent;
    const validMoves = opponent.moves.filter(id => state.db.moves[id].cost <= opponent.currentKavanah);
    const moveId = validMoves[Math.floor(Math.random() * validMoves.length)];
    executeTurn(state, moveId, true, sendUIUpdate, trigger);
}

export function end(state, isWin, sendUIUpdate) {
    if (isWin) {
        const xpGain = BATTLE_STATE.opponent.xpYield;
        // ... add XP and money to state.player
        sendToMain('toast', { message: `You won! Gained ${xpGain} XP.`, type: 'success' });
        Quests.updateObjective(state, { type: 'defeat', musagId: BATTLE_STATE.opponent.id, count: 1 });
    } else {
        sendToMain('toast', { message: `You were defeated...`, type: 'error' });
    }
    
    // Update player team stats from battle state
    const playerInBattle = BATTLE_STATE.player;
    const playerInTeam = state.player.team.find(m => m.id === playerInBattle.id);
    playerInTeam.currentHp = playerInBattle.currentHp;
    playerInTeam.currentKavanah = playerInBattle.currentKavanah;

    BATTLE_STATE = { active: false };
    sendUIUpdate({ screen: 'game' });
}

function showActionMenu(sendUIUpdate) {
    sendUIUpdate({ battle: { menu: {
        buttons: [
            { action: 'fight', text: 'Debate' },
            { action: 'item', text: 'Items' },
            { action: 'team', text: 'Shem' },
            { action: 'flee', text: 'Concede' },
        ]
    }}});
}

function showMovesMenu(sendUIUpdate) {
    sendUIUpdate({ battle: { menu: {
        buttons: BATTLE_STATE.player.moves.map(id => ({
            action: 'move',
            value: id,
            text: state.db.moves[id].name,
            disabled: BATTLE_STATE.player.currentKavanah < state.db.moves[id].cost,
        })).concat({ action: 'back', text: 'Back' })
    }}});
}


function getBattleUIPayload() {
    return {
        log: BATTLE_STATE.log,
        awaitingConfirm: BATTLE_STATE.awaitingConfirm,
        player: {
            name: BATTLE_STATE.player.name, level: BATTLE_STATE.player.level, emoji: BATTLE_STATE.player.emoji,
            hpPercent: (BATTLE_STATE.player.currentHp / BATTLE_STATE.player.maxHp) * 100,
            kavanahPercent: (BATTLE_STATE.player.currentKavanah / BATTLE_STATE.player.maxKavanah) * 100,
        },
        opponent: {
            name: BATTLE_STATE.opponent.name, level: BATTLE_STATE.opponent.level, emoji: BATTLE_STATE.opponent.emoji,
            hpPercent: (BATTLE_STATE.opponent.currentHp / BATTLE_STATE.opponent.maxHp) * 100,
        }
    };
}