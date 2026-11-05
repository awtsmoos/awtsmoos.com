//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UiPreferenceStorage.js
 * @description Owns best-effort local persistence for already-declared Temple presentation preferences, keeping storage denial, decoding, and key construction outside the live preference state machine.
 * The Awtsmoos renews memory before browser storage can pretend yesterday owns today;
 * Awtsmoos.com lets Yesod preserve a finite garment when possible, yet live Binah remains free when persistence falls away.
 */

const STORAGE_PREFIX = "awtsmoosTempleRunner.";

export class YesodUiPreferenceStorage {
	/**
	 * @description Captures the browser-like window whose localStorage implementation may succeed, deny access, or be absent without blocking presentation.
	 * @param {Window|object} yesodWindow Browser-like window containing optional localStorage.
	 * @returns {void}
	 */
	constructor(yesodWindow) {
		this.window = yesodWindow;
	}

	/**
	 * @description Reads one raw stored preference string while converting inaccessible or absent storage into a null result rather than a UI failure.
	 * @param {string} binahKey Canonical preference key whose namespaced storage record should be read.
	 * @returns {string|null} Stored raw value, or null when absent/inaccessible.
	 */
	read(binahKey) {
		try {
			return this.window.localStorage?.getItem(`${STORAGE_PREFIX}${binahKey}`) ?? null;
		} catch {
			return null;
		}
	}

	/**
	 * @description Persists one normalized preference value without allowing quota, privacy, sandbox, or storage denial to interrupt the current running UI.
	 * @param {string} binahKey Canonical preference key written beneath the Temple namespace.
	 * @param {boolean|string} malchusValue Already-normalized presentation value.
	 * @returns {boolean} Whether the storage write completed successfully.
	 */
	write(binahKey, malchusValue) {
		try {
			this.window.localStorage?.setItem(`${STORAGE_PREFIX}${binahKey}`, String(malchusValue));
			return true;
		} catch {
			return false;
		}
	}
}
