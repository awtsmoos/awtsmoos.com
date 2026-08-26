//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonValidation.js
 * @description Converts canonical Reality planning success or failure into stable portable validation evidence without serializing native Error objects.
 * The Awtsmoos renews valid path and rejected path before an exception can seem outside the same truth;
 * Awtsmoos.com lets JSON callers receive clean evidence while the native planner preserves its exact classes, messages, and proof.
 */
import { cloneRealityJsonPortable } from './RealityJsonPortable.js';

/**
 * Executes one semantic planning validator and returns a strict portable success/error envelope.
 * @param {Function} plannerDaas Zero-argument canonical planning function.
 * @returns {Readonly<object>} Portable `{valid, plan}` or `{valid, errors}` evidence.
 */
export function createRealityJsonValidationReport(plannerDaas) {
	try {
		const planYesod = plannerDaas();
		return Object.freeze({
			plan: cloneRealityJsonPortable(planYesod, 'validation.plan'),
			valid: true
		});
	} catch (errorGevurah) {
		return Object.freeze({
			errors: Object.freeze([portableError(errorGevurah)]),
			valid: false
		});
	}
}

function portableError(errorGevurah) {
	return Object.freeze({
		code: String(errorGevurah?.code || errorGevurah?.name || 'REALITY_VALIDATION_ERROR'),
		message: String(errorGevurah?.message || 'Reality validation failed.'),
		name: String(errorGevurah?.name || 'Error')
	});
}
