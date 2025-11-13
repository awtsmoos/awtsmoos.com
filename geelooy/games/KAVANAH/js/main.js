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
    State.updateAscension(cameraSpeed * 0.1);

    // --- DIRECT POSITIONAL MOVEMENT REWORK ---
    // The previous velocity-based system felt indirect. This new system maps the
    // player's position directly to the user's finger movement for a true 1-to-1 feel.
    const player = State.getPlayer();
    const touchAnchor = Controls.getTouchAnchor();

    if (touchAnchor) {
        // Get the current drag distance from the starting touch point.
        const controlVector = Controls.getControlVector();
        
        // The player's new position is their starting position plus the drag distance.
        const newX = touchAnchor.playerStartX + controlVector.x;
        const newY = touchAnchor.playerStartY + controlVector.y;
        
        // Set the player's position directly.
        State.setPlayerPosition(newX, newY);

    } else {
        // When not touching, ensure player has no residual velocity.
        State.setPlayerVelocity(0, 0);
    }
    
    // Applies any velocity (which is 0 during touch control) and keeps player in bounds.
    State.updatePlayerPosition();
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
    },
    gameOver 
);

resizeCanvas();
gameLoop();