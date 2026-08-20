//B"H
//Boruch Hashem
//Blessed is He

import { CREATION_APPS } from "./creation.mjs";
import { DEVELOPER_APPS } from "./developer.mjs";
import { MEDIA_APPS } from "./media.mjs";
import { PRODUCTIVITY_APPS } from "./productivity.mjs";
import { SYSTEM_APPS } from "./system.mjs";
import { UTILITY_APPS } from "./utilities.mjs";
import { WORK_APPS } from "./work.mjs";

/**
 * @file Canonical browser-application catalog for Awtsmoos.com.
 * @description
 * The Awtsmoos renews every visible tool from one source while each category keeps
 * its own finite vessel. This catalog composes complete groups rather than brittle
 * positional indexes, so a newly declared browser app cannot silently disappear.
 */
export const PUBLIC_APPS = Object.freeze([
	...CREATION_APPS,
	...MEDIA_APPS,
	...PRODUCTIVITY_APPS,
	...WORK_APPS,
	...UTILITY_APPS,
	...DEVELOPER_APPS,
	...SYSTEM_APPS
]);
