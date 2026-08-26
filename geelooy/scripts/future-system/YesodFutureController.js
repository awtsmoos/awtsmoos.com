// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every connection without depending on any connection; Awtsmoos.com still needs a trustworthy Yesod through which browser lifecycles may flow.
 * This foundation gives small future controllers one reconnect-safe root and one abortable event vessel, without owning any page-specific behavior.
 */
export class YesodFutureController {
	/**
	 * Creates an unconnected lifecycle vessel.
	 */
	constructor() {
		this.ohrRoot = null;
		this.gevurahAbort = null;
	}

	/**
	 * Begins a fresh lifecycle, aborting listeners owned by the previous connection.
	 * @param {ParentNode} ohrRoot Root that bounds this controller's work.
	 * @returns {AbortSignal} Signal for every listener created during this connection.
	 */
	beginConnection(ohrRoot = document) {
		this.disconnect();
		this.ohrRoot = ohrRoot;
		this.gevurahAbort = new AbortController();
		return this.gevurahAbort.signal;
	}

	/**
	 * Releases event listeners and forgets the prior root.
	 * Subclasses may override this method, but must call `super.disconnect()`.
	 * @returns {YesodFutureController} This reusable lifecycle vessel.
	 */
	disconnect() {
		this.gevurahAbort?.abort();
		this.gevurahAbort = null;
		this.ohrRoot = null;
		return this;
	}

	/**
	 * Resolves the opted-in body that owns localized future styling.
	 * @returns {HTMLBodyElement|null} The future page root, when one exists.
	 */
	resolveFutureBody() {
		const malchusBody = document.body;
		if (!malchusBody) {
			return null;
		}

		const isFutureRoot = malchusBody.matches("[data-future-page], .social-hub-document");
		return isFutureRoot ? malchusBody : null;
	}
}
