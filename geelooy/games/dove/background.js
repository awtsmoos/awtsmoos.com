//B"H
import * as C from './constants.js';

// --- Image Assets ---
// For simplicity, we are using SVG data URLs. You could also use .png or other formats.
const cloudImage = new Image();
cloudImage.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 80%22><text y=%22.9em%22 font-size=%2270%22>☁️</text></svg>';

const oceanImage = new Image();
// This is a simple repeating wave pattern
oceanImage.src = `data:image/svg+xml,
<svg xmlns='http://www.w3.org/2000/svg' width='${C.CANVAS_WIDTH}' height='100'>
  <path d='M0,50 Q${C.CANVAS_WIDTH/4},25 ${C.CANVAS_WIDTH/2},50 T${C.CANVAS_WIDTH},50' stroke='white' fill='none' stroke-width='3'/>
  <path d='M0,60 Q${C.CANVAS_WIDTH/4},35 ${C.CANVAS_WIDTH/2},60 T${C.CANVAS_WIDTH},60' stroke='rgba(255,255,255,0.7)' fill='none' stroke-width='2'/>
</svg>`;


// --- Settings ---
const CLOUD_SPEED = 0.5;
const OCEAN_SPEED = 1.0;
const NUM_CLOUDS = 5;

let clouds = [];
let oceanOffset = 0;

// --- Logic ---

// To be called once when the game starts
export function init() {
    clouds = []; // Clear existing clouds
    for (let i = 0; i < NUM_CLOUDS; i++) {
        clouds.push({
            x: Math.random() * C.CANVAS_WIDTH,
            y: Math.random() * (C.CANVAS_HEIGHT / 3), // Top third of the screen
            width: 80 + Math.random() * 40, // Random size
            height: 60 + Math.random() * 20,
        });
    }
    oceanOffset = 0;
}

// To be called every frame from the game loop
export function update() {
    // Move clouds
    clouds.forEach(cloud => {
        cloud.x += CLOUD_SPEED;
        // If cloud moves off-screen to the right, wrap it around to the left
        if (cloud.x > C.CANVAS_WIDTH) {
            cloud.x = -cloud.width;
            cloud.y = Math.random() * (C.CANVAS_HEIGHT / 3); // Reset height for variety
        }
    });

    // Scroll ocean texture
    oceanOffset += OCEAN_SPEED;
    if (oceanOffset >= C.CANVAS_WIDTH) {
        oceanOffset = 0;
    }
}

// To be called every frame from the game loop
export function draw(ctx) {
    // Draw a solid sky blue background first
    ctx.fillStyle = '#87CEEB'; // Same color as your CSS background
    ctx.fillRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    // Draw clouds
    clouds.forEach(cloud => {
        ctx.drawImage(cloudImage, cloud.x, cloud.y, cloud.width, cloud.height);
    });
    
    // Draw scrolling ocean waves at the bottom
    const oceanSegmentY = C.CANVAS_HEIGHT - 80;
    // We draw two segments of the ocean image to create a seamless loop
    ctx.drawImage(oceanImage, -oceanOffset, oceanSegmentY, C.CANVAS_WIDTH, 100);
    ctx.drawImage(oceanImage, C.CANVAS_WIDTH - oceanOffset, oceanSegmentY, C.CANVAS_WIDTH, 100);
}