// B"H
// Boruch Hashem
// Blessed is He
/** Link diagnostics isolate availability, compatibility, cardinality, and native limits. */

import { createDiagnostic } from "../foundation/diagnostics/index.js";

function diagnostic(code, message, metadata = {}) {
	return createDiagnostic({ code, message, metadata });
}

function socket(definition, direction, id) {
	return definition?.[direction]?.find(candidate => candidate.id === id) ?? null;
}

export function validateUniversalLinkPlan(plan, nodes, diagnostics) {
	if (!plan.active) return;
	if (!nodes.has(plan.from.nodeId) || !nodes.has(plan.to.nodeId)) {
		diagnostics.push(diagnostic(
			"NODE.LINK_NODE_MISSING",
			"A link references a missing node.",
			{ plan }
		));
		return;
	}
	if (!plan.sourceType || !plan.targetType) {
		diagnostics.push(diagnostic(
			"NODE.LINK_SOCKET_MISSING",
			"A link references a missing socket.",
			{ plan }
		));
		return;
	}
	if (!plan.sourceAvailable || !plan.targetAvailable) {
		diagnostics.push(diagnostic(
			"NODE.LINK_SOCKET_UNAVAILABLE",
			"An active link references an unavailable socket.",
			{ plan }
		));
	}
	if (!plan.compatible) {
		diagnostics.push(diagnostic(
			"NODE.LINK_INCOMPATIBLE",
			plan.reason ?? "Socket types are incompatible.",
			{ plan }
		));
	}
}

export function validateUniversalIncomingLimits(definitions, plans, diagnostics) {
	const groups = new Map();
	for (const plan of plans.filter(candidate => candidate.active)) {
		const key = `${plan.to.nodeId}:${plan.to.socketId}`;
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(plan);
	}
	for (const [key, incoming] of groups) {
		const [nodeId, socketId] = key.split(":");
		const input = socket(definitions.get(nodeId), "inputs", socketId);
		if (!input) continue;
		if (!input.multiInput && incoming.length > 1) {
			diagnostics.push(diagnostic(
				"NODE.MULTIPLE_INPUT_LINKS",
				"A single-input socket has multiple active links.",
				{ nodeId, socketId, linkIds: incoming.map(plan => plan.linkId) }
			));
		}
		const nativeLimit = Math.floor(Number(input.metadata?.linkLimit));
		if (Number.isFinite(nativeLimit) && nativeLimit > 0 && incoming.length > nativeLimit) {
			diagnostics.push(diagnostic(
				"NODE.LINK_LIMIT_EXCEEDED",
				`Socket link limit exceeded: ${incoming.length} > ${nativeLimit}`,
				{ nodeId, socketId, nativeLimit }
			));
		}
	}
}

export function universalDefinitionSocket(definition, direction, id) {
	return socket(definition, direction, id);
}
