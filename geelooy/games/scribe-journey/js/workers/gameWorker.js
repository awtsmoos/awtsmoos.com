// js/workers/gameWorker.js

import { createDefaultGameState } from '../data/database.js';
import * as World from './world.js';
import * as Combat from './combat.js';
import * as Quests from './quests.js';

let GAME_STATE = {};
const GAME_LOOP_INTERVAL = 1000 / 60; // 60 FPS

// --- Communication Helpers ---
const sendToMain = (action, payload) => self.postMessage({ action, payload });
const sendUIUpdate = (payload) => sendToMain('uiUpdate', payload);
const sendToast = (message, type) => sendToMain('toast', { message, type });

// --- Game Loop ---
function gameLoop() {
    const now = performance.now();
    if (GAME_STATE.mode === 'game') {
        World.update(GAME_STATE, now);
    }
    sendToMain('gameStateUpdate', { state: GAME_STATE });
}

const trigger = {
    startBattle: (opponentData, context) => {
        GAME_STATE.mode = 'battle';
        Combat.initiate(GAME_STATE, opponentData, context, sendUIUpdate);
    },
    endBattle: (isWin) => {
        Combat.end(GAME_STATE, isWin, sendUIUpdate, trigger);
        GAME_STATE.mode = 'game'; // Return to game mode
    },
    startDialogue: (entity) => {
        World.startDialogue(GAME_STATE, entity, sendUIUpdate);
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
            if (GAME_STATE.dialogue.active) {
                if(payload.action === 'confirm') World.advanceDialogue(GAME_STATE, sendUIUpdate, trigger);
            } else if (GAME_STATE.mode === 'game') {
                World.handleInput(GAME_STATE, payload, trigger);
            }
            break;
        case 'dialogueChoice':
             World.handleDialogueChoice(GAME_STATE, payload.index, sendUIUpdate, trigger);
             break;
        case 'battleAction':
             Combat.handleAction(GAME_STATE, payload, sendUIUpdate, trigger);
             break;
        case 'uiAction':
             handleUIAction(payload);
             break;
    }
};

function handleUIAction({ action }) {
    switch (action) {
        case 'newGame':
            GAME_STATE = createDefaultGameState();
            GAME_STATE.mode = 'game';
            sendUIUpdate({ screen: 'game' });
            // Start the opening dialogue
            trigger.startDialogue({
                dialogue: GAME_STATE.maps.malkuth_village.interactables['start_sequence'].dialogue
            });
            break;
        case 'resume':
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