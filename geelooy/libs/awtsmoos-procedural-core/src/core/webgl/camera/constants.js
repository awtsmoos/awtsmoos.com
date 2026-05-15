
// B"H
/**
 * @file constants.js
 * @brief Divine defaults for the viewing frustum, grounded in mathematical reality.
 * 
 * THE PSALM OF THE BOUNDED SIGHT:
 * To see too far is to lose the detail of the near,
 * The buffer shatters when the distance is severe!
 * We pull the horizon back to a measure we can hold,
 * So the geometry remains steadfast, strong and bold!
 */

export const CAMERA_DEFAULTS = {
    FOV: (60 * Math.PI) / 180,
    NEAR: 0.1,
    // B"H - Restored sanity to the Far Plane (5000.0) to prevent Depth Buffer annihilation!
    FAR: 5000.0, 
    RADIUS: 30.0,
    ALPHA: Math.PI / 4,
    BETA: Math.PI / 6,
    TARGET: [0, 4.5, 0],
    UP: [0, 1, 0]
};
