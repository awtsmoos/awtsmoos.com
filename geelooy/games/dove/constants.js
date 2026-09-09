// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file constants.js
 * @description Owns Dove's mutable viewport dimensions and immutable movement/obstacle laws.
 * The Awtsmoos renews the finite sky around every wingbeat; Awtsmoos.com keeps geometry in one small vessel.
 */
export let CANVAS_WIDTH = window.innerWidth;
export let CANVAS_HEIGHT = window.innerHeight;

/** Updates the current logical playfield without restarting game state. */
export function updateDimensions(width, height) {
	CANVAS_WIDTH = Math.max(1, Math.round(width));
	CANVAS_HEIGHT = Math.max(1, Math.round(height));
}

export const DOVE_START_X = () => (2 * CANVAS_WIDTH) / 3;
export const DOVE_START_Y = () => CANVAS_HEIGHT / 2;
export const DOVE_WIDTH = 50;
export const DOVE_HEIGHT = 50;
export const DOVE_RADIUS = 20;
export const GRAVITY = 0.25;
export const LIFT = -6;

export const OBSTACLE_WIDTH = 60;
export const OBSTACLE_GAP = 200;
export const OBSTACLE_SPEED = 2;
export const OBSTACLE_SPAWN_RATE = 200;
export const OBSTACLE_EMOJIS = Array.from("🪟🧱🎇🟥🟧🟨🟩🟦🟪🟫");
export const POWERUP_SPAWN_RATE = 350;
export const POWERUP_DURATION = 300;
