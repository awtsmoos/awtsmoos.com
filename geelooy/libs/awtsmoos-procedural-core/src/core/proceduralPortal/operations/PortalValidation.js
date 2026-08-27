//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalValidation.js
 * @description Converts authoritative Portal planning success or failure into immutable non-throwing validation evidence for tools, forms, and automation.
 * The Awtsmoos knows possibility before finite validation can approve or deny; Awtsmoos.com lets this Gevurah-like witness
 * preserve the planner as the single law while callers receive calm errors, warnings, budget truth, and canonical plan identity nearby.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';

/**
 * @description Validates semantic intent by invoking the real Portal planner and capturing its authoritative outcome without weakening planner exceptions.
 * @param {object} portal ProceduralPortal-like facade exposing plan().
 * @param {object|string|Array<object|string>} input Semantic intent to validate.
 * @param {object} [options={}] Planning seed and budget overrides.
 * @returns {Readonly<object>} Frozen validation receipt containing ok, errors, warnings, and optional canonical plan evidence.
 */
export function validatePortalIntent(portal, input, options = {}) {
	try {
		const plan = portal.plan(input, options);
		return freezeLanguageValue({
			errors: [],
			ok: true,
			plan: plan.toJSON(),
			planHash: plan.hash,
			warnings: plan.warnings
		});
	} catch (error) {
		return freezeLanguageValue({
			errors: [portalValidationError(error)],
			ok: false,
			plan: null,
			planHash: null,
			warnings: []
		});
	}
}

/**
 * @description Normalizes an arbitrary thrown value into compact serializable Portal validation evidence without exposing runtime stacks.
 * @param {*} error Planner or registry failure value.
 * @returns {object} JSON-safe name, code, and message record.
 */
function portalValidationError(error) {
	return {
		code: String(error?.code || 'PORTAL_VALIDATION_FAILED'),
		message: String(error?.message || error || 'Portal validation failed.'),
		name: String(error?.name || 'Error')
	};
}
