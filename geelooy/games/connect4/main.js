//B"H
// main.js - v3 (Direct & Reliable Edition)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Centralized UI Element Cache ---
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
    const gameState = {
        worker: null,
        gameMode: null,
        isRunning: false,
        canvas: null,
    };

    // --- 3. Core Functions ---

    /**
     * Instantly shows the target screen and hides all others. NO FADES.
     * @param {HTMLElement} targetScreen The screen element to display.
     */
    function showScreen(targetScreen) {
        // Hide every screen
        ui.allScreenElements.forEach(screen => {
            screen.style.display = 'none';
        });
        // Show only the target screen using flexbox for centering
        targetScreen.style.display = 'flex';
    }

    /**
     * Gracefully terminates the worker and cleans up the canvas.
     */
    function endGame() {
        if (gameState.worker) {
            gameState.worker.terminate();
            gameState.worker = null;
        }
        if (gameState.canvas) {
            gameState.canvas.remove();
            gameState.canvas = null;
        }
        gameState.isRunning = false;
    }

    /**
     * Creates a new canvas, attaches event listeners, and adds it to the container.
     */
    function createCanvas() {
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'game-canvas';
        // In main.js -> createCanvas function
ui.screens.game.appendChild(newCanvas);
        
        gameState.canvas = newCanvas;

        newCanvas.addEventListener('click', handleCanvasEvent);
        newCanvas.addEventListener('mousemove', handleCanvasEvent);
        newCanvas.addEventListener('mouseleave', handleCanvasEvent);
    }
    
    /**
     * Starts a new game session.
     */
    function startGame(mode, playerGoesFirst = null) {
        endGame();
        createCanvas();
        showScreen(ui.screens.game);

        gameState.isRunning = true;
        gameState.gameMode = mode;
        gameState.worker = new Worker('game.worker.js');

        gameState.worker.onmessage = (e) => {
            if (e.data.type === 'goToMainMenu') {
                endGame();
                showScreen(ui.screens.mainMenu);
            }
        };
        
        resizeCanvas();
        const offscreen = gameState.canvas.transferControlToOffscreen();
        
        gameState.worker.postMessage({
            type: 'init',
            canvas: offscreen,
            width: gameState.canvas.width,
            height: gameState.canvas.height,
            gameMode: mode,
            playerGoesFirst: playerGoesFirst
        }, [offscreen]);
    }

    /**
     * Calculates and applies the optimal canvas size.
     */
    function resizeCanvas() {
        if (!gameState.canvas) return;

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

    function handleCanvasEvent(event) {
        if (!gameState.worker) return;
        const rect = gameState.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const type = event.type;
        
        if (type === 'click') {
            gameState.worker.postMessage({ type, x, y, canvasWidth: rect.width, canvasHeight: rect.height });
        } else if (type === 'mousemove') {
            gameState.worker.postMessage({ type, x, canvasWidth: rect.width });
        } else if (type === 'mouseleave') {
            gameState.worker.postMessage({ type });
        }
    }

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