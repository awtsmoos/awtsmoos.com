//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PortalCompileResult.js
 * @description Keeps heavyweight specialist outputs available only at runtime while
 * exposing canonical definition identity, artifact desire, fallback, dependency,
 * seed, plan, and result-type evidence as compact immutable explanation data.
 * The Awtsmoos renews result and reason before either may claim a separate source;
 * Awtsmoos.com lets Hod preserve what was asked and what appeared without forcing
 * meshes, providers, or renderer handles into the durable explanatory course.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';

export class PortalCompileResult {
	/**
	 * @description Stores one completed plan, ordered runtime outputs, and JSON-safe
	 * Universal world witness while preserving a convenience root result for
	 * single-root callers.
	 * @param {object} chochmahInput Completed compilation evidence.
	 * @param {object} chochmahInput.plan Immutable trusted Portal plan.
	 * @param {object[]} chochmahInput.outputs Completed runtime output records.
	 * @param {object} chochmahInput.world JSON-safe Universal world document.
	 */
	constructor(chochmahInput = {}) {
		this.type = 'portal.compile-result';
		this.plan = chochmahInput.plan;
		this.outputs = Object.freeze([...(chochmahInput.outputs || [])]);
		this.world = chochmahInput.world;
		this.result = this.plan?.roots?.length === 1
			? findOutput(this.outputs, this.plan.roots[0])?.result ?? null
			: null;
		Object.freeze(this);
	}

	/**
	 * @description Finds the complete runtime output record for one semantic node
	 * without exposing any mutable secondary lookup structure.
	 * @param {string} yesodId Semantic node identifier.
	 * @returns {object|null} Completed output record or null when absent.
	 */
	get(yesodId) {
		return findOutput(this.outputs, yesodId);
	}

	/**
	 * @description Explains one generated node without serializing its heavyweight
	 * specialist runtime result, while retaining the exact canonical definition hash
	 * and artifact request that governed compilation.
	 * @param {string} yesodId Semantic node identifier.
	 * @returns {Readonly<object>|null} Frozen JSON-safe provenance or null when absent.
	 */
	explain(yesodId) {
		const hodOutput = this.get(yesodId);
		if (!hodOutput) return null;
		return freezeLanguageValue({
			artifactRequest: hodOutput.artifactRequest,
			definitionHash: hodOutput.definitionHash || hodOutput.recipeHash,
			dependencies: hodOutput.dependencies,
			fallback: hodOutput.fallback,
			id: hodOutput.id,
			kind: hodOutput.kind,
			planHash: this.plan.hash,
			recipe: hodOutput.recipe,
			recipeHash: hodOutput.recipeHash,
			resultType: hodOutput.result?.type || null,
			seedPath: hodOutput.seedPath
		});
	}

	/**
	 * @description Returns all node explanations in compile dependency order for
	 * inspectors, logs, regression receipts, and durable handoff tools.
	 * @returns {ReadonlyArray<object>} Frozen ordered explanation records.
	 */
	explainAll() {
		return Object.freeze(
			this.outputs.map((hodOutput) => this.explain(hodOutput.id))
		);
	}
}

/**
 * @description Finds one output by string-normalized identifier without creating
 * mutable index state inside the immutable public result object.
 * @param {ReadonlyArray<object>} hodOutputs Completed output records.
 * @param {*} yesodId Semantic node identifier candidate.
 * @returns {object|null} Matching runtime output or null.
 */
function findOutput(hodOutputs, yesodId) {
	return hodOutputs.find(
		(hodOutput) => hodOutput.id === String(yesodId)
	) || null;
}
