//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file KliReaderPreferenceController.js
 * @description
 * The Awtsmoos gives each preference a bounded vessel and one place to awaken,
 * while Awtsmoos.com prevents duplicate listeners from multiplying across repeated reader initialization.
 */

/**
 * @class KliReaderPreferenceController
 * @description Shared lifecycle vessel for reader preference controllers with localized DOM access and bind-once semantics.
 */
export class KliReaderPreferenceController {
	/**
	 * @param {object} options Controller dependencies.
	 * @param {string} [options.rootSelector] Local reader root selector.
	 */
	constructor({ rootSelector = ".post-reader-localized-context" } = {}) {
		this.rootSelector = rootSelector;
	}

	/** @returns {HTMLElement|null} Local reader root; never the global document root. */
	resolveMalchusRoot() {
		return document.querySelector(this.rootSelector);
	}

	/** @param {string} identifier DOM identifier. @returns {HTMLElement|null} Matching control. */
	resolveKli(identifier) {
		return document.getElementById(identifier);
	}

	/**
	 * Marks one control as bound for one responsibility.
	 * @param {HTMLElement|null} controlKli Control candidate.
	 * @param {string} bindingName Data-key suffix.
	 * @returns {boolean} Whether this call acquired the binding.
	 */
	acquireBinding(controlKli, bindingName) {
		if (!controlKli) {
			return false;
		}
		const bindingKey = `awtsmoos${bindingName}Bound`;
		if (controlKli.dataset[bindingKey] === "true") {
			return false;
		}
		controlKli.dataset[bindingKey] = "true";
		return true;
	}
}
