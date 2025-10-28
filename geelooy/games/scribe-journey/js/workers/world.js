// B"H
// js/workers/world.js

import { TILE_SIZE, PLAYER_SPEED } from '../data/database.js';
import * as Quests from './quests.js';

let keyState = {};
let dialogueState = { active: false };

export function handleInput(state, payload, trigger) {
    if (payload.keys) keyState = payload.keys;
    if (payload.action === 'confirm') {
        if (dialogueState.active) {
            advanceDialogue(state, trigger);
        } else {
            checkInteraction(state, trigger);
        }
    }
}

export function update(state, now) {
    const p = state.player;
    if (p.isMoving) {
        const elapsed = now - p.moveStartTime;
        if (elapsed >= PLAYER_SPEED) {
            p.isMoving = false;
            p.x = p.targetX;
            p.y = p.targetY;
            p.pixelX = p.x * TILE_SIZE;
            p.pixelY = p.y * TILE_SIZE;
            // Check for encounter on arrival
        } else {
            const progress = elapsed / PLAYER_SPEED;
            p.pixelX = p.startX * TILE_SIZE + (p.targetX - p.startX) * TILE_SIZE * progress;
            p.pixelY = p.startY * TILE_SIZE + (p.targetY - p.startY) * TILE_SIZE * progress;
        }
        return;
    }

    if (dialogueState.active) return;

    let dx = 0, dy = 0;
    let newDir = p.direction;

    if (keyState['ArrowUp'] || keyState['w']) { dy = -1; newDir = 'up'; }
    else if (keyState['ArrowDown'] || keyState['s']) { dy = 1; newDir = 'down'; }
    else if (keyState['ArrowLeft'] || keyState['a']) { dx = -1; newDir = 'left'; }
    else if (keyState['ArrowRight'] || keyState['d']) { dx = 1; newDir = 'right'; }

    if (dx !== 0 || dy !== 0) {
        initiatePlayerMove(state, dx, dy, newDir, now);
    }
}

function initiatePlayerMove(state, dx, dy, newDir, now) {
    const p = state.player;
    p.direction = newDir;
    
    const targetX = p.x + dx;
    const targetY = p.y + dy;
    const map = state.maps[state.currentMapId];
    
    // Collision Detection
    if (targetX < 0 || targetY < 0 || targetY >= map.baseLayer.length || targetX >= map.baseLayer[0].length) return;
    const baseTile = map.baseLayer[targetY][targetX];
    if (['🌳', '🏠', '🪨', '🔥', '🌊', '💎'].includes(baseTile)) return; // Simple collision
    if (map.interactables[`${targetX},${targetY}`]?.type === 'npc') return; // Cannot walk on NPCs

    p.isMoving = true;
    p.moveStartTime = now;
    p.startX = p.x;
    p.startY = p.y;
    p.targetX = targetX;
    p.targetY = targetY;
}

function checkInteraction(state, trigger) {
    const p = state.player;
    let targetX = p.x, targetY = p.y;

    if (p.direction === 'up') targetY--;
    else if (p.direction === 'down') targetY++;
    else if (p.direction === 'left') targetX--;
    else if (p.direction === 'right') targetX++;

    const entity = state.maps[state.currentMapId].interactables[`${targetX},${targetY}`];
    if (entity) {
        if (entity.type === 'door') {
            state.currentMapId = entity.targetMap;
            state.player.x = entity.targetX;
            state.player.y = entity.targetY;
            state.player.pixelX = entity.targetX * TILE_SIZE;
            state.player.pixelY = entity.targetY * TILE_SIZE;
        } else if (entity.dialogue) {
            startDialogue(state, entity);
        }
    } else {
        state.mode = 'gameMenu';
        trigger.sendUIUpdate({ screen: 'gameMenu' });
    }
}

export function startDialogue(state, entity, sendUIUpdate) {
    state.mode = 'dialogue';
    dialogueState = {
        active: true,
        entityId: entity.id,
        branch: 'start',
        index: 0,
    };
    // Handle quest-based dialogue branches
    if (entity.questGiver) {
        const questStatus = Quests.getQuestStatus(state, entity.questGiver);
        if (questStatus === 'completed' && entity.dialogue.completed) {
            dialogueState.branch = 'completed';
        } else if (questStatus === 'in_progress' && entity.dialogue.in_progress) {
            dialogueState.branch = 'in_progress';
        }
    }
    
    advanceDialogue(state, sendUIUpdate);
}

export function advanceDialogue(state, sendUIUpdate, trigger) {
    if (!dialogueState.active) return;

    const entity = findEntity(state, dialogueState.entityId);
    const branch = entity.dialogue[dialogueState.branch];

    if (!branch || dialogueState.index >= branch.length) {
        endDialogue(state, sendUIUpdate);
        return;
    }

    const message = branch[dialogueState.index];

    if (typeof message === 'string') {
        if (message === 'end') {
            endDialogue(state, sendUIUpdate);
            return;
        }
        sendUIUpdate({ dialogue: { active: true, text: message } });
        dialogueState.index++;
    } else if (typeof message === 'object') {
        // Handle actions
        if(message.startBattle) trigger.startBattle(message.startBattle);
        if(message.giveItem) Quests.giveItem(state, message.giveItem);
        if(message.acceptQuest) trigger.acceptQuest(entity.questGiver);
        if(message.finalizeQuest) trigger.finalizeQuest(entity.questGiver);

        // Handle choices
        if(message.choices) {
            sendUIUpdate({
                dialogue: {
                    active: true,
                    text: message.text,
                    choices: message.choices.map(c => ({ text: c.text, disabled: false })) // Add condition logic here
                }
            });
        } else {
            dialogueState.index++;
            advanceDialogue(state, sendUIUpdate, trigger);
        }
    }
}

export function handleDialogueChoice(state, index, sendUIUpdate, trigger) {
    const entity = findEntity(state, dialogueState.entityId);
    const branch = entity.dialogue[dialogueState.branch];
    const message = branch[dialogueState.index];
    const choice = message.choices[index];

    if (choice.next) {
        dialogueState.branch = choice.next;
        dialogueState.index = 0;
        advanceDialogue(state, sendUIUpdate, trigger);
    } else {
        endDialogue(state, sendUIUpdate);
    }
}

function endDialogue(state, sendUIUpdate) {
    dialogueState = { active: false };
    state.mode = 'game';
    sendUIUpdate({ dialogue: { active: false } });
}

function findEntity(state, entityId) {
    for (const map of Object.values(state.maps)) {
        for (const entity of Object.values(map.interactables)) {
            if (entity.id === entityId) return entity;
        }
    }
    return null;
}