//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file MalchusReaderPreferenceApplication.js
 * @description
 * The Awtsmoos lets distinct preferences descend into one visible kingdom without becoming one tangled thing,
 * while Awtsmoos.com composes storage, font, and theme controllers through a tiny repeat-safe application root.
 */

import { DaasReaderPreferenceStore } from "./DaasReaderPreferenceStore.js";
import { YesodReaderFontController } from "./YesodReaderFontController.js";
import { TiferesReaderThemeController } from "./TiferesReaderThemeController.js";
import { DreamReaderController } from "./DreamReaderController.js";

const THEME_STORAGE_KEY = "awtsmoos-theme";

/**
 * @class MalchusReaderPreferenceApplication
 * @description Composition root for independent reader preference controllers.
 */
export class MalchusReaderPreferenceApplication {
	/** @param {Storage} storageKli Browser storage vessel. */
	constructor(storageKli = window.localStorage) {
		this.daasStore = new DaasReaderPreferenceStore(storageKli);
		this.yesodFont = new YesodReaderFontController({ store: this.daasStore });
		this.tiferesTheme = new TiferesReaderThemeController({ store: this.daasStore });
		this.dreamReader = new DreamReaderController({ store: this.daasStore });
	}

	/** @returns {void} Restores and binds every preference controller; each controller guards duplicate listeners. */
	mount() {
		this.yesodFont.mount();
		this.tiferesTheme.mount();
		this.dreamReader.mount();
		// A ?dream= link is a shareable vision: pair it with its matching theme
		// so the sanctuary arrives dark and the dawn arrives light.
		const urlDream = this.dreamReader.dreamFromUrl();
		if (urlDream === "sanctuary") {
			this.tiferesTheme.applyTheme("dark");
			return;
		}
		if (urlDream === "dawn") {
			this.tiferesTheme.applyTheme("light");
			return;
		}
		// No link and no memory: the time-aware greeting already chose the
		// fitting vision — give it its fitting light too, but only when the
		// reader never chose a theme either. Stored choices always win.
		if (!this.dreamReader.hasStoredDream() && !this.daasStore.has(THEME_STORAGE_KEY)) {
			const timedDream = this.dreamReader.timeDefaultDream();
			this.tiferesTheme.applyTheme(timedDream === "sanctuary" ? "dark" : "light");
		}
	}
}

const malchusReaderPreferences = new MalchusReaderPreferenceApplication();

/** @returns {void} Mounts the shared reader preference application. */
export function mountReaderPreferences() {
	malchusReaderPreferences.mount();
}
