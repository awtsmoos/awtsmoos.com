/*
 ב"ה 
B"H 
File: /scripts/awtsmoos/video/synth-video-worker.js
*/

// Import the base worker library (assuming it's in the same directory)
importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js'); // NOTE: The typo 'wirker' is maintained as per your path

// --- Project-Specific Drawing Constants ---
const UI_COLOR = {
// ... (UI_COLOR and NOTE_NAMES_FLAT are unchanged)
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

// Function to pre-calculate all key positions (unchanged)
function calculateKeyLayout(startOctave, numOctaves, whiteKeyWidth) {
// ... (unchanged)
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
    // --- CONTEXT CHANGE: Access mediabunny components directly ---
    const { payload, canvasSource } = context; 
    
    // FIX: Access resolution directly from payload
    const { resolution, keyPressData, style } = payload; 
    
    const ctx = context.ctx; // OffscreenCanvas context
    // Video-specific constants
    const FRAME_RATE = 30; // 30 FPS for smooth key transitions if needed
    const FRAME_DURATION = 1 / FRAME_RATE;
    
    // --- 1. Calculate Keyboard Layout ---
    // Assuming the video focuses on the bottom keyboard (octave 1 to 8, total 8 octaves)
    const { layout } = calculateKeyLayout(
        parseInt(payload.startOctave || 1), // Use the start octave passed from the main thread
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
    
    // Find the total audio duration to ensure video length matches
    const totalAudioDuration = payload.audioBufferShim ? payload.audioBufferShim.duration : 0;
    
    // The loop will continue until all key states are processed AND the audio duration is met.
    while (dataIndex < keyPressData.length || frameTime < totalAudioDuration) {
        
        const currentData = keyPressData[Math.min(dataIndex, keyPressData.length - 1)];
        const nextData = keyPressData[dataIndex + 1];
        
        // Determine the time until the next key state change
        let endTime = nextData ? nextData.time : totalAudioDuration + 0.1; 
        
        // Clamp the end time to the total audio duration
        endTime = Math.min(endTime, totalAudioDuration + FRAME_DURATION); 

        // If frameTime has passed the end of the last recorded state, break the outer loop (will be caught by totalAudioDuration check)
        if (dataIndex >= keyPressData.length && frameTime >= totalAudioDuration) break;
        
        // Loop from the current state time up to the next state time/audio end
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
                // Use the scrollX and keyboard width from the recorded data
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
            // --- CONTEXT CHANGE: Use canvasSource ---
            await canvasSource.add(frameTime, FRAME_DURATION); 
            
            // Increment frame time
            frameTime += FRAME_DURATION;
            
            self.postMessage({
                type: 'PROGRESS_UPDATE',
                payload: {
                    percent: Math.min(95, Math.floor(frameTime / totalAudioDuration * 100))
                }
            });
        }
        
        // Move to the next key press data point only after the frame loop finishes the segment
        dataIndex++;
    }
    
    // Ensure the final frame is rendered up to the total duration
    if (frameTime < totalAudioDuration) {
        await canvasSource.add(frameTime, totalAudioDuration - frameTime);
    }
}

// Bootstrap the worker with the project-specific logic
bootstrapMediabunnyWorker(synthWorkerLogic, {
    // Assuming the base worker and the library are in the same directory relative to this file
    libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' 
});