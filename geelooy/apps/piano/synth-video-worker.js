/*
 ב"ה 
B"H 
File: /scripts/awtsmoos/video/synth-video-worker.js
*/

// Import the base worker library
importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Project-Specific Drawing Constants ---
const UI_COLOR = {
    WHITE_KEY: 'rgb(255, 255, 255)',
    BLACK_KEY: 'rgb(0, 0, 0)',
    ACTIVE_WHITE: '#f0f0f0', // Slightly less bright for effect
    ACTIVE_BLACK: '#1a1a1a', 
    LABEL: 'rgb(0, 0, 0)',
    BACKGROUND: 'rgb(0, 0, 0)',
    BORDER: 'rgb(17, 17, 17)',
    ACTIVE_KEY_GLOW: 'rgba(0, 123, 255, 0.7)', // #007bff
    KEY_HEIGHT_RATIO: 0.6 
};

const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Function to pre-calculate all key positions (Slightly modified to return total width)
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
 */
async function synthWorkerLogic(context) {
    
    const { payload, canvasSource } = context; 
    const { resolution, keyPressData, style, alwaysDual, independentScroll, isVertical } = payload; 
    const ctx = context.ctx; 

    // Determine the keyboard layout based on main thread settings
    const isDualView = alwaysDual || isVertical;
    const numOctaves = isDualView && !independentScroll ? 8 : 4;
    const bottomStartOctave = parseInt(payload.startOctave || 1);
    const topStartOctave = isDualView && !independentScroll ? bottomStartOctave : bottomStartOctave + 4;
    
    // --- 1. Keyboard Dimensions & Layout Calculations ---
    const keyboardHeight = resolution.height / (isDualView ? 2 : 1) * 0.95; // 95% of row height
    const whiteKeyHeight = keyboardHeight;
    const blackKeyHeight = whiteKeyHeight * UI_COLOR.KEY_HEIGHT_RATIO;
    const { layout: layoutBottom } = calculateKeyLayout(bottomStartOctave, 8, style.whiteKeyWidth);
    
    let layoutTop = [];
    if (isDualView) {
        // Only calculate top layout if in dual view, using the correct start offset
        const { layout: layoutTopCalc } = calculateKeyLayout(topStartOctave, 8, style.whiteKeyWidth);
        layoutTop = layoutTopCalc;
    }
    
    // --- 2. Drawing Function with Shadows/Gradients ---
    
    const renderKey = (key, xOffset, yStart, rowHeight, activeKeySet) => {
        const isActive = activeKeySet.has(key.note);
        const xPos = key.x - xOffset;
        const width = key.width;
        const height = key.isBlack ? blackKeyHeight : whiteKeyHeight;
        const yPos = yStart + rowHeight - height; // Draw from the bottom of the row

        // Skip if key is entirely off-screen
        if (xPos + width < 0 || xPos > resolution.width) return;

        ctx.save();
        ctx.beginPath();
        ctx.rect(xPos, yPos, width, height);
        ctx.clip(); // Ensure gradients/shadows don't bleed

        // Subtle Key Body Fill (Gradient for 3D effect)
        let gradient = ctx.createLinearGradient(xPos, yPos, xPos, yPos + height);
        if (key.isBlack) {
            gradient.addColorStop(0, isActive ? UI_COLOR.ACTIVE_BLACK : UI_COLOR.BLACK_KEY);
            gradient.addColorStop(1, '#080808'); 
            ctx.fillStyle = gradient;
        } else {
            gradient.addColorStop(0, isActive ? UI_COLOR.ACTIVE_WHITE : UI_COLOR.WHITE_KEY);
            gradient.addColorStop(1, '#e0e0e0');
            ctx.fillStyle = gradient;
            
            // Subtle White Key Shadow/Border
            ctx.strokeStyle = UI_COLOR.BORDER;
            ctx.lineWidth = 1;
            ctx.strokeRect(xPos, yPos, width, height);
        }
        ctx.fill();

        // Active Light (Flash Effect)
        if (isActive) {
            ctx.fillStyle = UI_COLOR.ACTIVE_KEY_GLOW;
            ctx.fillRect(xPos, yPos + height - 10, width, 10);
        }
        
        // Key Label
        ctx.fillStyle = key.isBlack ? UI_COLOR.WHITE_KEY : UI_COLOR.LABEL;
        ctx.font = `${key.isBlack ? 16 : 24}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(key.note, xPos + width / 2, yPos + height - 10);
        
        ctx.restore();
    };
    
    // --- 3. Rendering Loop Setup ---

    const FRAME_RATE = 30; 
    const FRAME_DURATION = 1 / FRAME_RATE;
    let frameTime = 0;
    let dataIndex = 0;
    
    if (keyPressData.length === 0 || keyPressData[0].time !== 0) {
        keyPressData.unshift({ time: 0, keys: [], scrollX: 0, scrollX2: 0, keyboardWidth: style.keyboardWidth, keyWidth: style.whiteKeyWidth });
    }
    
    const totalAudioDuration = payload.audioBufferShim ? payload.audioBufferShim.duration : 0;
    
    // Get the scroll state property names based on independence
    const getScrollX = (data, logicalIndex) => {
        if (!isDualView || !independentScroll || logicalIndex === 0) return data.scrollX || 0;
        return data.scrollX2 || 0;
    };
    
    // The total height of one keyboard row
    const rowHeight = resolution.height / (isDualView ? 2 : 1);
    
    while (dataIndex < keyPressData.length || frameTime < totalAudioDuration) {
        
        const currentData = keyPressData[Math.min(dataIndex, keyPressData.length - 1)];
        const nextData = keyPressData[dataIndex + 1];
        
        let endTime = nextData ? nextData.time : totalAudioDuration + 0.1; 
        endTime = Math.min(endTime, totalAudioDuration + FRAME_DURATION); 

        if (dataIndex >= keyPressData.length && frameTime >= totalAudioDuration) break;
        
        while (frameTime < endTime) {
            
            // a. Clear Canvas & Set Background
            ctx.fillStyle = UI_COLOR.BACKGROUND;
            ctx.fillRect(0, 0, resolution.width, resolution.height);
            
            // b. Set Active Keys
            const activeKeySet = new Set(currentData.keys.map(k => k.note));
            
            // --- DRAW BOTTOM KEYBOARD (Logical Index 0) ---
            const scrollX0 = getScrollX(currentData, 0);
            
            // Draw Z-index 1 (White keys)
            layoutBottom.forEach(key => renderKey(key, scrollX0, rowHeight * (isDualView ? 1 : 0), rowHeight, activeKeySet));
            // Draw Z-index 2 (Black keys)
            layoutBottom.forEach(key => renderKey(key, scrollX0, rowHeight * (isDualView ? 1 : 0), rowHeight, activeKeySet));

            // --- DRAW TOP KEYBOARD (Logical Index 1) ---
            if (isDualView) {
                 const scrollX1 = getScrollX(currentData, 1);
                 
                 // The top keyboard is positioned at y=0, with its own scroll
                 layoutTop.forEach(key => renderKey(key, scrollX1, 0, rowHeight, activeKeySet));
                 layoutTop.forEach(key => renderKey(key, scrollX1, 0, rowHeight, activeKeySet));

                 // Draw a subtle separator line
                 ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                 ctx.lineWidth = 2;
                 ctx.beginPath();
                 ctx.moveTo(0, rowHeight);
                 ctx.lineTo(resolution.width, rowHeight);
                 ctx.stroke();
            }

            // c. Add the rendered frame to Mediabunny
            await canvasSource.add(frameTime, FRAME_DURATION); 
            
            frameTime += FRAME_DURATION;
            
            self.postMessage({
                type: 'PROGRESS_UPDATE',
                payload: {
                    percent: Math.min(95, Math.floor(frameTime / totalAudioDuration * 100))
                }
            });
        }
        
        dataIndex++;
    }
    
    if (frameTime < totalAudioDuration) {
        await canvasSource.add(frameTime, totalAudioDuration - frameTime);
    }
}

// Bootstrap the worker with the project-specific logic
bootstrapMediabunnyWorker(synthWorkerLogic, {
    libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js' 
});