// B"H
// js/workers/world.js

import { TILE_SIZE, PLAYER_SPEED } from '../data/database.js'; // <-- CORRECTED IMPORT
import * as Quests from './quests.js';

let keyState = {};

export function handleKeyState(state, keys) {
    keyState = keys;
}

// Main update loop for the world, called 60 times per second
export function update(state, now, trigger) {
    const p = state.player;

    if (p.isMoving) {
        const elapsed = now - p.moveStartTime;
        if (elapsed >= PLAYER_SPEED) {
            p.isMoving = false;
            p.x = p.targetX;
            p.y = p.targetY;
            p.pixelX = p.x * TILE_SIZE;
            p.pixelY = p.y * TILE_SIZE;
            checkTileLandedOn(state, trigger);
        } else {
            const progress = elapsed / PLAYER_SPEED;
            p.pixelX = p.startX * TILE_SIZE + (p.targetX - p.startX) * TILE_SIZE * progress;
            p.pixelY = p.startY * TILE_SIZE + (p.targetY - p.startY) * TILE_SIZE * progress;
        }
        return;
    }

    if (!p.isMoving && !state.dialogue.active && state.mode === 'game') {
        let direction = null;
        if (keyState['ArrowUp'] || keyState['w']) { direction = 'up'; }
        else if (keyState['ArrowDown'] || keyState['s']) { direction = 'down'; }
        else if (keyState['ArrowLeft'] || keyState['a']) { direction = 'left'; }
        else if (keyState['ArrowRight'] || keyState['d']) { direction = 'right'; }
        
        if (direction) {
            initiatePlayerMove(state, direction, now);
        }
    }
}

function initiatePlayerMove(state, direction, now) {
    const p = state.player;
    p.direction = direction;

    let dx = 0, dy = 0;
    if (direction === 'up') dy = -1;
    if (direction === 'down') dy = 1;
    if (direction === 'left') dx = -1;
    if (direction === 'right') dx = 1;

    const targetX = p.x + dx;
    const targetY = p.y + dy;
    const map = state.maps[state.currentMapId];

    if (targetX < 0 || targetY < 0 || targetY >= map.baseLayer.length || targetX >= map.baseLayer[0].length) return;
    const baseTile = map.baseLayer[targetY]?.[targetX];
    const interactable = map.interactables[`${targetX},${targetY}`];
    
    const solidTiles = ['🌳', '🏠', '🪨', '🔥', '🌊', '💎', '📜', '📚', '🕳️'];
    if (solidTiles.includes(baseTile)) return;
    if (interactable && ['npc', 'door'].includes(interactable.type)) return;

    p.isMoving = true;
    p.moveStartTime = now;
    p.startX = p.x;
    p.startY = p.y;
    p.targetX = targetX;
    p.targetY = targetY;
}

function checkTileLandedOn(state, trigger) {
    const p = state.player;
    const tileChar = state.maps[state.currentMapId].baseLayer[p.y]?.[p.x];
    if (tileChar === '🌾' && Math.random() < 0.25) {
        trigger.startBattle([{ id: 'whispering_grass', level: Math.floor(2 + Math.random() * 2) }]);
    }
}

export function checkInteraction(state, trigger, sendUIUpdate) {
    if (state.player.isMoving || state.dialogue.active) return;

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
            state.player.x = state.player.startX = state.player.targetX = entity.targetX;
            state.player.y = state.player.startY = state.player.targetY = entity.targetY;
            state.player.pixelX = entity.targetX * TILE_SIZE;
            state.player.pixelY = entity.targetY * TILE_SIZE;
            state.player.isMoving = false;
        } else if (entity.dialogue) {
            startDialogue(state, entity, 'start', sendUIUpdate);
        }
    } else {
        state.mode = 'gameMenu';
        sendUIUpdate({ screen: 'gameMenu' });
    }
}

// ... the rest of the file (startDialogue, advanceDialogue, etc.) is unchanged ...
// (You can keep the rest of your world.js file as it was from the previous response)

export function startDialogue(state, entity, startingBranch, sendUIUpdate) {
    state.mode = 'dialogue';
    state.dialogue = {
        active: true,
        entity: entity,
        branch: startingBranch,
        index: 0,
    };

    if (entity.questGiver) {
        const questStatus = Quests.getStatus(state, entity.questGiver);
        if (questStatus === 'completed' && entity.dialogue.completed) {
            state.dialogue.branch = 'completed';
        } else if (questStatus === 'in_progress' && entity.dialogue.in_progress) {
            state.dialogue.branch = 'in_progress';
        }
    }
    
    advanceDialogue(state, sendUIUpdate);
}

export function advanceDialogue(state, sendUIUpdate, trigger) {
    if (!state.dialogue.active) return;
    
    const dialogue = state.dialogue;
    const branch = dialogue.entity.dialogue[dialogue.branch];

    if (!branch || dialogue.index >= branch.length) {
        endDialogue(state, sendUIUpdate);
        return;
    }

    const message = branch[dialogue.index];

    if (typeof message === 'string') {
        if (message === 'end') {
            endDialogue(state, sendUIUpdate);
            return;
        }
        dialogue.index++;
        sendUIUpdate({ dialogue: { active: true, text: message } });
    } else if (typeof message === 'object') {
        if (message.choices) {
            sendUIUpdate({
                dialogue: {
                    active: true,
                    text: message.text,
                    choices: message.choices
                }
            });
        } else {
            if (message.startBattle) { endDialogue(state, sendUIUpdate); trigger.startBattle(message.startBattle); return; }
            if (message.giveItem) Quests.giveItem(state, message.giveItem);
            if (message.acceptQuest) trigger.acceptQuest(dialogue.entity.questGiver);
            if (message.finalizeQuest) trigger.finalizeQuest(dialogue.entity.questGiver);
            
            dialogue.index++;
            advanceDialogue(state, sendUIUpdate, trigger);
        }
    }
}

export function handleDialogueChoice(state, index, sendUIUpdate, trigger) {
    const dialogue = state.dialogue;
    const branch = dialogue.entity.dialogue[dialogue.branch];
    const message = branch[dialogue.index];
    const choice = message.choices[index];

    dialogue.index++; 

    if (choice.action) {
        // Handle special actions
    }

    if (choice.next) {
        dialogue.branch = choice.next;
        dialogue.index = 0;
        advanceDialogue(state, sendUIUpdate, trigger);
    } else {
        endDialogue(state, sendUIUpdate);
    }
}

function endDialogue(state, sendUIUpdate) {
    state.dialogue.active = false;
    state.mode = 'game';
    sendUIUpdate({ dialogue: { active: false } });
}