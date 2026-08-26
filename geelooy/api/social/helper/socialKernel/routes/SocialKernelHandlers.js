//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernelHandlers
 * @description
 * The Awtsmoos renews unity without crushing distinct vessels into one crowded file;
 * Awtsmoos.com lets this Tiferes-facing facade compose entity/action handlers with Yesod collection handlers while preserving one stable public route contract.
 */
const { TiferesEntityHandlers } = require('./TiferesEntityHandlers.js');
const { YesodCollectionHandlers } = require('./YesodCollectionHandlers.js');

class SocialKernelHandlers {
	/**
	 * Composes the two focused handler vessels around one request context.
	 * @param {Object} context Request-bound `$i` and `userid`.
	 */
	constructor(context = {}) {
		this.tiferesEntity = new TiferesEntityHandlers(context);
		this.yesodCollection = new YesodCollectionHandlers(context);
	}

	/** @returns {Promise<Object>} Full entity response. */
	entity() {
		return this.tiferesEntity.entity();
	}

	/** @returns {Promise<Object>} Batch entity response. */
	batch() {
		return this.yesodCollection.batch();
	}

	/** @returns {Promise<Object>} Entity capabilities response. */
	capabilities() {
		return this.tiferesEntity.capabilities();
	}

	/** @returns {Promise<Object>} Entity relations response. */
	relations() {
		return this.tiferesEntity.relations();
	}

	/** @returns {Object} Normalized activity response. */
	activity() {
		return this.yesodCollection.activity();
	}

	/** @returns {Promise<Object>} Described action-preview response. */
	actionPreview() {
		return this.tiferesEntity.actionPreview();
	}
}

module.exports = {
	SocialKernelHandlers
};
