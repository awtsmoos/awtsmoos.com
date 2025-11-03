//B"H
import * as C from './constants.js';

// --- Image Assets ---
const cloudImage = new Image();
cloudImage.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 80%22><text y=%22.9em%22 font-size=%2270%22>☁️</text></svg>';

// --- Settings ---
const CLOUD_SPEED = 0.5;
const NUM_CLOUDS = 5;

// New Ocean Settings
const OCEAN_BASE_COLOR = '#003366'; // A darker, deeper blue
const OCEAN_TOP = C.CANVAS_HEIGHT - 100; // Where the ocean starts from the top

// New Wave Settings - Each object is a layer of waves
const WAVES = [
    { color: 'rgba(255, 255, 255, 0.6)', speed: 1.0, amplitude: 15, frequency: 0.02 },
    { color: 'rgba(255, 255, 255, 0.4)', speed: 0.8, amplitude: 20, frequency: 0.015 },
    { color: 'rgba(255, 255, 255, 0.2)', speed: 0.6, amplitude: 25, frequency: 0.01 }
];

// New Hebrew Letter Settings
const HEBREW_LETTERS = Array.from("אבגדהוזחטיכךלמםנןסעפףצץקרשת");
const NUM_LETTERS = 20;
const LETTER_FONT_SIZE = 20;
const LETTER_COLOR = 'rgba(255, 255, 255, 0.15)';

// --- State Variables ---
let clouds = [];
let hebrewLetters = [];
let frame = 0; // A counter for continuous animation

// --- Logic ---

export function init() {
    // Initialize clouds
    clouds = [];
    for (let i = 0; i < NUM_CLOUDS; i++) {
        clouds.push({
            x: Math.random() * C.CANVAS_WIDTH,
            y: Math.random() * (C.CANVAS_HEIGHT / 3),
            width: 80 + Math.random() * 40,
            height: 60 + Math.random() * 20,
        });
    }

    // Initialize Hebrew letters
    hebrewLetters = [];
    for (let i = 0; i < NUM_LETTERS; i++) {
        hebrewLetters.push({
            char: HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)],
            x: Math.random() * C.CANVAS_WIDTH,
            y: OCEAN_TOP + Math.random() * (C.CANVAS_HEIGHT - OCEAN_TOP), // Only inside the ocean
            speed: 0.2 + Math.random() * 0.5 // Give each a slightly different speed
        });
    }
    
    frame = 0;
}

export function update() {
    // Animate frame counter for wave motion
    frame++;

    // Move clouds
    clouds.forEach(cloud => {
        cloud.x += CLOUD_SPEED;
        if (cloud.x > C.CANVAS_WIDTH) {
            cloud.x = -cloud.width;
            cloud.y = Math.random() * (C.CANVAS_HEIGHT / 3);
        }
    });

    // Move Hebrew letters
    hebrewLetters.forEach(letter => {
        letter.x += letter.speed;
        if (letter.x > C.CANVAS_WIDTH) {
            letter.x = -LETTER_FONT_SIZE; // Wrap around to the left
        }
    });
}

// Helper function to draw a single wave layer
function drawWave(ctx, wave) {
    ctx.beginPath();
    ctx.moveTo(0, OCEAN_TOP);
    
    for (let x = 0; x < C.CANVAS_WIDTH; x++) {
        const yOffset = Math.sin(x * wave.frequency + frame * 0.01 * wave.speed) * wave.amplitude;
        ctx.lineTo(x, OCEAN_TOP + yOffset);
    }

    ctx.lineTo(C.CANVAS_WIDTH, C.CANVAS_HEIGHT);
    ctx.lineTo(0, C.CANVAS_HEIGHT);
    ctx.closePath();

    ctx.fillStyle = wave.color;
    ctx.fill();
}


export function draw(ctx) {
    // 1. Draw solid sky blue background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    // 2. Draw clouds
    clouds.forEach(cloud => {
        ctx.drawImage(cloudImage, cloud.x, cloud.y, cloud.width, cloud.height);
    });
    
    // 3. Draw the solid dark blue ocean base
    ctx.fillStyle = OCEAN_BASE_COLOR;
    ctx.fillRect(0, OCEAN_TOP, C.CANVAS_WIDTH, C.CANVAS_HEIGHT - OCEAN_TOP);

    // 4. Draw the flowing Hebrew letters within the ocean
    ctx.font = `${LETTER_FONT_SIZE}px Arial`;
    ctx.fillStyle = LETTER_COLOR;
    ctx.textAlign = 'center';
    hebrewLetters.forEach(letter => {
        // Add a slight bobbing motion to the letters
        const yBob = Math.sin(frame * 0.05 + letter.x * 0.02) * 5;
        ctx.fillText(letter.char, letter.x, letter.y + yBob);
    });

    // 5. Draw the translucent wave layers on top of everything else
    // We draw them as filled shapes down to the bottom of the canvas
    WAVES.forEach(wave => drawWave(ctx, wave));
}