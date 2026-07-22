// B"H
// Boruch Hashem
// Blessed is He
/** One graph envelope preserves nodes, ordered links, interfaces, and backend-neutral intent. */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { normalizeResourceBudget } from "../foundation/budgets/index.js";
import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { hashCanonicalValue } from "../foundation/canonical/index.js";
import {
	compareUniversalNodeLinks,
	normalizeUniversalNodeLink
} from "./normalizeUniversalNodeLink.js";

const GRAPH_KINDS = Object.freeze([
	"geometry", "material", "world", "light", "compositor", "simulation"
]);
const ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;

function assertId(value, label) {
	if (typeof value !== "string" || !ID_PATTERN.test(value)) {
		throw new TypeError(`${label} must be a machine identifier.`);
	}
	return value;
}

function normalizeNode(input) {
	return Object.freeze({
		id: assertId(input.id, "Node id"),
		type: assertId(input.type, "Node type"),
		version: typeof input.version === "string" ? input.version : "1.0.0",
		inputs: cloneManifestMetadata(input.inputs ?? {}),
		config: cloneManifestMetadata(input.config ?? {}),
		socketState: cloneManifestMetadata(input.socketState ?? {}),
		position: Object.freeze([...(input.position ?? [0, 0])].map(Number)),
		label: typeof input.label === "string" ? input.label : null,
		enabled: input.enabled !== false,
		muted: input.muted === true,
		seed: input.seed ?? null,
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
}

export function createUniversalNodeGraph(input) {
	if (!GRAPH_KINDS.includes(input?.kind)) {
		throw new TypeError(`Unsupported universal graph kind: ${input?.kind}`);
	}
	const nodes = (input.nodes ?? []).map(normalizeNode)
		.sort((left, right) => left.id.localeCompare(right.id));
	if (new Set(nodes.map(node => node.id)).size !== nodes.length) {
		throw new Error("Universal node IDs must be unique.");
	}
	const links = (input.links ?? []).map(normalizeUniversalNodeLink)
		.sort(compareUniversalNodeLinks);
	if (new Set(links.map(link => link.id)).size !== links.length) {
		throw new Error("Universal link IDs must be unique.");
	}
	const content = Object.freeze({
		name: assertId(input.name, "Universal graph name"),
		version: typeof input.version === "string" ? input.version : "1.0.0",
		kind: input.kind,
		schemaPackId: input.schemaPackId ?? null,
		inputs: cloneManifestMetadata(input.inputs ?? {}),
		outputs: cloneManifestMetadata(input.outputs ?? {}),
		nodes: Object.freeze(nodes),
		links: Object.freeze(links),
		interface: cloneManifestMetadata(input.interface ?? {}),
		zones: cloneManifestMetadata(input.zones ?? []),
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
