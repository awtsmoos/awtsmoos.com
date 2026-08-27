//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonIntentFacade.js
 * @description Adds strict portable intent planning, explanation, and validation above JSON discovery while reusing the canonical native Reality planner.
 * The Awtsmoos renews every intention before plan, explanation, success, or rejection can appear in a finite object;
 * Awtsmoos.com lets JSON carry the same deterministic intent law as JavaScript while generation, history, and transport remain outside this vessel.
 */
import { cloneRealityJsonPortable } from './RealityJsonPortable.js';
import { RealityJsonDiscoveryFacade } from './RealityJsonDiscoveryFacade.js';
import { createRealityJsonValidationReport } from './RealityJsonValidation.js';

/** Strict portable intent layer sharing the same native Reality planner as direct JavaScript. */
export class RealityJsonIntentFacade extends RealityJsonDiscoveryFacade {
	/**
	 * @description Produces the exact canonical non-heavy plan used by native Reality callers after strict JSON-portability validation.
	 * @param {object} requestKeter Portable request containing required `intent` and optional `defaults`.
	 * @returns {Readonly<object>} Frozen canonical Reality intent plan.
	 * @throws {TypeError|RangeError} When request portability, intent identity, aliases, dependencies, cycles, or profile values are invalid.
	 */
	plan(requestKeter) {
		const requestBinah = normalizeRealityJsonIntentRequest(requestKeter);
		return cloneRealityJsonPortable(
			this.reality.plan(requestBinah.intent, requestBinah.defaults || {}),
			'plan'
		);
	}

	/**
	 * @description Explains portable intent through the same canonical non-heavy planner and returns strict portable planning/provenance evidence.
	 * @param {object} requestKeter Portable request containing required `intent` and optional `defaults`.
	 * @returns {Readonly<object>} Frozen canonical explanation result.
	 * @throws {TypeError|RangeError} When request portability or canonical intent semantics are invalid.
	 */
	explain(requestKeter) {
		const requestBinah = normalizeRealityJsonIntentRequest(requestKeter);
		return cloneRealityJsonPortable(
			this.reality.explain(requestBinah.intent, requestBinah.defaults || {}),
			'explain'
		);
	}

	/**
	 * @description Validates strict JSON portability plus the complete canonical Reality semantic graph without procedural generation and converts failures into portable evidence.
	 * @param {object} requestKeter Portable request containing required `intent` and optional `defaults`.
	 * @returns {Readonly<object>} Frozen `{valid, plan}` or `{valid, errors}` validation report.
	 */
	validate(requestKeter) {
		return createRealityJsonValidationReport(() => this.plan(requestKeter));
	}
}

/**
 * @description Validates the common portable request envelope for plan/explain/validate while preserving arbitrary specialist intent fields inside the strict JSON value.
 * @param {object} requestKeter Candidate portable intent request.
 * @returns {Readonly<object>} Frozen portable request containing required `intent`.
 * @throws {TypeError} When the request is not a plain object or omits `intent`.
 */
export function normalizeRealityJsonIntentRequest(requestKeter) {
	const requestBinah = cloneRealityJsonPortable(requestKeter, 'intent.request');
	if (!requestBinah || typeof requestBinah !== 'object' || Array.isArray(requestBinah)) {
		throw new TypeError('B"H | Reality JSON intent request must be an object.');
	}
	if (!Object.hasOwn(requestBinah, 'intent')) {
		throw new TypeError('B"H | Reality JSON intent request requires `intent`.');
	}
	return requestBinah;
}
