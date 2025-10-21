//B"H

const canvas = document.getElementById('game-canvas');
const mainMenu = document.getElementById('main-menu');
const turnChoiceMenu = document.getElementById('turn-choice-menu');
const gameControls = document.getElementById('game-controls');
const pVsGButton = document.getElementById('p-vs-g');
const gVsGButton = document.getElementById('g-vs-g');
const pVsPButton = document.getElementById('p-vs-p');
const playerFirstButton = document.getElementById('player-first');
const playerSecondButton = document.getElementById('player-second');
const resignButton = document.getElementById('resign-btn');

if (!window.Worker) {
    alert("Your browser does not support Web Workers.");
}

const worker = new Worker('game.worker.js');
let offscreen;
let gameMode;

function startGame(mode, playerGoesFirst = null) {
    mainMenu.style.display = 'none';
    turnChoiceMenu.style.display = 'none';
    gameControls.style.display = 'block';

    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    offscreen = canvas.transferControlToOffscreen();

    worker.postMessage({
        type: 'init',
        canvas: offscreen,
        width: canvas.width,
        height: canvas.height,
        gameMode: mode,
        playerGoesFirst: playerGoesFirst
    }, [offscreen]);
}

pVsPButton.addEventListener('click', () => {
    gameMode = 'pvp';
    startGame(gameMode);
});

pVsGButton.addEventListener('click', () => {
    gameMode = 'pvc';
    mainMenu.style.display = 'none';
    turnChoiceMenu.style.display = 'flex';
});

gVsGButton.addEventListener('click', () => {
    gameMode = 'cvc';
    startGame(gameMode);
});

playerFirstButton.addEventListener('click', () => {
    startGame(gameMode, true);
});

playerSecondButton.addEventListener('click', () => {
    startGame(gameMode, false);
});

resignButton.addEventListener('click', () => {
    worker.postMessage({ type: 'resign' });
    gameControls.style.display = 'none';
    mainMenu.style.display = 'flex';
});

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    worker.postMessage({ type: 'click', x: x, canvasWidth: rect.width });
});

window.addEventListener('resize', () => {
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    worker.postMessage({ type: 'resize', width: canvas.width, height: canvas.height });
});