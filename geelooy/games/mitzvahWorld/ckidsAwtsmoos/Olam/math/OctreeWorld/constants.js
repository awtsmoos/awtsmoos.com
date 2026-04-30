
/**
 * B"H
 * Constants for OctreeWorld - OPTIMIZED FOR 60FPS STABILITY
 * 
 * Chapter 100: The Speed of Creation.
 * We must ensure the "Oyved" (Worker) does not linger too long in his labors, 
 * or the "Asiyah" (Physical Realm) will stutter. By restricting the frame budget 
 * and focusing only on local thresholds, we achieve a liquid-smooth experience.
 */
export const JOB_STEP = {
    CLONE: 0,
    BOUNDS: 1,
    SETUP_ITER: 2,
    PROCESS_TRIS: 3,
    FINALIZE: 4
};

export const NODE_STATE = {
    EMPTY: 'EMPTY',
    PENDING_BUILD: 'PENDING_BUILD',
    READY: 'READY'
};

export const CONFIG = {
    MAX_DEPTH: 8, // Shallower depth for faster raycasting
    SAFE_RADIUS_SQ: 100, // Check every 10 units of movement
    BASE_BUILD_RADIUS: 40,
    MERGE_RADIUS: 80,
    VELOCITY_LOOKAHEAD: 1.2,
    
    /**
     * B"H: PERFORMANCE TIKKUN
     * We cap background processing at 2.5 milliseconds.
     * This guarantees that even during a heavy load, the render loop has 
     * enough room to push out a perfect frame without choppiness.
     */
    FRAME_BUDGET: 2.5, 
    MAX_TRIANGLES_PER_NODE: 4000
};
