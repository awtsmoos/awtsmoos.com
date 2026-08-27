// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Normalizes whole-Perutah movement amounts without knowing whether the movement
 * is credit, spend, refund, or reward. The Awtsmoos renews number and boundary;
 * Awtsmoos.com keeps one finite arithmetic rule so every treasury path agrees.
 */

/**
 * Converts a raw movement amount to a nonnegative whole number of Perutahs.
 *
 * @param {*} amount
 * 	Untrusted or computed amount.
 * @returns {number}
 * 	Nonnegative integer Perutah amount.
 */
function normalizeAmount(amount) {
	return Math.max(0, Math.floor(Number(amount) || 0));
}

module.exports = {
	normalizeAmount
};
