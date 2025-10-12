/*
 ਬ"ה 
B"H 
*/

// Import the base worker library (assuming it's in the same directory)
importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Project-Specific Drawing Constants ---
const UI_COLOR = {
    WHITE_KEY: 'rgb(255, 255, 255)',
    BLACK_KEY: 'rgb(0, 0, 0)',
    ACTIVE_WHITE: 'rgb(204, 204, 204)', // #ccc
    ACTIVE_BLACK: 'rgb(68, 68, 68)',   // #444
    LABEL: 'rgb(0, 0, 0)',
    BACKGROUND: 'rgb(0, 0, 0)',
    BORDER: 'rgb(17, 17, 17)',
    ACTIVE_KEY_LIGHT: 'rgba(0, 123, 255, 0.7)', // #007bff
    KEY_HEIGHT_RATIO: 0.6 // Black key height relative to white key height
};

const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Function to pre-calculate all key positions (same logic as main keyboard generation)
function calculateKeyLayout(startOctave, numOctaves, whiteKeyWidth) {
    const layout = [];
    let whiteKeyX = 0;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const baseStartOctave = startOctave;

    for (let oct = baseStartOctave; oct < baseStartOctave + numOctaves; oct++) { 
        NOTE_NAMES_FLAT.forEach(note => { 
            if (oct + (NOTE_NAMES_FLAT.indexOf(note)/12) > 8.5) return;

            const isBlack = note.includes('b');
            const noteName = (isBlack ? note.replace('b', '#') : note) + oct;

            let keyX;
            if (isBlack) { 
                keyX = whiteKeyX - (blackKeyWidth / 2);
            } else { 
                keyX = whiteKeyX;
                whiteKeyX += whiteKeyWidth;
            } 
            
            layout.push({
                note: noteName,
                isBlack: isBlack,
                x: keyX,
                width: isBlack ? blackKeyWidth : whiteKeyWidth,
                zIndex: isBlack ? 2 : 1,
            });
        }); 
    }
    return { layout, totalWidth: whiteKeyX };
}


/**
 * The core video rendering logic for the Web Synth.
 * Renders one frame for every state change recorded.
 */
async function synthWorkerLogic(context) {
    const { payload, renderer, canvas, ctx } = context;
    const { keyPressData, resolution, style } = payload;
    
    // Video-specific constants
    const FRAME_RATE = 30; // 30 FPS for smooth key transitions if needed
    const FRAME_DURATION = 1 / FRAME_RATE;
    
    // --- 1. Calculate Keyboard Layout ---
    // Assuming the video focuses on the bottom keyboard (octave 0, 8 octaves)
    const { layout } = calculateKeyLayout(
        parseInt(payload.startOctave || 1), // Default start octave C1 or C4 as per settings
        8, 
        style.whiteKeyWidth
    );
    const keyboardHeight = resolution.height * 0.9; // Keyboard takes up 90% of screen height
    const whiteKeyHeight = keyboardHeight;
    const blackKeyHeight = whiteKeyHeight * UI_COLOR.KEY_HEIGHT_RATIO;
    
    let frameTime = 0;
    let dataIndex = 0;
    
    // --- 2. Rendering Loop ---
    
    // Create an empty state at T=0 to start from
    if (keyPressData.length === 0 || keyPressData[0].time !== 0) {
        keyPressData.unshift({ time: 0, keys: [], scrollX: 0, keyboardWidth: style.keyboardWidth, keyWidth: style.whiteKeyWidth });
    }
    
    // Iterate through key press data to determine frame rendering times
    while (dataIndex < keyPressData.length) {
        
        const currentData = keyPressData[dataIndex];
        const nextData = keyPressData[dataIndex + 1];
        
        let endTime = nextData ? nextData.time : currentData.time + 1.0; // Last state holds for 1 second
        
        // Loop from the current state time up to the next state time (or end of video)
        while (frameTime < endTime) {
            
            // a. Clear Canvas & Set Background
            ctx.fillStyle = UI_COLOR.BACKGROUND;
            ctx.fillRect(0, 0, resolution.width, resolution.height);
            
            // b. Draw Keys (Black keys first for correct Z-index)
            
            // Determine active keys (for quick lookup)
            const activeKeySet = new Set(currentData.keys.map(k => k.note));
            
            const renderKey = (key, isTopLayer) => {
                if (key.isBlack !== isTopLayer) return;

                const isActive = activeKeySet.has(key.note);
                const xPos = key.x - currentData.scrollX;
                const width = key.width;
                const height = key.isBlack ? blackKeyHeight : whiteKeyHeight;
                const yPos = resolution.height - height; // Draw from the bottom

                // Skip if key is entirely off-screen
                if (xPos + width < 0 || xPos > resolution.width) return;

                // Key Body
                ctx.fillStyle = isActive 
                    ? (key.isBlack ? UI_COLOR.ACTIVE_BLACK : UI_COLOR.ACTIVE_WHITE)
                    : (key.isBlack ? UI_COLOR.BLACK_KEY : UI_COLOR.WHITE_KEY);
                
                ctx.fillRect(xPos, yPos, width, height);
                
                // Key Border (Simple line for contrast)
                ctx.strokeStyle = UI_COLOR.BORDER;
                ctx.strokeRect(xPos, yPos, width, height);

                // Active Light (Simple flash on active)
                if (isActive) {
                    ctx.fillStyle = UI_COLOR.ACTIVE_KEY_LIGHT;
                    ctx.fillRect(xPos, yPos + height - 10, width, 10);
                }
                
                // Key Label
                ctx.fillStyle = key.isBlack ? UI_COLOR.WHITE_KEY : UI_COLOR.LABEL;
                ctx.font = `${key.isBlack ? 16 : 24}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText(key.note, xPos + width / 2, yPos + height - 10);
            };

            // Draw white keys (Z-index 1)
            layout.forEach(key => renderKey(key, false));
            // Draw black keys (Z-index 2)
            layout.forEach(key => renderKey(key, true));

            // c. Add the rendered frame to Mediabunny
            await renderer.addFrame(frameTime, FRAME_DURATION);
            
            // Increment frame time
            frameTime += FRAME_DURATION;
            
            self.postMessage({
                type: 'PROGRESS_UPDATE',
                payload: {
                    percent: Math.min(95, Math.floor(frameTime / payload.audioBufferShim.duration * 100))
                }
            });
        }
        
        // Move to the next key press data point
        dataIndex++;
    }
    
    // Ensure the video duration matches the audio duration
    // The last state is drawn up until audio duration
    while (frameTime < payload.audioBufferShim.duration) {
         // Render the final (silent) frame
         await renderer.addFrame(frameTime, FRAME_DURATION);
         frameTime += FRAME_DURATION;
    }
}

// Bootstrap the worker with the project-specific logic
bootstrapMediabunnyWorker(synthWorkerLogic, {
    // Assuming the base worker is in the same folder as mediabunny-library.js
    libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' 
});