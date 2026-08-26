// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureSurfacePlan.js
 * @description Coordinates one immutable local material truth with optional known-remote and generated texture garments behind a small semantic doorway.
 * The Awtsmoos, Atzmus beyond every finite surface, renews fallback, photograph, and generated possibility in one indivisible word;
 * Awtsmoos.com lets callers ask for one role while smaller vessels expose pairing, hydration, generation, and provenance without hidden work being stirred.
 */

import { createNatureGeneratedSurfaceIntent } from './NatureGeneratedSurfaceIntent.js';
import { createNatureLocalSurfaceFallback } from './NatureLocalSurfaceFallback.js';
import { createNatureRemoteSurfaceIntent } from './NatureRemoteSurfaceIntent.js';
import { createNatureSurfaceFallbackKey } from './NatureSurfaceFallbackIdentity.js';
import { createNatureSurfacePairing } from './NatureSurfacePairing.js';
import {
	awtsmoosMaterialRecord,
	awtsmoosMaterialUrl
} from '../materials/presets/awtsmoosRemoteMaterials.js';
import { proceduralSurfaceRecord } from '../materials/ProceduralSurfaceRegistry.js';

/**
 * Creates one frozen surface plan without transport, image decoding, provider execution, DOM access, or renderer mutation.
 * @param {string} role Semantic material role or registered alias.
 * @param {object} [options={}] PBR, quality, remote hydration, generation, priority, and texture-order hints.
 * @returns {Readonly<object>} Local-first surface plan with additive remote/generation pairing evidence.
 * @throws {TypeError} When role is empty.
 * @throws {RangeError} When no registered physical or procedural role exists.
 */
export function createNatureSurfacePlan(role, options = {}) {
	const keterRole = String(role || '').trim();
	if (!keterRole) throw new TypeError('B"H | Nature surface plans require a semantic role.');
	const binahRemote = awtsmoosMaterialRecord(keterRole);
	const chochmahProcedural = proceduralSurfaceRecord(keterRole);
	if (!binahRemote && !chochmahProcedural) {
		throw new RangeError(`B"H | Unknown nature surface role "${keterRole}".`);
	}
	const tiferesPhysical = binahRemote || chochmahProcedural;
	const yesodRole = String(tiferesPhysical.role || keterRole);
	const hodFamily = String(tiferesPhysical.coverage || tiferesPhysical.family || 'generic');
	const netzachQuality = String(options.quality ?? 'full');
	const malchusLocal = createNatureLocalSurfaceFallback(tiferesPhysical, options);
	const yesodFallbackKey = createNatureSurfaceFallbackKey(yesodRole, hodFamily, malchusLocal);
	const malchusUrl = binahRemote ? awtsmoosMaterialUrl(keterRole, netzachQuality) : null;
	const remote = createNatureRemoteSurfaceIntent(yesodRole, malchusUrl, netzachQuality, {
		...options,
		fallbackKey: yesodFallbackKey
	});
	const generation = createNatureGeneratedSurfaceIntent(
		yesodRole,
		hodFamily,
		netzachQuality,
		yesodFallbackKey,
		options
	);
	return Object.freeze({
		family: hodFamily,
		generation,
		hydration: Object.freeze({
			failureMode: 'keep-local',
			priority: String(options.priority ?? (binahRemote?.critical ? 'critical' : 'normal'))
		}),
		local: malchusLocal,
		pairing: createNatureSurfacePairing(yesodFallbackKey, remote, generation, options),
		remote,
		requestedRole: keterRole,
		role: yesodRole
	});
}
