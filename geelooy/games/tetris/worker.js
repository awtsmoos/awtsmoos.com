// B"H
// worker.js

// Import scripts immediately. This is a synchronous operation within the worker's event loop,
// meaning the script will pause here until they are fetched and executed.
try {
    importScripts('constants.js', 'effects.js', 'aiEngine.js', 'gameInstance.js');
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
    if (gameInstances.length === 0) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        return;
    }
    
    // This log will be very noisy, but it confirms the loop is running.
    // You can comment it out later.
    //console.log(`Game loop running. Timestamp: ${timestamp}`); // <-- LOG 8

    try {
        gameInstances.forEach(inst => {
            inst.update(timestamp);
            inst.draw();
        });
        animationFrameId = requestAnimationFrame(gameLoop);
    } catch (e) {
        console.error("FATAL ERROR IN GAME LOOP:", e);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// --- MAIN WORKER MESSAGE HANDLER ---
self.onmessage = ({ data }) => {
    // **THE FIX**: All logic is now inside the message handler.
    // This guarantees that the `importScripts` command has completed before any of this code runs.
    try {
        switch (data.type) {
        // B"H
// In worker.js, inside the self.onmessage function

// B"H
// In worker.js, replace the 'init' case inside self.onmessage with this.

case 'init':
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    // --- START OF FIX ---
    const { p1Canvas, p1Dimensions, p1Dpr, p2Canvas, p2Dimensions, p2Dpr, mode } = data.payload;

    gameInstances = []; 
    
    if (p1Canvas && p1Dimensions) {
        // Set the REAL canvas resolution using the pixel density
        p1Canvas.width = p1Dimensions.width * p1Dpr;
        p1Canvas.height = p1Dimensions.height * p1Dpr;
        
        const isP1AI = (mode === 'aivai');
        // Pass the original CSS dimensions and the density to the game instance
        gameInstances.push(new GameInstance(1, isP1AI, p1Canvas, p1Dimensions, p1Dpr));
    }

    if (mode !== 'single' && p2Canvas && p2Dimensions) {
        p2Canvas.width = p2Dimensions.width * p2Dpr;
        p2Canvas.height = p2Dimensions.height * p2Dpr;
        gameInstances.push(new GameInstance(2, true, p2Canvas, p2Dimensions, p2Dpr));
    }
    // --- END OF FIX ---

    gameInstances.forEach(inst => inst.init());

    if (gameInstances.length > 0) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    break;

// --- Add logging to the game loop ---

        
            // B"H
// In worker.js, inside the self.onmessage function



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