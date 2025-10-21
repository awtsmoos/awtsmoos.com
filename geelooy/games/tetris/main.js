// B"H
// main.js - The central nervous system of the Tikkun game.
// This file handles DOM manipulation, user input, communication with the game worker,
// and rendering the main thread's background visual effects.

/**
 * A self-contained, high-performance background effect engine.
 * Renders a "digital rain" of Hebrew characters on a dedicated canvas.
 */
class BackgroundFX {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("BackgroundFX Error: Canvas not found!");
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.hebrewChars = 'אבגדהוזחטיכלמנסעפצקרשתךםןףץ';
        this.fontSize = 20;
        this.drops = [];
        this.animationFrameId = null;

        // Bind the context of the animation loop
        this.animate = this.animate.bind(this);
    }

    // Initialize or re-initialize the effect on screen resize
    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        const columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = [];
        for (let i = 0; i < columns; i++) {
            // Give each column a random starting position and speed
            this.drops[i] = {
                y: Math.random() * this.canvas.height,
                speed: Math.random() * 3 + 1.5
            };
        }
        // If animation is already running, cancel it before starting a new one
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.animate();
    }

    // The core animation loop, runs continuously
    animate() {
        // Draw a semi-transparent black rectangle over the whole canvas
        // This creates the fading trail effect for the characters
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#FC0'; // The color of the Golem/border
        this.ctx.font = `${this.fontSize}px monospace`;

        // Loop through each column/drop
        for (let i = 0; i < this.drops.length; i++) {
            const drop = this.drops[i];
            // Pick a random Hebrew character to draw
            const text = this.hebrewChars[Math.floor(Math.random() * this.hebrewChars.length)];
            // Draw the character at the drop's current position
            this.ctx.fillText(text, i * this.fontSize, drop.y * this.fontSize);

            // If a drop reaches the bottom of the screen, reset it to the top with a new random speed
            if (drop.y * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                drop.y = 0;
                drop.speed = Math.random() * 3 + 1.5;
            }
            // Move the drop down the screen
            drop.y += drop.speed / 10; // Divide by 10 for smoother speed control
        }

        this.animationFrameId = requestAnimationFrame(this.animate);
    }
}


