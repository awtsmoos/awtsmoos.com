
// B"H
/**
 * @file keyframeUtils.js
 * @brief Utilities for procedurally generating animation keyframes.
 *        Saves space in scene files and ensures perfect loops.
 */

/**
 * Generates a 360-degree spin track around a specific axis.
 * @param {number} duration - Total time for one full rotation.
 * @param {string} axis - 'x', 'y', or 'z'.
 * @param {Array} position - Fixed position [x,y,z] (optional, default 0,0,0).
 * @param {Array} scale - Fixed scale [x,y,z] (optional, default 1,1,1).
 * @returns {Array} Array of keyframe objects.
 */
export function generateSpinTrack(duration, axis = 'y', position = [0,0,0], scale = [1,1,1]) {
    const keyframes = [];
    const steps = 4; // 0, 90, 180, 270, 360
    
    for (let i = 0; i <= steps; i++) {
        const t = (i / steps);
        const angle = t * Math.PI * 2;
        const rot = [0, 0, 0];
        
        if (axis === 'x') rot[0] = angle;
        else if (axis === 'y') rot[1] = angle;
        else if (axis === 'z') rot[2] = angle;

        keyframes.push({
            time: t * duration,
            position: [...position],
            rotation: rot,
            scale: [...scale]
        });
    }
    return keyframes;
}

/**
 * Generates a floating/oscillating motion (Sine wave).
 * @param {number} duration - Duration of one full cycle (up and down).
 * @param {Array} basePos - Center position [x,y,z].
 * @param {number} amplitude - How far to move.
 * @param {string} axis - 'x', 'y', or 'z'.
 * @returns {Array} Keyframes.
 */
export function generateFloatTrack(duration, basePos, amplitude, axis = 'y') {
    const keyframes = [];
    const steps = 8;
    
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Sin wave: 0 -> 1 -> 0 -> -1 -> 0
        const offset = Math.sin(t * Math.PI * 2) * amplitude;
        const pos = [...basePos];
        
        if (axis === 'x') pos[0] += offset;
        else if (axis === 'y') pos[1] += offset;
        else if (axis === 'z') pos[2] += offset;

        keyframes.push({
            time: t * duration,
            position: pos,
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        });
    }
    return keyframes;
}
