
// B"H
/**
 * @file headConstants.js
 * @brief Horizontal band and vertical loop definitions for the Living Head.
 */
export const HEAD_BANDS = {
    CROWN: { start: 0, end: 4, scale: [1.05, 1.0, 1.05], move: [0, 0.1, 0] },
    FOREHEAD: { start: 5, end: 8, scale: [1.1, 1.0, 1.05], move: [0, 0, 0.1] },
    EYES: { start: 9, end: 12, scale: [0.95, 1.0, 1.0], move: [0, 0, 0] },
    NOSE: { start: 13, end: 15, scale: [1.1, 1.0, 1.2], move: [0, 0, 0.25] },
    MOUTH_OUTER: { ring: 16, scale: [1.0, 1.0, 1.15], move: [0, 0, 0.15] },
    MOUTH_INNER: { ring: 17 }, // Pushed inward in Carver
    TRANSITION: { start: 18, end: 20 }, // 3 rings thick for hinge
    JAW: { start: 21, end: 23, scale: [0.9, 1.0, 0.95], move: [0, -0.15, 0] }
};

/**
 * B"H - Influence Weight Table
 * RingIdx -> % Jaw Influence (1.0 = 100% Jaw)
 */
export const WEIGHT_TABLE = {
    23: 1.0, 22: 1.0, 21: 1.0,
    20: 0.8, 19: 0.5, 18: 0.2, // Linear transition
    17: 0.1, 16: 0.05
};

/**
 * B"H - Vertical segments for corners
 */
export const MOUTH_SEGMENTS = {
    LEFT: 0.25, // 25%
    RIGHT: 0.75 // 75%
};
