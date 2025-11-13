// B"H

import * as State from './state.js';
import * as Drawing from './drawing.js';
import * as Controls from './controls.js';
import * as Entities from './entities.js';
import { Particle } from './classes/Particle.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let touchOffset = null;
let sanctifyTimer = 0; // Timer to control when new letters become sacred.

// --- Tikkun Activation Function ---
function activateTikkun() {
    const player = State.getPlayer();
    if (player.tikkun < player.maxTikkun) return;

    player.tikkun = 0;
    player.isTikkun = true;
    player.tikkunTimer = 200; // Visual effect duration

    const particles = State.getParticles();

    // Make ALL letters on screen sacred and have plants release life energy
    State.getEntities().forEach(e => {
        if (e.type === 'otiot') {
            e.isSacred = true;
            e.sacredLife = 300; // Give them a fresh lifespan
        }
        // --- NEW: Plants now have a positive interaction ---
        if (e.type === 'tzomeach') {
            for(let i = 0; i < 20; i++) {
                particles.push(new Particle({
                    x: e.x, y: e.y - e.size / 2,
                    color: `hsl(120, 100%, ${70 + Math.random()*30}%)`, // Life-like green
                    size: Math.random() * 4 + 2,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -2 - Math.random() * 3, // Drift upwards
                    life: 90 + Math.random() * 50,
                    drag: 0.96,
                    gravity: -0.04 // Slight anti-gravity
                }));
            }
        }
    });
}

function update() {
    State.incrementTime();
    if (State.getGameState() !== 'playing') return;

    const cameraSpeed = 2 + State.getAscension() / 8000;
    State.moveCamera(cameraSpeed);
    
    // --- Direct Drag Movement Logic ---
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
    
    // --- Gameplay Logic Update ---
    if (player.isTikkun && player.tikkunTimer > 0) {
        State.decrementTikkunTimer();
    } else {
        State.endTikkun();
    }
    
    // Make a new letter glow periodically
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
    if (State.getGameState() !== 'playing') {
        State.init(canvas.width, canvas.height);
    }
    Drawing.draw(ctx, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);

// --- Pass the new Tikkun function to the controls ---
Controls.setupControls(canvas, 
    () => { // onGameStart
        State.init(canvas.width, canvas.height);
        State.setGameState('playing');
    },
    activateTikkun // onTikkun
);

resizeCanvas();
gameLoop();