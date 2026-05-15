
// B"H
/**
 * @file eyeGroup.js
 * @brief Logic for manifesting a synchronized collection of Living Eyes.
 */
import { createLivingEye, getLookAtRotation } from './livingEye.js';

/**
 * B"H - Creates a group of eyes that share blinks and tracking logic.
 * @param {object} config { id, eyes: [{pos, color}], targetPath, blinkTrackName, scale }
 */
export function createEyeGroup(config, sceneTracks) {
    const { id, eyes = [], targetPath = [], irisColor =[0.1, 0.5, 0.9], scale = [1,1,1] } = config;
    
    // 1. Calculate Group Center for Uniform Gaze
    let centerX = 0, centerY = 0, centerZ = 0;
    eyes.forEach(e => {
        centerX += e.pos[0]; centerY += e.pos[1]; centerZ += e.pos[2];
    });
    const groupCenter =[centerX / eyes.length, centerY / eyes.length, centerZ / eyes.length];

    // 2. Create Shared Tracking Track
    // Instead of each eye looking at the target, the GROUP looks at the target.
    // This ensures all pupils are offset by the exact same amount.
    const sharedTrackId = `track_${id}_uniform_gaze`;
    const gazeKeyframes = targetPath.map(kf => {
        const rot = getLookAtRotation(groupCenter, kf.position);
        return { time: kf.time, rotation: rot };
    });
    sceneTracks[sharedTrackId] = gazeKeyframes;

    // 3. Manifest individual eyes with linked animations
    return eyes.map((eyeCfg, index) => {
        return createLivingEye({
            id: `${id}_${index}`,
            position: eyeCfg.pos,
            scale: eyeCfg.scale || scale, // B"H - Pass the size decree to the eye
            irisColor: eyeCfg.color || irisColor,
            animations: {
                topLid:[ { track: 'blink_top', speed: 1.0 } ],
                bottomLid:[ { track: 'blink_bottom', speed: 1.0 } ],
                iris: [ { track: sharedTrackId, speed: 1.0 } ]
            }
        });
    });
}
