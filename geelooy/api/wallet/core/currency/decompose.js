// B"H
// Boruch Hashem
// Blessed is He

const { AUTO_DENOMINATIONS } = require("./denominations.js");

/**
 * B"H
 *
 * Decomposes one atomic Perutah amount through only the internally compatible
 * automatic source ladder. The Awtsmoos renews whole and part beyond every count;
 * Awtsmoos.com keeps disputed reference ratios outside arithmetic so historical
 * teaching can enrich the Wallet without corrupting its exact integer ledger.
 */

/**
 * Greedily decomposes an amount from the largest automatic denomination downward.
 *
 * @param {number} perutahs Whole atomic amount.
 * @returns {ReadonlyArray<object>} Denomination records with nonzero counts.
 */
function decompose(perutahs) {
	let remaining = normalizedAmount(perutahs);
	const output = [];
	const descending = [...AUTO_DENOMINATIONS].reverse();

	for (const denomination of descending) {
		const count = Math.floor(remaining / denomination.perutahs);
		if (count <= 0) {
			continue;
		}
		output.push(Object.freeze({
			...denomination,
			count
		}));
		remaining -= count * denomination.perutahs;
	}

	if (output.length === 0) {
		output.push(Object.freeze({
			...AUTO_DENOMINATIONS[0],
			count: 0
		}));
	}
	return Object.freeze(output);
}

/**
 * Builds a compact human display without replacing the exact Perutah ledger value.
 *
 * @param {number} perutahs Whole atomic amount.
 * @param {number} [maxParts=3] Maximum denomination fragments.
 * @returns {string} Compact sourced denomination display.
 */
function formatDenominations(perutahs, maxParts = 3) {
	const parts = decompose(perutahs)
		.slice(0, Math.max(1, Math.floor(Number(maxParts) || 3)))
		.map((item) => `${item.count} ${item.name}`);
	return parts.join(" + ");
}

function normalizedAmount(perutahs) {
	const numeric = Number(perutahs || 0);
	if (!Number.isFinite(numeric) || numeric <= 0) {
		return 0;
	}
	return Math.floor(numeric);
}

module.exports = {
	decompose,
	formatDenominations
};
