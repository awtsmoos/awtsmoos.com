//B"H
// Note: CANVAS_WIDTH and CANVAS_HEIGHT are now set dynamically in game.js.
// These are default values.
export let CANVAS_WIDTH = window.innerWidth;
export let CANVAS_HEIGHT = window.innerHeight;

export function updateDimensions(width, height) {
    CANVAS_WIDTH = width;
    CANVAS_HEIGHT = height;
}

// Dove Physics
export let DOVE_START_X = () => CANVAS_WIDTH / 3; // Position the dove 1/3 of the way across the screen

export const DOVE_START_Y = () => CANVAS_HEIGHT / 2; // Y position is relative to height
export const DOVE_WIDTH = 50;
export const DOVE_HEIGHT = 50;
export const DOVE_RADIUS = 20; // For circular collision
export const GRAVITY = 0.25;
export const LIFT = -6;

// Obstacle Settings
export const OBSTACLE_WIDTH = 60;
export const OBSTACLE_GAP = 200;
export const OBSTACLE_SPEED = 2;
export const OBSTACLE_SPAWN_RATE = 200;
export const OBSTACLE_EMOJIS = Array.from("🪟🧱🎇🟥🟧🟨🟩🟦🟪🟫")

// Power-up Settings
export const POWERUP_SPAWN_RATE = 350;
export const POWERUP_DURATION = 300;