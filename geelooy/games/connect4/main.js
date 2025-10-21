//B"H


document.addEventListener('DOMContentLoaded', () => {
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

    if (!window.Worker || !canvas.transferControlToOffscreen) {
        alert("Your browser does not support the required features for this game (Web Workers or OffscreenCanvas).");
        return;
    }

    const worker = new Worker('game.worker.js');
    let gameMode;
    let isGameRunning = false;

    function resizeCanvas() {
        const BOARD_ASPECT_RATIO = 7 / 6; // Columns / Rows
        const container = document.getElementById('game-container');
        let availableWidth = container.clientWidth;
        let availableHeight = container.clientHeight;

        availableHeight -= 80; // Reserve 80px space for the resign button

        let newWidth = availableWidth;
        let newHeight = availableHeight;

        if (newWidth / newHeight > BOARD_ASPECT_RATIO) {
            newWidth = newHeight * BOARD_ASPECT_RATIO;
        } else {
            newHeight = newWidth / BOARD_ASPECT_RATIO;
        }

        const dpr = window.devicePixelRatio || 1;
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
        canvas.width = newWidth * dpr;
        canvas.height = newHeight * dpr;

        if (isGameRunning) {
            worker.postMessage({ type: 'resize', width: canvas.width, height: canvas.height });
        }
    }

    function showScreen(screen) {
        mainMenu.style.display = 'none';
        turnChoiceMenu.style.display = 'none';
        gameContainer.style.display = 'none';
        screen.style.display = 'flex';
    }

    function startGame(mode, playerGoesFirst = null) {
        showScreen(gameContainer);
        isGameRunning = true;
        
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

    pVsPButton.addEventListener('click', () => startGame('pvp'));
    gVsGButton.addEventListener('click', () => startGame('cvc'));

    pVsGButton.addEventListener('click', () => {
        gameMode = 'pvc';
        showScreen(turnChoiceMenu);
    });

    playerFirstButton.addEventListener('click', () => startGame(gameMode, true));
    playerSecondButton.addEventListener('click', () => startGame(gameMode, false));

    resignButton.addEventListener('click', () => {
        worker.postMessage({ type: 'resign' });
        isGameRunning = false;
        showScreen(mainMenu);
    });

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        worker.postMessage({ type: 'click', x: x, canvasWidth: rect.width });
    });

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        worker.postMessage({ type: 'mousemove', x: x, canvasWidth: rect.width });
    });

    canvas.addEventListener('mouseleave', () => {
        worker.postMessage({ type: 'mouseleave' });
    });

    window.addEventListener('resize', resizeCanvas);
});



