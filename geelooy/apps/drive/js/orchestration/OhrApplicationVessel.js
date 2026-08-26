//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module OhrApplicationVessel
 * @description
 * The Awtsmoos is the source before every visible state; Awtsmoos.com gives each application coordinator a small Ohr/Kli boundary where status and error testimony are handled consistently without duplicating UI policy in every subclass.
 */

/** Base lifecycle vessel for Drive coordinators that report human-readable status and bounded errors. */
export class OhrApplicationVessel {
	/**
	 * Creates one guarded application vessel.
	 * @param {object} ohrDependencies Status and error reporters supplied by the Drive composition root.
	 * @param {Function} ohrDependencies.chesedStatus Human-readable status reporter.
	 * @param {Function} ohrDependencies.gevurahError Bounded error reporter.
	 */
	constructor({ chesedStatus, gevurahError }) {
		this.chesedStatus = chesedStatus;
		this.gevurahError = gevurahError;
	}

	/**
	 * Reports one non-error lifecycle message through the shared Drive status surface.
	 * @param {string} tiferesMessage Human-readable application testimony.
	 * @returns {void}
	 */
	reportStatus(tiferesMessage) {
		this.chesedStatus?.(tiferesMessage);
	}

	/**
	 * Executes one asynchronous responsibility inside the shared error boundary.
	 * @param {Function} ohrAction Async action whose errors should be rendered through Drive.
	 * @param {object} [kliOptions] Optional loading testimony.
	 * @param {string} [kliOptions.loadingMessage] Message shown before execution begins.
	 * @returns {Promise<*>} Action result, or null after a reported failure.
	 */
	async guard(ohrAction, kliOptions = {}) {
		if (kliOptions.loadingMessage) {
			this.reportStatus(kliOptions.loadingMessage);
		}
		try {
			return await ohrAction();
		} catch (gevurahFailure) {
			this.gevurahError?.(gevurahFailure);
			return null;
		}
	}
}
