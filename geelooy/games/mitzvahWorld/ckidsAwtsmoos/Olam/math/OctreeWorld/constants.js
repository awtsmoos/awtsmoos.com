
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
    MAX_DEPTH: 5, // B"H: Restricted depth to prevent recursive memory explosion (8^5 = 32k max nodes)
    SAFE_RADIUS_SQ: 100, 
    BASE_BUILD_RADIUS: 40,
    MERGE_RADIUS: 80,
    VELOCITY_LOOKAHEAD: 1.2,
    
    /**
     * B"H: PERFORMANCE TIKKUN
     * We cap background processing at 2.5 milliseconds.
     */
    FRAME_BUDGET: 2.5, 
    MAX_TRIANGLES_PER_NODE: 32 // B"H: Balanced leaf capacity for O(1) query speed vs memory footprint
};
