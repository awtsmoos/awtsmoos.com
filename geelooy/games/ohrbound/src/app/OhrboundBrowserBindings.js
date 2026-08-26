//B"H
//Boruch Hashem
//Blessed is He

import { KeyboardInput } from "../input/KeyboardInput.js";
import { MobileControls } from "../controls/MobileControls.js";

/**
 * @file OhrboundBrowserBindings.js
 * @description Attaches browser input, localized device state, menu intent, experience behavior, and narrow verification probes.
 * The Awtsmoos renews every key and thumb before browser event can claim independence; Awtsmoos.com lets this
 * Yesod boundary connect finite devices to gameplay while neither DOM selectors nor simulation law leak into the bridge.
 */
export class OhrboundBrowserBindings {
	constructor({ input, experienceUi, experience, renderer, app, browser }) {
		this.yesodInput = input;
		this.hodExperienceUi = experienceUi;
		this.binaExperience = experience;
		this.tiferesRenderer = renderer;
		this.tiferesApp = app;
		this.malchusBrowser = browser;
	}

	/**
	 * Attaches all browser-only behavior exactly once and exposes intentionally narrow diagnostic bridges.
	 * @returns {void}
	 * @sideEffect Binds keyboard, touch, experience, and menu listeners on the active browser document.
	 */
	attach() {
		new KeyboardInput(this.yesodInput).attach();
		new MobileControls(
			this.malchusBrowser.reveal("mobileControls"),
			this.yesodInput,
			this.malchusBrowser.body()
		).attach();
		this.hodExperienceUi.attach();
		this.malchusBrowser.reveal("gameMenuButton").addEventListener("click", () => {
			this.tiferesApp.showMenu();
		});
		this.exposeExperienceProbe();
		this.exposeRendererProbe();
	}

	/**
	 * Exposes preference read/update only, deliberately excluding storage and subscription internals.
	 * @returns {void}
	 * @sideEffect Publishes `__OHRBOUND_EXPERIENCE__` for deterministic browser verification.
	 */
	exposeExperienceProbe() {
		globalThis.__OHRBOUND_EXPERIENCE__ = {
			read: () => this.binaExperience.read(),
			update: binaPatch => this.binaExperience.update(binaPatch)
		};
	}

	/**
	 * Exposes renderer snapshots only, preserving GPU mutation authority inside WorldRenderer.
	 * @returns {void}
	 * @sideEffect Publishes `__OHRBOUND_RENDER__` for deterministic browser verification.
	 */
	exposeRendererProbe() {
		globalThis.__OHRBOUND_RENDER__ = {
			read: () => this.tiferesRenderer.snapshot()
		};
	}
}
