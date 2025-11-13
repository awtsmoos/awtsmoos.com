// B"H

import * as State from './state.js';
import * as Drawing from './drawing.js';
import * as Controls from './controls.js';
import * as Entities from './entities.js';
import { lerp } from './utils.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function update() {
    State.incrementTime();
    if (State.getGameState() !== 'playing') return;

    const cameraSpeed = 2 + State.getAscension() / 8000;
    State.moveCamera(cameraSpeed);
    State.updateAscension(cameraSpeed * 0.1);

    // --- Player Movement ---
    let finalVx = 0;
    let finalVy = 0;
    const touchAnchor = Controls.getTouchAnchor();
    const controlVector = Controls.getControlVector();

    if (touchAnchor) {
        const maxControlDist = 100; // Max distance from anchor for full speed
        const dist = Math.hypot(controlVector.x, controlVector.y);
        const deadZone = 5; // Small dead zone to prevent accidental drift

        if (dist > deadZone) {
            const clampedDist = Math.min(dist, maxControlDist);
            const angle = Math.atan2(controlVector.y, controlVector.x);
            const maxSpeed = 10;
            
            // Speed is proportional to how far you drag from the anchor
            const speed = (clampedDist / maxControlDist) * maxSpeed;

            finalVx = Math.cos(angle) * speed;
            finalVy = Math.sin(angle) * speed;
        }
    }

    // --- MOVEMENT FIX ---
    // Set velocity directly instead of using lerp. This provides immediate,
    // responsive control and fixes the bug where the player would not move.
    State.setPlayerVelocity(finalVx, finalVy);
    // ---

    State.updatePlayerPosition();
    State.checkPlayerBounds(canvas.width);


    if (State.player.isTikkun && State.player.tikkunTimer > 0) {
        State.decrementTikkunTimer();
    } else {
        State.endTikkun();
    }

    Entities.generateEntities(canvas.width, State.getCameraY());
    Entities.updateEntities(State.getCameraY(), cameraSpeed, canvas.width, gameOver);
    Entities.updateParticles();
}


function gameOver() {
    if (State.getGameState() !== 'playing') return;
    State.setGameState('gameOver');
    const ascension = State.getAscension();
    let bestAscension = State.getBestAscension();

    if (ascension > bestAscension) {
        bestAscension = ascension;
        localStorage.setItem('kavanahBestAscension', bestAscension);
        State.setBestAscension(bestAscension);
    }
    Entities.createGameOverParticles(State.player.x, State.player.y);
    setTimeout(() => State.init(canvas.width, canvas.height), 2000);
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
    // Re-draw immediately on resize
    Drawing.draw(ctx, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);

Controls.setupControls(canvas, 
    () => { // onGameStart
        State.init(canvas.width, canvas.height);
        State.setGameState('playing');
    },
    gameOver // onGameOver (passed as a function reference)
);

// Initial setup
resizeCanvas();
gameLoop();