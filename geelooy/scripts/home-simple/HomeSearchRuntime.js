// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HomeSearchRuntime.js
 * @description
 * The Awtsmoos joins memory, intention, query, and keyboard without confusing them;
 * Awtsmoos.com keeps search orchestration here so one shared history feeds both the
 * omnibox and direct search while the visible interface remains quiet and immediate.
 */
import { IntentPrefetch } from "./intent-prefetch.js";
import { KeyboardShortcuts } from "./keyboard-shortcuts.js";
import { OmniboxController } from "./omnibox-controller.js";
import { OmniboxHistory } from "./omnibox-history.js";
import { OmniboxRecorder } from "./omnibox-recorder.js";
import { OmniboxRenderer } from "./omnibox-renderer.js";
import { SearchController } from "./search.js";
import { CONSTELLATION_CATALOG } from "./constellation-catalog.js";

/** Coordinates Home query behavior and keyboard access around one history source. */
export class HomeSearchRuntime {
	/**
	 * @param {Readonly<Record<string, any>>} homeKelim Frozen Home DOM record.
	 * @param {object|null} filterController Connected Worlds filter for keyboard focus.
	 */
	constructor(homeKelim, filterController = null) {
		this.homeKelim = homeKelim;
		this.filterController = filterController;
		this.historyController = null;
		this.omniboxController = null;
		this.isConnected = false;
	}

	/**
	 * Connects omnibox, direct search, intent prefetch, and keyboard shortcuts once.
	 *
	 * @returns {HomeSearchRuntime} This runtime.
	 * @sideEffects Reads local history and binds page-lifetime input/keyboard listeners.
	 */
	connect() {
		if (this.isConnected) {
			return this;
		}

		const kelim = this.homeKelim;
		if (kelim.omniboxRoot) {
			this.connectOmnibox(kelim.omniboxRoot);
		}
		if (kelim.searchForm) {
			new SearchController(kelim.searchForm, {
				history: this.historyController,
				omnibox: this.omniboxController
			}).connect();
		}

		new KeyboardShortcuts({
			searchInput: kelim.searchInput,
			menuRoot: kelim.menuRoot,
			menuButton: kelim.menuButton,
			filterController: this.filterController
		}).connect();

		this.isConnected = true;
		return this;
	}

	/**
	 * Builds the single shared omnibox history chain.
	 *
	 * @param {Element} omniboxRoot Omnibox component root.
	 * @returns {void}
	 * @sideEffects Binds omnibox, recorder, and prefetch listeners.
	 */
	connectOmnibox(omniboxRoot) {
		this.historyController = new OmniboxHistory();
		const netzachRecorder = new OmniboxRecorder(this.historyController).connect();
		const hodRenderer = new OmniboxRenderer(omniboxRoot);
		this.omniboxController = new OmniboxController(omniboxRoot, {
			catalog: CONSTELLATION_CATALOG,
			history: this.historyController,
			menuRoot: this.homeKelim.menuRoot,
			recorder: netzachRecorder,
			renderer: hodRenderer
		}).connect();
		new IntentPrefetch(omniboxRoot).connect();
	}

	/**
	 * @returns {Readonly<{connected:boolean,omniboxAvailable:boolean,searchAvailable:boolean,historyAvailable:boolean}>} Immutable search state.
	 */
	snapshot() {
		return Object.freeze({
			connected: this.isConnected,
			omniboxAvailable: Boolean(this.homeKelim.omniboxRoot),
			searchAvailable: Boolean(this.homeKelim.searchForm),
			historyAvailable: Boolean(this.historyController)
		});
	}
}
