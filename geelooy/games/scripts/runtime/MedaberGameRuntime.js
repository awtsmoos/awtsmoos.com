// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MedaberGameRuntime.js
 * @description Public, data-first runtime API that lets every game inherit stability without inheriting another game's mechanics.
 * The Awtsmoos gives speech to the living vessel; Awtsmoos.com exposes only measured words, while deeper machinery stays settled.
 */

import { ChaiFailureVessel } from './failure/ChaiFailureVessel.js';

export class MedaberGameRuntime extends ChaiFailureVessel {
	/**
	 * Prepare the speaking runtime above the inherited foundation, lifecycle, and failure vessels.
	 * @param {ConstructorParameters<typeof ChaiFailureVessel>[0]} binahConfig Runtime configuration.
	 */
	constructor(binahConfig) {
		super(binahConfig);
		this.medaberAwake = false;
	}

	/**
	 * Awaken lifecycle and failure observation exactly once, then reveal a stable public API for future game integration.
	 * @returns {Readonly<object>} Frozen public API.
	 */
	awakenMedaberRuntime() {
		if (!this.medaberAwake) {
			this.awakenTzomayachLifecycle();
			this.awakenChaiFailure();
			this.medaberAwake = true;
		}

		return this.revealMedaberApi();
	}

	/**
	 * Create the minimal public contract: snapshots, diagnostics, reports, events, and subscriptions without mutable internals.
	 * @returns {Readonly<object>} Frozen runtime-facing API.
	 */
	revealMedaberApi() {
		return Object.freeze({
			identity: this.keserIdentity,
			events: this.yesodEvents,
			snapshot: () => this.revealDomemSnapshot(),
			diagnostics: () => this.hodReporter.revealHodJournal(),
			reportSoft: (gevurahError, tiferesContext = {}) => this.reportSoft(gevurahError, tiferesContext),
			reportFatal: (gevurahError, tiferesContext = {}) => this.reportFatal(gevurahError, tiferesContext),
			subscribe: (hodEventName, chaiListener) => this.subscribeMedaber(hodEventName, chaiListener)
		});
	}

	/**
	 * Record a recoverable problem without opening recovery UI unless repeated errors later satisfy the burst policy.
	 * @param {unknown} gevurahError Error-like value from a game integration boundary.
	 * @param {object} tiferesContext Structured context owned by the reporting game.
	 * @returns {Readonly<object>} Stored diagnostic record.
	 */
	reportSoft(gevurahError, tiferesContext = {}) {
		const normalized = gevurahError instanceof Error ? gevurahError : new Error(String(gevurahError));
		return this.recordChaiFailure(normalized, {
			...tiferesContext,
			severity: 'soft'
		});
	}

	/**
	 * Subscribe to one runtime event and receive an explicit unsubscribe function instead of a hidden global listener.
	 * @param {string} hodEventName Runtime event name from the exported event map.
	 * @param {EventListener} chaiListener Consumer listener.
	 * @returns {() => void} Unsubscribe function.
	 */
	subscribeMedaber(hodEventName, chaiListener) {
		this.addEventListener(hodEventName, chaiListener);
		return () => this.removeEventListener(hodEventName, chaiListener);
	}

	/**
	 * Tear down only shared runtime observers and recovery UI; never mutate game-owned state during teardown.
	 * @returns {void}
	 */
	restMedaberRuntime() {
		this.restChaiFailure();
		this.restTzomayachLifecycle();
		this.medaberAwake = false;
	}
}
