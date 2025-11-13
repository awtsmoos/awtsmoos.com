// B"H

import * as State from './state.js';
import * as Drawing from './drawing.js';
import * as Controls from './controls.js';
import * as Entities from './entities.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- NEW: Get references to HTML elements ---
const teachingsScreen = document.getElementById('teachings-screen');
const backButton = document.getElementById('back-button');

let touchOffset = null;
let sanctifyTimer = 0;

function activateTikkun() {
    const player = State.getPlayer();
    if (player.tikkun < player.maxTikkun) return;

    player.tikkun = 0;
    player.isTikkun = true;
    player.tikkunTimer = 250;
}

function update() {
    const gameState = State.getGameState();
    // Game logic only runs if the state is 'playing'
    if (gameState !== 'playing') return;

    State.incrementTime();

    const cameraSpeed = 2 + State.getAscension() / 8000;
    State.moveCamera(cameraSpeed);
    
    const player = State.getPlayer();
    const pointer = Controls.getPointerState();
    const cameraY = State.getCameraY();

    if (pointer.isActive) {
        if (touchOffset === null) {
            touchOffset = {
                x: pointer.x - player.x,
                y: pointer.y - (player.y - cameraY)
            };
        }
        let targetPlayerX = pointer.x - touchOffset.x;
        let targetPlayerScreenY = pointer.y - touchOffset.y;
        State.setPlayerPosition(targetPlayerX, targetPlayerScreenY + cameraY);
    } else {
        touchOffset = null;
        if (player.combo > 0 && !player.isTikkun) {
            player.combo = 0;
        }
    }
    
    State.checkPlayerBounds(canvas.width);
    
    if (player.isTikkun && player.tikkunTimer > 0) {
        State.decrementTikkunTimer();
    } else if (player.isTikkun && player.tikkunTimer <= 0) {
        State.endTikkun();
        player.combo = 0;
    }
    
    sanctifyTimer++;
    if (sanctifyTimer > 40 - Math.min(35, State.getAscension() / 500)) {
        Entities.sanctifyRandomLetter();
        sanctifyTimer = 0;
    }

    Entities.generateEntities(canvas.width, cameraY);
    Entities.updateEntities(cameraY, cameraSpeed, canvas.width, gameOver);
    Entities.updateParticles();
}


function gameOver() {
    if (State.getGameState() !== 'playing') return;
    State.setGameState('gameOver');
    touchOffset = null;
    const ascension = State.getAscension();
    let bestAscension = State.getBestAscension();

    if (ascension > bestAscension) {
        bestAscension = ascension;
        localStorage.setItem('kavanahBestAscension', bestAscension);
        State.setBestAscension(bestAscension);
    }
    Entities.createGameOverParticles(State.player.x, State.player.y);
    setTimeout(() => State.init(canvas.width, canvas.height), 750);
}

function gameLoop() {
    update();
    Drawing.draw(ctx, canvas.width, canvas.height);
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    State.init(canvas.width, canvas.height); 
    Drawing.draw(ctx, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);

// --- Event handler for clicks on the canvas ---
function handleGameStart(x, y) {
    const { gameState, menuButtons } = State.getUIState();
    if (gameState === 'waiting') {
        const startBtn = menuButtons.start;
        if (x > startBtn.x && x < startBtn.x + startBtn.w && y > startBtn.y && y < startBtn.y + startBtn.h) {
            State.setGameState('playing');
        }
        const teachingsBtn = menuButtons.teachings;
        if (x > teachingsBtn.x && x < teachingsBtn.x + teachingsBtn.w && y > teachingsBtn.y && y < teachingsBtn.y + teachingsBtn.h) {
            // --- NEW: Show HTML screen ---
            State.setGameState('teachings');
            teachingsScreen.classList.remove('hidden');
        }
    } else if (gameState === 'gameOver') {
        State.init(canvas.width, canvas.height);
        State.setGameState('playing');
    }
}

// --- NEW: Event listener for HTML back button ---
backButton.addEventListener('click', () => {
    teachingsScreen.classList.add('hidden');
    State.setGameState('waiting');
});

Controls.setupControls(canvas, handleGameStart, activateTikkun);

resizeCanvas();
gameLoop();