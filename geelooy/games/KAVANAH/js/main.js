// B"H

import * as State from './state.js';
import * as Drawing from './drawing.js';
import * as Controls from './controls.js';
import * as Entities from './entities.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function update() {
    State.incrementTime();
    if (State.getGameState() !== 'playing') return;

    const cameraSpeed = 2 + State.getAscension() / 8000;
    State.moveCamera(cameraSpeed);
    
    // --- DIRECT RELATIVE MOVEMENT & GRAVITY REMOVAL ---
    // This new system makes the player immune to camera scroll ("gravity") while being controlled.
    // Movement is now based on the finger's delta from the last frame for a 1:1 feel.
    const player = State.getPlayer();
    const pointer = Controls.getPointerState();

    if (pointer.isActive) {
        // 1. Counteract the camera scroll to remove "gravity".
        // This keeps the player stationary on the screen if the finger is not moving.
        player.y += cameraSpeed;

        // 2. Apply the finger's movement delta from the last frame.
        const delta = Controls.getAndResetPointerDelta();
        State.movePlayer(delta.x, delta.y);
    }
    // If pointer is not active, the player is not moved and will "fall" with the camera scroll.
    
    State.checkPlayerBounds(canvas.width);
    // ---

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
    }
);

resizeCanvas();
gameLoop();