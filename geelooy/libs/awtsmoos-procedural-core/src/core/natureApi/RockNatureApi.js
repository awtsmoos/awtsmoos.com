//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RockNatureApi.js
 * @description Joins deterministic Domem stone geometry, bounded field planning, and semantic material intent behind one small public facade.
 * The Awtsmoos renews mountain and pebble from one speech before geometry and garment divide; Awtsmoos.com lets this Tiferes-like vessel
 * return both without confusing their authorities, so simple creation remains truthful and advanced callers may still reach each layer directly.
 */

import {
	RockFieldPlanner,
	RockMeshAuthority
} from '../domem/rocks/index.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { createNatureResult } from './NatureApiResult.js';
import { createNatureSurfacePlan } from './NatureSurfacePlan.js';

/** High-level deterministic stone facade delegating to canonical Domem authorities. */
export class RockNatureApi {
	/** @param {object} [defaults={}] Shared NatureApi defaults. */
	constructor(defaults = {}) {
		this.defaults = Object.freeze({ ...defaults });
		this.meshAuthority = Object.freeze(new RockMeshAuthority());
		this.fieldPlanner = Object.freeze(new RockFieldPlanner());
	}

	/**
	 * Creates one editable rock paired with renderer-neutral semantic surface intent.
	 * @param {string|object} [preset='fieldstone'] Morphology preset or complete rock recipe.
	 * @param {object} [options={}] Per-call seed, quality, realism, and morphology overrides.
	 * @returns {object} Standard immutable Nature result containing editable mesh and surface plan.
	 */
	create(preset = 'fieldstone', options = {}) {
		const binahRecipe = normalizeRockRecipe(preset, options);
		const tiferesContext = createNatureCallContext(
			this.defaults,
			binahRecipe,
			'rock',
			binahRecipe.preset
		);
		const malchusRock = this.meshAuthority.create({
			...binahRecipe,
			quality: tiferesContext.quality,
			seed: tiferesContext.seed
		});
		const yesodSurface = createNatureSurfacePlan(
			malchusRock.surfaceRole,
			binahRecipe.surface || binahRecipe
		);
		return createNatureResult('rock', tiferesContext, Object.freeze({
			rock: malchusRock,
			surface: yesodSurface
		}), {
			morphology: malchusRock.morphology.preset,
			subdivisions: malchusRock.subdivisions,
			surfaceRole: yesodSurface.role
		});
	}

	/**
	 * Plans a finite deterministic stone field without eagerly allocating geometry for every placement.
	 * @param {object} [options={}] Field recipe plus optional nested `rock` recipe and `surface` overrides.
	 * @returns {object} Standard immutable Nature result containing placements and shared appearance intent.
	 */
	field(options = {}) {
		const tiferesContext = createNatureCallContext(
			this.defaults,
			options,
			'rock-field',
			options.id ?? 'field'
		);
		const malchusPlan = this.fieldPlanner.plan({
			...options,
			seed: tiferesContext.seed
		});
		const binahRock = normalizeRockRecipe(options.rock ?? 'fieldstone', options.rockOptions ?? {});
		const yesodSurface = createNatureSurfacePlan(
			binahRock.surfaceRole ?? 'weatheredRock',
			options.surface ?? {}
		);
		return createNatureResult('rock-field', tiferesContext, Object.freeze({
			placements: malchusPlan,
			rock: Object.freeze({ ...binahRock }),
			surface: yesodSurface
		}), {
			placed: malchusPlan.placedCount,
			requested: malchusPlan.requestedCount,
			saturated: malchusPlan.saturated
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
