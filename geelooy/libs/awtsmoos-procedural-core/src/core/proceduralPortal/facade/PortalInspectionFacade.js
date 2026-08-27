//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalInspectionFacade.js
 * @description Collects read-only universal Portal verbs in one inheritance layer while planning, querying, diffing, and explanation remain focused operation authorities.
 * The Awtsmoos sees every finite world without being divided by the verbs used to inspect it; Awtsmoos.com lets this Chochmah-like facade
 * gather validation, capability, inspection, query, difference, and explanation through one calm doorway whose inner laws remain independently made.
 */

import { describePortalCapabilities } from '../operations/PortalCapabilities.js';
import { diffPortalIntents } from '../operations/PortalDiff.js';
import { explainPortalIntent } from '../operations/PortalExplanation.js';
import { inspectPortalIntent } from '../operations/PortalInspection.js';
import { queryPortalIntent } from '../operations/PortalQuery.js';
import { validatePortalIntent } from '../operations/PortalValidation.js';

/** Read-only operation layer inherited by the concrete ProceduralPortal facade. */
export class PortalInspectionFacade {
	/**
	 * @description Validates semantic intent without throwing planner failures, preserving the planner as the single authority while exposing calm structured evidence.
	 * @param {*} input Semantic intent accepted by the Portal planner.
	 * @param {object} [options={}] Seed and budget planning overrides.
	 * @returns {Readonly<object>} Frozen validation evidence containing success, errors, warnings, and optional canonical plan data.
	 */
	validate(input, options = {}) {
		return validatePortalIntent(this, input, options);
	}

	/**
	 * @description Reveals truthful global or per-kind Portal capability evidence, including representation, native execution, and optional adapter state.
	 * @param {string|null} [kind=null] Optional canonical kind or registered alias to inspect.
	 * @returns {Readonly<object>} Frozen capability contract derived from the live registry and configured services.
	 */
	capabilities(kind = null) {
		return describePortalCapabilities(this, kind);
	}

	/**
	 * @description Inspects planned semantic intent without executing specialist compilers, returning roots, dependencies, provenance, costs, and canonical node evidence.
	 * @param {*} input Semantic intent accepted by the Portal planner.
	 * @param {object} [options={}] Seed and budget planning overrides.
	 * @returns {Readonly<object>} Frozen plan-backed inspection result.
	 */
	inspect(input, options = {}) {
		return inspectPortalIntent(this, input, options);
	}

	/**
	 * @description Filters planned semantic nodes using deterministic serializable criteria instead of renderer assumptions or executable predicates.
	 * @param {*} input Semantic intent or root collection to plan and query.
	 * @param {object} [criteria={}] Query criteria such as id, kind, root status, dependency, trait, or text.
	 * @param {object} [options={}] Seed and budget planning overrides.
	 * @returns {Readonly<object>} Frozen query result carrying normalized criteria and matching semantic nodes.
	 */
	query(input, criteria = {}, options = {}) {
		return queryPortalIntent(this, input, criteria, options);
	}

	/**
	 * @description Compares two semantic intents through canonical plan identity and Procedural Language definition deltas.
	 * @param {*} before Earlier semantic intent or root collection.
	 * @param {*} after Later semantic intent or root collection.
	 * @param {object} [options={}] Shared seed and budget planning overrides.
	 * @returns {Readonly<object>} Frozen semantic diff receipt with root and node-level change evidence.
	 */
	diff(before, after, options = {}) {
		return diffPortalIntents(this, before, after, options);
	}

	/**
	 * @description Explains observed planner decisions using only roots, dependencies, demand, budget, warnings, hashes, and provenance already present in canonical evidence.
	 * @param {*} input Semantic intent accepted by the Portal planner.
	 * @param {object} [options={}] Seed and budget planning overrides.
	 * @returns {Readonly<object>} Frozen evidence-only explanation that does not invent provider motives.
	 */
	explain(input, options = {}) {
		return explainPortalIntent(this, input, options);
	}
}
