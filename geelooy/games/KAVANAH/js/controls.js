// B"H
// Manages all user input.

import * as State from './state.js';

let touchAnchor = null;
let controlVector = { x: 0, y: 0 };

export const getTouchAnchor = () => touchAnchor;
export const getControlVector = () => controlVector;

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
            // Set the anchor point for movement control
            touchAnchor = { x, y };
            controlVector = { x: 0, y: 0 };
        }
    });

    canvas.addEventListener('pointermove', e => {
        e.preventDefault();
        // If we have an anchor, calculate the vector for movement
        if (touchAnchor) {
            controlVector = { x: e.clientX - touchAnchor.x, y: e.clientY - touchAnchor.y };
        }
    });

    // Use a window event listener for pointerup to catch cases where the user drags off the canvas
    window.addEventListener('pointerup', () => {
        // Release the anchor when the touch ends, causing the player to decelerate
        touchAnchor = null;
    });
}