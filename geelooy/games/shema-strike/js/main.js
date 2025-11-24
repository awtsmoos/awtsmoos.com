//B"H

// Shema Strike - Main Thread Controller
// This script runs on the main browser thread (the UI thread).
// Its responsibilities are minimal to keep the UI responsive. It handles:
// 1. Setting up the Web Worker and OffscreenCanvas.
// 2. Capturing all user input (keyboard, touch).
// 3. Sending user input to the worker on every frame.
// 4. Listening for high-level messages from the worker (e.g., 'gameOver').
// 5. Managing the visibility of UI overlays (start/end screens).

// js/main.js
// Shema Strike - Main Thread Controller (Corrected Version)

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT SELECTION ---
    const canvas = document.getElementById('gameCanvas');
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const gameOverScreen = document.getElementById('game-over-screen');
    const restartButton = document.getElementById('restart-button');
    const container = document.getElementById('game-container');

    // --- WORKER SUPPORT CHECK ---
    if (!window.Worker) {
        console.error('Your browser does not support Web Workers. The game cannot run.');
        startScreen.innerHTML = '<h1>Error</h1><p>Your browser does not support a required feature (Web Workers) to run this game.</p>';
        startScreen.style.display = 'flex';
        return;
    }

    // =============================================================
    // --- FIX 1: Corrected Sizing and Worker Initialization Flow ---
    // =============================================================

    // STEP 1: Set the initial size of the canvas BEFORE transferring control.
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const worker = new Worker('js/game-worker.js');

    // STEP 2: Transfer control to the OffscreenCanvas.
    const offscreen = canvas.transferControlToOffscreen();
    worker.postMessage({ type: 'init', payload: { canvas: offscreen } }, [offscreen]);


    // --- CONTROLS SETUP & COMMUNICATION ---
    const isTouchDevice = 'ontouchstart' in window;
    const controls = new Controls(isTouchDevice);

    function sendControlsLoop() {
        worker.postMessage({
            type: 'controls',
            payload: {
                controls: {
                    left: controls.left,
                    right: controls.right,
                    jump: controls.jump,
                    strike: controls.strike,
                    strikePressed: controls.strikePressed
                }
            }
        });
        controls.resetPress();
        requestAnimationFrame(sendControlsLoop);
    }
    sendControlsLoop();

    // --- LISTENING TO THE WORKER ---
    worker.addEventListener('message', (e) => {
        if (e.data.type === 'gameOver') {
            showGameOverScreen();
        }
    });

    // --- UI MANAGEMENT & EVENT LISTENERS ---
    function showGameOverScreen() {
        gameOverScreen.style.display = 'flex';
    }

    startButton.addEventListener('click', () => {
        startScreen.style.display = 'none';
        worker.postMessage({ type: 'start' });
    });

    restartButton.addEventListener('click', () => {
        window.location.reload();
    });

    // STEP 3: The resize handler now ONLY sends a message. It does not touch the canvas directly.
    function handleResize() {
        // We get the new dimensions from the container.
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;

        // We send these dimensions to the worker, which is now in charge of the canvas.
        worker.postMessage({
            type: 'resize',
            payload: { width: newWidth, height: newHeight }
        });
    }

    window.addEventListener('resize', handleResize);
});