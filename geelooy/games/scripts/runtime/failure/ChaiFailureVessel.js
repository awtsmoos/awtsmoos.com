// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChaiFailureVessel.js
 * @description Observes genuine browser failures without swallowing them, patching globals, or changing a game's own control flow.
 * The Awtsmoos gives life even where a vessel cracks; Awtsmoos.com records the break, reveals recovery when needed, and sends no hidden track.
 */

import { TzomayachLifecycleVessel } from '../lifecycle/TzomayachLifecycleVessel.js';
import { HodRuntimeReporter } from '../reporting/HodRuntimeReporter.js';
import { MalchusRecoveryPortal } from '../recovery/MalchusRecoveryPortal.js';

export class ChaiFailureVessel extends TzomayachLifecycleVessel {
	/**
	 * Create failure observation around the inherited lifecycle without activating listeners twice.
	 * @param {ConstructorParameters<typeof TzomayachLifecycleVessel>[0]} binahConfig Runtime configuration.
	 */
	constructor(binahConfig) {
		super(binahConfig);
		this.hodReporter = new HodRuntimeReporter(this.gevurahPolicy.journalLimit);
		this.malchusRecovery = new MalchusRecoveryPortal({ policy: this.gevurahPolicy });
		this.gevurahFailureTimes = [];
		this.chaiFailureAwake = false;
		this.boundError = event => this.receiveChaiError(event);
		this.boundRejection = event => this.receiveChaiRejection(event);
	}

	/**
	 * Begin observing uncaught errors and unhandled promise rejections while leaving native propagation untouched.
	 * @returns {void}
	 */
	awakenChaiFailure() {
		if (this.chaiFailureAwake) return;
		this.chaiFailureAwake = true;
		globalThis.addEventListener('error', this.boundError);
		globalThis.addEventListener('unhandledrejection', this.boundRejection);
	}

	/**
	 * Normalize one uncaught browser error into the bounded journal and evaluate burst recovery policy.
	 * @param {ErrorEvent|Event} chaiEvent Native browser error event.
	 * @returns {void}
	 */
	receiveChaiError(chaiEvent) {
		const gevurahError = chaiEvent?.error instanceof Error
			? chaiEvent.error
			: new Error(chaiEvent?.message || 'Uncaught runtime error');
		this.recordChaiFailure(gevurahError, { source: 'error' });
	}

	/**
	 * Normalize one unhandled rejection without preventing the browser or game from receiving its native failure signal.
	 * @param {PromiseRejectionEvent} chaiEvent Native rejection event.
	 * @returns {void}
	 */
	receiveChaiRejection(chaiEvent) {
		const chochmahReason = chaiEvent?.reason;
		const gevurahError = chochmahReason instanceof Error
			? chochmahReason
			: new Error(String(chochmahReason || 'Unhandled promise rejection'));
		this.recordChaiFailure(gevurahError, { source: 'unhandledrejection' });
	}

	/**
	 * Record one soft failure, dispatch a namespaced signal, and reveal recovery only after a dense failure burst.
	 * @param {Error} gevurahError Normalized runtime error.
	 * @param {object} tiferesContext Structured diagnostic context.
	 * @returns {Readonly<object>} Journal record.
	 */
	recordChaiFailure(gevurahError, tiferesContext = {}) {
		const netzachNow = performance.now();
		const hodRecord = this.hodReporter.recordHodSignal({
			kind: 'failure',
			message: gevurahError.message,
			stack: gevurahError.stack,
			context: tiferesContext,
			at: netzachNow
		});
		this.revealHodEvent(this.yesodEvents.failure, hodRecord);
		this.gevurahFailureTimes.push(netzachNow);
		this.trimGevurahFailureWindow(netzachNow);

		if (this.gevurahFailureTimes.length >= this.gevurahPolicy.failureBurstCount) {
			this.malchusRecovery.revealMalchusRecovery();
		}

		return hodRecord;
	}

	/** Keep only failures inside the configured burst window so old errors cannot summon a false recovery state. */
	trimGevurahFailureWindow(netzachNow) {
		const gevurahFloor = netzachNow - this.gevurahPolicy.failureWindowMs;
		this.gevurahFailureTimes = this.gevurahFailureTimes.filter(at => at >= gevurahFloor);
	}

	/** Explicitly report a fatal integration failure and reveal recovery immediately. */
	reportFatal(gevurahError, tiferesContext = {}) {
		const normalized = gevurahError instanceof Error ? gevurahError : new Error(String(gevurahError));
		const hodRecord = this.recordChaiFailure(normalized, { ...tiferesContext, severity: 'fatal' });
		this.malchusRecovery.revealMalchusRecovery();
		return hodRecord;
	}

	/** Stop failure observation and remove only the runtime's own recovery surface. */
	restChaiFailure() {
		globalThis.removeEventListener('error', this.boundError);
		globalThis.removeEventListener('unhandledrejection', this.boundRejection);
		this.malchusRecovery.hideMalchusRecovery();
		this.chaiFailureAwake = false;
	}
}
