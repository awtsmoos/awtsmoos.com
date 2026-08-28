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
	revealTempleModelClock,
	revealTempleModelStatDelta,
	waitForTempleModelRetry
} from "./TempleModelAttemptTools.js";
import {
	revealTempleModelRetryPolicy,
	templeModelRetryDelayMs
} from "./TempleModelRetryPolicy.js";

const MAX_MODEL_ATTEMPTS = 2;

export class NetzachTempleModelLoadAttempt {
	/**
	 * @description Captures the shared Core model service plus injectable clock/sleeper so timing and retry behavior remain deterministic under tests without owning fetch or parser logic.
	 * @param {object} netzachModelAssets Shared Procedural Core service exposing `loadIsolated()` and `stats()`.
	 * @param {Function} [netzachNow=revealTempleModelClock] Monotonic millisecond clock.
	 * @param {Function} [netzachSleep=waitForTempleModelRetry] Promise-based bounded delay function.
	 * @returns {void}
	 */
	constructor(
		netzachModelAssets,
		netzachNow = revealTempleModelClock,
		netzachSleep = waitForTempleModelRetry
	) {
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
		const netzachStartedAt = this.now();
		const binahBefore = this.modelAssets.stats?.() || {};
		let gevurahPolicy = Object.freeze({
			retryable: false,
			category: "none",
			status: null,
			delayMs: 0
		});
		for (let netzachAttempt = 1; netzachAttempt <= MAX_MODEL_ATTEMPTS; netzachAttempt += 1) {
			try {
				const malchusModel = await this.modelAssets.loadIsolated(yesodUrl, malchusLabel);
				return Object.freeze({
					model: malchusModel,
					evidence: this.evidence(
						yesodUrl,
						netzachAttempt,
						netzachStartedAt,
						binahBefore,
						null,
						gevurahPolicy
					),
					service: this.modelAssets.stats?.() || null
				});
			} catch (gevurahError) {
				gevurahPolicy = revealTempleModelRetryPolicy(gevurahError);
				if (netzachAttempt >= MAX_MODEL_ATTEMPTS || !gevurahPolicy.retryable) {
					gevurahError.awtsmoosAssetEvidence = this.evidence(
						yesodUrl,
						netzachAttempt,
						netzachStartedAt,
						binahBefore,
						gevurahError,
						gevurahPolicy
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
		const binahAfter = this.modelAssets.stats?.() || {};
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
			cacheHits: revealTempleModelStatDelta(binahAfter, binahBefore, "cacheHits"),
			cacheMisses: revealTempleModelStatDelta(binahAfter, binahBefore, "cacheMisses"),
			failures: revealTempleModelStatDelta(binahAfter, binahBefore, "failures"),
			error: gevurahError ? String(gevurahError?.message || gevurahError) : null
		});
	}
}
