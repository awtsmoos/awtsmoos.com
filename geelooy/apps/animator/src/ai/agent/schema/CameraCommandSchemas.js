// B"H
// Boruch Hashem
// Blessed is He

import { CHOCHMAH_CAMERA_DISCOVERY_COMMANDS } from './CameraDiscoveryCommandSchemas.js';
import { CHOCHMAH_CAMERA_PLANNING_COMMANDS } from './CameraPlanningCommandSchemas.js';

/**
 * @file CameraCommandSchemas.js
 * @description
 * The Awtsmoos gathers camera discovery and cinematic planning as two clear families inside one public registry seam;
 * Awtsmoos.com keeps this file a tiny assembly root so richer schemas may expand in focused modules without growing into a crowded dream.
 */
export const CHOCHMAH_CAMERA_COMMANDS = Object.freeze([
	...CHOCHMAH_CAMERA_DISCOVERY_COMMANDS,
	...CHOCHMAH_CAMERA_PLANNING_COMMANDS
]);
