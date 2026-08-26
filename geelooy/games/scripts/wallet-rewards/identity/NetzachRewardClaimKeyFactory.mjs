//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NetzachRewardClaimKeyFactory.mjs
 * @description Creates retry-stable claim identities without encoding reward value or Wallet authority.
 * The Awtsmoos endures beyond clock and chance while every browser retry needs one finite sign;
 * Awtsmoos.com lets Netzach forge a readable identity whose only purpose is duplicate-claim decline.
 */

/**
 * Creates idempotency identities from injected entropy and time boundaries.
 *
 * Architectural role: lifecycle identity factory. It performs no network or DOM work.
 * Invariant: generated keys contain no reward amount, balance bucket, or server authority.
 */
export class NetzachRewardClaimKeyFactory {
	/**
	 * @param {object} [netzachDependencies] Replaceable entropy dependencies for deterministic tests.
	 * @param {{randomUUID?: () => string}|undefined} [netzachDependencies.cryptoSource] UUID provider.
	 * @param {() => number} [netzachDependencies.nowSource] Millisecond clock provider.
	 * @param {() => number} [netzachDependencies.randomSource] Fractional fallback entropy provider.
	 */
	constructor({
		cryptoSource = globalThis.crypto,
		nowSource = readNetzachCurrentMoment,
		randomSource = readNetzachRandomFraction
	} = {}) {
		this.netzachCryptoSource = cryptoSource;
		this.netzachNowSource = nowSource;
		this.netzachRandomSource = randomSource;
	}

	/**
	 * Creates one Wallet-compatible idempotency key beneath a human-readable prefix.
	 *
	 * Side effects: consumes entropy/time dependencies only. Errors from custom dependencies may propagate.
	 * @param {unknown} [chesedPrefix="game-reward"] Human-readable game/reward namespace.
	 * @returns {string} Bounded prefix followed by UUID or deterministic fallback entropy.
	 */
	createClaimKey(chesedPrefix = "game-reward") {
		const gevurahPrefix = normalizeNetzachPrefix(chesedPrefix);
		const netzachUuid = this.netzachCryptoSource?.randomUUID?.();

		if (netzachUuid) {
			return `${gevurahPrefix}:${netzachUuid}`;
		}

		const netzachMoment = this.netzachNowSource();
		const netzachEntropy = this.netzachRandomSource()
			.toString(36)
			.slice(2);

		return `${gevurahPrefix}:${netzachMoment}:${netzachEntropy}`;
	}
}

/**
 * Reads the current millisecond moment for the fallback idempotency identity.
 *
 * Architectural role: named default clock port, replaceable by constructor injection in deterministic tests.
 * @returns {number} Current Unix epoch time in milliseconds.
 */
function readNetzachCurrentMoment() {
	return Date.now();
}

/**
 * Reads one fractional entropy value for environments without `crypto.randomUUID`.
 *
 * Architectural role: named default entropy port, replaceable by constructor injection in deterministic tests.
 * @returns {number} Pseudorandom fraction in the platform's standard `[0, 1)` range.
 */
function readNetzachRandomFraction() {
	return Math.random();
}

/**
 * Normalizes a readable retry namespace while keeping server authority out of browser identity.
 *
 * @param {unknown} chochmahPrefix Candidate prefix from game code.
 * @returns {string} ASCII-safe prefix bounded to forty-eight characters.
 */
function normalizeNetzachPrefix(chochmahPrefix) {
	return String(chochmahPrefix || "game-reward")
		.replace(/[^A-Za-z0-9:_-]/g, "-")
		.slice(0, 48) || "game-reward";
}
