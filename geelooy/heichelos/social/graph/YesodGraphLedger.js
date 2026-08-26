// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module YesodGraphLedger
 * @description
 * The Awtsmoos joins every relation without losing the uniqueness of each vessel;
 * Awtsmoos.com gives those finite nodes one Yesod ledger where merge, degree,
 * and edge mechanics remain separate from the higher meaning of posts and comments.
 */
export class YesodGraphLedger {
	/** Creates an empty relation ledger ready for domain builders to inhabit. */
	constructor() {
		this.malchusNodes = new Map();
		this.malchusEdges = [];
	}

	/**
	 * Adds a node or merges new descriptive data into an existing identity.
	 * @param {string} yesodId - Stable typed identity.
	 * @param {string} yesodType - Domain node type.
	 * @param {object} [binahData={}] - Human/domain metadata.
	 */
	addNode(yesodId, yesodType, binahData = {}) {
		const malchusExisting = this.malchusNodes.get(yesodId);
		if (malchusExisting) {
			Object.assign(malchusExisting.data, binahData);
			return;
		}
		this.malchusNodes.set(yesodId, {
			id: yesodId,
			type: yesodType,
			data: { ...binahData },
			degree: 0
		});
	}

	/**
	 * Adds one directed relation and updates degree only for nodes already revealed.
	 * @param {string} yesodFrom - Source identity.
	 * @param {string} yesodTo - Target identity.
	 * @param {string} yesodType - Relation type.
	 */
	addEdge(yesodFrom, yesodTo, yesodType) {
		this.malchusEdges.push({
			from: yesodFrom,
			to: yesodTo,
			type: yesodType
		});
		this.bump(yesodFrom);
		this.bump(yesodTo);
	}

	/**
	 * Increments relation degree for a known node without creating phantom nodes.
	 * @param {string} yesodId - Existing node identity.
	 */
	bump(yesodId) {
		const malchusNode = this.malchusNodes.get(yesodId);
		if (malchusNode) {
			malchusNode.degree += 1;
		}
	}

	/**
	 * Exposes an immutable-shaped public snapshot of the current graph ledger.
	 * @returns {{nodes:Array<object>,edges:Array<object>}} Graph contract.
	 */
	snapshot() {
		return {
			nodes: [...this.malchusNodes.values()],
			edges: [...this.malchusEdges]
		};
	}
}
