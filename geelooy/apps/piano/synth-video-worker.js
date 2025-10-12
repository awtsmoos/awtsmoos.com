/*
 ב"ה

B"H
File: /scripts/awtsmoos/video/synth-video-worker.js
Description: A high-performance, cinematic piano renderer with perfect 1:1 UI mirroring.
VERSION 19.0 - The "Event-Driven Nova" Edition (Superior Accuracy & Visuals)
*/

importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

// --- Global State ---
let keyEvents = [];
let scrollEvents = [];
let bottomKeyboardLayout = null, topKeyboardLayout = null;
let keyCache = {};
let particles = [];
let starfield = [];
let zoomFactor = 1;
let mediaBunny = null;

// --- "NOVA" VISUAL STYLE ---
const UI_STYLE = {
    BACKGROUND_COLOR: '#010103',
    STAR_COLOR: 'rgba(200, 220, 255, 0.6)',
    WHITE_KEY_FILL: '#dfe2e8',
    WHITE_KEY_AO: 'rgba(0, 0, 0, 0.25)',
    BLACK_KEY_FILL: '#121317',
    BLACK_KEY_HIGHLIGHT: 'rgba(255, 255, 255, 0.1)',
    
    // Enhanced Active State Visuals
    ACTIVE_KEY_COLOR: '#ff33cc', // Vibrant Pink/Magenta
    ACTIVE_KEY_GLOW: 'rgba(255, 51, 204, 0.7)',
    PARTICLE_COLOR: 'rgba(255, 100, 220, 0.9)',
    SHOCKWAVE_COLOR: 'rgba(255, 51, 204, 0.25)',
    
    // Label Colors for visibility
    LABEL_COLOR_WHITE_KEY: '#707080',
    LABEL_COLOR_BLACK_KEY: '#a0a0b0',
    ACTIVE_LABEL_COLOR: '#FFFFFF'
};

const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// --- Utility & Setup Functions ---

function calculateKeyLayout(startOctave, numOctaves, whiteKeyWidth) {
    const layout = [];
    let whiteKeyX = 0;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    for (let oct = startOctave; oct < startOctave + numOctaves; oct++) {
        NOTE_NAMES_FLAT.forEach(note => {
            const isBlack = note.includes('b');
            const noteName = (isBlack ? note.replace('b', '#') : note) + oct;
            layout.push({
                note: noteName, isBlack, x: isBlack ? whiteKeyX - (blackKeyWidth / 2) : whiteKeyX,
                width: isBlack ? blackKeyWidth : whiteKeyWidth, pressAnimation: 0
            });
            if (!isBlack) whiteKeyX += whiteKeyWidth;
        });
    }
    return layout;
}

function cacheKeyRenders(whiteKeyWidth, whiteKeyHeight) {
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = whiteKeyHeight * 0.65; // Standard black key height ratio
    
    // White Key
    const wCanvas = new OffscreenCanvas(whiteKeyWidth, whiteKeyHeight);
    const wCtx = wCanvas.getContext('2d');
    wCtx.fillStyle = UI_STYLE.WHITE_KEY_FILL;
    wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
    const aoGradient = wCtx.createLinearGradient(0, 0, whiteKeyWidth, 0);
    aoGradient.addColorStop(0, UI_STYLE.WHITE_KEY_AO);
    aoGradient.addColorStop(0.1, 'transparent');
    aoGradient.addColorStop(0.9, 'transparent');
    aoGradient.addColorStop(1, UI_STYLE.WHITE_KEY_AO);
    wCtx.fillStyle = aoGradient;
    wCtx.fillRect(0, 0, whiteKeyWidth, whiteKeyHeight);
    keyCache['white_default'] = wCanvas;

    // Black Key
    const bCanvas = new OffscreenCanvas(blackKeyWidth, blackKeyHeight);
    const bCtx = bCanvas.getContext('2d');
    bCtx.fillStyle = UI_STYLE.BLACK_KEY_FILL;
    bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
    const bGradient = bCtx.createLinearGradient(0, 0, blackKeyWidth, 0);
    bGradient.addColorStop(0, UI_STYLE.BLACK_KEY_HIGHLIGHT);
    bGradient.addColorStop(0.5, 'transparent');
    bCtx.fillStyle = bGradient;
    bCtx.fillRect(0, 0, blackKeyWidth, blackKeyHeight);
    keyCache['black_default'] = bCanvas;
}

function createParticles(x, y) {
    const particleCount = 60; // More particles for a richer effect
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 200 + 50;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: Math.random() * 1.5 + 0.5, // Lifespan between 0.5 and 2 seconds
            initialLife: -1,
            radius: Math.random() * 2 + 1
        });
    }
}

