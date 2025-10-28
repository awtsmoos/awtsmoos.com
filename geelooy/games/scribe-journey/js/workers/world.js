// B"H
// js/workers/world.js

import { TILE_SIZE, PLAYER_SPEED } from '../data/database.js';
import * as Quests from './quests.js';
import * as Shop from './shop.js';

let keyState = {};

export function handleKeyState(state, keys) {
    keyState = keys;
}

export function update(state, now, deltaTime, trigger) {
    const p = state.player;

    if (p.isMoving) {
        const velocity = (TILE_SIZE / PLAYER_SPEED) * 1000;
        const moveDistance = velocity * (deltaTime / 1000);
        if (p.targetX > p.x) p.pixelX = Math.min(p.pixelX + moveDistance, p.targetX * TILE_SIZE);
        else if (p.targetX < p.x) p.pixelX = Math.max(p.pixelX - moveDistance, p.targetX * TILE_SIZE);
        if (p.targetY > p.y) p.pixelY = Math.min(p.pixelY + moveDistance, p.targetY * TILE_SIZE);
        else if (p.targetY < p.y) p.pixelY = Math.max(p.pixelY - moveDistance, p.targetY * TILE_SIZE);

        if (p.pixelX === p.targetX * TILE_SIZE && p.pixelY === p.targetY * TILE_SIZE) {
            p.isMoving = false;
            p.x = p.targetX;
            p.y = p.targetY;
            checkTileLandedOn(state, trigger);
        }
        return;
    }

    if (state.dialogue.active || state.mode !== 'game') return;

    let direction = null;
    if (keyState['ArrowUp'] || keyState['w']) { direction = 'up'; }
    else if (keyState['ArrowDown'] || keyState['s']) { direction = 'down'; }
    else if (keyState['ArrowLeft'] || keyState['a']) { direction = 'left'; }
    else if (keyState['ArrowRight'] || keyState['d']) { direction = 'right'; }
    
    if (direction) {
        initiatePlayerMove(state, direction);
    }
}

function initiatePlayerMove(state, direction) {
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
    const solidTiles = ['🌳', '🏠', '🪨', '🔥', '🌊', '💎', '📜', '📚', '🕳️', '👨‍🏫', '👨', '👨‍🌾', '🐂', '🛒', '🚪'];
    if (solidTiles.includes(baseTile)) return;
    if (interactable && ['npc', 'door'].includes(interactable.type)) return;
    p.isMoving = true; p.startX = p.x; p.startY = p.y; p.targetX = targetX; p.targetY = targetY;
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
    if (p.direction === 'up') targetY--; else if (p.direction === 'down') targetY++;
    else if (p.direction === 'left') targetX--; else if (p.direction === 'right') targetX++;
    const entity = state.maps[state.currentMapId].interactables[`${targetX},${targetY}`];
    
    if (entity) {
        if (entity.type === 'door') {
            // --- FIX FOR LOCKED DOORS ---
            // Check for the more complex 'condition' object first.
            if (entity.condition) {
                let canPass = true;
                if (entity.condition.type === 'hasItem') {
                    // Check if the player has the required item in their inventory.
                    const hasItem = state.player.inventory.some(item => item.id === entity.condition.itemId);
                    if (!hasItem) {
                        canPass = false;
                    }
                }
                // If the condition is not met, show the message and stop.
                if (!canPass) {
                    startDialogue(state, { dialogue: { start: ["A powerful concept blocks this path. You must prove your understanding first.", "end"] } }, 'start', sendUIUpdate);
                    return;
                }
            }
            // If there's no condition or the condition was met, move the player.
            state.currentMapId = entity.targetMap;
            p.x = p.startX = p.targetX = entity.targetX;
            p.y = p.startY = p.targetY = entity.targetY;
            p.pixelX = entity.targetX * TILE_SIZE; p.pixelY = entity.targetY * TILE_SIZE;
            p.isMoving = false;
        } else if (entity.dialogue) {
            startDialogue(state, entity, 'start', sendUIUpdate);
        } else if (entity.shop) {
            Shop.startShop(state, sendUIUpdate);
        }
    } else {
        state.mode = 'gameMenu';
        sendUIUpdate({ screen: 'gameMenu' });
    }
}

export function startDialogue(state, entity, startingBranch, sendUIUpdate) {
    state.mode = 'dialogue';
    state.dialogue = { active: true, entity: entity, branch: startingBranch, index: 0 };
    if (entity && entity.questGiver) {
        const questStatus = Quests.getStatus(state, entity.questGiver);
        if (questStatus === 'completed' && entity.dialogue.completed) state.dialogue.branch = 'completed';
        else if (questStatus === 'in_progress') {
            if (Quests.getObjectiveStatus(state, entity.questGiver, 'learn_law') && entity.dialogue.learned_law) state.dialogue.branch = 'learned_law';
            else state.dialogue.branch = 'in_progress';
        }
    }
    advanceDialogue(state, sendUIUpdate);
}

export function advanceDialogue(state, sendUIUpdate, trigger) {
    if (!state.dialogue.active) return;
    // --- FIX FOR SHOP CRASH ---
    // We remove the incorrect call to Shop.advanceShop. The shop is only advanced
    // by player choices, not by the generic 'confirm' action.
    if (state.dialogue.entity.shop) { 
        // Do nothing here for the shop on a generic advance.
        return; 
    }
    const dialogue = state.dialogue;
    const branch = dialogue.entity.dialogue[dialogue.branch];
    if (!branch || dialogue.index >= branch.length) { endDialogue(state, sendUIUpdate); return; }
    const message = branch[dialogue.index];
    if (typeof message === 'string') {
        if (message === 'end') { endDialogue(state, sendUIUpdate); return; }
        dialogue.index++;
        sendUIUpdate({ dialogue: { active: true, text: message } });
    } else if (typeof message === 'object') {
        if (message.choices) { sendUIUpdate({ dialogue: { active: true, text: message.text, choices: message.choices } }); }
        else {
            if (message.startBattle) { endDialogue(state, sendUIUpdate); trigger.startBattle(message.startBattle, message.context); return; }
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
    // The shop logic correctly uses handleShopChoice. This was already correct.
    if (dialogue.entity.shop) {
        const branch = dialogue.entity.dialogue[dialogue.branch];
        const choice = branch[dialogue.index].choices[index];
        Shop.handleShopChoice(state, choice, sendUIUpdate);
        return;
    }
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