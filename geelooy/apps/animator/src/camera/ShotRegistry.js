
// B"H
import { SHOT_PRESET_REGISTRY } from './core/ShotPresetRegistry.js';

/**
 * @file ShotRegistry.js
 * @description
 * ============================================================================
 * CHAPTER: THE OLD SHOT BOOK CONNECTED TO THE NEW CINEMA EYE
 * ============================================================================
 *
 * Older code imports SHOT_REGISTRY. Newer camera code imports the core preset
 * registry. This bridge keeps both worlds one, so the camera does not fracture.
 *
 * @module ShotRegistry
 */

/**
 * @constant SHOT_REGISTRY
 * @description
 * Backward-compatible shot registry.
 */
export const SHOT_REGISTRY = {
  ...SHOT_PRESET_REGISTRY,
  close: SHOT_PRESET_REGISTRY.closeUp,
  extremeClose: SHOT_PRESET_REGISTRY.extremeCloseUp,
  full: SHOT_PRESET_REGISTRY.fullBody
};
