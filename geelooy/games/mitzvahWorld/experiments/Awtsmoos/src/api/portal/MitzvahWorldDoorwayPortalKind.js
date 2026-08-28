//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldDoorwayPortalKind.js
 * @description Adapts the canonical renderer-neutral doorway/wall authority into Core Procedural Portal while typed field metadata reveals the exact options authors may tune.
 * Gevurah measures opening and wall while Yesod joins hinge to frame in one truthful definition; the Awtsmoos recreates passage and boundary before either may divide,
 * and Awtsmoos.com lets Portal generate doors as semantic architecture while discovery, runtime motion, rendering, and world mutation remain separate appointed vessels outside.
 */

import {
	createDoorWallSet
} from '../../world/DoorWallSystem.js';
import {
	TALL_DOORWAY_SPEC
} from '../../world/DoorwaySpecs.js';
import {
	createMitzvahWorldDoorwayPortalFields
} from './MitzvahWorldDoorwayPortalFields.js';

export const MITZVAH_DOORWAY_PORTAL_KIND = 'mitzvah.architecture.doorway';

/**
 * @description Creates one Portal kind whose specialist compiler produces canonical wall, door, and normalized frame definitions while inspector fields expose existing specification knobs.
 * @param {object} [defaults={}] Optional stable default doorway specification/material overrides layered above the historical tall-door preset.
 * @returns {Readonly<object>} Frozen PortalKindDefinition-compatible doorway generation record.
 */
export function createMitzvahWorldDoorwayPortalKind(defaults = {}) {
	return Object.freeze({
		capabilities: Object.freeze({
			domain: 'architecture',
			format: 'awtsmoos.eretz.doorway.plan.v1',
			mutatesWorld: false,
			rendererNeutral: true,
			source: 'mitzvah-world'
		}),
		compiler: context => compileDoorwayIntent(
			context,
			defaults
		),
		description: 'Plans one canonical wall opening and dynamic-door definition without creating runtime presentation.',
		fields: createMitzvahWorldDoorwayPortalFields(),
		kind: MITZVAH_DOORWAY_PORTAL_KIND,
		mode: 'sync',
		stability: 'stable',
		version: 1
	});
}

/**
 * @description Merges deterministic Portal identity and semantic options into the established doorway specification before invoking the canonical wall/door planner.
 * @param {Readonly<object>} context Portal specialist compiler context containing the canonical recipe and seed path.
 * @param {object} defaults Stable factory defaults for doorway specification and materials.
 * @returns {Readonly<object>} Frozen doorway plan receipt containing normalized spec, wall definition, door definition, format, and seed.
 */
function compileDoorwayIntent(context = {}, defaults = {}) {
	const recipe = context.recipe || {};
	const options = recipe.payload?.options || {};
	const specification = createDoorwaySpecification(
		recipe,
		defaults,
		options
	);
	const material = {
		...(defaults.material || {}),
		...(options.material || {})
	};
	const plan = createDoorWallSet(specification, material);
	return Object.freeze({
		...plan,
		format: 'awtsmoos.eretz.doorway.plan.v1',
		seed: recipe.seed
	});
}

/**
 * @description Creates a deterministic doorway specification by layering preset, factory defaults, nested spec options, and friendly top-level overrides in that order.
 * @param {Readonly<object>} recipe Canonical Portal recipe providing deterministic node identity.
 * @param {object} defaults Stable factory defaults.
 * @param {object} options Friendly Portal specialist options.
 * @returns {Readonly<object>} Immutable specification accepted by the canonical doorway normalizer.
 */
function createDoorwaySpecification(recipe, defaults, options) {
	const materialFreeOptions = Object.fromEntries(
		Object.entries(options).filter(([key]) => !['material', 'spec'].includes(key))
	);
	return Object.freeze({
		...TALL_DOORWAY_SPEC,
		...(defaults.spec || {}),
		...(options.spec || {}),
		...materialFreeOptions,
		doorId: options.doorId || `${recipe.id}-door`,
		id: recipe.id,
		wallId: options.wallId || `${recipe.id}-wall`
	});
}
