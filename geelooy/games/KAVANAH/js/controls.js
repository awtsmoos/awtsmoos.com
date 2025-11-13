// B"H
// Manages all user input.

import * as State from './state.js';

let pointer = {
    isActive: false,
    x: 0,
    y: 0
};

export const getPointerState = () => pointer;

function handlePointerDown(coords, onGameStart, onTikkun) {
    const gameState = State.getGameState();
    
    if (gameState === 'waiting' || gameState === 'gameOver') {
        onGameStart();
        return;
    }

    const canvas = document.getElementById('gameCanvas');
    const btnSize = Math.min(100, canvas.width * 0.12);
    const x = coords.clientX;
    const y = coords.clientY;
    const player = State.getPlayer();

    // Check if the Tikkun button was pressed
    if (y > canvas.height - btnSize && x > canvas.width/2 - btnSize/2 && x < canvas.width/2 + btnSize/2) {
        if (player.tikkun >= player.maxTikkun) {
            onTikkun();
        }
    } else { // Otherwise, it's for movement
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

export function setupControls(canvas, onGameStart, onTikkun) {
    const onDown = (e) => {
        e.preventDefault();
        const coords = e.touches ? e.touches[0] : e;
        handlePointerDown(coords, onGameStart, onTikkun);
    };

    const onMove = (e) => {
        e.preventDefault();
        if (pointer.isActive) {
            const coords = e.touches ? e.touches[0] : e;
            handlePointerMove(coords);
        }
    };

    // Add new, correct listeners
    canvas.addEventListener('pointerdown', onDown, { passive: false });
    canvas.addEventListener('touchstart', onDown, { passive: false });

    canvas.addEventListener('pointermove', onMove, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
}