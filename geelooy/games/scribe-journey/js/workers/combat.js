// B"H
// js/workers/combat.js
import * as Quests from './quests.js';

let BATTLE_STATE = {};

function getMusagInstance(state, source) {
    const base = state.db.musagim[source.id];
    if (!base) {
        console.error(`Musag ID not found in database: ${source.id}`);
        return null;
    }
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
        id: source.id,
        maxHp: stats.hp,
        currentHp: source.currentHp || stats.hp,
        maxKavanah: 20 + Math.floor(level / 2),
        currentKavanah: source.currentKavanah || (20 + Math.floor(level / 2)),
        stats,
    };
}

export function initiate(state, opponentData, context, sendUIUpdate) {
    const playerInstance = getMusagInstance(state, state.player.team[0]);
    const opponentInstance = getMusagInstance(state, opponentData[0]);

    if (!playerInstance || !opponentInstance) {
        console.error("Failed to create battle participants.");
        return;
    }

    state.battle = BATTLE_STATE = {
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
        
        if (BATTLE_STATE.winner) {
            trigger.endBattle(BATTLE_STATE.winner === 'player');
            return;
        }

        if (BATTLE_STATE.turn === 'player') {
            showActionMenu(sendUIUpdate);
        } else {
            runOpponentTurn(state, sendUIUpdate, trigger);
        }
        return;
    }

    if (BATTLE_STATE.awaitingConfirm || BATTLE_STATE.turn !== 'player') return;

    switch(data.action) {
        case 'fight':
            showMovesMenu(state, sendUIUpdate);
            break;
        case 'back':
            showActionMenu(sendUIUpdate);
            break;
        case 'move':
            executeTurn(state, data.value, false, sendUIUpdate, trigger);
            break;
    }
}

function executeTurn(state, moveId, isOpponent, sendUIUpdate, trigger) {
    const attacker = isOpponent ? BATTLE_STATE.opponent : BATTLE_STATE.player;
    const defender = isOpponent ? BATTLE_STATE.player : BATTLE_STATE.opponent;
    const move = state.db.moves[moveId];

    if (attacker.currentKavanah < move.cost) {
        BATTLE_STATE.log = `${attacker.name} doesn't have enough Kavanah!`;
        BATTLE_STATE.awaitingConfirm = true;
        BATTLE_STATE.turn = isOpponent ? 'player' : 'opponent';
        sendUIUpdate({ battle: getBattleUIPayload() });
        return;
    }
    
    attacker.currentKavanah -= move.cost;
    let damage = Math.max(1, Math.floor(move.power + attacker.stats.attack - (defender.stats.defense / 2)));
    defender.currentHp = Math.max(0, defender.currentHp - damage);

    BATTLE_STATE.log = `${attacker.name} used ${move.name}! It dealt ${damage} damage.`;
    BATTLE_STATE.awaitingConfirm = true;

    if (defender.currentHp <= 0) {
        BATTLE_STATE.log += `\n${defender.name} has been refuted!`;
        BATTLE_STATE.winner = isOpponent ? 'opponent' : 'player';
    } else {
        BATTLE_STATE.turn = isOpponent ? 'player' : 'opponent';
    }

    sendUIUpdate({ battle: getBattleUIPayload() });
}

function runOpponentTurn(state, sendUIUpdate, trigger) {
    const opponent = BATTLE_STATE.opponent;
    const validMoves = opponent.moves.filter(id => state.db.moves[id].cost <= opponent.currentKavanah);
    
    const moveId = validMoves.length > 0
        ? validMoves[Math.floor(Math.random() * validMoves.length)]
        : opponent.moves[0];

    setTimeout(() => executeTurn(state, moveId, true, sendUIUpdate, trigger), 500);
}

// Cleans up and ends the battle
// FIX: Receive sendToast as a direct argument
export function end(state, isWin, sendUIUpdate, sendToast, trigger) {
    if (isWin) {
        const xpGain = BATTLE_STATE.opponent.xpYield;
        // TODO: Add XP and money logic to state.player
        
        // FIX: Call sendToast directly
        sendToast(`You won! Gained ${xpGain} XP.`, 'success');
        Quests.updateObjective(state, { type: 'defeat', musagId: BATTLE_STATE.opponent.id, count: 1 });
    } else {
        // FIX: Call sendToast directly
        sendToast(`You were defeated...`, 'error');
    }
    
    const playerInBattle = BATTLE_STATE.player;
    const playerInTeam = state.player.team.find(m => m.id === playerInBattle.id);
    if (playerInTeam) {
        playerInTeam.currentHp = playerInBattle.currentHp;
        playerInTeam.currentKavanah = playerInBattle.currentKavanah;
    }
    
    state.battle = { active: false };
    state.mode = 'game';
    sendUIUpdate({ screen: 'game' });
}

// --- UI Menu Generation ---
function showActionMenu(sendUIUpdate) {
    sendUIUpdate({ battle: getBattleUIPayload(true, [
        { action: 'fight', text: 'Debate' },
        { action: 'item', text: 'Items', disabled: true },
        { action: 'team', text: 'Shem', disabled: true },
        { action: 'flee', text: 'Concede' },
    ])});
}

function showMovesMenu(state, sendUIUpdate) {
    const player = BATTLE_STATE.player;
    const buttons = player.moves.map(id => {
        const move = state.db.moves[id];
        return {
            action: 'move', value: id, text: `${move.name} (${move.cost} Kav)`,
            disabled: player.currentKavanah < move.cost,
        };
    });
    buttons.push({ action: 'back', text: 'Back' });
    sendUIUpdate({ battle: getBattleUIPayload(true, buttons) });
}


function getBattleUIPayload(withMenu = false, buttons = []) {
    const payload = {
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
    if (withMenu) {
        payload.menu = { buttons };
        payload.log = null;
    }
    return payload;
}