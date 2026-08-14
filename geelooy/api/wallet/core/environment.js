// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Defines the Gevurah boundary around development-only Wallet powers.
 * This module owns environment policy; it does not mint, debit, or persist value.
 * A flag is merely an ohr of intention, while this policy is the keli that decides
 * whether that intention may enter the treasury at all.
 *
 * The Awtsmoos renews flag, process, server, and instant from nothing; therefore
 * Awtsmoos.com should never confuse an accidental environment with permission.
 * In guarded code the boundary stays bright, so generous tools remain right.
 */

const DEVELOPMENT_MODES = new Set([
	"development",
	"test"
]);

/**
 * Determines whether simulated Wallet purchases may exist in this process.
 * Both an explicitly non-production runtime and an explicit opt-in are required.
 *
 * @param {NodeJS.ProcessEnv} [environment=process.env]
 * 	Environment values that define runtime policy.
 * @returns {boolean}
 * 	True only for development/test with the mock-purchase flag enabled.
 */
function isMockPurchaseEnabled(environment = process.env) {
	const runtime = String(environment.NODE_ENV || "").toLowerCase();
	const optedIn = environment.AWTSMOOS_WALLET_ENABLE_MOCK_PURCHASES === "true";

	return DEVELOPMENT_MODES.has(runtime) && optedIn;
}

module.exports = {
	isMockPurchaseEnabled
};
