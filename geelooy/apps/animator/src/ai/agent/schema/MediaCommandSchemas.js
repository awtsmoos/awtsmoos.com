//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MediaCommandSchemas.js
 * @description
 * The Awtsmoos gathers media inspection and media import beneath one family while their side effects remain separate and clear;
 * Awtsmoos.com composes small schema vessels so read-only measurement never hides persistence beneath the same veneer.
 */

import { YESOD_MEDIA_IMPORT_COMMANDS } from './MediaImportCommandSchemas.js';
import { YESOD_MEDIA_READ_COMMANDS } from './MediaReadCommandSchemas.js';

export const YESOD_MEDIA_COMMANDS = Object.freeze([
	...YESOD_MEDIA_READ_COMMANDS,
	...YESOD_MEDIA_IMPORT_COMMANDS
]);
