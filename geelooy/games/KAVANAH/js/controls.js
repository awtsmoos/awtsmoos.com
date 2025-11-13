// B"H
// Manages all user input.

import * as State from './state.js';

// This new state object tracks pointer activity and movement deltas frame-over-frame.
let pointer = {
    isActive: false,
    lastX: 0,
    lastY: 0,
    deltaX: 0,
    deltaY: 0
};

export const getPointerState = () => ({ isActive: pointer.isActive });

// This function is called by main.js to get the accumulated movement and reset it for the next frame.
export function getAndResetPointerDelta() {
    const delta = { x: pointer.deltaX, y: pointer.deltaY };
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    return delta;
}

export function setupControls(canvas, onGameStart) {
    canvas.addEventListener('pointerdown', e => {
        e.preventDefault();
        const gameState = State.getGameState();
        
        if (gameState === 'waiting' || gameState === 'gameOver') {
            onGameStart();
            return;
        }

        const btnSize = Math.min(100, canvas.width * 0.12);
        const x = e.clientX;
        const y = e.clientY;
        const player = State.getPlayer();

        if (y > canvas.height - btnSize) { // Button area
             if (x < btnSize) { 
                player.attunement = 'gevurah'; 
                player.combo = 0; 
            } else if (x > canvas.width - btnSize) { 
                player.attunement = 'chesed'; 
                player.combo = 0; 
            } else if (player.tikkun >= player.maxTikkun && x > canvas.width/2 - btnSize/2 && x < canvas.width/2 + btnSize/2) {
                player.isTikkun = true; 
                player.tikkunTimer = 400; 
                player.tikkun = 0;
            }
        } else { // Movement area
            pointer.isActive = true;
            pointer.lastX = e.clientX;
            pointer.lastY = e.clientY;
        }
    });

    canvas.addEventListener('pointermove', e => {
        e.preventDefault();
        if (pointer.isActive) {
            const currentX = e.clientX;
            const currentY = e.clientY;

            // Accumulate the distance moved since the last frame.
            pointer.deltaX += currentX - pointer.lastX;
            pointer.deltaY += currentY - pointer.lastY;

            // Update the last position for the next move event.
            pointer.lastX = currentX;
            pointer.lastY = currentY;
        }
    });

    window.addEventListener('pointerup', () => {
        // Deactivate movement when the pointer is lifted.
        if (pointer.isActive) {
            pointer.isActive = false;
            pointer.deltaX = 0;
            pointer.deltaY = 0;
        }
    });
}