// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HomeWorldsRuntime.js
 * @description
 * The Awtsmoos contains every doorway without crowding one screen; Awtsmoos.com
 * keeps the retractable Worlds constellation inside this runtime, where rendering,
 * opening, menu discipline, and filtering remain one bounded discovery concern.
 */
import { CONSTELLATION_CATALOG, CONSTELLATION_GROUPS } from "./constellation-catalog.js";
import { ConstellationRenderer } from "./constellation-renderer.js";
import { ConstellationStyleLoader } from "./constellation-style-loader.js";
import { LauncherFilter } from "./launcher-filter.js";
import { MenuController } from "./menu.js";
import { WorldLauncherOpener } from "./world-launcher-opener.js";

/** Coordinates the retractable Worlds menu and exposes only stable route state. */
export class HomeWorldsRuntime {
	/**
	 * @param {Readonly<Record<string, any>>} homeKelim Frozen Home DOM record.
	 */
	constructor(homeKelim) {
		this.homeKelim = homeKelim;
		this.filterController = null;
		this.isConnected = false;
	}

	/**
	 * Renders and connects the Worlds menu once when its root exists.
	 *
	 * @returns {HomeWorldsRuntime} This runtime.
	 * @sideEffects Injects constellation styles, renders menu records, and binds page-lifetime menu listeners.
	 */
	connect() {
		if (this.isConnected) {
			return this;
		}

		ConstellationStyleLoader.ensure();
		const menuRoot = this.homeKelim.menuRoot;
		if (menuRoot) {
			new ConstellationRenderer(menuRoot, CONSTELLATION_CATALOG, CONSTELLATION_GROUPS).render();
			new MenuController(menuRoot).connect();
			new WorldLauncherOpener(menuRoot, this.homeKelim.openWorldsButton).connect();
			this.filterController = new LauncherFilter(menuRoot).connect();
		}

		this.isConnected = true;
		return this;
	}

	/**
	 * Returns the filter controller solely for sibling shortcut composition.
	 *
	 * @returns {LauncherFilter|null} Connected filter controller or null without a menu.
	 */
	revealFilterController() {
		return this.filterController;
	}

	/**
	 * @returns {Readonly<{connected:boolean,menuAvailable:boolean,filterAvailable:boolean}>} Immutable Worlds state.
	 */
	snapshot() {
		return Object.freeze({
			connected: this.isConnected,
			menuAvailable: Boolean(this.homeKelim.menuRoot),
			filterAvailable: Boolean(this.filterController)
		});
	}
}
