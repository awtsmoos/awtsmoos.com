// B"H
// js/workers/world.js

import { TILE_SIZE, PLAYER_SPEED } from '../data/database.js';
import * as Quests from './quests.js';

let keyState = {};

// Renamed from handleInput to handleKeyState for clarity
export function handleKeyState(state, keys) {
    keyState = keys;
}

// This function now specifically handles interaction checks
export function checkInteraction(state, trigger, sendUIUpdate) {
    if (state.dialogue.active) return; // Don't interact if dialogue is open

    const p = state.player;
    let targetX = p.x, targetY = p.y;

    if (p.direction === 'up') targetY--;
    else if (p.direction === 'down') targetY++;
    else if (p.direction === 'left') targetX--;
    else if (p.direction === 'right') targetX++;

    const entity = state.maps[state.currentMapId].interactables[`${targetX},${targetY}`];
    
    if (entity) {
        if (entity.type === 'door') {
            // Door logic is simple state change, no UI update needed from here
            state.currentMapId = entity.targetMap;
            state.player.x = entity.targetX;
            state.player.y = entity.targetY;
            state.player.pixelX = entity.targetX * TILE_SIZE;
            state.player.pixelY = entity.targetY * TILE_SIZE;
        } else if (entity.dialogue) {
            // Pass sendUIUpdate to startDialogue
            startDialogue(state, entity, 'start', sendUIUpdate);
        }
    } else {
        // Open the game menu if no interaction target
        state.mode = 'gameMenu';
        sendUIUpdate({ screen: 'gameMenu' });
    }
}


export function update(state, now, trigger) {
    const p = state.player;
    // Handle movement interpolation
    if (p.isMoving) {
        const elapsed = now - p.moveStartTime;
        if (elapsed >= PLAYER_SPEED) {
            p.isMoving = false;
            p.x = p.targetX;
            p.y = p.targetY;
            p.pixelX = p.x * TILE_SIZE;
            p.pixelY = p.y * TILE_SIZE;
            // Check for wild encounter upon landing on the tile
            const tileChar = state.maps[state.currentMapId].baseLayer[p.y][p.x];
            if (tileChar === '🌾' && Math.random() < 0.2) {
                trigger.startBattle([{ id: 'whispering_grass', level: 3 }]);
            }
        } else {
            const progress = elapsed / PLAYER_SPEED;
            p.pixelX = p.startX * TILE_SIZE + (p.targetX - p.startX) * TILE_SIZE * progress;
            p.pixelY = p.startY * TILE_SIZE + (p.targetY - p.startY) * TILE_SIZE * progress;
        }
        return;
    }

    if (state.dialogue.active || state.mode !== 'game') return;

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
    
    if (targetX < 0 || targetY < 0 || targetY >= map.baseLayer.length || targetX >= map.baseLayer[0].length) return;
    const baseTile = map.baseLayer[targetY][targetX];
    if (['🌳', '🏠', '🪨', '🔥', '🌊', '💎', '📜'].includes(baseTile)) return;
    if (map.interactables[`${targetX},${targetY}`]?.type === 'npc') return;

    p.isMoving = true;
    p.moveStartTime = now;
    p.startX = p.x;
    p.startY = p.y;
    p.targetX = targetX;
    p.targetY = targetY;
}

export function startDialogue(state, entity, startingBranch = 'start', sendUIUpdate) {
    state.mode = 'dialogue';
    state.dialogue = {
        active: true,
        entityId: entity.id || null, // Use entity id if available
        entity: entity, // Keep a direct reference for non-id'd entities
        branch: startingBranch,
        index: 0,
    };

    if (entity.questGiver) {
        const questStatus = Quests.getQuestStatus(state, entity.questGiver);
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
                    choices: message.choices.map(c => ({ text: c.text, disabled: false }))
                }
            });
        } else {
            // Auto-executing actions
            if (message.startBattle) {
                endDialogue(state, sendUIUpdate); // End dialogue before battle
                trigger.startBattle(message.startBattle);
                return;
            }
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

    dialogue.index++; // Move past the choice object

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