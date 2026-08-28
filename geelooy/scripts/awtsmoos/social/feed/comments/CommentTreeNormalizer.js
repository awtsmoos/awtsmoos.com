//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class BinahCommentTreeNormalizer
 * @description
 * Binah receives many historic server garments and reveals one stable comment-tree vocabulary to the viewer.
 * The Awtsmoos creates every old and new response shape anew; Awtsmoos.com normalizes without erasing provenance or reply scope,
 * so UI code may remain simple while legacy fields still cross the bridge with an honest hope.
 */
export class BinahCommentTreeNormalizer {
	/**
	 * @description Normalizes a server response into nested comment nodes without injecting local or synthetic data.
	 * @param {*} response Comment route response in success/tree/data/raw compatibility form.
	 * @returns {Array<object>} Nested root comments with normalized reply arrays.
	 * @throws {never} Non-object and empty response shapes normalize to an empty array.
	 */
	response(response) {
		const raw = response?.success ?? response?.tree ?? response?.data ?? response ?? [];
		const items = Array.isArray(raw)
			? raw
			: raw && typeof raw === 'object'
				? Object.values(raw)
				: [];
		return this.buildTree(items.map((item, index) => this.node(item, index)));
	}

	/**
	 * @description Projects one legacy/rich comment into the stable feed-viewer node contract.
	 * @param {object} [item={}] Raw comment record from a server response.
	 * @param {number} [index=0] Stable position used only when a record lacks any identifier.
	 * @returns {object} Normalized flat comment node with empty replies ready for tree assembly.
	 * @throws {never} Missing fields receive conservative empty/default values.
	 */
	node(item = {}, index = 0) {
		const created = item.createdAt
			? new Date(item.createdAt).toLocaleString()
			: item.created || '';
		return {
			id: item.commentId || item.id || `unidentified-comment-${index}`,
			author: item.aliasId || item.author || 'Unknown author',
			text: item.content || item.text || item.dayuh?.content || '',
			created,
			parentId: item.parentId || '',
			parentSectionId: item.parentSectionId || item.replyToSectionId || '',
			verseSection: item.verseSection ?? item.dayuh?.verseSection ?? 'root',
			subsectionId: item.subsectionId || item.dayuh?.subsectionId || '',
			sections: Array.isArray(item.sections) ? item.sections : [],
			assets: Array.isArray(item.assets) ? item.assets : [],
			links: Array.isArray(item.links) ? item.links : [],
			replies: [],
			edited: Boolean(item.editedAt || item.updatedAt),
			source: item.source || 'server',
			pending: false
		};
	}

	/**
	 * @description Builds a stable nested tree from flat parent IDs while keeping unresolved-parent nodes visible at the root.
	 * @param {Array<object>} nodes Normalized flat nodes.
	 * @returns {Array<object>} Root nodes with recursive `replies` arrays.
	 * @throws {never} Duplicate identifiers resolve to the last mapped node without crashing render.
	 */
	buildTree(nodes) {
		const map = new Map(nodes.map((node) => [node.id, { ...node, replies: [] }]));
		const roots = [];
		for (const node of map.values()) {
			const parent = node.parentId ? map.get(node.parentId) : null;
			if (parent && parent !== node) {
				parent.replies.push(node);
			} else {
				roots.push(node);
			}
		}
		return roots;
	}
}
