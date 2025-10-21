//B"H
// main.js - v2 (Insane Edition)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Centralized UI Element Cache ---
    // All DOM queries are in one place for easy management.
    const ui = {
        screens: {
            mainMenu: document.getElementById('main-menu'),
            turnChoice: document.getElementById('turn-choice-menu'),
            game: document.getElementById('game-container'),
        },
        buttons: {
            pVsP: document.getElementById('p-vs-p'),
            pVsG: document.getElementById('p-vs-g'),
            gVsG: document.getElementById('g-vs-g'),
            playerFirst: document.getElementById('player-first'),
            playerSecond: document.getElementById('player-second'),
            resign: document.getElementById('resign-btn'),
        },
        get allScreenElements() {
            return Object.values(this.screens);
        }
    };

    // --- 2. Centralized Game State ---
    // A single source of truth for the game's current state.
    const gameState = {
        worker: null,
        gameMode: null,
        isRunning: false,
        canvas: null,
    };

    // --- 3. Core Functions ---

    /**
     * Handles smooth transitions between UI screens.
     * @param {HTMLElement} targetScreen The screen element to display.
     */
    function showScreen(targetScreen) {
        ui.allScreenElements.forEach(screen => {
            screen.classList.remove('visible');
        });
        targetScreen.classList.add('visible');
    }

    /**
     * Gracefully terminates the current game worker and cleans up the canvas.
     */
    function endGame() {
        if (gameState.worker) {
            gameState.worker.terminate();
            gameState.worker = null;
        }
        if (gameState.canvas) {
            gameState.canvas.remove(); // Essential for preventing the error
            gameState.canvas = null;
        }
        gameState.isRunning = false;
    }

    /**
     * Creates a new canvas, attaches all necessary event listeners,
     * and adds it to the game container.
     */
    function createCanvas() {
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'game-canvas';
        ui.screens.game.appendChild(newCanvas);
        gameState.canvas = newCanvas; // Update state

        // Attach event listeners directly to the newly created canvas
        newCanvas.addEventListener('click', handleCanvasEvent);
        newCanvas.addEventListener('mousemove', handleCanvasEvent);
        newCanvas.addEventListener('mouseleave', handleCanvasEvent);
    }
    
    /**
     * Starts a new game session.
     * @param {string} mode The game mode ('pvp', 'pvc', 'cvc').
     * @param {boolean|null} playerGoesFirst True if player starts, false if AI starts.
     */
    function startGame(mode, playerGoesFirst = null) {
        endGame(); // Ensure a perfectly clean slate
        createCanvas(); // Create a fresh canvas for the new game

        gameState.isRunning = true;
        gameState.gameMode = mode;
        gameState.worker = new Worker('game.worker.js');

        // Handle messages from the worker (e.g., returning to menu)
        gameState.worker.onmessage = (e) => {
            if (e.data.type === 'goToMainMenu') {
                endGame();
                showScreen(ui.screens.mainMenu);
            }
        };
        
        // Resize canvas BEFORE transferring control
        resizeCanvas();
        const offscreen = gameState.canvas.transferControlToOffscreen();
        
        // Initialize the worker with all necessary data
        gameState.worker.postMessage({
            type: 'init',
            canvas: offscreen,
            width: gameState.canvas.width,
            height: gameState.canvas.height,
            gameMode: mode,
            playerGoesFirst: playerGoesFirst
        }, [offscreen]);

        showScreen(ui.screens.game);
    }

    /**
     * Calculates the optimal canvas size and applies it.
     */
    function resizeCanvas() {
        if (!gameState.canvas) return; // Don't run if there's no canvas

        const BOARD_ASPECT_RATIO = 7 / 6;
        const container = ui.screens.game;
        const availableHeight = container.clientHeight - ui.buttons.resign.offsetHeight * 2;

        let newWidth = container.clientWidth;
        let newHeight = availableHeight;

        if (newWidth / newHeight > BOARD_ASPECT_RATIO) {
            newWidth = newHeight * BOARD_ASPECT_RATIO;
        } else {
            newHeight = newWidth / BOARD_ASPECT_RATIO;
        }

        const dpr = window.devicePixelRatio || 1;
        gameState.canvas.style.width = `${newWidth}px`;
        gameState.canvas.style.height = `${newHeight}px`;
        gameState.canvas.width = Math.round(newWidth * dpr);
        gameState.canvas.height = Math.round(newHeight * dpr);

        if (gameState.isRunning && gameState.worker) {
            gameState.worker.postMessage({ 
                type: 'resize', 
                width: gameState.canvas.width, 
                height: gameState.canvas.height 
            });
        }
    }

    // --- 4. Event Handlers ---

    /**
     * A single handler for all canvas interactions to keep code DRY.
     * @param {MouseEvent} event The DOM event from the canvas.
     */
    function handleCanvasEvent(event) {
        if (!gameState.worker) return;

        const rect = gameState.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        switch (event.type) {
            case 'click':
                gameState.worker.postMessage({ type: 'click', x, y, canvasWidth: rect.width, canvasHeight: rect.height });
                break;
            case 'mousemove':
                gameState.worker.postMessage({ type: 'mousemove', x, canvasWidth: rect.width });
                break;
            case 'mouseleave':
                gameState.worker.postMessage({ type: 'mouseleave' });
                break;
        }
    }

    /**
     * Attaches listeners to all UI buttons and the window.
     */
    function initializeEventListeners() {
        ui.buttons.pVsP.addEventListener('click', () => startGame('pvp'));
        ui.buttons.gVsG.addEventListener('click', () => startGame('cvc'));
        
        ui.buttons.pVsG.addEventListener('click', () => {
            gameState.gameMode = 'pvc';
            showScreen(ui.screens.turnChoice);
        });

        ui.buttons.playerFirst.addEventListener('click', () => startGame(gameState.gameMode, true));
        ui.buttons.playerSecond.addEventListener('click', () => startGame(gameState.gameMode, false));

        ui.buttons.resign.addEventListener('click', () => {
            endGame();
            showScreen(ui.screens.mainMenu);
        });

        window.addEventListener('resize', resizeCanvas);
    }

    // --- 5. Application Entry Point ---
    initializeEventListeners();
    showScreen(ui.screens.mainMenu); // Start the application on the main menu
});