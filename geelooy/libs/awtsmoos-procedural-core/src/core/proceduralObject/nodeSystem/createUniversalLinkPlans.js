// B"H
// Boruch Hashem
// Blessed is He
/** Every preserved link receives one immutable compatibility, availability, and slot plan. */

import { planSocketConnection } from "../nodes/planSocketConnection.js";
import { selectActiveUniversalLinks, universalLinkIsActive } from "./selectActiveUniversalLinks.js";
import { universalSocketState } from "./universalSocketAvailability.js";

function socket(definition, direction, id) {
	return definition?.[direction]?.find(candidate => candidate.id === id) ?? null;
}

function activeSlots(graph) {
	const slots = new Map();
	const counts = new Map();
	for (const link of selectActiveUniversalLinks(graph)) {
		const key = `${link.to.nodeId}:${link.to.socketId}`;
		const slot = counts.get(key) ?? 0;
		counts.set(key, slot + 1);
		slots.set(link.id, slot);
	}
	return slots;
}

function unresolved(link, active, reason) {
	return Object.freeze({
		linkId: link.id,
		order: link.order,
		active,
		from: link.from,
		to: link.to,
		compatible: false,
		validForExecution: false,
		conversion: null,
		lossiness: "incompatible",
		reason,
		multiInputSlot: null,
		metadata: link.metadata
	});
}

export function createUniversalLinkPlans(graph, definitions) {
	const nodes = new Map(graph.nodes.map(node => [node.id, node]));
	const slots = activeSlots(graph);
	return Object.freeze(graph.links.map(link => {
		const active = universalLinkIsActive(link);
		const sourceNode = nodes.get(link.from.nodeId);
		const targetNode = nodes.get(link.to.nodeId);
		if (!sourceNode || !targetNode) {
			return unresolved(link, active, "A link references a missing node.");
		}
		const output = socket(definitions.get(sourceNode.id), "outputs", link.from.socketId);
		const input = socket(definitions.get(targetNode.id), "inputs", link.to.socketId);
		if (!output || !input) {
			return unresolved(link, active, "A link references a missing socket.");
		}
		const sourceState = universalSocketState(sourceNode, output);
		const targetState = universalSocketState(targetNode, input);
		const connection = planSocketConnection(output, input);
		const available = sourceState.available && targetState.available;
		return Object.freeze({
			linkId: link.id,
			order: link.order,
			active,
			from: link.from,
			to: link.to,
			sourceType: output.type,
			targetType: input.type,
			sourceAvailable: sourceState.available,
			targetAvailable: targetState.available,
			compatible: connection.compatible,
			validForExecution: active && available && connection.compatible,
			conversion: connection.conversion,
			lossiness: connection.lossiness,
			reason: connection.reason,
			multiInput: input.multiInput,
			multiInputSlot: active ? slots.get(link.id) ?? null : null,
			linkLimit: input.metadata?.linkLimit ?? null,
			metadata: link.metadata
		});
	}));
}
