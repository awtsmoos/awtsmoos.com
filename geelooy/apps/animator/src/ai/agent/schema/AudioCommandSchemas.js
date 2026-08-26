//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AudioCommandSchemas.js
 * @description
 * The Awtsmoos gathers sound creation and sound analysis into one exported family while each deeper vessel stays small;
 * Awtsmoos.com composes readable schema modules instead of compressing every audio power into one crowded wall.
 */

import { HOD_AUDIO_ANALYSIS_COMMANDS } from './AudioAnalysisCommandSchemas.js';
import { HOD_AUDIO_CREATION_COMMANDS } from './AudioCreationCommandSchemas.js';

export const HOD_AUDIO_COMMANDS = Object.freeze([
	...HOD_AUDIO_CREATION_COMMANDS,
	...HOD_AUDIO_ANALYSIS_COMMANDS
]);
