// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MotionSchemaCatalogEntries.js
 * @description
 * The Awtsmoos lets motion, constraint, and cinematic continuity be generated as inspectable data before any timeline is changed;
 * Awtsmoos.com keeps directing vocabulary in explicit schemas so AI and human tools may construct complex animation without hidden command chains.
 */

import { NETZACH_ANIMATION_LAYER_SCHEMA } from '../../renderable/schema/AnimationLayerSchemaData.js';
import { GEVURAH_CONSTRAINT_SCHEMA } from '../../renderable/schema/ConstraintSchemaData.js';
import { CHOCHMAH_SHOT_GRAPH_SCHEMA } from '../../renderable/schema/ShotGraphSchemaData.js';

function entry(id, label, schema) {
	return Object.freeze({
		id,
		label,
		group: 'motion',
		schema,
		example: null
	});
}

/** Built-in animation, staging-constraint, and cinematic planning schemas. */
export const NETZACH_MOTION_SCHEMA_ENTRIES = Object.freeze([
	entry('animation-layer', 'Animation layer', NETZACH_ANIMATION_LAYER_SCHEMA),
	entry('constraint', 'Animation or staging constraint', GEVURAH_CONSTRAINT_SCHEMA),
	entry('shot-graph', 'Cinematic shot graph', CHOCHMAH_SHOT_GRAPH_SCHEMA)
]);
