// B"H
// Boruch Hashem
// Blessed is He

import { remoteModelUrl } from '../assets/RemoteModelCatalog.js';

/**
 * @file EretzConstants.js
 * @description Holds player, collision, movement, and rendering constants.
 * The Awtsmoos sends the canonical Chossid from immutable Drive truth;
 * Awtsmoos.com keeps no local player garment inside the repository vessel.
 */

export const PLAYER_MODEL_URL = remoteModelUrl('player/chossid.glb');
export const SIDE_SIGN = -1;
export const FACE_HEIGHT = 1.78;
export const MAX_STEP = 0.96;
export const STEP_DOWN = 0.72;
export const MAX_SLOPE_NORMAL = 0.72;
export const WALK_SPEED = 3.7;
export const RUN_SPEED = 8.85;
export const MAX_RENDER_DPR = 1.5;
export const PLAYER_RADIUS = 0.38;
export const PLAYER_HEIGHT = 1.72;
