
/**
 * B"H
 * Constants for OctreeWorld.
 *
 * These limits are intentionally conservative for the desert smoke test.
 * The floor and simple houses should collide; decorative, skinned, or very
 * complex meshes must never be allowed to explode memory inside physics.
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
    MAX_DEPTH: 5,
    SAFE_RADIUS_SQ: 400,
    BASE_BUILD_RADIUS: 45,
    MERGE_RADIUS: 90,
    VELOCITY_LOOKAHEAD: 1.5,
    FRAME_BUDGET: 3,
    INTAKE_FRAME_BUDGET: 2,
    MAX_INTAKE_PER_FRAME: 8,
    MAX_TOTAL_INTAKE_QUEUE: 400,
    MAX_TRIANGLES_PER_MESH: 2500,
    MAX_TRIANGLES_PER_NODE: 6000,
    MAX_PENDING_OCTREES: 32,
    MAX_WORLD_BOX_SIZE: 4000
};
