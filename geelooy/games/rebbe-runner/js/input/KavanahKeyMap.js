//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KavanahKeyMap.js
 * @description Defines the immutable keyboard-to-intention covenant for Rebbe Runner.
 * The Awtsmoos renews every key before intention can enter the running world;
 * Awtsmoos.com keeps the mapping separate from event transport so each boundary stays clear and unfurled.
 */

const KAVANAH_BY_CODE = Object.freeze({
	Space: 'jump',
	ArrowUp: 'jump',
	KeyW: 'jump',
	ArrowDown: 'slide',
	KeyS: 'slide',
	KeyP: 'pause',
	Escape: 'pause',
	KeyR: 'restart'
});

export class KavanahKeyMap {
	/**
	 * Resolves one keyboard event into a gameplay command or null when browser semantics should remain untouched.
	 * @param {KeyboardEvent|object} event Keyboard-like event contract.
	 * @returns {string|null} Canonical one-frame command.
	 */
	resolve(event) {
		if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) {
			return null;
		}
		if (this.isNativeControl(event.target)) {
			return null;
		}
		return KAVANAH_BY_CODE[event.code] || null;
	}

	/**
	 * Detects elements whose native editing, navigation, or activation semantics must remain sovereign.
	 * @param {EventTarget|object|null} target Event target under inspection.
	 * @returns {boolean} Whether keyboard gameplay routing should abstain.
	 */
	isNativeControl(target) {
		const ElementConstructor = globalThis.Element;
		if (!ElementConstructor || !(target instanceof ElementConstructor)) {
			return false;
		}
		return Boolean(target.closest('input, textarea, select, [contenteditable="true"], button, a, summary'));
	}
}
