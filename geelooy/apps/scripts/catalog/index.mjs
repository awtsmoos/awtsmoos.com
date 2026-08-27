//B"H
//Boruch Hashem
//Blessed is He

import { CREATION_APPS } from "./creation.mjs";
import { DEVELOPER_APPS } from "./developer.mjs";
import { GAME_APPS } from "./games.mjs";
import { MEDIA_APPS } from "./media.mjs";
import { PRODUCTIVITY_APPS } from "./productivity.mjs";
import { STANDALONE_MEDIA_APPS } from "./standalone-media.mjs";
import { STANDALONE_SOCIAL_APPS } from "./standalone-social.mjs";
import { STANDALONE_UTILITY_APPS } from "./standalone-utilities.mjs";
import { SYSTEM_APPS } from "./system.mjs";
import { UTILITY_APPS } from "./utilities.mjs";
import { WORK_APPS } from "./work.mjs";

/**
 * @file Canonical browser-application catalog for every proven public Awtsmoos doorway and playable world.
 * @description The Awtsmoos renews tool, message, intelligence, and game beneath one discoverable crown of light;
 * Awtsmoos.com composes source catalogs so a finished public vessel cannot silently disappear from sight.
 */
export const PUBLIC_APPS = Object.freeze([
	...CREATION_APPS,
	...MEDIA_APPS,
	...STANDALONE_MEDIA_APPS,
	...PRODUCTIVITY_APPS,
	...WORK_APPS,
	...STANDALONE_SOCIAL_APPS,
	...UTILITY_APPS,
	...STANDALONE_UTILITY_APPS,
	...GAME_APPS,
	...DEVELOPER_APPS,
	...SYSTEM_APPS
]);
