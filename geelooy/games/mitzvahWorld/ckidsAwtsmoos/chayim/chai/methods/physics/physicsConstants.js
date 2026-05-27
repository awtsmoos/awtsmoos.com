// B"H
/**
 * physicsConstants.js
 * Central repository for character physics and movement constants.
 */

export const PHYSICS_CONSTANTS = {
    // Movement
    DEFAULT_SPEED: 6,
    RUN_MULTIPLIER: 1.5,
    LERP_TURN_SPEED: 0.145,
    
    // Forces
    DEFAULT_GRAVITY: 30,
    AIR_DAMPING: 2,
    
    // Jump
    DEFAULT_JUMP_HEIGHT: 12,
    
    // Collider
    DEFAULT_HEIGHT: 0.75,
    DEFAULT_RADIUS: 0.35,
    MAX_RADIUS_CAP: 0.6
};
