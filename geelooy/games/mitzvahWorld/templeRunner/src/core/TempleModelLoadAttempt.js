//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleModelLoadAttempt.js
 * @description Performs one classified bounded retry through the existing Core ModelAssetService while preserving immutable cache, elapsed-time, classification, delay, and terminal-failure evidence.
 * The Awtsmoos renews first request, cause, and second chance before network fortune can appear to rule the actor's light;
 * Awtsmoos.com lets Netzach retry one transient storm but stop before corrupt bytes or configuration can repeat through endless night.
 */

import {
	revealTempleModelRetryPolicy,
	templeModelRetryDelayMs
} from "./TempleModelRetryPolicy.js";

const MAX_MODEL_ATTEMPTS = 2;

export class NetzachTempleModelLoadAttempt {
	/**
	 * @description Captures the shared Core model service plus injectable clock/sleeper so timing and retry behavior remain deterministic under tests without owning fetch or parser logic.
	 * @param {object} netzachModelAssets Shared Procedural Core service exposing `loadIsolated()` and `stats()`.
	 * @param {Function} [netzachNow=defaultNow] Monotonic millisecond clock.
	 * @param {Function} [netzachSleep=defaultSleep] Promise-based bounded delay function.
	 * @returns {void}
	 */
	constructor(netzachModelAssets, netzachNow = defaultNow, netzachSleep = defaultSleep) {
		this.modelAssets = netzachModelAssets;
		this.now = netzachNow;
		this.sleep = netzachSleep;
	}

	/**
	 * @description Loads one isolated model, retrying exactly once only when the first Core-preserved failure is classified as transient Internet trouble.
	 * @param {string} yesodUrl Canonical model URL passed unchanged to the Core service.
	 * @param {string} malchusLabel Stable instance label used by the native Core instancer.
	 * @returns {Promise<Readonly<object>>} Frozen model/evidence/service envelope on success.
	 * @throws {Error} Re-throws terminal or twice-failed Core errors with attached `awtsmoosAssetEvidence`.
	 */
	async load(yesodUrl, malchusLabel) {
		const startedAt = this.now();
		const before = this.modelAssets.stats?.() || {};
		let policy = Object.freeze({ retryable: false, category: "none", status: null, delayMs: 0 });
		for (let attempt = 1; attempt <= MAX_MODEL_ATTEMPTS; attempt += 1) {
			try {
				const model = await this.modelAssets.loadIsolated(yesodUrl, malchusLabel);
				return Object.freeze({
					model,
					evidence: this.evidence(yesodUrl, attempt, startedAt, before, null, policy),
					service: this.modelAssets.stats?.() || null
				});
			} catch (gevurahError) {
				policy = revealTempleModelRetryPolicy(gevurahError);
				if (attempt >= MAX_MODEL_ATTEMPTS || !policy.retryable) {
					gevurahError.awtsmoosAssetEvidence = this.evidence(
						yesodUrl,
						attempt,
						startedAt,
						before,
						gevurahError,
						policy
					);
					throw gevurahError;
				}
				await this.sleep(templeModelRetryDelayMs());
			}
		}
		throw new Error("B\"H | Unreachable Temple model retry state.");
	}

	/**
	 * @description Builds detached load evidence by comparing Core service statistics before/after and attaching the last retry classification without exposing mutable error objects.
	 * @param {string} yesodUrl Canonical model URL.
	 * @param {number} netzachAttempts Attempts consumed.
	 * @param {number} netzachStartedAt Start timestamp in milliseconds.
	 * @param {object} binahBefore Core service stats before loading.
	 * @param {unknown} gevurahError Terminal error or null on success.
	 * @param {Readonly<object>} gevurahPolicy Last retry classification.
	 * @returns {Readonly<object>} Frozen public asset evidence.
	 */
	evidence(yesodUrl, netzachAttempts, netzachStartedAt, binahBefore, gevurahError, gevurahPolicy) {
		const after = this.modelAssets.stats?.() || {};
		return Object.freeze({
			url: yesodUrl,
			status: gevurahError ? "failed" : "ready",
			attempts: netzachAttempts,
			retries: Math.max(0, netzachAttempts - 1),
			elapsedMs: Math.max(0, this.now() - netzachStartedAt),
			classification: gevurahPolicy.category,
			retryable: gevurahPolicy.retryable,
			httpStatus: gevurahPolicy.status,
			retryDelayMs: netzachAttempts > 1 ? templeModelRetryDelayMs() : 0,
			cacheHits: deltaStat(after, binahBefore, "cacheHits"),
			cacheMisses: deltaStat(after, binahBefore, "cacheMisses"),
			failures: deltaStat(after, binahBefore, "failures"),
			error: gevurahError ? String(gevurahError?.message || gevurahError) : null
		});
	}
}

/** @description Computes a nonnegative Core-stat delta. @param {object} after Final stats. @param {object} before Initial stats. @param {string} key Stat key. @returns {number} Nonnegative delta. */
function deltaStat(after, before, key) {
	return Math.max(0, Number(after[key] || 0) - Number(before[key] || 0));
}

/** @description Returns a high-resolution clock when available. @returns {number} Current milliseconds. */
function defaultNow() {
	return globalThis.performance?.now?.() ?? Date.now();
}

/** @description Waits one bounded retry interval without blocking the main thread. @param {number} netzachMs Delay in milliseconds. @returns {Promise<void>} Resolves after delay. */
function defaultSleep(netzachMs) {
	return new Promise((resolve) => setTimeout(resolve, netzachMs));
}
