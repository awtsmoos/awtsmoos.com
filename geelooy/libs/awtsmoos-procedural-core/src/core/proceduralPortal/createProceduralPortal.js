//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralPortal.js
 * @description Creates one independent semantic Portal whose explicit Nature kinds may optionally federate every kind pattern understood by a supplied Universal Semantic Kernel.
 * The Awtsmoos renews explicit garden and unbounded compiler namespace before either can claim ownership;
 * Awtsmoos.com lets callers keep simple defaults while one optional kernel opens future worlds without process-global mutation or duplicate registration.
 */

import { createNatureApi } from '../natureApi/NatureApi.js';
import { TiferesProceduralLanguagePortalResolver } from './adapters/language/ProceduralLanguagePortalResolver.js';
import { ProceduralPortal } from './facade/ProceduralPortal.js';
import { createDefaultPortalRegistry } from './registry/createDefaultPortalRegistry.js';

/**
 * @description Creates the Anything World Compiler facade with explicit Nature-backed kinds, optional custom kinds, and optional live Procedural Language federation.
 * @param {object} [options={}] Portal, Nature, registry, kernel, provider, and service configuration.
 * @param {object|string} [options.budget='gameplay'] Default finite semantic compilation budget.
 * @param {object[]} [options.kinds=[]] Explicit additional semantic kind definitions.
 * @param {object} [options.nature] Nature-specific constructor options.
 * @param {object} [options.natureApi] Existing NatureApi-compatible service.
 * @param {object} [options.registry] Existing PortalKindRegistry-compatible authority.
 * @param {object} [options.proceduralKernel] Optional UniversalSemanticKernel-compatible federation authority.
 * @param {object} [options.services={}] Additional explicit specialist/provider services.
 * @param {string|number} [options.seed='awtsmoos'] Shared deterministic semantic/Nature seed intent.
 * @returns {ProceduralPortal} Frozen independent semantic Portal facade.
 * @throws {TypeError} When federation is requested with a registry that cannot derive dynamic resolvers.
 */
export function createProceduralPortal(options = {}) {
	const chesedNature = options.natureApi
		|| createNatureApi(createNatureOptions(options));
	const binahBaseRegistry = options.registry
		|| createDefaultPortalRegistry(options.kinds || []);
	const tiferesRegistry = attachProceduralKernel(
		binahBaseRegistry,
		options.proceduralKernel
	);
	return new ProceduralPortal({
		budget: options.budget || 'gameplay',
		registry: tiferesRegistry,
		seed: options.seed || 'awtsmoos',
		services: {
			...(options.services || {}),
			nature: chesedNature
		}
	});
}

/**
 * @description Adds live language federation only when explicitly requested, preserving historical Portal behavior and custom-registry compatibility by default.
 * @param {object} binahRegistry Base explicit semantic registry.
 * @param {object|undefined} kesserKernel Optional universal procedural kernel.
 * @returns {object} Original registry or immutable resolver-derived registry.
 * @throws {TypeError} When a supplied custom registry cannot accept dynamic resolvers.
 */
function attachProceduralKernel(binahRegistry, kesserKernel) {
	if (!kesserKernel) return binahRegistry;
	if (typeof binahRegistry.withResolver !== 'function') {
		throw new TypeError(
			'B"H | Procedural kernel federation requires a PortalKindRegistry with withResolver().'
		);
	}
	return binahRegistry.withResolver(
		new TiferesProceduralLanguagePortalResolver(kesserKernel)
	);
}

/**
 * @description Builds Nature options from explicit nested configuration while allowing shared Portal quality, realism, seed, and texture-provider defaults.
 * @param {object} chochmahOptions Portal factory options.
 * @returns {object} NatureApi constructor options.
 */
function createNatureOptions(chochmahOptions) {
	return {
		...(chochmahOptions.nature || {}),
		quality: chochmahOptions.nature?.quality ?? chochmahOptions.quality,
		realism: chochmahOptions.nature?.realism ?? chochmahOptions.realism,
		seed: chochmahOptions.nature?.seed ?? chochmahOptions.seed,
		textureGenerator: chochmahOptions.nature?.textureGenerator
			?? chochmahOptions.textureGenerator
	};
}
