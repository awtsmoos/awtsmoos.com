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

case 'init':
    console.log("Worker received 'init' message. Setting up game instances.");
    console.log("Received payload:", JSON.stringify(data.payload, null, 2)); // <-- LOG 1: See the data from main.js

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        console.log("Cancelled previous animation frame.");
    }

    const { p1Canvas, p1Dimensions, p2Canvas, p2Dimensions, mode } = data.payload;

    gameInstances = []; // Reset instances
    
    if (p1Canvas && p1Dimensions) {
        console.log(`P1 Dimensions received: width=${p1Dimensions.width}, height=${p1Dimensions.height}`); // <-- LOG 2: Check dimensions
        p1Canvas.width = p1Dimensions.width;
        p1Canvas.height = p1Dimensions.height;
        
        const isP1AI = (mode === 'aivai');
        console.log("Creating Player 1 GameInstance..."); // <-- LOG 3
        gameInstances.push(new GameInstance(1, isP1AI, p1Canvas));
        console.log("Player 1 GameInstance created."); // <-- LOG 4
    } else {
        console.error("P1 Canvas or Dimensions were not provided in init payload!");
    }

    if (mode !== 'single' && p2Canvas && p2Dimensions) {
        console.log(`P2 Dimensions received: width=${p2Dimensions.width}, height=${p2Dimensions.height}`);
        p2Canvas.width = p2Dimensions.width;
        p2Canvas.height = p2Dimensions.height;
        
        console.log("Creating Player 2 GameInstance...");
        gameInstances.push(new GameInstance(2, true, p2Canvas));
        console.log("Player 2 GameInstance created.");
    }

    console.log(`Initializing ${gameInstances.length} game instances...`); // <-- LOG 5
    gameInstances.forEach(inst => inst.init());
    console.log("All instances initialized."); // <-- LOG 6

    if (gameInstances.length > 0) {
        console.log("Starting game loop..."); // <-- LOG 7
        gameLoop();
    } else {
        console.warn("No game instances were created. Game loop will not start.");
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