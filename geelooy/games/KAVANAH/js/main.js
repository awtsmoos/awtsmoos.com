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
    
    // --- MOVEMENT LOGIC OVERHAUL ---
    const player = State.getPlayer();
    const pointer = Controls.getPointerState();

    // Store camera position before it moves
    const oldCameraY = State.getCameraY();
    State.moveCamera(cameraSpeed);
    const newCameraY = State.getCameraY();
    
    if (pointer.isActive) {
        // The previous logic failed at high speeds. This new logic works in screen-space to ensure 1:1 control.
        
        // 1. Get player's current position on the screen.
        let playerScreenY = player.y - oldCameraY;
        
        // 2. Get the user's directional input.
        const delta = Controls.getAndResetPointerDelta();

        // 3. Apply the input delta directly to the screen position.
        player.x += delta.x;
        playerScreenY += delta.y;
        
        // 4. Clamp the player's screen position so they can't leave the viewport.
        playerScreenY = Math.max(player.radius, Math.min(playerScreenY, canvas.height - player.radius));

        // 5. Convert the new, clamped screen position back to a world position for rendering.
        player.y = playerScreenY + newCameraY;

    }
    
    // Pass pointer state to bounds check to avoid conflicting logic.
    State.checkPlayerBounds(canvas.width, pointer.isActive);
    // --- END MOVEMENT LOGIC OVERHAUL ---

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