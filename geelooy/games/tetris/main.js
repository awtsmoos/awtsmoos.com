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
        this.animate = this.animate.bind(this);
    }

    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        const columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = [];
        for (let i = 0; i < columns; i++) {
            this.drops[i] = { y: Math.random() * this.canvas.height, speed: Math.random() * 3 + 1.5 };
        }
        if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); }
        this.animate();
    }

    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#FC0';
        this.ctx.font = `${this.fontSize}px monospace`;
        for (let i = 0; i < this.drops.length; i++) {
            const drop = this.drops[i];
            const text = this.hebrewChars[Math.floor(Math.random() * this.hebrewChars.length)];
            this.ctx.fillText(text, i * this.fontSize, drop.y * this.fontSize);
            if (drop.y * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                drop.y = 0;
                drop.speed = Math.random() * 3 + 1.5;
            }
            drop.y += drop.speed / 10;
        }
        this.animationFrameId = requestAnimationFrame(this.animate);
    }
}

// --- Main Application Logic ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. STATE MANAGEMENT & DOM ELEMENT CACHING ---
    const game = {
        worker: null,
        mode: null,
        touchStartX: 0,
        touchStartY: 0,
        touchMoved: false,
    };

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
    
    const backgroundFX = new BackgroundFX('background-canvas');
    backgroundFX.init();

    // --- 2. CORE GAME FLOW FUNCTIONS ---
    function startGame(mode) {
        game.mode = mode;
        if (game.worker) { game.worker.terminate(); }
        game.worker = new Worker('worker.js');
        game.worker.onmessage = handleWorkerMessage;
        
        elements.mainMenu.classList.add('hidden');
        elements.gameScreen.classList.remove('hidden');
        document.querySelectorAll('.game-over-overlay').forEach(el => el.remove());

        switch (mode) {
            case 'single':
                elements.p1Container.classList.remove('hidden');
                elements.p2Container.classList.add('hidden');
                elements.sharedControls.classList.add('hidden');
                elements.p1Container.appendChild(elements.descendButton);
                elements.descendButton.classList.remove('hidden');
                break;
            case 'pvai':
                elements.p1Container.classList.remove('hidden');
                elements.p2Container.classList.remove('hidden');
                elements.sharedControls.appendChild(elements.descendButton);
                elements.sharedControls.classList.remove('hidden');
                break;
            case 'aivai':
                elements.p1Container.classList.remove('hidden');
                elements.p2Container.classList.remove('hidden');
                elements.sharedControls.classList.add('hidden');
                break;
        }
        
        elements.p1Title.textContent = (mode === 'aivai') ? 'GOLEM 1' : 'PLAYER 1';
        elements.p2Title.textContent = (mode === 'aivai') ? 'GOLEM 2' : 'GOLEM';

        requestAnimationFrame(initCanvasesAndWorker);
    }
    
    function initCanvasesAndWorker() {
        const p1Rect = elements.p1Canvas.getBoundingClientRect();
        const p1Offscreen = elements.p1Canvas.transferControlToOffscreen();
        const payload = { p1Canvas: p1Offscreen, p1Dimensions: { width: p1Rect.width, height: p1Rect.height }, p1Dpr: window.devicePixelRatio, mode: game.mode };
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
    function handleWorkerMessage(event) {
        const { type, payload } = event.data;
        if (type === 'ui_update') updateUI(payload);
        else if (type === 'game_over') handleGameOver(payload);
    }

    function updateUI(payload) {
        const playerUI = payload.id === 1 ? elements.ui.p1 : elements.ui.p2;
        if (playerUI) {
            playerUI.score.textContent = payload.score;
            playerUI.level.textContent = payload.level;
            playerUI.lines.textContent = payload.lines;
        }
    }

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
    function debounce(func, delay) { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; }
    
    // --- NEW: Non-destructive resize function ---
    function resizeGameInstances() {
        backgroundFX.init();
        if (!game.worker) return;

        const p1Rect = elements.p1Canvas.getBoundingClientRect();
        const payload = {
            p1Dimensions: { width: p1Rect.width, height: p1Rect.height },
            p1Dpr: window.devicePixelRatio
        };

        if (game.mode !== 'single') {
            const p2Rect = elements.p2Canvas.getBoundingClientRect();
            payload.p2Dimensions = { width: p2Rect.width, height: p2Rect.height };
            payload.p2Dpr = window.devicePixelRatio;
        }
        game.worker.postMessage({ type: 'resize', payload });
    }
    
    // --- CHANGE: The resize handler no longer restarts the entire game ---
    const handleResize = debounce(resizeGameInstances, 250);

    function sendInput(action, value) { if (game.worker) { game.worker.postMessage({ type: 'input', payload: { action, value } }); } }
    
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
    elements.p1Container.addEventListener('touchstart', (e) => { e.preventDefault(); const touch = e.touches[0]; game.touchStartX = touch.clientX; game.touchStartY = touch.clientY; game.touchMoved = false; }, { passive: false });
    elements.p1Container.addEventListener('touchmove', (e) => { e.preventDefault(); if (!e.touches.length) return; const touch = e.touches[0]; const deltaX = touch.clientX - game.touchStartX; const deltaY = touch.clientY - game.touchStartY; if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) { sendInput('move', deltaX > 0 ? 1 : -1); game.touchStartX = touch.clientX; } if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) { game.touchMoved = true; } }, { passive: false });
    elements.p1Container.addEventListener('touchend', (e) => { e.preventDefault(); if (!game.touchMoved) { sendInput('rotate'); } }, { passive: false });

    // --- FIX: Correct "Hold-to-Descend" Logic for the Button ---
    const button = elements.descendButton;
    button.addEventListener('touchstart', (e) => { e.stopPropagation(); sendInput('soft_drop_start'); });
    button.addEventListener('mousedown', () => sendInput('soft_drop_start'));
    button.addEventListener('touchend', (e) => { e.stopPropagation(); sendInput('soft_drop_end'); });
    button.addEventListener('mouseup', () => sendInput('soft_drop_end'));
    button.addEventListener('mouseleave', () => sendInput('soft_drop_end'));

    // --- Universal Event Listeners ---
    window.addEventListener('resize', handleResize);

    // Menu button listeners
    document.getElementById('play-single').addEventListener('click', () => startGame('single'));
    document.getElementById('play-pvai').addEventListener('click', () => startGame('pvai'));
    document.getElementById('play-aivai').addEventListener('click', () => startGame('aivai'));
});