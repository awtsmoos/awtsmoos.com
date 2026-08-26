//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RockNatureApi.js
 * @description Presents one geological default for natural stone while preserving an explicit expert morphology doorway.
 * The Awtsmoos renews pebble, shard, and mountain from one source; Awtsmoos.com lets geology carry natural truth by default,
 * while the older morphology vessel remains openly reachable for artists who intentionally need its more direct course.
 */

import { GeologyAuthority } from '../domem/nature/index.js';
import { RockFieldPlanner, RockMeshAuthority } from '../domem/rocks/index.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { createNatureResult } from './NatureApiResult.js';
import { createNatureSurfacePlan } from './NatureSurfacePlan.js';
import { createRockGeologyRecipe } from './RockGeologyRecipe.js';
import {
	createRockNatureDiagnostics,
	createRockNatureValue
} from './RockNatureValue.js';

/** High-level deterministic stone facade with one natural authority and one explicit expert escape hatch. */
export class RockNatureApi {
	/**
	 * @param {object} [defaults={}] Shared Nature defaults.
	 * @param {object} [authorities={}] Optional injectable authorities for tests and specialist runtimes.
	 */
	constructor(defaults = {}, authorities = {}) {
		this.defaults = Object.freeze({ ...defaults });
		this.geologyAuthority = authorities.geologyAuthority || new GeologyAuthority();
		this.morphologyAuthority = authorities.morphologyAuthority || new RockMeshAuthority();
		this.fieldPlanner = authorities.fieldPlanner || new RockFieldPlanner();
	}

	/**
	 * Creates one natural rock from canonical geology and preserves the historic public value shape.
	 * @param {string|object} [preset='fieldstone'] Geological/morphological preset or complete recipe.
	 * @param {object} [options={}] Per-call seed, quality, realism, geometry, and surface overrides.
	 * @returns {object} Immutable Nature result with editable mesh, geological evidence, and surface plan.
	 */
	create(preset = 'fieldstone', options = {}) {
		const binahRecipe = normalizeRockRecipe(preset, options);
		const tiferesContext = createNatureCallContext(this.defaults, binahRecipe, 'rock', binahRecipe.preset);
		const chochmahGeology = createRockGeologyRecipe(binahRecipe);
		const malchusGeology = this.geologyAuthority.rock(
			chochmahGeology.preset,
			chochmahGeology.options,
			tiferesContext
		);
		const yesodRock = createRockNatureValue(malchusGeology, chochmahGeology);
		const hodSurface = createNatureSurfacePlan(yesodRock.surfaceRole, binahRecipe.surface || binahRecipe);
		return createNatureResult('rock', tiferesContext, Object.freeze({ rock: yesodRock, surface: hodSurface }), {
			...createRockNatureDiagnostics(yesodRock),
			surfaceRole: hodSurface.role
		});
	}

	/**
	 * Plans a bounded deterministic stone field without eagerly creating every mesh.
	 * @param {object} [options={}] Field recipe plus optional nested rock and surface recipes.
	 * @returns {object} Immutable Nature result containing placements and shared geological appearance intent.
	 */
	field(options = {}) {
		const tiferesContext = createNatureCallContext(this.defaults, options, 'rock-field', options.id ?? 'field');
		const malchusPlan = this.fieldPlanner.plan({ ...options, seed: tiferesContext.seed });
		const binahRock = normalizeRockRecipe(options.rock ?? 'fieldstone', options.rockOptions ?? {});
		const chochmahGeology = createRockGeologyRecipe(binahRock);
		const yesodSurface = createNatureSurfacePlan(chochmahGeology.options.material.role, options.surface ?? {});
		return createNatureResult('rock-field', tiferesContext, Object.freeze({
			geology: Object.freeze({ profile: chochmahGeology.preset, materialRole: chochmahGeology.options.material.role }),
			placements: malchusPlan,
			rock: Object.freeze({ ...binahRock }),
			surface: yesodSurface
		}), {
			placed: malchusPlan.placedCount,
			requested: malchusPlan.requestedCount,
			saturated: malchusPlan.saturated
		});
	}

	/**
	 * Runs the legacy morphology authority intentionally for expert art-direction workflows.
	 * @param {string|object} [preset='fieldstone'] Morphology preset or recipe.
	 * @param {object} [options={}] Seed, quality, and morphology overrides.
	 * @returns {object} Immutable Nature result wrapping the expert morphology rock value.
	 */
	morphology(preset = 'fieldstone', options = {}) {
		const binahRecipe = normalizeRockRecipe(preset, options);
		const tiferesContext = createNatureCallContext(this.defaults, binahRecipe, 'rock-morphology', binahRecipe.preset);
		const malchusRock = this.morphologyAuthority.create({
			...binahRecipe,
			quality: tiferesContext.quality,
			seed: tiferesContext.seed
		});
		return createNatureResult('rock-morphology', tiferesContext, Object.freeze({ rock: malchusRock }), {
			morphology: malchusRock.morphology.preset,
			subdivisions: malchusRock.subdivisions,
			surfaceRole: malchusRock.surfaceRole
		});
	}
}

/** Normalizes string shorthand and object recipes without mutating caller-owned data. */
function normalizeRockRecipe(preset, options) {
	const keterRecipe = typeof preset === 'object' && preset
		? { ...preset, ...options }
		: { ...options, preset: String(preset || 'fieldstone') };
	return Object.freeze(keterRecipe);
}
