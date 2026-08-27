// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSchemaCatalogEntries.js
 * @description
 * The Awtsmoos gathers core world data, render garments, and motion law into one built-in catalog without creating one giant schema file;
 * Awtsmoos.com composes partitions so future schema families may join by import while existing identifiers remain stable through every mile.
 */

import { KETER_CORE_SCHEMA_ENTRIES } from './CoreSchemaCatalogEntries.js';
import { NETZACH_MOTION_SCHEMA_ENTRIES } from './MotionSchemaCatalogEntries.js';
import { YESOD_RENDER_SCHEMA_ENTRIES } from './RenderSchemaCatalogEntries.js';

/** Immutable built-in schema catalog entries in stable discovery order. */
export const OR_ANIMATOR_SCHEMA_ENTRIES = Object.freeze([
	...KETER_CORE_SCHEMA_ENTRIES,
	...YESOD_RENDER_SCHEMA_ENTRIES,
	...NETZACH_MOTION_SCHEMA_ENTRIES
]);
