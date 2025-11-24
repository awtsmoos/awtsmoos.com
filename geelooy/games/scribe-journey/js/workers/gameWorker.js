// B"H
// js/workers/gameWorker.js

import { createDefaultGameState } from '../data/database.js';
import * as World from './world.js';
import * as Combat from './combat.js';
import { getMusagInstance } from './combat.js';
import * as Quests from './quests.js';

let GAME_STATE = {};
let lastTimestamp = 0;

const sendToMain = (action, payload) => self.postMessage({ action, payload });
const sendUIUpdate = (payload) => sendToMain('uiUpdate', payload);
const sendToast = (message, type) => sendToMain('toast', { message, type });

function gameLoop(now) {
    if (!lastTimestamp) lastTimestamp = now;
    const deltaTime = now - lastTimestamp;
    lastTimestamp = now;

    if (GAME_STATE.mode === 'game') {
        World.update(GAME_STATE, now, deltaTime, trigger);
    }
    sendToMain('gameStateUpdate', { state: GAME_STATE });

    self.requestAnimationFrame(gameLoop);
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
            self.requestAnimationFrame(gameLoop);
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
            const instance = getMusagInstance(state, member);
            if (!instance) return null;
            return {
                ...instance,
                moves: instance.moves.map(id => state.db.moves[id])
            };
        }).filter(Boolean)
    };
}

function handleUIAction({ action }) {
    switch (action) {
        case 'newGame':
            GAME_STATE = createDefaultGameState();
            GAME_STATE.mode = 'game';
            sendUIUpdate({ screen: 'game' });
            
            // --- THIS IS THE FIX ---
            // Define the intro dialogue here as a self-contained, temporary entity.
            setTimeout(() => {
                const introEntity = {
                    id: 'start_sequence',
                    dialogue: {
                        start: [
                            "The world feels... fractured, Scribe.",
                            "The Great Sefer is shattered. Its concepts now roam wild as Musagim.",
                            "You must journey through the Sefirot. Find the fragments. Rectify Creation.",
                            "Take this satchel. May your ink flow true.",
                            "end"
                        ]
                    }
                };
                trigger.startDialogue(introEntity);
            }, 500);
            break;

        // ... the rest of the function is unchanged
        case 'resume':
        case 'close-shem': 
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
        case 'shem-screen':
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