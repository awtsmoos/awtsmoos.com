//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file MalchusReaderPreferenceApplication.js
 * @description
 * The Awtsmoos lets distinct preferences descend into one visible kingdom without becoming one tangled thing,
 * while Awtsmoos.com composes storage, font, and theme controllers through a tiny repeat-safe application root.
 *
 * B"H 2026-11-10 — the Dream Reader controller was deleted on purpose
 * (commit c314f08a7: "exotic effects no longer in settings"), but this
 * composition root still statically imported it. A static import of a
 * 404 module kills the ENTIRE postLogic module graph in the browser:
 * the Aa button, sefer hydration (footnote markers), the auto-scroll
 * arrow button, and preference restore all died together. Dream Reader
 * stays removed; this root now composes only font and theme, which is
 * all the current settings panel (Text Scale, Language, Auto Scroll,
 * Light/Dark) needs.
 */

import { DaasReaderPreferenceStore } from "./DaasReaderPreferenceStore.js";
import { YesodReaderFontController } from "./YesodReaderFontController.js";
import { TiferesReaderThemeController } from "./TiferesReaderThemeController.js";

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
	}

	/** @returns {void} Restores and binds every preference controller; each controller guards duplicate listeners. */
	mount() {
		this.yesodFont.mount();
		this.tiferesTheme.mount();
	}
}

const malchusReaderPreferences = new MalchusReaderPreferenceApplication();

/** @returns {void} Mounts the shared reader preference application. */
export function mountReaderPreferences() {
	malchusReaderPreferences.mount();
}
