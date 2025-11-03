//B"H
// Game Canvas
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

// Dove Physics
export const DOVE_START_X = CANVAS_WIDTH - 100;
export const DOVE_START_Y = CANVAS_HEIGHT / 2;
export const DOVE_WIDTH = 50;
export const DOVE_HEIGHT = 50;
export const GRAVITY = 0.25;
export const LIFT = -6;

// Obstacle Settings
export const OBSTACLE_WIDTH = 60;
export const OBSTACLE_GAP = 200;
export const OBSTACLE_SPEED = 2;
export const OBSTACLE_SPAWN_RATE = 200; // Frames between spawns (higher is more space)
export const OBSTACLE_EMOJIS = Array.from("🌫️🪟🧱🎇🟥🟧🟨🟩🟦🟪🟫")

// Power-up Settings
export const POWERUP_SPAWN_RATE = 350; // Frames between spawns
export const POWERUP_DURATION = 300; // Frames (5 seconds at 60fps)