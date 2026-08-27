//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWorldGraphApi.js
 * @description Adds immutable world-document construction, querying, editing, diffing, and Reality planning above the JSON/discovery chain without replacing direct, fluent, intent, or expert APIs.
 * The Awtsmoos renews the whole before simple composition and microscopic expert control can seem opposed;
 * Awtsmoos.com lets one high-level world document unfold into explicit intents, relation evidence, and the same canonical planner while every deeper module remains directly reachable.
 */
import { RealityJsonApi } from './RealityJsonApi.js';
import { adaptWorldGraphToRealityIntents } from './RealityWorldGraphAdapter.js';
import { cloneRealityJsonPortable } from './json/RealityJsonPortable.js';
import {
	createWorldGraphDocument,
	diffWorldGraphs,
	editWorldGraph,
	queryWorldGraph
} from './worldGraph/index.js';

/** Progressive Reality layer exposing universal semantic world-document operations without owning any procedural generation algorithm. */
export class RealityWorldGraphApi extends RealityJsonApi {
	/**
	 * @description Creates one canonical immutable World Graph document. The native Reality seed becomes a convenience default only when the caller does not supply a graph seed; no non-portable Reality defaults are silently copied into the document.
	 * @param {object} [keterInput={}] Graph-like portable input containing nodes, rootSeed/seed, defaults, metadata, provenance, and capability requirements.
	 * @returns {Readonly<object>} Frozen validated World Graph document with stable protocol/version and authored node order.
	 * @throws {TypeError|RangeError} When portable data, node identity, or local relationship references are invalid.
	 */
	worldGraph(keterInput = {}) {
		const portableKeter = cloneRealityJsonPortable(keterInput, 'reality.worldGraph');
		return createWorldGraphDocument({
			...portableKeter,
			rootSeed: portableKeter.rootSeed ?? portableKeter.seed ?? this.defaults.seed ?? 613
		});
	}

	/**
	 * @description Queries a canonical or graph-like world document through the finite JSON-safe query AST, including arbitrary deep expert `options.*` and `metadata.*` paths.
	 * @param {object} graphKeter Canonical or graph-like World Graph document.
	 * @param {object} queryKeter Portable finite query AST.
	 * @returns {ReadonlyArray<object>} Frozen matching canonical nodes in original authored order.
	 * @throws {TypeError|RangeError} When graph or query semantics are invalid.
	 */
	queryWorld(graphKeter, queryKeter) {
		return queryWorldGraph(graphKeter, queryKeter);
	}

	/**
	 * @description Applies one portable edit or an ordered edit batch immutably, preserving unrelated expert options and revalidating the complete document after every operation.
	 * @param {object} graphKeter Canonical or graph-like World Graph document.
	 * @param {object|object[]} editsKeter One edit request or ordered edit array.
	 * @returns {Readonly<object>} Fresh canonical World Graph document after every requested edit succeeds.
	 * @throws {TypeError|RangeError} When an edit is invalid or would leave the graph in an invalid referential state.
	 */
	editWorld(graphKeter, editsKeter) {
		return editWorldGraph(graphKeter, editsKeter);
	}

	/**
	 * @description Produces a stable semantic diff between two world documents without realizing either world or comparing accidental JavaScript object identity.
	 * @param {object} beforeKeter Earlier canonical or graph-like World Graph document.
	 * @param {object} afterKeter Later canonical or graph-like World Graph document.
	 * @returns {Readonly<object>} Portable diff containing added/removed/unchanged IDs, changed semantic fields/keys, and document-level changes.
	 * @throws {TypeError|RangeError} When either document fails canonical graph validation.
	 */
	diffWorld(beforeKeter, afterKeter) {
		return diffWorldGraphs(beforeKeter, afterKeter);
	}

	/**
	 * @description Adapts a World Graph into ordinary Reality intents and runs the exact existing canonical non-heavy planner while preserving translation evidence and every expert node option.
	 * @param {object} graphKeter Canonical or graph-like World Graph document.
	 * @param {object} [keterOverrides={}] Portable plan defaults overriding graph defaults/root seed, including full advanced serializable specialist defaults.
	 * @returns {Readonly<object>} Frozen portable report containing graph, intents, supported/unsupported relationship evidence, and canonical Reality intent plan.
	 * @throws {TypeError|RangeError} When graph adaptation, plan defaults, intent kind ownership, dependencies, or canonical planning validation fails.
	 */
	planWorld(graphKeter, keterOverrides = {}) {
		const graphBinah = this.worldGraph(graphKeter);
		const adapterTiferes = adaptWorldGraphToRealityIntents(graphBinah);
		const overridesGevurah = cloneRealityJsonPortable(keterOverrides, 'reality.planWorld.defaults');
		const defaultsChesed = {
			...graphBinah.defaults,
			seed: graphBinah.rootSeed,
			...overridesGevurah
		};
		const planMalchus = this.plan(adapterTiferes.intents, defaultsChesed);
		return cloneRealityJsonPortable({
			graph: graphBinah,
			intents: adapterTiferes.intents,
			plan: planMalchus,
			supportedRelationships: adapterTiferes.supportedRelationships,
			unsupportedRelationships: adapterTiferes.unsupportedRelationships
		}, 'reality.planWorld.result');
	}
}
