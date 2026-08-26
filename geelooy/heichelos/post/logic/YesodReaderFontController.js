//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file YesodReaderFontController.js
 * @description
 * The Awtsmoos lets many letter-forms stand upon one foundation without escaping their chamber,
 * while Awtsmoos.com remembers an old reader's choice and translates it into the cleaner present.
 */

import { KliReaderPreferenceController } from "./KliReaderPreferenceController.js";

const DEFAULT_FONT = "'Cardo', serif";
const FONT_ALIASES = new Map([
	["'Crimson Pro', serif", "'Source Serif 4', serif"],
	["'EB Garamond', serif", "'Cardo', serif"],
	["'Lora', serif", "'Source Serif 4', serif"]
]);

/**
 * @class YesodReaderFontController
 * @extends KliReaderPreferenceController
 * @description Owns reader font persistence and the localized --font-manuscript variable.
 */
export class YesodReaderFontController extends KliReaderPreferenceController {
	/** @param {object} options Dependencies. @param {import("./DaasReaderPreferenceStore.js").DaasReaderPreferenceStore} options.store Preference store. */
	constructor({ store, ...options }) {
		super(options);
		this.store = store;
	}

	/** @param {string} rememberedFont Stored font value. @param {HTMLSelectElement|null} selectorKli Font selector. @returns {string} Supported font value. */
	normalizeFont(rememberedFont, selectorKli) {
		const translatedFont = FONT_ALIASES.get(rememberedFont) || rememberedFont || DEFAULT_FONT;
		const supportedFonts = Array.from(selectorKli?.options || []).map(option => option.value);
		return supportedFonts.includes(translatedFont) ? translatedFont : DEFAULT_FONT;
	}

	/** @param {string} fontValue Supported font stack. @returns {string} Applied font stack. */
	applyFont(fontValue) {
		const malchusRoot = this.resolveMalchusRoot();
		malchusRoot?.style.setProperty("--font-manuscript", fontValue);
		this.store.write("awtsmoos-font", fontValue);
		return fontValue;
	}

	/** @returns {void} Restores state and binds the selector at most once. */
	mount() {
		const selectorKli = /** @type {HTMLSelectElement|null} */ (this.resolveKli("fontSelector"));
		const rememberedFont = this.store.read("awtsmoos-font", DEFAULT_FONT);
		const normalizedFont = this.normalizeFont(rememberedFont, selectorKli);
		if (selectorKli) {
			selectorKli.value = normalizedFont;
		}
		this.applyFont(normalizedFont);
		if (!this.acquireBinding(selectorKli, "ReaderFont")) {
			return;
		}
		selectorKli.addEventListener("change", event => {
			const nextFont = this.normalizeFont(event.target.value, selectorKli);
			selectorKli.value = nextFont;
			this.applyFont(nextFont);
		});
	}
}