// --- Main Application Logic ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. STATE MANAGEMENT & DOM ELEMENT CACHING ---
    // Centralized object to hold the game's state.
    const game = {
        worker: null,
        mode: null, // 'single', 'pvai', 'aivai'
        touchStartX: 0,
        touchStartY: 0,
        isSwiping: false,
    };

    // Cache all DOM elements we need to interact with for performance.
    const elements = {
        mainMenu: document.getElementById('main-menu'),
        gameScreen: document.getElementById('game-screen'),
        p1Container: document.getElementById('p1-container'),
        p2Container: document.getElementById('p2-container'),
        p1Canvas: document.getElementById('p1-canvas'),
        p2Canvas: document.getElementById('p2-canvas'),
        p1Title: document.getElementById('p1-title'),
        p2Title: document.getElementById('p2-title'),
        sharedControls: document.getElementById('shared-controls'),
        descendButton: document.getElementById('descend-button'),
        ui: {
            p1: { score: document.getElementById('p1-score'), level: document.getElementById('p1-level'), lines: document.getElementById('p1-lines') },
            p2: { score: document.getElementById('p2-score'), level: document.getElementById('p2-level'), lines: document.getElementById('p2-lines') }
        }
    };
    
    // Initialize the insane background effect engine.
    const backgroundFX = new BackgroundFX('background-canvas');
    backgroundFX.init();

    // --- 2. CORE GAME FLOW FUNCTIONS ---

    /**
     * Initializes a new game with the selected mode.
     * This is the primary function for starting or restarting the game.
     * @param {string} mode - The game mode ('single', 'pvai', 'aivai').
     */
    function startGame(mode) {
        game.mode = mode;

        // Terminate any existing worker to ensure a clean state.
        if (game.worker) {
            game.worker.terminate();
        }
        
        // Create a new Web Worker. All game logic runs here.
        game.worker = new Worker('worker.js');
        game.worker.onmessage = handleWorkerMessage;
        
        // Configure the UI layout based on the selected mode.
        elements.mainMenu.classList.add('hidden');
        elements.gameScreen.classList.remove('hidden');

        // Reset any leftover "Game Over" overlays from previous games.
        document.querySelectorAll('.game-over-overlay').forEach(el => el.remove());

        // Setup visibility of player containers and controls
        elements.p1Container.classList.remove('hidden');
        elements.p2Container.classList.toggle('hidden', mode === 'single');
        elements.sharedControls.classList.toggle('hidden', mode !== 'pvai');
        
        // Set player titles
        elements.p1Title.textContent = (mode === 'aivai') ? 'GOLEM 1' : 'PLAYER 1';
        elements.p2Title.textContent = (mode === 'aivai') ? 'GOLEM 2' : 'GOLEM';

        // Wait a moment for the DOM to update before initializing canvases,
        // which prevents race conditions with layout calculations.
        requestAnimationFrame(() => {
            initCanvasesAndWorker();
        });
    }
    
    /**
     * Prepares canvas objects and sends them to the worker to start the game logic.
     */
    function initCanvasesAndWorker() {
        const p1Rect = elements.p1Canvas.getBoundingClientRect();
        const p1Offscreen = elements.p1Canvas.transferControlToOffscreen();
        
        const payload = {
            p1Canvas: p1Offscreen,
            p1Dimensions: { width: p1Rect.width, height: p1Rect.height },
            p1Dpr: window.devicePixelRatio,
            mode: game.mode
        };

        const canvasesToTransfer = [p1Offscreen];

        if (game.mode !== 'single') {
            const p2Rect = elements.p2Canvas.getBoundingClientRect();
            const p2Offscreen = elements.p2Canvas.transferControlToOffscreen();
            payload.p2Canvas = p2Offscreen;
            payload.p2Dimensions = { width: p2Rect.width, height: p2Rect.height };
            payload.p2Dpr = window.devicePixelRatio;
            canvasesToTransfer.push(p2Offscreen);
        }

        game.worker.postMessage({ type: 'init', payload }, canvasesToTransfer);
    }

    // --- 3. WORKER COMMUNICATION HANDLERS ---

    /**
     * Handles all messages received from the game worker.
     * @param {MessageEvent} event - The event object from the worker.
     */
    function handleWorkerMessage(event) {
        const { type, payload } = event.data;
        switch (type) {
            case 'ui_update':
                updateUI(payload);
                break;
            case 'game_over':
                handleGameOver(payload);
                break;
        }
    }

    /**
     * Updates a player's score, level, and lines in the HUD.
     * @param {object} payload - The data for the UI update.
     */
    function updateUI(payload) {
        const playerUI = payload.id === 1 ? elements.ui.p1 : elements.ui.p2;
        if (playerUI) {
            playerUI.score.textContent = payload.score;
            playerUI.level.textContent = payload.level;
            playerUI.lines.textContent = payload.lines;
        }
    }

    /**
     * Displays a "Game Over" message on the specified player's canvas.
     * @param {object} payload - The data specifying which player lost.
     */
    function handleGameOver(payload) {
        const container = payload.id === 1 ? elements.p1Container : elements.p2Container;
        if (container) {
            const overlay = document.createElement('div');
            overlay.className = 'game-over-overlay';
            overlay.textContent = 'GAME OVER';
            container.querySelector('.game-board-container').appendChild(overlay);
        }
    }

    // --- 4. EVENT LISTENERS & USER INPUT ---

    /**
     * A utility function to prevent an event from firing too rapidly.
     * Used here to avoid spamming resize events.
     */
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Handles resizing of the window, re-initializing the game to fit the new dimensions.
     */
    const handleResize = debounce(() => {
        // Re-initialize the background effect for the new size
        backgroundFX.init();
        // If a game is active, restart it to get fresh canvas dimensions
        if (game.mode) {
            startGame(game.mode);
        }
    }, 250);

    /**
     * Sends a command to the worker based on user input.
     * @param {string} action - The action to perform.
     * @param {*} [value] - An optional value for the action (e.g., move direction).
     */
    function sendInput(action, value) {
        if (game.worker) {
            game.worker.postMessage({ type: 'input', payload: { action, value } });
        }
    }
    
    // --- Keyboard Input ---
    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowLeft':  case 'a': sendInput('move', -1); break;
            case 'ArrowRight': case 'd': sendInput('move', 1); break;
            case 'ArrowUp':    case 'w': sendInput('rotate'); break;
            case 'ArrowDown':  case 's': sendInput('soft_drop_start'); break;
            case ' ': sendInput('hard_drop'); break;
        }
    });
    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowDown' || e.key === 's') {
            sendInput('soft_drop_end');
        }
    });
    
    // --- Touch Input for Player 1's board ---
    elements.p1Container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        game.touchStartX = touch.clientX;
        game.touchStartY = touch.clientY;
        game.isSwiping = false;
    }, { passive: false });

    elements.p1Container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!e.touches.length) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - game.touchStartX;
        const deltaY = touch.clientY - game.touchStartY;

        // Prioritize vertical swipes for dropping
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 20) {
            if (deltaY > 0) sendInput('soft_drop_start');
            game.isSwiping = true;
        } else if (Math.abs(deltaX) > 20) { // Horizontal swipe threshold
            sendInput('move', deltaX > 0 ? 1 : -1);
            // Reset start X to allow for continuous swiping without lifting the finger
            game.touchStartX = touch.clientX;
            game.isSwiping = true;
        }
    }, { passive: false });
    
    elements.p1Container.addEventListener('touchend', (e) => {
        e.preventDefault();
        // If it wasn't a swipe, it was a tap for rotation
        if (!game.isSwiping) {
            sendInput('rotate');
        }
        // Always end soft drop on touch end
        sendInput('soft_drop_end');
        game.isSwiping = false;
    }, { passive: false });

    // --- Universal Event Listeners ---
    window.addEventListener('resize', handleResize);
    elements.descendButton.addEventListener('click', () => sendInput('hard_drop'));

    // Menu button listeners
    document.getElementById('play-single').addEventListener('click', () => startGame('single'));
    document.getElementById('play-pvai').addEventListener('click', () => startGame('pvai'));
    document.getElementById('play-aivai').addEventListener('click', () => startGame('aivai'));
});