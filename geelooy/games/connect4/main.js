//B"H

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mainMenu = document.getElementById('main-menu');
    const turnChoiceMenu = document.getElementById('turn-choice-menu');
    const gameContainer = document.getElementById('game-container');
    const canvas = document.getElementById('game-canvas');

    const pVsGButton = document.getElementById('p-vs-g');
    const gVsGButton = document.getElementById('g-vs-g');
    const pVsPButton = document.getElementById('p-vs-p');
    const playerFirstButton = document.getElementById('player-first');
    const playerSecondButton = document.getElementById('player-second');
    const resignButton = document.getElementById('resign-btn');

    // --- State ---
    let worker = null;
    let gameMode = null;
    let isGameRunning = false;

    if (!window.Worker || !canvas.transferControlToOffscreen) {
        alert("Your browser is missing required features (Web Workers or OffscreenCanvas).");
        return;
    }

    function showScreen(screen) {
        mainMenu.style.display = 'none';
        turnChoiceMenu.style.display = 'none';
        gameContainer.style.display = 'none';
        screen.style.display = 'flex';
    }

    /**
     * Terminates the current game worker if it exists.
     */
    function endGame() {
        if (worker) {
            worker.terminate();
            worker = null;
        }
        isGameRunning = false;
    }

    /**
     * Starts a new game, creating a new worker and transferring canvas control.
     */
    function startGame(mode, playerGoesFirst = null) {
        endGame(); // Ensure any previous worker is terminated
        showScreen(gameContainer);
        isGameRunning = true;
        
        // Create a new worker for a clean state
        worker = new Worker('game.worker.js');

        worker.onmessage = (e) => {
            if (e.data.type === 'goToMainMenu') {
                endGame();
                showScreen(mainMenu);
            }
        };

        // CRITICAL FIX: Resize the canvas BEFORE transferring control
        resizeCanvas();
        const offscreen = canvas.transferControlToOffscreen();
        
        worker.postMessage({
            type: 'init',
            canvas: offscreen,
            width: canvas.width,
            height: canvas.height,
            gameMode: mode,
            playerGoesFirst: playerGoesFirst
        }, [offscreen]);
    }

    function resizeCanvas() {
        const BOARD_ASPECT_RATIO = 7 / 6;
        const container = document.getElementById('game-container');
        let availableWidth = container.clientWidth;
        let availableHeight = container.clientHeight - 80; // Space for controls

        let newWidth = Math.min(availableWidth, container.offsetWidth);
        let newHeight = Math.min(availableHeight, container.offsetHeight);

        if (newWidth / newHeight > BOARD_ASPECT_RATIO) {
            newWidth = newHeight * BOARD_ASPECT_RATIO;
        } else {
            newHeight = newWidth / BOARD_ASPECT_RATIO;
        }

        const dpr = window.devicePixelRatio || 1;
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;

        // This is safe because it happens before transferControlToOffscreen() for each game
        canvas.width = newWidth * dpr;
        canvas.height = newHeight * dpr;

        if (isGameRunning && worker) {
            worker.postMessage({ type: 'resize', width: canvas.width, height: canvas.height });
        }
    }

    // --- Event Listeners ---
    pVsPButton.addEventListener('click', () => startGame('pvp'));
    gVsGButton.addEventListener('click', () => startGame('cvc'));
    pVsGButton.addEventListener('click', () => {
        gameMode = 'pvc';
        showScreen(turnChoiceMenu);
    });
    playerFirstButton.addEventListener('click', () => startGame(gameMode, true));
    playerSecondButton.addEventListener('click', () => startGame(gameMode, false));

    resignButton.addEventListener('click', () => {
        endGame();
        showScreen(mainMenu);
    });

    canvas.addEventListener('click', (event) => {
        if (!worker) return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        worker.postMessage({ type: 'click', x, y, canvasWidth: rect.width, canvasHeight: rect.height });
    });

    canvas.addEventListener('mousemove', (event) => {
        if (!worker) return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        worker.postMessage({ type: 'mousemove', x, canvasWidth: rect.width });
    });

    canvas.addEventListener('mouseleave', () => {
        if (worker) worker.postMessage({ type: 'mouseleave' });
    });

    window.addEventListener('resize', resizeCanvas);
});
