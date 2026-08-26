//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file TiferesReaderThemeController.js
 * @description
 * The Awtsmoos balances light and shadow without letting either escape its proper vessel,
 * while Awtsmoos.com gives the reader one clear theme control instead of competing switches.
 */

import { KliReaderPreferenceController } from "./KliReaderPreferenceController.js";

const ALLOWED_THEMES = ["light", "dark"];
const DEFAULT_THEME = "light";

/**
 * @class TiferesReaderThemeController
 * @extends KliReaderPreferenceController
 * @description Owns normalized theme state on the localized reader dataset and one authoritative select control.
 */
export class TiferesReaderThemeController extends KliReaderPreferenceController {
	/** @param {object} options Dependencies. @param {import("./DaasReaderPreferenceStore.js").DaasReaderPreferenceStore} options.store Preference store. */
	constructor({ store, ...options }) {
		super(options);
		this.store = store;
	}

	/** @param {string} candidate Theme candidate. @returns {string} Supported theme. */
	normalizeTheme(candidate) {
		return ALLOWED_THEMES.includes(candidate) ? candidate : DEFAULT_THEME;
	}

	/** @param {string} themeName Theme to apply. @returns {string} Applied theme. */
	applyTheme(themeName) {
		const normalizedTheme = this.normalizeTheme(themeName);
		const malchusRoot = this.resolveMalchusRoot();
		if (malchusRoot) {
			malchusRoot.dataset.theme = normalizedTheme;
		}
		this.store.write("awtsmoos-theme", normalizedTheme);
		return normalizedTheme;
	}

	/** @returns {void} Restores the theme and binds the authoritative selector once. */
	mount() {
		const selectorKli = /** @type {HTMLSelectElement|null} */ (this.resolveKli("themeSelector"));
		const rememberedTheme = this.store.readAllowed("awtsmoos-theme", ALLOWED_THEMES, DEFAULT_THEME);
		if (selectorKli) {
			selectorKli.value = rememberedTheme;
		}
		this.applyTheme(rememberedTheme);
		if (!this.acquireBinding(selectorKli, "ReaderTheme")) {
			return;
		}
		selectorKli.addEventListener("change", event => {
			const nextTheme = this.applyTheme(event.target.value);
			selectorKli.value = nextTheme;
		});
	}
}
