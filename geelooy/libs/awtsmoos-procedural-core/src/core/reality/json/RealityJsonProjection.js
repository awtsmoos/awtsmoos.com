//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonProjection.js
 * @description Applies only declared portable projection policies so native runtime behavior is never silently erased during JSON transport.
 * The Awtsmoos renews native vessel and portable description before one can masquerade as the other;
 * Awtsmoos.com lets every capability state its projection covenant, and this module obeys that law without guessing beneath the cover.
 */
import { cloneRealityJsonPortable } from './RealityJsonPortable.js';

/**
 * Projects one native result through the capability's explicit JSON policy.
 * @param {object} capabilityKli Canonical Reality capability covenant record.
 * @param {unknown} nativeOhr Native JavaScript result.
 * @param {object} [contextBinah={}] Explicit `describe` or `plan` functions supplied by the owning adapter.
 * @returns {unknown} Strict portable projection or explicit unsupported evidence.
 */
export function projectRealityJsonResult(
	capabilityKli,
	nativeOhr,
	contextBinah = {}
) {
	const policyYesod = capabilityKli.jsonProjection;
	if (policyYesod === 'portable') {
		return cloneRealityJsonPortable(nativeOhr, `result.${capabilityKli.id}`);
	}
	if (policyYesod === 'metadata') {
		return cloneRealityJsonPortable(capabilityKli, `metadata.${capabilityKli.id}`);
	}
	if (policyYesod === 'describe') {
		return executeProjection(capabilityKli, contextBinah.describe, nativeOhr, 'describe');
	}
	if (policyYesod === 'plan') {
		return executeProjection(capabilityKli, contextBinah.plan, nativeOhr, 'plan');
	}
	return unsupportedProjection(capabilityKli, 'native-only');
}

/**
 * Returns strict portable evidence explaining why native data is not directly representable in JSON.
 * @param {object} capabilityKli Capability covenant record.
 * @param {string} reasonYesod Projection reason.
 * @returns {Readonly<object>} Portable unsupported descriptor.
 */
export function unsupportedRealityJsonProjection(capabilityKli, reasonYesod = 'unsupported') {
	return unsupportedProjection(capabilityKli, reasonYesod);
}

function executeProjection(capabilityKli, projectorDaas, nativeOhr, policyYesod) {
	if (typeof projectorDaas !== 'function') {
		return unsupportedProjection(capabilityKli, `${policyYesod}-projection-unavailable`);
	}
	return cloneRealityJsonPortable(
		projectorDaas(nativeOhr, capabilityKli),
		`${policyYesod}.${capabilityKli.id}`
	);
}

function unsupportedProjection(capabilityKli, reasonYesod) {
	return Object.freeze({
		capabilityId: capabilityKli.id,
		jsonProjection: capabilityKli.jsonProjection,
		nativeResultKind: capabilityKli.nativeResultKind,
		reason: String(reasonYesod),
		supported: false
	});
}
