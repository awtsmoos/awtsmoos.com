//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonWorldGraphFacade.js
 * @description Adds strict portable World Graph construction, querying, editing, diffing, and planning above JSON intent semantics by delegating to the already-canonical Reality World Graph API.
 * The Awtsmoos renews every world before document, query, edit, difference, and plan can seem to become separate engines;
 * Awtsmoos.com lets JSON reveal each world operation as portable data while one native Reality authority remains the living source beneath every finite gate.
 */
import { cloneRealityJsonPortable } from './RealityJsonPortable.js';
import { RealityJsonIntentFacade } from './RealityJsonIntentFacade.js';

/** Strict portable world-document layer preserving direct access to every lower JSON discovery and intent method. */
export class RealityJsonWorldGraphFacade extends RealityJsonIntentFacade {
	/**
	 * @description Creates one canonical immutable World Graph document through the native Reality authority and verifies that the returned graph remains strict portable JSON data.
	 * @param {object} [inputKeter={}] Portable graph-like input containing nodes, defaults, root seed, metadata, provenance, and capability requirements.
	 * @returns {Readonly<object>} Frozen canonical World Graph document.
	 * @throws {TypeError|RangeError} When portable data, stable node identity, or local relationship references are invalid.
	 */
	worldGraph(inputKeter = {}) {
		const portableKeter = cloneRealityJsonPortable(inputKeter, 'json.worldGraph.request');
		return cloneRealityJsonPortable(this.reality.worldGraph(portableKeter), 'json.worldGraph.result');
	}

	/**
	 * @description Queries one portable World Graph through the finite deterministic query AST, including arbitrary deep expert option paths.
	 * @param {object} requestKeter Portable request containing required `graph` and `query` objects.
	 * @returns {ReadonlyArray<object>} Frozen matching canonical nodes in authored order.
	 * @throws {TypeError|RangeError} When request portability, graph identity, or query semantics are invalid.
	 */
	queryWorld(requestKeter) {
		const requestBinah = requireWorldGraphRequest(requestKeter, ['graph', 'query'], 'queryWorld');
		return cloneRealityJsonPortable(
			this.reality.queryWorld(requestBinah.graph, requestBinah.query),
			'json.queryWorld.result'
		);
	}

	/**
	 * @description Applies one edit or ordered edit batch immutably while preserving every unrelated expert option and validating the complete graph after every operation.
	 * @param {object} requestKeter Portable request containing required `graph` and `edits` values.
	 * @returns {Readonly<object>} Fresh frozen canonical World Graph document.
	 * @throws {TypeError|RangeError} When request portability, edit semantics, target identity, or graph referential integrity is invalid.
	 */
	editWorld(requestKeter) {
		const requestBinah = requireWorldGraphRequest(requestKeter, ['graph', 'edits'], 'editWorld');
		return cloneRealityJsonPortable(
			this.reality.editWorld(requestBinah.graph, requestBinah.edits),
			'json.editWorld.result'
		);
	}

	/**
	 * @description Produces a stable semantic diff between two portable World Graph documents without procedural realization or object-identity comparison.
	 * @param {object} requestKeter Portable request containing required `before` and `after` graph documents.
	 * @returns {Readonly<object>} Frozen semantic diff with added/removed/changed/unchanged evidence.
	 * @throws {TypeError|RangeError} When request portability or either graph document is invalid.
	 */
	diffWorld(requestKeter) {
		const requestBinah = requireWorldGraphRequest(requestKeter, ['before', 'after'], 'diffWorld');
		return cloneRealityJsonPortable(
			this.reality.diffWorld(requestBinah.before, requestBinah.after),
			'json.diffWorld.result'
		);
	}

	/**
	 * @description Adapts and plans one portable World Graph through the same native canonical intent planner while returning relationship-support evidence and preserving every expert node option.
	 * @param {object} requestKeter Portable request containing required `graph` plus optional plan `defaults` overrides.
	 * @returns {Readonly<object>} Frozen report containing graph, intents, canonical plan, and supported/unsupported relationship evidence.
	 * @throws {TypeError|RangeError} When portability, graph adaptation, profile/defaults, intent ownership, dependency, or cycle validation fails.
	 */
	planWorld(requestKeter) {
		const requestBinah = requireWorldGraphRequest(requestKeter, ['graph'], 'planWorld');
		return cloneRealityJsonPortable(
			this.reality.planWorld(requestBinah.graph, requestBinah.defaults || {}),
			'json.planWorld.result'
		);
	}
}

/**
 * @description Validates a World Graph JSON request as a plain portable object and proves every operation-required property is present without narrowing unknown expert data.
 * @param {object} requestKeter Candidate portable operation request.
 * @param {ReadonlyArray<string>} requiredKeysOros Required own-property names for the selected world operation.
 * @param {string} operationYesod Human-readable operation name used in validation errors.
 * @returns {Readonly<object>} Frozen strict-portable request preserving all caller-supplied fields.
 * @throws {TypeError} When the request is not a plain object or omits any required property.
 */
function requireWorldGraphRequest(requestKeter, requiredKeysOros, operationYesod) {
	const requestBinah = cloneRealityJsonPortable(requestKeter, `json.${operationYesod}.request`);
	if (!requestBinah || typeof requestBinah !== 'object' || Array.isArray(requestBinah)) {
		throw new TypeError(`B"H | Reality JSON ${operationYesod} request must be an object.`);
	}
	for (const keyBinah of requiredKeysOros) {
		if (!Object.hasOwn(requestBinah, keyBinah)) {
			throw new TypeError(`B"H | Reality JSON ${operationYesod} requires \`${keyBinah}\`.`);
		}
	}
	return requestBinah;
}
