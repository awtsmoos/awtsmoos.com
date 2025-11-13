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

    // --- ACCELERATION-BASED MOVEMENT REWORK ---
    let targetVx = 0;
    let targetVy = 0;
    const touchAnchor = Controls.getTouchAnchor();
    const controlVector = Controls.getControlVector();

    // If the player is touching the screen for movement...
    if (touchAnchor) {
        const maxControlDist = 120; // The max distance from the anchor for full speed
        const dist = Math.hypot(controlVector.x, controlVector.y);
        const deadZone = 10;

        if (dist > deadZone) {
            const clampedDist = Math.min(dist, maxControlDist);
            const angle = Math.atan2(controlVector.y, controlVector.x);
            const maxSpeed = 12;
            // Calculate target velocity based on how far the finger is from the anchor
            targetVx = Math.cos(angle) * (clampedDist / maxControlDist) * maxSpeed;
            targetVy = Math.sin(angle) * (clampedDist / maxControlDist) * maxSpeed;
        }
    }
    
    // Smoothly interpolate from current velocity to the target velocity for an acceleration effect.
    const player = State.getPlayer();
    const lerpFactor = 0.08; 
    player.vx = lerp(player.vx, targetVx, lerpFactor);
    player.vy = lerp(player.vy, targetVy, lerpFactor);

    State.updatePlayerPosition();
    // ---

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

Controls.setupControls(canvas, 
    () => { // onGameStart
        State.init(canvas.width, canvas.height);
        State.setGameState('playing');
    },
    gameOver 
);

resizeCanvas();
gameLoop();