//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalGraph.js
 * @description Stores one verified finite semantic dependency graph while topology validation and traversal live in their own focused authority.
 * The Awtsmoos renews node and edge before sequence can pretend to create either; Awtsmoos.com lets this Netzach-like vessel remain
 * small, immutable, inspectable, and serializable while a separate topology module proves every reference and every dependency order.
 */

import { PortalGraphNode } from './PortalGraphNode.js';
import { createPortalGraphError } from './PortalGraphError.js';
import {
	createPortalTopologicalOrder,
	validatePortalGraphReferences
} from './PortalGraphTopology.js';

/** Immutable dependency graph used for Portal planning and compilation evidence. */
export class PortalGraph {
	/**
	 * @description Indexes planned nodes, rejects duplicate identity, validates references, and stores the proven topological order.
	 * @param {PortalGraphNode[]} [nodes=[]] Planned semantic graph nodes.
	 * @returns {PortalGraph} Frozen graph with deterministic dependency order.
	 */
	constructor(nodes = []) {
		const entries = new Map();
		for (const node of nodes) {
			if (!(node instanceof PortalGraphNode)) {
				throw createPortalGraphError(
					'PORTAL_GRAPH_NODE_INVALID',
					'Graph accepts PortalGraphNode instances only.'
				);
			}
			if (entries.has(node.id)) {
				throw createPortalGraphError(
					'PORTAL_GRAPH_DUPLICATE_ID',
					`Duplicate node id: ${node.id}`
				);
			}
			entries.set(node.id, node);
		}
		validatePortalGraphReferences(entries);
		this._entries = entries;
		this._order = Object.freeze(createPortalTopologicalOrder(entries));
		Object.freeze(this);
	}

	/**
	 * @description Returns one graph node by exact semantic identifier without fabricating a replacement for missing identity.
	 * @param {string} id Semantic node identifier.
	 * @returns {PortalGraphNode|null} Matching node or explicit null.
	 */
	get(id) {
		return this._entries.get(String(id)) || null;
	}

	/**
	 * @description Returns graph nodes in deterministic dependency-before-dependent order.
	 * @returns {readonly PortalGraphNode[]} Frozen ordered graph nodes.
	 */
	list() {
		return Object.freeze(this._order.map(id => this._entries.get(id)));
	}

	/**
	 * @description Returns the stable topological identifier order proved during construction.
	 * @returns {readonly string[]} Frozen dependency-first node identifiers.
	 */
	order() {
		return this._order;
	}

	/**
	 * @description Returns JSON-safe graph-node evidence in the exact order later consumed by compilation and persistence.
	 * @returns {readonly object[]} Frozen serializable graph witness.
	 */
	toJSON() {
		return Object.freeze(this.list().map(node => node.toJSON()));
	}
}
