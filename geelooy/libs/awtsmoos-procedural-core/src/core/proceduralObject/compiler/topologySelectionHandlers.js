// B"H

import { createSelectionArtifact } from "../foundation/selections/index.js";
import {
	composeTopologyRemaps,
	createTopologyIdentityReference,
	remapSelectionThroughTopology,
	topologyDomainIds
} from "../geometry/topology/index.js";
import {
	requireStoredSelection,
	requireTopologyIdentity,
	requireTopologyRemap,
	storeSelection,
	storeTopologyRemap
} from "./topologyContextHelpers.js";

function selectionIds(identity, args) {
	if (args.elementIds && args.elementIndices) {
		throw new TypeError("Topology selection accepts elementIds or elementIndices, not both.");
	}
	if (!args.elementIndices) return args.elementIds ?? [];
	if (!Array.isArray(args.elementIndices)) {
		throw new TypeError("Topology selection elementIndices must be an array.");
	}
	const ids = topologyDomainIds(identity, args.domain);
	return args.elementIndices.map(index => {
		if (!Number.isInteger(index) || index < 0 || index >= ids.length) {
			throw new RangeError(`Topology selection index is out of range: ${index}`);
		}
		return ids[index];
	});
}

function selectionWeights(ids, weights) {
	if (!Array.isArray(weights)) return weights;
	if (weights.length !== ids.length) {
		throw new RangeError("Selection weight array must match selected element count.");
	}
	return Object.fromEntries(ids.map((id, index) => [id, weights[index]]));
}

function createSelectionHandler(context, command) {
	const identity = requireTopologyIdentity(context, command.args.identitySource);
	const elementIds = selectionIds(identity, command.args);
	return storeSelection(context, command.target, createSelectionArtifact({
		target: createTopologyIdentityReference(identity),
		domain: command.args.domain,
		elementIds,
		weights: selectionWeights(elementIds, command.args.weights),
		provenance: command.args.provenance
	}));
}

function remapSelectionHandler(context, command) {
	return storeSelection(context, command.target, remapSelectionThroughTopology(
		requireStoredSelection(context, command.args.selectionSource),
		requireTopologyRemap(context, command.args.remapSource),
		{ removed: command.args.removed, weights: command.args.weights }
	));
}

function composeRemapsHandler(context, command) {
	return storeTopologyRemap(context, command.target, composeTopologyRemaps(
		requireTopologyRemap(context, command.args.first),
		requireTopologyRemap(context, command.args.second),
		{ operation: command.args.operation, metadata: command.args.metadata }
	));
}

/** Registers stable selection creation, migration, and remap composition. */
export function registerTopologySelectionHandlers(registry) {
	registry.register("create_topology_selection", { handler: createSelectionHandler });
	registry.register("remap_topology_selection", { handler: remapSelectionHandler });
	registry.register("compose_topology_remaps", { handler: composeRemapsHandler });
	return registry;
}
