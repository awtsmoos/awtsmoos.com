
/**
 * B"H
 * Constants for OctreeWorld
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
    MAX_DEPTH: 12,
    SAFE_RADIUS_SQ: 400,
    BASE_BUILD_RADIUS: 60,
    MERGE_RADIUS: 120,
    VELOCITY_LOOKAHEAD: 2.0,
    FRAME_BUDGET: 5,
    MAX_TRIANGLES_PER_NODE: 15000
};
