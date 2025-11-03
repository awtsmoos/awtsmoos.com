//B"H

// Shema Strike - Main Thread Controller
// This script runs on the main browser thread (the UI thread).
// Its responsibilities are minimal to keep the UI responsive. It handles:
// 1. Setting up the Web Worker and OffscreenCanvas.
// 2. Capturing all user input (keyboard, touch).
// 3. Sending user input to the worker on every frame.
// 4. Listening for high-level messages from the worker (e.g., 'gameOver').
// 5. Managing the visibility of UI overlays (start/end screens).

document.addEventListener('DOMContentLoaded', () => {
    // ==================================
    // 1. DOM ELEMENT SELECTION
    // ==================================
    // Get references to all the necessary HTML elements.
    const canvas = document.getElementById('gameCanvas');
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const gameOverScreen = document.getElementById('game-over-screen');
    const restartButton = document.getElementById('restart-button');
    const container = document.getElementById('game-container');

    // ==================================
    // 2. WORKER SUPPORT CHECK
    // ==================================
    // Web Workers are essential for this architecture. If the browser doesn't support them,
    // we can't run the game. We'll display an error message and stop.
    if (!window.Worker) {
        console.error('Your browser does not support Web Workers. The game cannot run.');
        startScreen.innerHTML = '<h1>Error</h1><p>Your browser does not support a required feature (Web Workers) to run this game. Please use a modern browser.</p>';
        startScreen.style.display = 'flex';
        return; // Halt execution
    }

    // ==================================
    // 3. WORKER INITIALIZATION
    // ==================================
    console.log('Main thread: Initializing the game worker.');
    const worker = new Worker('js/game-worker.js');

    // --- OffscreenCanvas Setup ---
    // This is the core of the performance improvement. We transfer control of the
    // canvas's rendering context to the worker. The main thread can no longer draw
    // to it, but the worker can do so without blocking the main thread.
    const offscreen = canvas.transferControlToOffscreen();

    // Send the 'init' message to the worker. We pass the offscreen canvas object
    // as the second argument, which transfers its ownership to the worker thread.
    // This is a zero-copy operation, making it very fast.
    worker.postMessage({ type: 'init', payload: { canvas: offscreen } }, [offscreen]);


    // ==================================
    // 4. CONTROLS SETUP & COMMUNICATION
    // ==================================
    // The main thread is solely responsible for listening to user input.
    const isTouchDevice = 'ontouchstart' in window;
    const controls = new Controls(isTouchDevice); // This class handles keyboard/touch listeners.

    /**
     * This loop runs on every frame and its only job is to send the current
     * state of the controls to the worker. This keeps the worker perfectly
     * in sync with the player's actions.
     */
    function sendControlsLoop() {
        worker.postMessage({
            type: 'controls',
            payload: {
                // We create a plain object with the control states to send.
                controls: {
                    left: controls.left,
                    right: controls.right,
                    jump: controls.jump,
                    strike: controls.strike,
                    strikePressed: controls.strikePressed // Important for single-press actions.
                }
            }
        });
        // After sending the "pressed" state, we immediately reset it on the main thread.
        // This ensures it's only true for a single frame, preventing repeated actions.
        controls.resetPress();

        // Continue the loop on the next available frame.
        requestAnimationFrame(sendControlsLoop);
    }
    // Start the input-sending loop.
    sendControlsLoop();


    // ==================================
    // 5. LISTENING TO THE WORKER
    // ==================================
    // We set up a listener to handle messages coming *from* the worker.
    // The main thread should only listen for high-level game state changes.
    worker.addEventListener('message', (e) => {
        const { type, payload } = e.data;
        switch (type) {
            // The worker will tell us when the game is over.
            case 'gameOver':
                console.log('Main thread: Received gameOver message from worker.');
                showGameOverScreen();
                break;
            // Future messages from the worker could be handled here (e.g., 'levelComplete').
        }
    });


    // ==================================
    // 6. UI MANAGEMENT & EVENT LISTENERS
    // ==================================
    // These functions and listeners manage the UI overlays.

    function showGameOverScreen() {
        gameOverScreen.style.display = 'flex';
    }

    // When the player clicks the "BEGIN" button...
    startButton.addEventListener('click', () => {
        startScreen.style.display = 'none';
        // ...we send a 'start' message to the worker to tell it to begin the game loop logic.
        worker.postMessage({ type: 'start' });
    });

    // When the player clicks "FIGHT AGAIN"...
    restartButton.addEventListener('click', () => {
        // ...the simplest way to reset the entire game state is to just reload the page.
        window.location.reload();
    });

    // --- Canvas Resizing ---
    /**
     * Handles resizing the canvas to fit its container and informs the worker.
     */
    function resizeCanvas() {
        // Match the canvas rendering resolution to its new display size.
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Send a 'resize' message to the worker with the new dimensions.
        // The worker needs this information to adjust its internal camera,
        // UI layout, and world boundaries.
        worker.postMessage({
            type: 'resize',
            payload: { width: canvas.width, height: canvas.height }
        });
    }

    // Listen for the browser window resizing.
    window.addEventListener('resize', resizeCanvas);

    // Call it once initially to set the correct size.
    resizeCanvas();
});