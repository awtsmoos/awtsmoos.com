// B"H
// js/workers/gameWorker.js

import { createDefaultGameState } from '../data/database.js';
import * as World from './world.js';
import * as Combat from './combat.js';
import * as Quests from './quests.js';

let GAME_STATE = {};
const GAME_LOOP_INTERVAL = 1000 / 60;

const sendToMain = (action, payload) => self.postMessage({ action, payload });
const sendUIUpdate = (payload) => sendToMain('uiUpdate', payload);
const sendToast = (message, type) => sendToMain('toast', { message, type });

function gameLoop() {
    const now = performance.now();
    if (GAME_STATE.mode === 'game') {
        World.update(GAME_STATE, now, trigger);
    }
    sendToMain('gameStateUpdate', { state: GAME_STATE });
}

const trigger = {
    startBattle: (opponentData, context = {}) => {
        GAME_STATE.mode = 'battle';
        Combat.initiate(GAME_STATE, opponentData, context, sendUIUpdate);
    },
    endBattle: (isWin) => {
        Combat.end(GAME_STATE, isWin, sendUIUpdate, sendToast, trigger);
    },
    startDialogue: (entity, startingBranch = 'start') => {
        World.startDialogue(GAME_STATE, entity, startingBranch, sendUIUpdate);
    },
    acceptQuest: (questId) => Quests.accept(GAME_STATE, questId, sendToast),
    finalizeQuest: (questId) => Quests.finalize(GAME_STATE, questId, sendToast),
};

self.onmessage = (e) => {
    const { action, payload } = e.data;
    switch (action) {
        case 'init':
            GAME_STATE = createDefaultGameState();
            GAME_STATE.mode = 'main-menu';
            sendUIUpdate({ screen: 'main-menu' });
            setInterval(gameLoop, GAME_LOOP_INTERVAL);
            break;
        case 'input':
            if (payload.type === 'keyState') {
                if (GAME_STATE.mode === 'game') { World.handleKeyState(GAME_STATE, payload.keys); }
            } else if (payload.type === 'press' && payload.key === 'Confirm') {
                if (GAME_STATE.dialogue.active) { World.advanceDialogue(GAME_STATE, sendUIUpdate, trigger); } 
                else if (GAME_STATE.mode === 'game') { World.checkInteraction(GAME_STATE, trigger, sendUIUpdate); } 
                else if (GAME_STATE.mode === 'battle' && GAME_STATE.battle.awaitingConfirm) { Combat.handleAction(GAME_STATE, { action: 'confirm' }, sendUIUpdate, trigger); }
            }
            break;
        case 'dialogueChoice': World.handleDialogueChoice(GAME_STATE, payload.index, sendUIUpdate, trigger); break;
        case 'battleAction': Combat.handleAction(GAME_STATE, payload, sendUIUpdate, trigger); break;
        case 'uiAction': handleUIAction(payload); break;
    }
};

function getShemPayload(state) {
    return {
        team: state.player.team.map(member => {
            const instance = Combat.getMusagInstance(state, member);
            return {
                ...instance,
                currentHp: member.currentHp,
                currentKavanah: member.currentKavanah,
                moves: instance.moves.map(id => state.db.moves[id])
            };
        })
    };
}


function handleUIAction({ action }) {
    switch (action) {
        case 'newGame':
            GAME_STATE = createDefaultGameState();
            GAME_STATE.mode = 'game';
            sendUIUpdate({ screen: 'game' });
            setTimeout(() => {
                const startEntity = GAME_STATE.maps.malkuth_village.interactables['start_sequence'];
                trigger.startDialogue(startEntity);
            }, 500);
            break;
        case 'resume':
        case 'close-shem': // New action to close the Shem screen
            GAME_STATE.mode = 'game';
            sendUIUpdate({ screen: 'game' });
            break;
        case 'inventory-screen':
            GAME_STATE.mode = 'inventory';
            sendUIUpdate({ screen: 'inventory-screen', inventory: Quests.getInventoryPayload(GAME_STATE) });
            break;
        case 'quest-log-screen':
            GAME_STATE.mode = 'questlog';
            sendUIUpdate({ screen: 'quest-log-screen', questLog: Quests.getQuestLogPayload(GAME_STATE) });
            break;
        case 'shem-screen': // New action to open the Shem screen
            GAME_STATE.mode = 'shem';
            sendUIUpdate({ screen: 'shem-screen', shem: getShemPayload(GAME_STATE) });
            break;
        case 'main-menu':
            GAME_STATE.mode = 'main-menu';
            sendUIUpdate({ screen: 'main-menu' });
            break;
        case 'close-inventory':
        case 'close-questlog':
            GAME_STATE.mode = 'gameMenu';
            sendUIUpdate({ screen: 'gameMenu' });
            break;
    }
}