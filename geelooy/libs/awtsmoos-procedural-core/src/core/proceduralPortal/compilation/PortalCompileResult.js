//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalCompileResult.js
 * @description Keeps heavyweight specialist outputs available at runtime while exposing compact provenance and explanation for every semantic node.
 * The Awtsmoos renews result and reason together; Awtsmoos.com lets this Hod-like envelope preserve generated value without forcing
 * it into durable JSON, while kind, seed, recipe hash, dependencies, fallback evidence, plan hash, and Universal world truth stay inspectable.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';

/** Immutable runtime envelope for one completed Portal compilation. */
export class PortalCompileResult {
	/**
	 * @description Stores completed outputs as one frozen ordered collection without exposing a mutable lookup structure behind the facade.
	 * @param {object} input Completed compilation evidence.
	 * @param {object} input.plan Immutable Portal plan.
	 * @param {object[]} input.outputs Completed runtime output records.
	 * @param {object} input.world JSON-safe Universal world document.
	 * @returns {PortalCompileResult} Frozen compile result envelope.
	 */
	constructor(input = {}) {
		this.type = 'portal.compile-result';
		this.plan = input.plan;
		this.outputs = Object.freeze([...(input.outputs || [])]);
		this.world = input.world;
		this.result = this.plan?.roots?.length === 1 ? findOutput(this.outputs, this.plan.roots[0])?.result ?? null : null;
		Object.freeze(this);
	}

	/**
	 * @description Returns the complete runtime output record for one semantic node identifier.
	 * @param {string} id Semantic node identifier.
	 * @returns {object|null} Completed output record or null when absent.
	 */
	get(id) {
		return findOutput(this.outputs, id);
	}

	/**
	 * @description Explains one generated node without leaking heavyweight specialist result objects into the explanation payload.
	 * @param {string} id Semantic node identifier.
	 * @returns {Readonly<object>|null} Frozen JSON-safe provenance or null when the node is absent.
	 */
	explain(id) {
		const output = this.get(id);
		if (!output) return null;
		return freezeLanguageValue({
			dependencies: output.dependencies,
			fallback: output.fallback,
			id: output.id,
			kind: output.kind,
			planHash: this.plan.hash,
			recipe: output.recipe,
			recipeHash: output.recipeHash,
			resultType: output.result?.type || null,
			seedPath: output.seedPath
		});
	}

	/**
	 * @description Returns every node explanation in dependency order for graph inspectors, logs, and handoff tools.
	 * @returns {readonly object[]} Frozen explanation records.
	 */
	explainAll() {
		return Object.freeze(this.outputs.map(output => this.explain(output.id)));
	}
}

/**
 * @description Finds one output without introducing a mutable secondary index into the immutable public result object.
 * @param {readonly object[]} outputs Completed output records.
 * @param {*} id Semantic node identifier.
 * @returns {object|null} Matching output or null.
 */
function findOutput(outputs, id) {
	return outputs.find(output => output.id === String(id)) || null;
}
