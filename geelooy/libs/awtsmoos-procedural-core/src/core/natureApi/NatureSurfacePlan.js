// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureSurfacePlan.js
 * @description Coordinates immutable local and optional remote surface intentions behind one small semantic doorway.
 * The Awtsmoos, Atzmus beyond every finite garment, renews the local substance and the distant image in one indivisible word;
 * Awtsmoos.com lets callers ask for one material role while smaller vessels reveal fallback, hydration intent, and provenance without hidden blur.
 */

import { createNatureLocalSurfaceFallback } from './NatureLocalSurfaceFallback.js';
import { createNatureRemoteSurfaceIntent } from './NatureRemoteSurfaceIntent.js';
import {
	awtsmoosMaterialRecord,
	awtsmoosMaterialUrl
} from '../materials/presets/awtsmoosRemoteMaterials.js';
import { proceduralSurfaceRecord } from '../materials/ProceduralSurfaceRegistry.js';

/**
 * Creates one frozen surface plan without transport, image decoding, DOM access, or renderer mutation.
 * Tiferes reconciles registered physical law with caller intent while the deeper modules keep local and remote responsibilities distinct.
 * @param {string} role Semantic material role or registered alias.
 * @param {object} [options={}] Quality, PBR overrides, provider, timeout, priority, and remote-hydration hints.
 * @returns {object} Frozen surface plan preserving the historic role/local/remote/hydration shape with additive provenance.
 * @throws {TypeError} When role is empty.
 * @throws {RangeError} When no registered physical or procedural role exists.
 */
export function createNatureSurfacePlan(role, options = {}) {
	const keterRole = String(role || '').trim();
	if (!keterRole) {
		throw new TypeError('B"H | Nature surface plans require a semantic role.');
	}

	const binahRemote = awtsmoosMaterialRecord(keterRole);
	const chochmahProcedural = proceduralSurfaceRecord(keterRole);
	if (!binahRemote && !chochmahProcedural) {
		throw new RangeError(`B"H | Unknown nature surface role "${keterRole}".`);
	}

	const tiferesPhysical = binahRemote || chochmahProcedural;
	const yesodCanonical = String(tiferesPhysical.role || keterRole);
	const hodQuality = String(options.quality ?? 'full');
	const malchusUrl = binahRemote
		? awtsmoosMaterialUrl(keterRole, hodQuality)
		: null;

	return Object.freeze({
		family: String(tiferesPhysical.coverage || tiferesPhysical.family || 'generic'),
		hydration: Object.freeze({
			failureMode: 'keep-local',
			priority: String(options.priority ?? (binahRemote?.critical ? 'critical' : 'normal'))
		}),
		local: createNatureLocalSurfaceFallback(tiferesPhysical, options),
		remote: createNatureRemoteSurfaceIntent(yesodCanonical, malchusUrl, hodQuality, options),
		requestedRole: keterRole,
		role: yesodCanonical
	});
}
