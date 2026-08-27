//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalExport.js
 * @description Exports canonical Portal/world data natively as stable JSON and delegates specialist targets only through explicit installed exporter adapters.
 * The Awtsmoos is beyond file and renderer while every finite world may receive a portable garment; Awtsmoos.com lets canonical JSON flow natively
 * and marks unknown targets deferred until a truthful bridge appears, so interoperability expands without fabrication in the nightly sea.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import { stableLanguageHash, stableLanguageJson } from '../../proceduralLanguage/data/stableLanguageValue.js';
import { invokePortalAdapter } from './PortalAdapterExecution.js';
import { portalAdapterOptions, portalPlanningOptions } from './PortalOperationOptions.js';

/**
 * @description Exports semantic intent, a Portal plan, compile result, or awtsmoos.world.v1 document to canonical JSON or an explicit adapter target.
 * @param {object} portal ProceduralPortal-like facade exposing plan() and services.
 * @param {*} input Semantic intent or already-produced Portal/world value.
 * @param {string} [target='canonical-json'] Export target identifier.
 * @param {object} [options={}] Operation options containing planner seed/budget, optional exporter override, and explicit adapterOptions bag.
 * @returns {Promise<Readonly<object>>} Frozen native/deferred receipt or shallow-frozen executed adapter receipt.
 */
export async function exportPortalValue(portal, input, target = 'canonical-json', options = {}) {
	const planning = portalPlanningOptions(options);
	const adapterOptions = portalAdapterOptions(options, 'adapterOptions');
	const payload = resolvePortalExportPayload(portal, input, planning);
	const canonicalTarget = String(target || 'canonical-json').trim().toLowerCase();
	if (canonicalTarget === 'canonical-json' || canonicalTarget === 'json') {
		return createCanonicalJsonExport(payload);
	}
	const exporter = options.exporter || portal.services.exporter;
	if (!exporter) {
		return createDeferredExport(payload, canonicalTarget);
	}
	const result = await invokePortalAdapter(exporter, 'export', Object.freeze({
		options: adapterOptions,
		payload,
		target: canonicalTarget
	}));
	return Object.freeze({
		hash: stableLanguageHash(payload),
		result,
		status: 'executed',
		target: canonicalTarget,
		type: 'portal.export-result',
		version: 1
	});
}

/**
 * @description Resolves an already-portable world/plan value when possible and otherwise derives the canonical Portal plan without executing specialists.
 * @param {object} portal ProceduralPortal-like facade exposing plan().
 * @param {*} input Candidate world document, compile result, PortalPlan, or semantic intent.
 * @param {object} planningOptions Canonical seed/budget planner options.
 * @returns {Readonly<object>} Portable JSON-safe export payload.
 */
function resolvePortalExportPayload(portal, input, planningOptions) {
	if (input?.format === 'awtsmoos.world.v1') {
		return input;
	}
	if (input?.world?.format === 'awtsmoos.world.v1') {
		return input.world;
	}
	if (Array.isArray(input?.graph) && typeof input?.hash === 'string') {
		return typeof input.toJSON === 'function' ? input.toJSON() : input;
	}
	return portal.plan(input, planningOptions).toJSON();
}

/**
 * @description Creates the native stable JSON export receipt with deterministic semantic hash evidence.
 * @param {Readonly<object>} payload Portable semantic payload.
 * @returns {Readonly<object>} Frozen canonical JSON receipt.
 */
function createCanonicalJsonExport(payload) {
	return freezeLanguageValue({
		hash: stableLanguageHash(payload),
		json: stableLanguageJson(payload),
		mediaType: 'application/json',
		status: 'ready',
		target: 'canonical-json',
		type: 'portal.export-result',
		version: 1
	});
}

/**
 * @description Creates honest non-executed export evidence when no adapter exists for a requested specialist target.
 * @param {Readonly<object>} payload Portable semantic payload remaining available for a future adapter.
 * @param {string} target Requested specialist export target.
 * @returns {Readonly<object>} Frozen deferred export evidence.
 */
function createDeferredExport(payload, target) {
	return freezeLanguageValue({
		hash: stableLanguageHash(payload),
		reason: `No exporter adapter is installed for ${target}.`,
		status: 'deferred',
		target,
		type: 'portal.export-result',
		version: 1
	});
}
