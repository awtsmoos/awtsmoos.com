// B"H

import * as State from './state.js';
import * as Drawing from './drawing.js';
import * as Controls from './controls.js';
import * as Entities from './entities.js';
import { Particle } from './classes/Particle.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let touchOffset = null;
let sanctifyTimer = 0;

// --- Tikkun Activation Function ---
function activateTikkun() {
    const player = State.getPlayer();
    if (player.tikkun < player.maxTikkun) return;

    player.tikkun = 0;
    player.isTikkun = true;
    player.tikkunTimer = 200;

    const particles = State.getParticles();

    State.getEntities().forEach(e => {
        if (e.type === 'otiot') {
            e.sanctify();
        }
        if (e.type === 'tzomeach') {
            for(let i = 0; i < 20; i++) {
                particles.push(new Particle({
                    x: e.x, y: e.y - e.height,
                    color: `hsl(120, 100%, ${70 + Math.random()*30}%)`,
                    size: Math.random() * 4 + 2,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -2 - Math.random() * 3,
                    life: 90 + Math.random() * 50,
                    drag: 0.96,
                    gravity: -0.04
                }));
            }
        }
    });
}

function update() {
    const gameState = State.getGameState();
    if (gameState === 'waiting' || gameState === 'teachings') return; // Don't update game logic on menu screens

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
    }
    
    State.checkPlayerBounds(canvas.width);
    
    if (player.isTikkun && player.tikkunTimer > 0) {
        State.decrementTikkunTimer();
    } else {
        State.endTikkun();
    }
    
    sanctifyTimer++;
    if (sanctifyTimer > 35 - Math.min(30, State.getAscension() / 1000)) {
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
    State.init(canvas.width, canvas.height); // Always re-init on resize for clean state
    Drawing.draw(ctx, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);

Controls.setupControls(canvas, 
    (x, y) => { // onGameStart now receives coordinates
        const { gameState, menuButtons } = State.getUIState();
        if (gameState === 'waiting') {
            // Check if 'Start' button is clicked
            const startBtn = menuButtons.start;
            if (x > startBtn.x && x < startBtn.x + startBtn.w && y > startBtn.y && y < startBtn.y + startBtn.h) {
                State.setGameState('playing');
            }
            // Check if 'Teachings' button is clicked
            const teachingsBtn = menuButtons.teachings;
            if (x > teachingsBtn.x && x < teachingsBtn.x + teachingsBtn.w && y > teachingsBtn.y && y < teachingsBtn.y + teachingsBtn.h) {
                State.setGameState('teachings');
            }
        } else if (gameState === 'teachings') {
             // Check if 'Back' button is clicked
            const backBtn = menuButtons.back;
             if (x > backBtn.x && x < backBtn.x + backBtn.w && y > backBtn.y && y < backBtn.y + backBtn.h) {
                State.setGameState('waiting');
            }
        } else if (gameState === 'gameOver') {
            State.init(canvas.width, canvas.height);
            State.setGameState('playing');
        }
    },
    activateTikkun
);

resizeCanvas();
gameLoop();