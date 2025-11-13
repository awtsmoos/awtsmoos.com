// B"H
// Manages all user input.

import * as State from './state.js';

// This state object now tracks pointer activity and its current screen coordinates.
let pointer = {
    isActive: false,
    x: 0,
    y: 0
};

// Returns the entire pointer state object.
export const getPointerState = () => pointer;

// The delta system has been removed as it was the source of the issue.

export function setupControls(canvas, onGameStart) {
    const handlePointerDown = (e) => {
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
            pointer.x = e.clientX;
            pointer.y = e.clientY;
        }
    };

    const handlePointerMove = (e) => {
        e.preventDefault();
        if (pointer.isActive) {
            pointer.x = e.clientX;
            pointer.y = e.clientY;
        }
    };

    const handlePointerUp = () => {
        if (pointer.isActive) {
            pointer.isActive = false;
        }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('touchstart', (e) => handlePointerDown(e.touches[0]), { passive: false });

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('touchmove', (e) => handlePointerMove(e.touches[0]), { passive: false });

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
}