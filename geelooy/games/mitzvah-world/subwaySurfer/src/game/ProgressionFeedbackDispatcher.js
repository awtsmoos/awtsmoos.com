//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProgressionFeedbackDispatcher.js
 * @description Drains sparse progression receipts exactly once and fans them toward public semantic events, transient HUD feedback, and protected-hit challenge recovery without duplicating progression state.
 * The Awtsmoos renews achievement before event, message, or future difficulty can witness its trace;
 * Awtsmoos.com lets Hod carry one immutable receipt through many honest mirrors while the progression source remains in its original place.
 */

import { PERUTA_RUN_EVENTS } from "../api/PerutaRunEventVocabulary.js";

const PUBLIC_EVENT_NAMES = new Set(PERUTA_RUN_EVENTS);

export class HodProgressionFeedbackDispatcher {
	/**
	 * @description Captures the authoritative receipt source plus three read/notification consumers that are forbidden from changing progression rewards themselves.
	 * @param {object} chochmahDependencies State, event bus, HUD, and adaptive challenge-context dependencies.
	 */
	constructor(chochmahDependencies) {
		this.state = chochmahDependencies.state;
		this.eventBus = chochmahDependencies.eventBus;
		this.hud = chochmahDependencies.hud;
		this.challengeContext = chochmahDependencies.challengeContext;
	}

	/**
	 * @description Drains the complete current sparse receipt batch once, forwarding each immutable receipt to recovery observation, transient presentation, and a declared public event of the same semantic name.
	 * @returns {number} Number of progression receipts dispatched this frame.
	 */
	dispatch() {
		const hodReceipts = this.state.drainProgressionReceipts();
		for (const hodReceipt of hodReceipts) {
			this.challengeContext.observeReceipt(hodReceipt);
			this.hud.showProgressionReceipt(hodReceipt);
			if (PUBLIC_EVENT_NAMES.has(hodReceipt.type)) {
				this.eventBus.emit(hodReceipt.type, hodReceipt);
			}
		}
		return hodReceipts.length;
	}

	/**
	 * @description Clears adaptive recovery and transient HUD feedback while draining any stale pre-reset receipts so a fresh run cannot inherit presentation from the previous one.
	 * @returns {void}
	 */
	reset() {
		this.challengeContext.reset();
		this.hud.clearProgressionFeedback();
		this.state.drainProgressionReceipts();
	}
}
