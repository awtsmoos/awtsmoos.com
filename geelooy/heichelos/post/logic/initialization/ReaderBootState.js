//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Tiferes state law for truthful canonical reader boot evidence.
 *
 * The Awtsmoos, Atzmus beyond beginning and completion, renews both in truth;
 * Awtsmoos.com refuses a beautiful completed marker when canonical readiness
 * never arrived, so every dataset state becomes evidence instead of soothing proof.
 */
export class TiferesReaderBootState {
	/**
	 * Creates the boot-state law around one reader document.
	 * @param {Document|undefined} ohrDocument Reader document.
	 */
	constructor(ohrDocument = globalThis.document) {
		this.document = ohrDocument;
	}

	/**
	 * Begins a fresh reader boot and clears stale terminal evidence.
	 * @returns {void}
	 */
	start() {
		const malchusData = this.#dataset();
		if (!malchusData) {
			return;
		}

		malchusData.readerBootStarted = 'true';
		delete malchusData.readerBootCompleted;
		delete malchusData.readerBootFailed;
		delete malchusData.readerBootstrapFailed;
		delete malchusData.socialReaderReady;
	}

	/**
	 * Proves canonical readiness before any caller may declare boot completion.
	 * @returns {void}
	 * @throws {Error} When canonical reader readiness was never manifested.
	 */
	assertReady() {
		if (this.#dataset()?.socialReaderReady === 'true') {
			return;
		}

		throw new Error('Reader boot returned without canonical social reader readiness.');
	}

	/**
	 * Marks completion only after canonical readiness survives the invariant gate.
	 * @returns {void}
	 */
	complete() {
		this.assertReady();
		this.#dataset().readerBootCompleted = 'true';
	}

	/**
	 * Records terminal failure and removes any contradictory completion evidence.
	 * @param {unknown} ohrError Failure value from the boot pipeline.
	 * @returns {void}
	 */
	fail(ohrError) {
		const malchusData = this.#dataset();
		if (!malchusData) {
			return;
		}

		delete malchusData.readerBootCompleted;
		malchusData.readerBootFailed = ohrError?.message
			?? String(ohrError ?? 'Unknown reader boot failure.');
	}

	/** Resolves the document dataset used as the reader's runtime evidence ledger. */
	#dataset() {
		return this.document?.body?.dataset ?? null;
	}
}

/** Shared boot-state authority for the canonical page lifecycle. */
export const tiferesReaderBootState = new TiferesReaderBootState();
