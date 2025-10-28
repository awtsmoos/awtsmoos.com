// B"H
// js/workers/world.js

import { TILE_SIZE, PLAYER_SPEED } from '../data/database.js';
import * as Quests from './quests.js';

let keyState = {};

export function handleKeyState(state, keys) {
    keyState = keys;
}

export function update(state, now, trigger) {
    const p = state.player;

    // --- NEW SMOOTH MOVEMENT LOGIC ---
    if (p.isMoving) {
        const elapsed = now - p.moveStartTime;
        const progress = Math.min(elapsed / PLAYER_SPEED, 1); // Clamp progress between 0 and 1

        // Interpolate pixel position for smooth animation
        p.pixelX = p.startX * TILE_SIZE + (p.targetX - p.startX) * TILE_SIZE * progress;
        p.pixelY = p.startY * TILE_SIZE + (p.targetY - p.startY) * TILE_SIZE * progress;

        if (progress >= 1) {
            // Movement finished, snap to grid
            p.isMoving = false;
            p.x = p.targetX;
            p.y = p.targetY;
            checkTileLandedOn(state, trigger);
        }
        return; // Don't process new movement while animating
    }

    if (state.dialogue.active || state.mode !== 'game') return;

    // Check for new input to start a move
    let direction = null;
    if (keyState['ArrowUp'] || keyState['w']) { direction = 'up'; }
    else if (keyState['ArrowDown'] || keyState['s']) { direction = 'down'; }
    else if (keyState['ArrowLeft'] || keyState['a']) { direction = 'left'; }
    else if (keyState['ArrowRight'] || keyState['d']) { direction = 'right'; }
    
    if (direction) {
        initiatePlayerMove(state, direction, now);
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
            if (entity.flagRequired && !state.player.flags[entity.flagRequired]) {
                startDialogue(state, { dialogue: { start: ["The way is sealed by an unseen force.", "end"] } }, 'start', sendUIUpdate);
                return;
            }
            state.currentMapId = entity.targetMap;
            p.x = p.startX = p.targetX = entity.targetX;
            p.y = p.startY = p.targetY = entity.targetY;
            p.pixelX = entity.targetX * TILE_SIZE;
            p.pixelY = entity.targetY * TILE_SIZE;
            p.isMoving = false;
        } else if (entity.dialogue) {
            startDialogue(state, entity, 'start', sendUIUpdate);
        }
    } else {
        state.mode = 'gameMenu';
        sendUIUpdate({ screen: 'gameMenu' });
    }
}

export function startDialogue(state, entity, startingBranch, sendUIUpdate) {
    state.mode = 'dialogue';
    state.dialogue = {
        active: true, entity: entity, branch: startingBranch, index: 0,
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
    let branch = dialogue.entity.dialogue[dialogue.branch];
    
    // Check for special quest-based branches
    if (dialogue.entity.questGiver) {
        const questStatus = Quests.getStatus(state, dialogue.entity.questGiver);
        if (questStatus === 'learned_law' && dialogue.entity.dialogue.learned_law) {
            branch = dialogue.entity.dialogue.learned_law;
            dialogue.index = 0; // Start at beginning of this special branch
        }
    }

    if (!branch || dialogue.index >= branch.length) {
        endDialogue(state, sendUIUpdate);
        return;
    }

    const message = branch[dialogue.index];

    if (typeof message === 'string') {
        if (message === 'end') { endDialogue(state, sendUIUpdate); return; }
        dialogue.index++;
        sendUIUpdate({ dialogue: { active: true, text: message } });
    } else if (typeof message === 'object') {
        if (message.choices) {
            sendUIUpdate({ dialogue: { active: true, text: message.text, choices: message.choices } });
        } else {
            if (message.startBattle) { endDialogue(state, sendUIUpdate); trigger.startBattle(message.startBattle); return; }
            if (message.giveItem) Quests.giveItem(state, message.giveItem);
            if (message.acceptQuest) trigger.acceptQuest(dialogue.entity.questGiver);
            if (message.finalizeQuest) trigger.finalizeQuest(dialogue.entity.questGiver);
            if (message.updateQuest) Quests.updateObjective(state, { type: 'dialogue', flag: message.objectiveId });
            if (message.setFlag) state.player.flags[message.setFlag] = true;
            
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