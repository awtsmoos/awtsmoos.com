// B"H
// worker.js

// Import the modularized scripts. The order is important.
importScripts('constants.js', 'aiEngine.js', 'gameInstance.js');

let gameInstances = [];
let animationFrameId;

// --- MAIN GAME LOOP ---
function gameLoop(timestamp) {
    try {
        gameInstances.forEach(inst => {
            inst.update(timestamp);
            inst.draw();
        });
        animationFrameId = requestAnimationFrame(gameLoop);
    } catch (e) {
        console.error("FATAL ERROR IN GAME LOOP:", e);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }
}

// --- MAIN WORKER MESSAGE HANDLER ---
self.onmessage = ({ data }) => {
    try {
        switch (data.type) {
            case 'init':
                const { p1Canvas, p2Canvas, mode } = data.payload;

                gameInstances = [];
                if (p1Canvas) {
                    const isP1AI = (mode === 'aivai');
                    gameInstances.push(new GameInstance(1, isP1AI, p1Canvas));
                }
                if (mode !== 'single' && p2Canvas) {
                    gameInstances.push(new GameInstance(2, true, p2Canvas)); // P2 is always AI
                }

                gameInstances.forEach(inst => inst.init());

                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                gameLoop();
                break;

            case 'input':
                const player1 = gameInstances.find(i => i.id === 1 && !i.isAI);
                if (player1) {
                    const { action, value } = data.payload;
                    switch (action) {
                        case 'move': player1.move(value); break;
                        case 'rotate': player1.rotate(); break;
                        case 'hard_drop': player1.hardDrop(); break;
                        case 'soft_drop_start': player1.isSoftDropping = true; break;
                        case 'soft_drop_end': player1.isSoftDropping = false; break;
                    }
                }
                break;
        }
    } catch (e) {
        console.error("UNHANDLED WORKER ERROR:", e);
    }
};