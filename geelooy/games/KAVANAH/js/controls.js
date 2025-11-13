// B"H
// Manages all user input.

import * as State from './state.js';

let pointer = {
    isActive: false,
    x: 0,
    y: 0
};

export const getPointerState = () => pointer;

// --- FIX: The handler functions no longer call e.preventDefault themselves ---
function handlePointerDown(coords) {
    const gameState = State.getGameState();
    
    if (gameState === 'waiting' || gameState === 'gameOver') {
        // This is handled by the event listener now, which calls onGameStart.
        return;
    }

    const btnSize = Math.min(100, window.innerWidth * 0.12);
    const x = coords.clientX;
    const y = coords.clientY;
    const player = State.getPlayer();

    if (y > window.innerHeight - btnSize) { // Button area
         if (x < btnSize) { 
            player.attunement = 'gevurah'; 
            player.combo = 0; 
        } else if (x > window.innerWidth - btnSize) { 
            player.attunement = 'chesed'; 
            player.combo = 0; 
        } else if (player.tikkun >= player.maxTikkun && x > window.innerWidth/2 - btnSize/2 && x < window.innerWidth/2 + btnSize/2) {
            player.isTikkun = true; 
            player.tikkunTimer = 400; 
            player.tikkun = 0;
        }
    } else { // Movement area
        pointer.isActive = true;
        pointer.x = coords.clientX;
        pointer.y = coords.clientY;
    }
}

function handlePointerMove(coords) {
    if (pointer.isActive) {
        pointer.x = coords.clientX;
        pointer.y = coords.clientY;
    }
}

function handlePointerUp() {
    if (pointer.isActive) {
        pointer.isActive = false;
    }
}

export function setupControls(canvas, onGameStart) {
    // --- FIX: Event listeners now correctly handle the event object (e) ---
    // They call preventDefault on 'e' and pass the correct coordinate object to the handler.

    const onDown = (e) => {
        e.preventDefault();
        const gameState = State.getGameState();
        if (gameState === 'waiting' || gameState === 'gameOver') {
            onGameStart();
        } else {
            const coords = e.touches ? e.touches[0] : e;
            handlePointerDown(coords);
        }
    };

    const onMove = (e) => {
        e.preventDefault();
        const coords = e.touches ? e.touches[0] : e;
        handlePointerMove(coords);
    };

    const onUp = () => {
        handlePointerUp();
    };

    // Clear old listeners if any
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('touchstart', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('touchmove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('touchend', onUp);

    // Add new, correct listeners
    canvas.addEventListener('pointerdown', onDown, { passive: false });
    canvas.addEventListener('touchstart', onDown, { passive: false });

    canvas.addEventListener('pointermove', onMove, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });

    window.addEventListener('pointerup', onUp);
    window.addEventListener('touchend', onUp);
}