// --- The Core Drawing Logic ---
function drawKeyboardFrame(ctx, canvas, frameTime, deltaTime) {
    const { payload } = mediaBunny.config;
    const { resolution, style, alwaysDual, independentScroll, isVertical } = payload;

    // --- 1. DETERMINE CURRENT STATE FROM EVENT LOGS ---
    const activeKeys = new Set();
    keyEvents.forEach(event => {
        if (frameTime >= event.start && frameTime < event.end) {
            activeKeys.add(event.note);
        }
    });

    let currentScrollX = 0, currentScrollX2 = 0;
    const relevantScrollEvent = scrollEvents.slice().reverse().find(e => e.time <= frameTime);
    if (relevantScrollEvent) {
        currentScrollX = relevantScrollEvent.scrollX;
        currentScrollX2 = relevantScrollEvent.scrollX2;
    }

    // --- 2. UPDATE ANIMATIONS ---
    const allLayouts = [bottomKeyboardLayout, topKeyboardLayout].filter(Boolean);
    allLayouts.forEach(layout => {
        layout.forEach(key => {
            const isActive = activeKeys.has(key.note);
            const targetAnimation = isActive ? 1.0 : 0.0;
            const animationSpeed = isActive ? 8.0 : 4.0; // Faster press, slower release
            if (Math.abs(key.pressAnimation - targetAnimation) > 0.01) {
                key.pressAnimation += (targetAnimation - key.pressAnimation) * animationSpeed * deltaTime;
            } else {
                key.pressAnimation = targetAnimation;
            }
            // Trigger particles on the first frame of being pressed
            if (isActive && key.pressAnimation > 0.95 && (key.pressAnimation - (targetAnimation - key.pressAnimation) * animationSpeed * deltaTime) < 0.95) {
                 const keyScreenX = key.x - (key.isBlack ? currentScrollX : currentScrollX); // Simplified for particle position
                 createParticles(keyScreenX + key.width / 2, canvas.height / 2);
            }
        });
    });

    // --- 3. DRAWING ---
    ctx.save();
    
    // Background
    ctx.fillStyle = UI_STYLE.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, resolution.width, resolution.height);
    starfield.forEach(star => { star.y += star.speed * deltaTime; if(star.y > resolution.height) {star.y=0; star.x=Math.random()*resolution.width;} });
    ctx.fillStyle = UI_STYLE.STAR_COLOR;
    starfield.forEach(star => ctx.fillRect(star.x, star.y, star.size, star.size));

    // Scale context to mirror user's view
    ctx.scale(zoomFactor, zoomFactor);

    const isDualView = alwaysDual || isVertical;
    const unscaledRowHeight = (resolution.height / zoomFactor) / (isDualView ? 2 : 1);

    // Render Function per Key
    const renderKey = (key, keyScreenX, yStart) => {
        const whiteKeyHeight = unscaledRowHeight * 0.95;
        const blackKeyHeight = whiteKeyHeight * 0.65;
        const pressDepth = key.pressAnimation * 4;
        
        const yPos = yStart + (key.isBlack ? 0 : unscaledRowHeight - whiteKeyHeight);
        const height = key.isBlack ? blackKeyHeight : whiteKeyHeight;
        
        const keyImage = keyCache[`${key.isBlack ? 'black' : 'white'}_default`];
        if (!keyImage) return;

        // Draw Base Key
        ctx.drawImage(keyImage, keyScreenX, yPos + pressDepth);
        
        // Active State Visuals
        if (key.pressAnimation > 0) {
            ctx.globalAlpha = key.pressAnimation;

            // 1. Solid Color Fill
            ctx.fillStyle = UI_STYLE.ACTIVE_KEY_COLOR;
            ctx.fillRect(keyScreenX, yPos + pressDepth, key.width, height);

            // 2. Center Glow
            const glowGradient = ctx.createRadialGradient(
                keyScreenX + key.width / 2, yPos + height / 2 + pressDepth, 0,
                keyScreenX + key.width / 2, yPos + height / 2 + pressDepth, key.width * 0.8
            );
            glowGradient.addColorStop(0, 'rgba(255,255,255,0.4)');
            glowGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(keyScreenX, yPos + pressDepth, key.width, height);

            // 3. Shockwave
            const shockwaveRadius = (1 - key.pressAnimation) * key.width * 1.5;
            ctx.globalAlpha = key.pressAnimation * 0.5;
            ctx.beginPath();
            ctx.arc(keyScreenX + key.width / 2, yPos + height / 2, shockwaveRadius, 0, Math.PI * 2);
            ctx.strokeStyle = UI_STYLE.SHOCKWAVE_COLOR;
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.globalAlpha = 1;
        }

        // Draw Labels (ON ALL KEYS)
        const isActive = key.pressAnimation > 0.5;
        ctx.font = `bold ${style.userKeyWidth * 0.22}px sans-serif`;
        ctx.textAlign = 'center';
        if (key.isBlack) {
            ctx.fillStyle = isActive ? UI_STYLE.ACTIVE_LABEL_COLOR : UI_STYLE.LABEL_COLOR_BLACK_KEY;
            ctx.textBaseline = 'middle';
            ctx.fillText(key.note.slice(0,-1), keyScreenX + key.width / 2, yPos + height * 0.8);
        } else {
            ctx.fillStyle = isActive ? UI_STYLE.ACTIVE_LABEL_COLOR : UI_STYLE.LABEL_COLOR_WHITE_KEY;
            ctx.textBaseline = 'bottom';
            ctx.fillText(key.note, keyScreenX + key.width / 2, yStart + unscaledRowHeight - (unscaledRowHeight * 0.05));
        }
    };

    const renderRow = (layout, yStart, transform) => {
        if (!layout) return;
        const renderPass = isBlackPass => layout.forEach(key => {
            if (key.isBlack !== isBlackPass) return;
            const keyScreenX = key.x + transform;
            if (keyScreenX + key.width > 0 && keyScreenX < style.userViewportWidth) {
                 renderKey(key, keyScreenX, yStart);
            }
        });
        renderPass(false); // White keys first
        renderPass(true);  // Black keys on top
    };

    const bottomTransform = -currentScrollX;
    renderRow(bottomKeyboardLayout, isDualView ? unscaledRowHeight : 0, bottomTransform);
    if (isDualView) {
        const topTransform = independentScroll ? -currentScrollX2 : (style.userViewportWidth - currentScrollX);
        renderRow(topKeyboardLayout, 0, topTransform);
    }
    
    // Particles
    for (let i = particles.length - 1; i >= 0; i--) { 
        const p = particles[i]; 
        if(p.initialLife === -1) p.initialLife = p.life;
        p.x += p.vx * deltaTime; 
        p.y += p.vy * deltaTime; 
        p.vy += 350 * deltaTime; // Gravity
        p.life -= deltaTime; 
        const lifePercent = Math.max(0, p.life / p.initialLife); 
        if (lifePercent <= 0) { 
            particles.splice(i, 1); 
        } else { 
            ctx.globalAlpha = lifePercent; 
            ctx.fillStyle = UI_STYLE.PARTICLE_COLOR; 
            ctx.beginPath(); 
            ctx.arc(p.x, p.y, p.radius * lifePercent, 0, Math.PI * 2); 
            ctx.fill(); 
        } 
    }
    
    ctx.restore();

    // Separator line
    if (isDualView) { ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, resolution.height / 2); ctx.lineTo(resolution.width, resolution.height / 2); ctx.stroke(); }
}


