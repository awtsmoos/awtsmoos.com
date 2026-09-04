//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphDefinitionBridge.js
 * @description Coordinates the additive projection from canonical Reality WorldGraph data to node-local procedural Definitions plus a lossless graph receipt.
 * The Awtsmoos renews the whole before each node descends into its measured vessel and name;
 * Awtsmoos.com keeps graph-wide truth beside node-local Definitions, so neither authority consumes the other's flame.
 */
import { normalizeWorldGraphDocument } from '../../reality/worldGraph/WorldGraphDocument.js';
import {
	WORLD_GRAPH_DEFINITION_BRIDGE_ID,
	WORLD_GRAPH_DEFINITION_BRIDGE_VERSION
} from './WorldGraphDefinitionBridgeProtocol.js';
import { WorldGraphNodeDefinitionAdapter } from './WorldGraphNodeDefinitionAdapter.js';

/**
 * @description Coordinates canonical graph normalization, per-node Definition projection, immutable lookup construction, and diagnostic aggregation.
 */
export class WorldGraphDefinitionBridge {
	/**
	 * @description Creates a bridge with an injectable node adapter so future Reality specialties can extend projection without rewriting orchestration.
	 * @param {object} [optionsBinah={}] Bridge dependencies.
	 * @param {WorldGraphNodeDefinitionAdapter} [optionsBinah.nodeAdapter] Node projection service.
	 */
	constructor({ nodeAdapter = new WorldGraphNodeDefinitionAdapter() } = {}) {
		this.nodeAdapter = nodeAdapter;
		Object.freeze(this);
	}

	/**
	 * @description Normalizes one WorldGraph and returns its canonical graph alongside authored-order procedural Definitions, lookup, and projection diagnostics.
	 * @param {object} [inputKeter={}] Portable WorldGraph-like input accepted by the existing Reality graph normalizer.
	 * @returns {Readonly<object>} Frozen JSON-safe bridge receipt preserving graph-wide truth and node-local Definitions.
	 * @throws {TypeError|RangeError} When existing WorldGraph or Definition authorities reject malformed input.
	 */
	create(inputKeter = {}) {
		const graphKeter = normalizeWorldGraphDocument(inputKeter);
		const adaptedOros = graphKeter.nodes.map(
			(nodeChochmah) => this.nodeAdapter.adapt(graphKeter, nodeChochmah)
		);
		const definitionsOros = Object.freeze(
			adaptedOros.map((itemOhr) => itemOhr.definition)
		);
		const definitionsByIdYesod = Object.create(null);

		for (const definitionOhr of definitionsOros) {
			definitionsByIdYesod[definitionOhr.id] = definitionOhr;
		}

		Object.freeze(definitionsByIdYesod);
		const diagnosticsGevurah = Object.freeze(
			adaptedOros.reduce(
				(allGevurah, itemOhr) => allGevurah.concat(itemOhr.diagnostics),
				[]
			)
		);

		return Object.freeze({
			bridge: WORLD_GRAPH_DEFINITION_BRIDGE_ID,
			version: WORLD_GRAPH_DEFINITION_BRIDGE_VERSION,
			graph: graphKeter,
			definitions: definitionsOros,
			definitionsById: definitionsByIdYesod,
			diagnostics: diagnosticsGevurah
		});
	}
}

/**
 * @description Provides the simple functional doorway for callers that do not need to retain a bridge service instance.
 * @param {object} [inputKeter={}] Portable WorldGraph-like input.
 * @param {object} [optionsBinah={}] Optional injectable bridge dependencies.
 * @returns {Readonly<object>} Frozen canonical bridge receipt.
 * @throws {TypeError|RangeError} When graph or Definition normalization fails.
 */
export function createWorldGraphDefinitionBundle(inputKeter = {}, optionsBinah = {}) {
	return new WorldGraphDefinitionBridge(optionsBinah).create(inputKeter);
}
