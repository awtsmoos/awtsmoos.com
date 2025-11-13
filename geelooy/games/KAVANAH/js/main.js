// B"H

import * as State from './state.js';
import * as Drawing from './drawing.js';
import * as Controls from './controls.js';
import * as Entities from './entities.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// This variable will hold the offset between the player and the touch point.
let touchOffset = null;

function update() {
    State.incrementTime();
    if (State.getGameState() !== 'playing') return;

    const cameraSpeed = 2 + State.getAscension() / 8000;
    State.moveCamera(cameraSpeed);
    
    // --- DIRECT DRAG MOVEMENT LOGIC ---
    const player = State.getPlayer();
    const pointer = Controls.getPointerState();
    const cameraY = State.getCameraY();

    if (pointer.isActive) {
        // If this is the first frame of a drag, calculate and store the offset.
        if (touchOffset === null) {
            touchOffset = {
                x: pointer.x - player.x,
                y: pointer.y - (player.y - cameraY) // y-offset is in screen space
            };
        }

        // Update the player's position to maintain the offset from the pointer.
        let targetPlayerX = pointer.x - touchOffset.x;
        let targetPlayerScreenY = pointer.y - touchOffset.y;

        // Set the player's new world coordinates.
        State.setPlayerPosition(targetPlayerX, targetPlayerScreenY + cameraY);

    } else {
        // If the pointer is released, reset the offset.
        touchOffset = null;
    }
    
    State.checkPlayerBounds(canvas.width);
    // --- END DIRECT DRAG LOGIC ---

    if (State.player.isTikkun && State.player.tikkunTimer > 0) {
        State.decrementTikkunTimer();
    } else {
        State.endTikkun();
    }

    Entities.generateEntities(canvas.width, cameraY);
    Entities.updateEntities(cameraY, cameraSpeed, canvas.width, gameOver);
    Entities.updateParticles();
}


function gameOver() {
    if (State.getGameState() !== 'playing') return;
    State.setGameState('gameOver');
    touchOffset = null; // Ensure offset is cleared on game over
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