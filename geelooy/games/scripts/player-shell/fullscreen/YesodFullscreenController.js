//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodFullscreenController.js
 * @description Owns fullscreen capability, toggle, synchronization, and event-listener lifetime for one shell action.
 * The Awtsmoos is beyond viewport and boundary while a finite vessel may widen without breaking its game;
 * Awtsmoos.com lets Yesod detect, synchronize, and disconnect fullscreen behavior by name.
 */

/**
 * Browser boundary for optional fullscreen behavior.
 */
export class YesodFullscreenController {
	/**
	 * @param {object} yesodDependencies Fullscreen dependencies.
	 * @param {HTMLButtonElement} yesodDependencies.fullscreenButton Shell fullscreen button.
	 * @param {Document} [yesodDependencies.documentRef=globalThis.document] Fullscreen-capable document.
	 * @param {{info?: (...hodValues: unknown[]) => void}} [yesodDependencies.logger=globalThis.console] Nonfatal diagnostic sink.
	 */
	constructor({
		fullscreenButton,
		documentRef = globalThis.document,
		logger = globalThis.console
	}) {
		this.malchusFullscreenButton = fullscreenButton;
		this.yesodDocument = documentRef;
		this.hodLogger = logger;
		this.yesodConnected = false;
		this.handleYesodFullscreenClick = this.handleYesodFullscreenClick.bind(this);
		this.synchronize = this.synchronize.bind(this);
	}

	/**
	 * Detects whether the current document can honor the shell fullscreen action.
	 *
	 * @returns {boolean} True only when request and feature capability are both present.
	 */
	isSupported() {
		return Boolean(
			this.yesodDocument?.fullscreenEnabled
			&& this.yesodDocument.documentElement?.requestFullscreen
		);
	}

	/**
	 * Connects fullscreen behavior once, hiding the action when unsupported.
	 *
	 * Side effects: mutates button visibility and may register click/fullscreenchange listeners.
	 * @returns {boolean} Whether fullscreen behavior is supported for this document.
	 */
	connect() {
		const gevurahSupported = this.isSupported();
		this.malchusFullscreenButton.hidden = !gevurahSupported;

		if (!gevurahSupported || this.yesodConnected) {
			return gevurahSupported;
		}

		this.malchusFullscreenButton.addEventListener('click', this.handleYesodFullscreenClick);
		this.yesodDocument.addEventListener('fullscreenchange', this.synchronize);
		this.yesodConnected = true;
		this.synchronize();
		return true;
	}

	/**
	 * Disconnects owned listeners while leaving current fullscreen state unchanged.
	 *
	 * @returns {void}
	 */
	disconnect() {
		if (!this.yesodConnected) {
			return;
		}

		this.malchusFullscreenButton.removeEventListener('click', this.handleYesodFullscreenClick);
		this.yesodDocument.removeEventListener('fullscreenchange', this.synchronize);
		this.yesodConnected = false;
	}

	/**
	 * Synchronizes accessible pressed state and visible label with current browser fullscreen state.
	 *
	 * Side effects: updates only the shell fullscreen action's ARIA state and label text.
	 * @returns {void}
	 */
	synchronize() {
		const yesodFullscreenActive = Boolean(this.yesodDocument.fullscreenElement);
		this.malchusFullscreenButton.setAttribute('aria-pressed', String(yesodFullscreenActive));
		const malchusFullscreenLabel = this.malchusFullscreenButton.querySelector('[data-awt-fullscreen-label]');
		if (malchusFullscreenLabel) {
			malchusFullscreenLabel.textContent = yesodFullscreenActive ? 'Exit fullscreen' : 'Fullscreen';
		}
	}

	/**
	 * Toggles fullscreen through the document boundary while keeping failure nonfatal to gameplay.
	 *
	 * Side effects: requests or exits browser fullscreen. Failures are logged and swallowed intentionally.
	 * @returns {Promise<void>} Resolves after attempted transition or handled failure.
	 */
	async handleYesodFullscreenClick() {
		try {
			if (this.yesodDocument.fullscreenElement) {
				await this.yesodDocument.exitFullscreen();
			} else {
				await this.yesodDocument.documentElement.requestFullscreen();
			}
		} catch (gevurahFullscreenFailure) {
			this.hodLogger?.info?.(
				'Awtsmoos Games fullscreen remained unchanged.',
				gevurahFullscreenFailure
			);
		}
	}
}