// --- Main Worker Logic ---

self.onmessage = async (e) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'INITIALIZE_RENDERER':
            mediaBunny = new MediaBunny.BaseRenderer(payload);
            const { resolution, style, startOctave, alwaysDual, independentScroll, isVertical } = payload;
            
            const baseStartOctave = parseInt(startOctave);
            const userKeyWidth = style.userKeyWidth;
            const isDualView = alwaysDual || isVertical;
            
            bottomKeyboardLayout = calculateKeyLayout(baseStartOctave, isDualView ? (independentScroll ? 4 : 8) : 8, userKeyWidth);
            if (isDualView) {
                topKeyboardLayout = calculateKeyLayout(baseStartOctave + (independentScroll ? 4 : 0), isDualView ? (independentScroll ? 4 : 8) : 8, userKeyWidth);
            }
            
            const userViewportWidth = style.userViewportWidth || resolution.width;
            zoomFactor = userViewportWidth > 0 ? resolution.width / userViewportWidth : 1;
            const rowHeight = (resolution.height / zoomFactor) / (isDualView ? 2 : 1);
            
            cacheKeyRenders(userKeyWidth, rowHeight * 0.95);
            for(let i=0; i<500; i++) starfield.push({x: Math.random() * resolution.width, y: Math.random() * resolution.height, speed: Math.random() * 15 + 2, size: Math.random() * 1.5 + 0.5});
            
            mediaBunny.postStatus('Renderer Initialized and Ready.');
            break;

        case 'ADD_KEY_EVENT':
            keyEvents.push(payload);
            break;
            
        case 'UPDATE_SCROLL':
            scrollEvents.push(payload);
            break;
            
        case 'FINALIZE_MUXING':
            mediaBunny.postStatus('Received audio. Beginning frame rendering...');
            await mediaBunny.initAudio(payload.audioBufferShim);
            
            const { canvas, ctx } = mediaBunny.getCanvasContext();
            const { fps, duration } = mediaBunny.config.outputFormat;
            const totalFrames = Math.floor(duration * fps);
            const deltaTime = 1 / fps;

            for (let i = 0; i < totalFrames; i++) {
                const frameTime = i * deltaTime;
                drawKeyboardFrame(ctx, canvas, frameTime, deltaTime);
                await mediaBunny.addFrame(canvas);
                
                if (i % fps === 0) { // Update progress every second
                    const percent = ((i / totalFrames) * 100).toFixed(1);
                    mediaBunny.postProgress(percent, `Rendering video... ${percent}%`);
                }
            }
            
            mediaBunny.postStatus('Muxing audio and video...');
            await mediaBunny.finalize();
            const blob = mediaBunny.getBlob();
            mediaBunny.postComplete(blob, { download: true, fileName: `BH-WebSynth-Nova-${Date.now()}.mp4` });
            break;
    }
};