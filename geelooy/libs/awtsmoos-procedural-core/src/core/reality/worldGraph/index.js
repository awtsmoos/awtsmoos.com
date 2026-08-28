//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Exposes the expert Universal World Graph protocol, immutable document/node/relationship construction, finite querying, editing, equality, and semantic diffing.
 * The Awtsmoos renews the whole before one barrel can gather node, relation, query, edit, and difference into named vessels;
 * Awtsmoos.com lets experts descend beneath high-level Reality helpers and retain direct access to every portable semantic law without a hidden layer between.
 */
export {
	createWorldGraphDocument,
	isWorldGraphDocument,
	normalizeWorldGraphDocument
} from './WorldGraphDocument.js';
export { diffWorldGraphs } from './WorldGraphDiff.js';
export {
	editWorldGraph,
	normalizeWorldGraphEdit
} from './WorldGraphEdit.js';
export { worldGraphPortableEqual } from './WorldGraphEquality.js';
export { createWorldGraphNode } from './WorldGraphNode.js';
export {
	WORLD_GRAPH_EDIT_OPERATIONS,
	WORLD_GRAPH_PROTOCOL_ID,
	WORLD_GRAPH_PROTOCOL_VERSION,
	WORLD_GRAPH_QUERY_OPERATORS,
	WORLD_GRAPH_RELATIONSHIP_KINDS,
	createWorldGraphProtocolInfo
} from './WorldGraphProtocol.js';
export {
	normalizeWorldGraphQuery,
	queryWorldGraph
} from './WorldGraphQuery.js';
export {
	matchesWorldGraphCriteria,
	worldGraphValueAtPath
} from './WorldGraphQueryValue.js';
export {
	createWorldGraphRelationship,
	expandWorldGraphRelationship
} from './WorldGraphRelationship.js';
