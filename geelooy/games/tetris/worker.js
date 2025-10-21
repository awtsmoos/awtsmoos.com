// B"H
// worker.js

// Import scripts immediately. This is a synchronous operation within the worker's event loop,
// meaning the script will pause here until they are fetched and executed.
try {
    importScripts('constants.js', 'aiEngine.js', 'gameInstance.js');
} catch (e) {
    console.error("CRITICAL: Failed to import one or more scripts.", e);
    // If scripts fail to load, we cannot proceed.
    // Close the worker to prevent further errors.
    self.close();
}


let gameInstances = [];
let animationFrameId = null;

// --- MAIN GAME LOOP ---
function gameLoop(timestamp) {
    // Stop the loop if there are no more instances or if an error occurred.
    if (gameInstances.length === 0) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        return;
    }
    
    try {
        gameInstances.forEach(inst => {
            inst.update(timestamp);
            inst.draw();
        });
        animationFrameId = requestAnimationFrame(gameLoop);
    } catch (e) {
        console.error("FATAL ERROR IN GAME LOOP:", e);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = null; // Stop the loop on fatal error
    }
}

// --- MAIN WORKER MESSAGE HANDLER ---
self.onmessage = ({ data }) => {
    // **THE FIX**: All logic is now inside the message handler.
    // This guarantees that the `importScripts` command has completed before any of this code runs.
    try {
        switch (data.type) {
            case 'init':
                console.log("Worker received 'init' message. Setting up game instances.");

                // If a game is already running, cancel it before starting a new one.
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                
                const { p1Canvas, p2Canvas, mode } = data.payload;

                gameInstances = []; // Reset instances
                if (p1Canvas) {
                    const isP1AI = (mode === 'aivai');
                    gameInstances.push(new GameInstance(1, isP1AI, p1Canvas));
                }
                if (mode !== 'single' && p2Canvas) {
                    gameInstances.push(new GameInstance(2, true, p2Canvas));
                }

                gameInstances.forEach(inst => inst.init());

                // Start the game loop only after successful initialization.
                if (!animationFrameId) {
                    gameLoop();
                }
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

console.log("Worker script fully loaded and ready for messages.");