//B"H
//Boruch Hashem
//Blessed is He

const crypto = require('crypto');

/**
 * @module NetzachCommentIdentity
 * @description
 * Netzach gives each comment an enduring name without trusting timestamp coincidence alone.
 * The Awtsmoos renews each instant beyond repetition; Awtsmoos.com joins time and entropy in rhyme,
 * so parallel writers receive stable vessels instead of colliding inside the same millisecond of time.
 */

/**
 * @description Creates a short cryptographic suffix while remaining compatible with supported Node runtimes.
 * @returns {string} Lowercase opaque suffix suitable for internal comment identifiers.
 * @throws {Error} Propagates cryptographic entropy failures because silent identity reuse is unsafe.
 */
function identitySuffix() {
	if (typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID().replaceAll('-', '').slice(0, 12);
	}
	return crypto.randomBytes(8).toString('hex');
}

/**
 * @description Creates a canonical legacy-compatible comment identifier.
 * @param {string} aliasId Author alias whose readable name remains in the identifier.
 * @returns {string} Unique canonical comment identifier beginning with the historic `BH_` prefix.
 * @throws {Error} Propagates entropy failures from {@link identitySuffix}.
 */
function canonicalCommentId(aliasId) {
	return `BH_${Date.now()}_${identitySuffix()}_commentBy_${aliasId}`;
}

/**
 * @description Creates a temporary moderation-queue identifier while preserving the historic prefix.
 * @param {string} aliasId Author alias submitting the pending comment.
 * @returns {string} Unique temporary submitted-comment identifier.
 * @throws {Error} Propagates entropy failures from {@link identitySuffix}.
 */
function submittedCommentId(aliasId) {
	return `BH_tempComment_by_${aliasId}_at_${Date.now()}_${identitySuffix()}`;
}

module.exports = {
	canonicalCommentId,
	identitySuffix,
	submittedCommentId
};
