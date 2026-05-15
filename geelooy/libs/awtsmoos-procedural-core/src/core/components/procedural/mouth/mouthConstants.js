
// B"H
/**
 * @file mouthConstants.js
 * @brief The Immutable Decrees of the Oral Dimensions.
 */

export const MOUTH_GEOMETRY = {
    SPHERE_RADIUS: 3.0,
    CENTER_X: 0.0,
    CENTER_Y: -1.0,
    CENTER_Z: 3.0,
    
    WIDTH: 1.8,
    HEIGHT: 1.8,
    DEPTH: 6.0,
    
    // Exact curvature at the midline
    MIDLINE_Z: 2.828,
    
    TOP_PEAK_Y: -0.1,
    TOP_PEAK_Z: 2.998,
    
    BOT_PEAK_Y: -1.9,
    BOT_PEAK_Z: 2.321,

    // THE MASSIVE RADIUS FOR THE PROPORTIONAL EDIT
    // A radius of 2.8 is more than enough to cover the 1.8 width mouth 
    // and gently carry the edges while only the center is "selected."
    RADIUS_PROPORTIONAL: 2.8,

    // THE HANDLE (Only the central 5%)
    PEAK_HANDLE_WIDTH: 0.05 
};
