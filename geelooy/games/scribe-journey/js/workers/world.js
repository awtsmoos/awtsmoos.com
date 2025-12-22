
// B"H
// js/workers/world.js
import * as Movement from './world/movement.js';
import * as Interaction from './world/interaction.js';
import * as Dialogue from './world/dialogue.js';

let keyState = {};
export function handleKeyState(state, keys) { 
    keyState = keys; 
    state.keys = keys; // Ensure this is accessible for Sprint logic
}

export function update(state, now, deltaTime, trigger) {
    if (state.player.isMoving) {
        Movement.updatePosition(state, deltaTime, trigger);
        return;
    }
    if (state.dialogue.active || state.mode !== 'game') return;

    let dir = null;
    if (keyState['ArrowUp'] || keyState['w']) dir = 'up';
    else if (keyState['ArrowDown'] || keyState['s']) dir = 'down';
    else if (keyState['ArrowLeft'] || keyState['a']) dir = 'left';
    else if (keyState['ArrowRight'] || keyState['d']) dir = 'right';
    
    if (dir) Movement.attemptMove(state, dir);
}

export const checkInteraction = Interaction.checkInteraction;
export const startDialogue = Dialogue.startDialogue;
export const advanceDialogue = Dialogue.advanceDialogue;
export const handleDialogueChoice = Dialogue.handleDialogueChoice;
