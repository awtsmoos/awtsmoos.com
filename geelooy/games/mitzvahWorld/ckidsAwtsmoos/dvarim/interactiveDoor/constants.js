// B"H
/**
 * @file constants.js
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE SEAL OF LIMITS — Universal Door Constraints           ║
 * ║                                                             ║
 * ║  "He set a bound that they should not pass over"          ║
 * ║  (Tehillim 104:9)                                          ║
 * ║                                                             ║
 * ║  These constants define the physical laws of the Threshold.║
 * ╚═══════════════════════════════════════════════════════════╝
 */

export const DOOR_DEFAULTS = {
    width: 4,
    height: 5.5,
    thickness: 0.5,
    openAngle: Math.PI * 0.55,
    lerpSpeed: 12.0,
    angleThreshold: 0.01,
    interactKey: 'C',
    proximity: 5.0
};

export const DOOR_MATERIALS = {
    wood: { MeshLambertMaterial: { color: "#5d4037" } },
    knob: { MeshStandardMaterial: { color: "#FFD700", metalness: 1.0, roughness: 0.05 } }
};
