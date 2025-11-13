// B"H
// Manages all user input.

import * as State from './state.js';

let pointer = {
    isActive: false,
    x: 0,
    y: 0
};

export const getPointerState = () => pointer;

function handlePointerDown(coords, onStart, onTikkun) {
    const gameState = State.getGameState();
    const x = coords.clientX;
    const y = coords.clientY;
    
    onStart(x, y); // General start handler

    if (gameState === 'playing') {
        const btnSize = Math.min(100, document.getElementById('gameCanvas').width * 0.12);
        const btnY = document.getElementById('gameCanvas').height - btnSize - 10;
        const player = State.getPlayer();

        // Check if the Tikkun button was pressed
        if (y > btnY) {
            if (player.tikkun >= player.maxTikkun) {
                onTikkun();
            }
        } else { // Otherwise, it's for movement
            pointer.isActive = true;
            pointer.x = x;
            pointer.y = y;
        }
    }
}

function handlePointerMove(coords, onMove) {
    const gameState = State.getGameState();
    const x = coords.clientX;
    const y = coords.clientY;

    onMove(y); // General move handler (for scrolling)

    if (gameState === 'playing' && pointer.isActive) {
        pointer.x = x;
        pointer.y = y;
    }
}

function handlePointerUp(onEnd) {
    onEnd(); // General end handler
    if (pointer.isActive) {
        pointer.isActive = false;
    }
}

export function setupControls(canvas, onStart, onMove, onEnd, onTikkun) {
    const onDown = (e) => {
        e.preventDefault();
        const coords = e.touches ? e.touches[0] : e;
        handlePointerDown(coords, onStart, onTikkun);
    };

    const onMoveWrapper = (e) => {
        e.preventDefault();
        const coords = e.touches ? e.touches[0] : e;
        handlePointerMove(coords, onMove);
    };

    const onUp = () => {
        handlePointerUp(onEnd);
    }

    canvas.addEventListener('pointerdown', onDown, { passive: false });
    canvas.addEventListener('touchstart', onDown, { passive: false });

    canvas.addEventListener('pointermove', onMoveWrapper, { passive: false });
    canvas.addEventListener('touchmove', onMoveWrapper, { passive: false });

    window.addEventListener('pointerup', onUp, { passive: false });
    window.addEventListener('touchend', onUp, { passive: false });
}