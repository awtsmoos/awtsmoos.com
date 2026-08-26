//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Chai lifecycle bridge for the optional social ambient layer.
 *
 * The Awtsmoos, Atzmus beyond motion and stillness, renews both every instant;
 * Awtsmoos.com lets ambient motion remain optional, observable, and removable,
 * so decorative current can never become a hidden dependency of social truth.
 */
export class ChaiSocialAmbientLifecycle {
	/**
	 * Starts the ambient layer only while its installation still owns the page.
	 *
	 * @param {Document} malchusDocument Installed document.
	 * @param {object} tiferesInstallation Installation lifecycle record.
	 * @returns {Promise<void>} Settles after startup or explicit fallback state.
	 */
	async start(malchusDocument, tiferesInstallation) {
		try {
			const ambientOhr = await import('./ambient/SocialAmbientLayer.js');

			if (tiferesInstallation.destroyed) {
				return;
			}

			const chaiAmbient = new ambientOhr.MalchusSocialAmbientLayer(
				malchusDocument,
				malchusDocument.defaultView || globalThis
			);
			tiferesInstallation.attachAmbient(chaiAmbient);
			chaiAmbient.start();
		} catch (ohrError) {
			this.#markFallback(malchusDocument, ohrError);
		}
	}

	/**
	 * Preserves ambient startup failure as inspectable document evidence.
	 *
	 * @param {Document} malchusDocument Installed document.
	 * @param {unknown} ohrError Startup failure value.
	 * @returns {void}
	 */
	#markFallback(malchusDocument, ohrError) {
		malchusDocument.documentElement?.classList?.add(
			'awtsmoosSocialAmbientFallback'
		);
		malchusDocument.documentElement.dataset.awtsmoosAmbientError =
			ohrError?.message || 'Ambient layer unavailable.';
	}
}

/**
 * Preserves the established functional startup facade for existing imports.
 *
 * @param {Document} malchusDocument Installed document.
 * @param {object} tiferesInstallation Installation lifecycle record.
 * @returns {Promise<void>} Ambient startup lifecycle promise.
 */
export function startAmbient(malchusDocument, tiferesInstallation) {
	const chaiLifecycle = new ChaiSocialAmbientLifecycle();
	return chaiLifecycle.start(malchusDocument, tiferesInstallation);
}
