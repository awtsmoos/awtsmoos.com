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
    const x = coords.clientX;
    const y = coords.clientY;
    
    onGameStart(x, y); // Handles menu clicks

    if (gameState === 'playing') {
        const btnSize = Math.min(100, document.getElementById('gameCanvas').width * 0.12);
        const btnY = document.getElementById('gameCanvas').height - btnSize - 10;
        const player = State.getPlayer();

        if (y > btnY) {
            if (player.tikkun >= player.maxTikkun) {
                onTikkun();
            }
        } else {
            pointer.isActive = true;
            pointer.x = x;
            pointer.y = y;
        }
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

    canvas.addEventListener('pointerdown', onDown, { passive: false });
    canvas.addEventListener('touchstart', onDown, { passive: false });

    canvas.addEventListener('pointermove', onMove, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
}