//B"H
import * as C from './constants.js';

// --- Assets ---
const cloudImage = new Image();
cloudImage.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 80%22><text y=%22.9em%22 font-size=%2270%22>☁️</text></svg>';

// --- Settings ---
const CLOUD_SPEED = 0.5;
const NUM_CLOUDS = 5;
const OCEAN_BASE_COLOR = '#003366';
const OCEAN_TOP = C.CANVAS_HEIGHT - 100;

// Waves: Now defined with lineWidth for drawing crisp lines
const WAVES = [
    { color: 'rgba(255, 255, 255, 0.9)', speed: 1.0, amplitude: 15, frequency: 0.02, lineWidth: 3 },
    { color: 'rgba(255, 255, 255, 0.7)', speed: 0.8, amplitude: 20, frequency: 0.015, lineWidth: 2 },
];

const HEBREW_LETTERS = Array.from("אבגדהוזחטיכךלמםנןסעפףצץקרשת");
const NUM_LETTERS = 20;
const LETTER_COLOR = 'rgba(255, 255, 255, 0.15)';

// Sea Creatures
const SEA_CREATURE_EMOJIS = Array.from("🐠🐟🦦🦈🐡🐳🐋🐬🦭🪼🐙🐚🐧");
const NUM_CREATURES = 10;
const JUMP_PROBABILITY = 0.001;
const JUMP_FORCE = -8;
const GRAVITY = 0.25;

// --- State Variables ---
let clouds = [], hebrewLetters = [], seaCreatures = [], frame = 0;

// --- Logic ---

export function init() {
    frame = 0;
    // Init Clouds
    clouds = [];
    for (let i = 0; i < NUM_CLOUDS; i++) clouds.push({ x: Math.random() * C.CANVAS_WIDTH, y: Math.random() * (C.CANVAS_HEIGHT / 3), width: 80 + Math.random() * 40, height: 60 + Math.random() * 20 });
    // Init Hebrew Letters
    hebrewLetters = [];
    for (let i = 0; i < NUM_LETTERS; i++) hebrewLetters.push({ char: HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)], x: Math.random() * C.CANVAS_WIDTH, y: OCEAN_TOP + Math.random() * (C.CANVAS_HEIGHT - OCEAN_TOP), speed: 0.2 + Math.random() * 0.5 });
    // Init Sea Creatures
    seaCreatures = [];
    for (let i = 0; i < NUM_CREATURES; i++) {
        seaCreatures.push({
            emoji: SEA_CREATURE_EMOJIS[Math.floor(Math.random() * SEA_CREATURE_EMOJIS.length)],
            x: Math.random() * C.CANVAS_WIDTH,
            y: OCEAN_TOP + 10 + Math.random() * (C.CANVAS_HEIGHT - OCEAN_TOP - 20),
            baseY: OCEAN_TOP + 10 + Math.random() * (C.CANVAS_HEIGHT - OCEAN_TOP - 20),
            speedX: 0.5 + Math.random() * 1, velocityY: 0, isJumping: false, size: 25 + Math.random() * 15,
        });
    }
}

export function update() {
    frame++;
    // Move Clouds
    clouds.forEach(c => { c.x += CLOUD_SPEED; if (c.x > C.CANVAS_WIDTH) c.x = -c.width; });
    // Move Hebrew letters
    hebrewLetters.forEach(l => { l.x += l.speed; if (l.x > C.CANVAS_WIDTH) l.x = -20; });
    // Move Sea Creatures
    seaCreatures.forEach(c => {
        c.x += c.speedX;
        if (c.x > C.CANVAS_WIDTH + c.size) c.x = -c.size; // Wrap around
        if (c.isJumping) {
            c.velocityY += GRAVITY;
            c.y += c.velocityY;
            if (c.y > c.baseY) { c.y = c.baseY; c.isJumping = false; }
        } else if (Math.random() < JUMP_PROBABILITY) {
            c.isJumping = true; c.velocityY = JUMP_FORCE;
        }
    });
}

// Helper function to draw a wave with a line
function drawWaveLine(ctx, wave) {
    ctx.beginPath();
    for (let x = 0; x < C.CANVAS_WIDTH; x++) {
        const yOffset = Math.sin(x * wave.frequency + frame * 0.01 * wave.speed) * wave.amplitude;
        ctx.lineTo(x, OCEAN_TOP + yOffset);
    }
    ctx.strokeStyle = wave.color;
    ctx.lineWidth = wave.lineWidth;
    ctx.stroke();
}

export function draw(ctx) {
    // 1. Draw solid sky blue background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);
    // 2. Draw clouds
    clouds.forEach(c => ctx.drawImage(cloudImage, c.x, c.y, c.width, c.height));
    // 3. Draw the SOLID dark blue ocean base
    ctx.fillStyle = OCEAN_BASE_COLOR;
    ctx.fillRect(0, OCEAN_TOP, C.CANVAS_WIDTH, C.CANVAS_HEIGHT - OCEAN_TOP);
    // 4. Draw things INSIDE the ocean (creatures, letters)
    ctx.fillStyle = LETTER_COLOR;
    ctx.font = `20px Arial`;
    ctx.textAlign = 'center';
    hebrewLetters.forEach(l => ctx.fillText(l.char, l.x, l.y));
    seaCreatures.forEach(c => {
        ctx.font = `${c.size}px Arial`;
        ctx.fillText(c.emoji, c.x, c.y);
    });
    // 5. Draw the wave LINES on top. This is the fix.
    WAVES.forEach(wave => drawWaveLine(ctx, wave));
}