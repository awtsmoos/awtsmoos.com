
// B"H

/**
 * @file ShotPresetRegistry.js
 * @description
 * ============================================================================
 * CHAPTER: THE MANY EYES OF CINEMA
 * ============================================================================
 *
 * Wide sees world. Full sees body. Close sees soul. Low angle gives awe. High
 * angle gives fragility. The camera speaks through data, not scattered magic.
 *
 * @module ShotPresetRegistry
 */

/**
 * @constant SHOT_PRESET_REGISTRY
 * @description
 * Data-based cinematic camera shots.
 */
export const SHOT_PRESET_REGISTRY = {
  extremeWide: { zoom: 0.38, y: -90, x: 0, rotation: 0, safe: 'world' },
  wide: { zoom: 0.5, y: -104, x: 0, rotation: 0, safe: 'world' },
  fullBody: { zoom: 0.72, y: -126, x: 0, rotation: 0, safe: 'body' },
  cowboy: { zoom: 0.82, y: -142, x: 0, rotation: 0, safe: 'body' },
  medium: { zoom: 0.94, y: -156, x: 0, rotation: 0, safe: 'torso' },
  mediumClose: { zoom: 1.05, y: -174, x: 0, rotation: 0, safe: 'face' },
  closeUp: { zoom: 1.18, y: -194, x: 0, rotation: 0, safe: 'face' },
  extremeCloseUp: { zoom: 1.36, y: -218, x: 0, rotation: 0, safe: 'face' },
  twoShot: { zoom: 0.86, y: -148, x: 0, rotation: 0, safe: 'body' },
  group: { zoom: 0.62, y: -118, x: 0, rotation: 0, safe: 'world' },
  overShoulder: { zoom: 1.04, y: -166, x: 72, rotation: 0, safe: 'face' },
  reverseOverShoulder: { zoom: 1.04, y: -166, x: -72, rotation: 0, safe: 'face' },
  profile: { zoom: 0.9, y: -150, x: 110, rotation: 0, safe: 'body' },
  lowAngle: { zoom: 0.88, y: -72, x: 0, rotation: -0.015, safe: 'body' },
  highAngle: { zoom: 0.84, y: -206, x: 0, rotation: 0.012, safe: 'body' },
  insertShot: { zoom: 1.22, y: -160, x: 0, rotation: 0, safe: 'prop' },
  reactionShot: { zoom: 1.12, y: -188, x: 0, rotation: 0, safe: 'face' },
  bikeTracking: { zoom: 0.72, y: -112, x: 0, rotation: 0, safe: 'vehicle' }
};
