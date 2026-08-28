//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphProtocol.js
 * @description Declares the portable semantic vocabulary for universal world documents without owning procedural realization, rendering, simulation, or transport.
 * The Awtsmoos renews every possible world before node, query, edit, and relationship can receive a finite name;
 * Awtsmoos.com lets this protocol hold stable letters while every specialist remains free to reveal deeper detail through its own expert frame.
 */

export const WORLD_GRAPH_PROTOCOL_ID = 'awtsmoos.world-graph.v1';
export const WORLD_GRAPH_PROTOCOL_VERSION = 1;

export const WORLD_GRAPH_RELATIONSHIP_KINDS = Object.freeze([
	'alignedWith',
	'around',
	'attachedTo',
	'avoids',
	'carves',
	'conformsTo',
	'distributedAcross',
	'erodes',
	'faces',
	'feedsOn',
	'flowingInto',
	'follows',
	'growingOn',
	'inside',
	'mirrors',
	'near',
	'nestedWithin',
	'on',
	'outside',
	'replaces',
	'respondsTo',
	'shades',
	'spans',
	'supportedBy',
	'surrounds'
]);

export const WORLD_GRAPH_QUERY_OPERATORS = Object.freeze([
	'and',
	'domain',
	'id',
	'not',
	'or',
	'path',
	'relationship',
	'type'
]);

export const WORLD_GRAPH_EDIT_OPERATIONS = Object.freeze([
	'add',
	'mergeOptions',
	'remove',
	'removeRelationship',
	'replace',
	'reseed',
	'setProfile',
	'setRelationship',
	'tag',
	'untag'
]);

/**
 * @description Returns immutable protocol metadata suitable for saved worlds, tooling, network payloads, editors, and AI orchestration.
 * @returns {Readonly<object>} Versioned portable protocol evidence and controlled vocabularies.
 */
export function createWorldGraphProtocolInfo() {
	return Object.freeze({
		editOperations: WORLD_GRAPH_EDIT_OPERATIONS,
		id: WORLD_GRAPH_PROTOCOL_ID,
		queryOperators: WORLD_GRAPH_QUERY_OPERATORS,
		relationshipKinds: WORLD_GRAPH_RELATIONSHIP_KINDS,
		version: WORLD_GRAPH_PROTOCOL_VERSION
	});
}
