// B"H

import * as State from './state.js';
import * as Drawing from './drawing.js';
import * as Controls from './controls.js';
import * as Entities from './entities.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let touchOffset = null;
let sanctifyTimer = 0;
// --- For scrolling teachings ---
let lastPointerY = null;
let isDragging = false;


function activateTikkun() {
    const player = State.getPlayer();
    if (player.tikkun < player.maxTikkun) return;

    player.tikkun = 0;
    player.isTikkun = true;
    player.tikkunTimer = 250;
}

function update() {
    const gameState = State.getGameState();
    if (gameState === 'waiting' || gameState === 'teachings') return;

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
    // --- DIFFICULTY: Faster sanctification to keep game possible ---
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
    setTimeout(() => State.init(canvas.width, canvas.height, ctx), 750);
}

function gameLoop() {
    update();
    Drawing.draw(ctx, canvas.width, canvas.height);
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    State.init(canvas.width, canvas.height, ctx); 
    Drawing.draw(ctx, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);


// --- REWORKED: Controls to handle scrolling in 'teachings' state ---
function handleStart(x, y) {
    const { gameState, menuButtons } = State.getUIState();

    isDragging = false;
    lastPointerY = y;

    if (gameState === 'waiting') {
        const startBtn = menuButtons.start;
        if (x > startBtn.x && x < startBtn.x + startBtn.w && y > startBtn.y && y < startBtn.y + startBtn.h) {
            State.setGameState('playing');
        }
        const teachingsBtn = menuButtons.teachings;
        if (x > teachingsBtn.x && x < teachingsBtn.x + teachingsBtn.w && y > teachingsBtn.y && y < teachingsBtn.y + teachingsBtn.h) {
            State.setGameState('teachings');
        }
    } else if (gameState === 'teachings') {
        const backBtn = menuButtons.back;
        if (x > backBtn.x && x < backBtn.x + backBtn.w && y > backBtn.y && y < backBtn.y + backBtn.h) {
            State.setGameState('waiting');
        } else {
            isDragging = true;
        }
    } else if (gameState === 'gameOver') {
        State.init(canvas.width, canvas.height, ctx);
        State.setGameState('playing');
    }
}

function handleMove(y) {
    if (State.getGameState() === 'teachings' && isDragging) {
        const { scrollY, scrollMax } = State.getTeachingsState();
        const deltaY = y - lastPointerY;
        const newScrollY = Math.max(0, Math.min(scrollMax, scrollY - deltaY));
        State.setTeachingsScroll(newScrollY);
        lastPointerY = y;
    }
}

function handleEnd() {
    isDragging = false;
    lastPointerY = null;
}

Controls.setupControls(
    canvas,
    handleStart,
    handleMove,
    handleEnd,
    activateTikkun
);

resizeCanvas();
gameLoop();