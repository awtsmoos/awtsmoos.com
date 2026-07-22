// B"H
// Boruch Hashem
// Blessed is He
/**
 * Blender node execution is structured intent, never generated source code.
 * Awtsmoos.com preserves native types, properties, defaults, ordered links,
 * interfaces, and zones for a separately maintained trusted worker.
 */

import {
	NodeDefinitionRegistry,
	compileUniversalNodeTreePlan,
	createBlenderBuiltinSchemaPack,
	validateBlenderNodeZones
} from "../../core/proceduralObject/nodeSystem/index.js";

function createRegistry(pack) {
	return new NodeDefinitionRegistry().registerPack(pack.nodeSchemaPack);
}

function machineIdentifier(value, fallback) {
	const normalized = String(value ?? fallback)
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return normalized || fallback;
}

function normalizedTreeInput(input = {}) {
	const identifier = machineIdentifier(input.id ?? input.name, "blender-node-tree");
	return {
		...input,
		id: identifier,
		name: machineIdentifier(input.name ?? identifier, identifier),
		kind: input.kind ?? "geometry",
		version: input.version ?? "1.0.0"
	};
}

function nodeOperation(node, definition) {
	return Object.freeze({
		op: "create-node",
		nodeId: node.id,
		nativeType: definition.metadata.nativeType,
		treeType: definition.metadata.treeType,
		label: node.label,
		parentId: node.parentId,
		muted: node.muted,
		hidden: node.hidden,
		properties: node.properties,
		inputDefaults: node.inputs,
		metadata: node.metadata
	});
}

/**
 * Creates a safe trusted-worker plan for geometry or material node trees.
 * @returns {Object} Immutable structured operations and transparent coverage.
 * @complexity O(nodes + links + zones).
 * @deterministic Always for equal tree and schema pack.
 * @sideEffects None; does not import Blender or execute Python.
 */
export function createBlenderNodeExecutionPlan(input, options = {}) {
	const pack = options.schemaPack ?? createBlenderBuiltinSchemaPack(options);
	const registry = options.definitionRegistry ?? createRegistry(pack);
	const plan = compileUniversalNodeTreePlan(
		normalizedTreeInput(input),
		{ definitionRegistry: registry }
	);
	const definitionByNode = new Map(plan.nodes.map(node => [
		node.id,
		registry.resolve(node.type)
	]));
	const definitionByType = new Map(
		registry.list().map(definition => [definition.type, definition])
	);
	const zones = validateBlenderNodeZones(plan.tree, definitionByType);
	const nodeOperations = plan.schedule.map(nodeId => {
		const node = plan.tree.nodes.find(item => item.id === nodeId);
		return nodeOperation(node, definitionByNode.get(nodeId));
	});
	const linkOperations = plan.tree.links.map(link => Object.freeze({
		op: link.muted ? "create-muted-link" : "create-link",
		linkId: link.id,
		index: link.index,
		from: link.from,
		to: link.to
	}));
	return Object.freeze({
		type: "blender-node-execution-plan",
		version: "1.0.0",
		blenderVersion: pack.manifest.blenderVersion,
		treeId: plan.tree.id,
		treeKind: plan.tree.kind,
		operations: Object.freeze([...nodeOperations, ...linkOperations]),
		interfaceItems: plan.interfaceItems,
		groups: plan.groups,
		zones: plan.zones,
		diagnostics: Object.freeze([...plan.diagnostics, ...zones.diagnostics]),
		coverage: plan.coverage,
		executable: plan.ok && zones.ok,
		arbitrarySourceExecution: false,
		networkAccess: false
	});
}
