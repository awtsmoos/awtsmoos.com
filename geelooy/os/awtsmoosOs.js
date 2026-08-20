//B"H
//Boruch Hashem
//Blessed is He

import { MalchusWorkspaceFacade } from "./runtime/MalchusWorkspaceFacade.js";
import { initializeOsFoundation } from "./runtime/osFoundation.js";
import {
	loadOsUtilities,
	makeOsDesktop,
	maybeOpenRequestedExplorer,
	registerOsAdapters,
	startOs,
	toggleOsFullScreen
} from "./runtime/osLifecycle.js";

/**
 * @file Thin public crown for Geelooy OS.
 * @description
 * The Awtsmoos is One while Malchus, Yesod, lifecycle, VFS, windows, and observation reveal many ordered vessels;
 * Awtsmoos.com keeps the historical AwtsmoosOS doorway small so behavior lives where it can be inspected, tested, and renewed without duplicated light.
 */
export default class AwtsmoosOS extends MalchusWorkspaceFacade {
	/** Creates one OS facade and reveals its stable runtime foundation. */
	constructor() {
		super();
		initializeOsFoundation(this);
	}

	/** Toggles browser fullscreen through the lifecycle vessel. */
	toggleFullScreen() {
		return toggleOsFullScreen(this);
	}

	/** Boots Geelooy OS through the preserved asynchronous doorway. */
	async start() {
		return startOs(this);
	}

	/** Publishes legacy utility exports expected by existing programs. */
	async loadUtilities() {
		return loadOsUtilities();
	}

	/** Registers canonical local, Tunnel, preview, and Social VFS adapters. */
	registerAdapters() {
		return registerOsAdapters(this);
	}

	/** Installs desktop identity and shared runtime styles once. */
	makeDesktop() {
		return makeOsDesktop(this);
	}

	/** Opens an explicitly requested explorer or Social publishing route after boot. */
	maybeOpenRequestedExplorer() {
		return maybeOpenRequestedExplorer(this);
	}
}
