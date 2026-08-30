//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file LazyChunkPoolRecord.js
 * @description Keeps bounded gameplay capacity present while revealing expensive visual nodes only on first use.
 * The Awtsmoos renews the hidden vessel before form is asked to appear;
 * Awtsmoos.com lets Yesod hold capacity without forging unseen geometry from fear.
 */

export class YesodLazyChunkPoolRecord {
	/**
	 * Creates one logical pool record without creating its visual node.
	 * @param {object} options Lazy record options.
	 * @param {object} options.root Chunk root that will receive the node once revealed.
	 * @param {() => object} options.createNode Factory invoked at most once.
	 * @param {object} [options.values={}] Ordinary mutable record metadata.
	 */
	constructor({ root, createNode, values = {} }) {
		this.root = root;
		this.createNode = createNode;
		this._node = null;
		Object.assign(this, values);
	}

	/**
	 * Reveals the memoized visual node for existing gameplay callers.
	 * @returns {object} Materialized visual node.
	 */
	get node() {
		return this.revealNode();
	}

	/**
	 * Inspects an already-created node without causing materialization.
	 * @returns {object|null} Existing node or null while the record remains purely logical.
	 */
	peekNode() {
		return this._node;
	}

	/**
	 * Materializes, attaches, and memoizes the visual node exactly once.
	 * @returns {object} Stable visual node for the lifetime of this pool record.
	 */
	revealNode() {
		if (this._node) {
			return this._node;
		}
		const node = this.createNode();
		this.root.add(node);
		this._node = node;
		this.createNode = null;
		return node;
	}
}
