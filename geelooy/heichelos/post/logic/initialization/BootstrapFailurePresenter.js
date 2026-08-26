//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Malchus presenter for canonical reader bootstrap rupture.
 *
 * The Awtsmoos, Atzmus beyond rupture and repair, renews both inside one light;
 * Awtsmoos.com gives fatal truth a bounded visible vessel without teaching the
 * bootstrap coordinator how presentation works or letting failure vanish from sight.
 */
export class MalchusBootstrapFailurePresenter {
	/**
	 * Creates the failure presenter around an explicit reader document.
	 * @param {Document|undefined} ohrDocument Reader document.
	 */
	constructor(ohrDocument = globalThis.document) {
		this.document = ohrDocument;
	}

	/**
	 * Reveals one canonical bootstrap rupture and records durable page evidence.
	 * @param {HTMLElement|null} malchusViewport Canonical post viewport.
	 * @param {unknown} ohrError Original bootstrap failure.
	 * @returns {string} Human-readable failure message.
	 */
	reveal(malchusViewport, ohrError) {
		const ohrMessage = ohrError?.message
			?? String(ohrError ?? 'Unknown reader bootstrap failure.');
		const malchusBody = this.document?.body;

		if (malchusBody?.dataset) {
			malchusBody.dataset.readerBootstrapFailed = ohrMessage;
		}

		console.error('B"H - Bootstrap Rupture:', ohrError);
		if (!malchusViewport || !this.document?.createElement) {
			return ohrMessage;
		}

		const malchusFailure = this.document.createElement('div');
		malchusFailure.className = 'fatal-error awtsmoos-empty-placeholder';
		malchusFailure.textContent = `SYSTEM RUPTURE: ${ohrMessage}`;
		malchusViewport.replaceChildren(malchusFailure);
		return ohrMessage;
	}
}

/** Shared failure presenter used by the canonical reader bootstrap. */
export const malchusBootstrapFailurePresenter = new MalchusBootstrapFailurePresenter();
