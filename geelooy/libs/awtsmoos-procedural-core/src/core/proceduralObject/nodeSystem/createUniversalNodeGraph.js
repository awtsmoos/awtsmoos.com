// B"H
// Boruch Hashem
// Blessed is He
/** One graph envelope preserves geometry, material, world, light, and simulation intent. */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { hashCanonicalValue } from "../foundation/canonical/index.js";
import { normalizeResourceBudget } from "../foundation/budgets/index.js";

const GRAPH_KINDS = Object.freeze(["geometry", "material", "world", "light", "compositor", "simulation"]);
const ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;

function assertId(value, label) {
	if (typeof value !== "string" || !ID_PATTERN.test(value)) throw new TypeError(`${label} must be a machine identifier.`);
	return value;
}

function normalizeNode(input) {
	return Object.freeze({
		id: assertId(input.id, "Node id"),
		type: assertId(input.type, "Node type"),
		version: typeof input.version === "string" ? input.version : "1.0.0",
		inputs: cloneManifestMetadata(input.inputs ?? {}),
		config: cloneManifestMetadata(input.config ?? {}),
		position: Object.freeze([...(input.position ?? [0, 0])].map(Number)),
		seed: input.seed ?? null,
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
}

function normalizeLink(input) {
	return Object.freeze({
		from: Object.freeze({ nodeId: assertId(input.from?.nodeId, "Link source node"), socketId: assertId(input.from?.socketId, "Link source socket") }),
		to: Object.freeze({ nodeId: assertId(input.to?.nodeId, "Link target node"), socketId: assertId(input.to?.socketId, "Link target socket") })
	});
}

export function createUniversalNodeGraph(input) {
	if (!GRAPH_KINDS.includes(input?.kind)) throw new TypeError(`Unsupported universal graph kind: ${input?.kind}`);
	const nodes = (input.nodes ?? []).map(normalizeNode).sort((a, b) => a.id.localeCompare(b.id));
	if (new Set(nodes.map(node => node.id)).size !== nodes.length) throw new Error("Universal node IDs must be unique.");
	const links = (input.links ?? []).map(normalizeLink).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
	const content = Object.freeze({
		name: assertId(input.name, "Universal graph name"),
		version: typeof input.version === "string" ? input.version : "1.0.0",
		kind: input.kind,
		schemaPackId: input.schemaPackId ?? null,
		inputs: cloneManifestMetadata(input.inputs ?? {}),
		outputs: cloneManifestMetadata(input.outputs ?? {}),
		nodes: Object.freeze(nodes),
		links: Object.freeze(links),
		resourceBudget: normalizeResourceBudget(input.resourceBudget ?? {}),
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
	return Object.freeze({
		schema: "awtsmoos.universal-node-graph",
		id: input.id ?? createStableId("universal.graph", content),
		contentHash: hashCanonicalValue(content),
		...content
	});
}
