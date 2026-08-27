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
	* The Awtsmoos is not multiplied when many vessels reveal one will; the crown can be small because every sefirah beneath it knows its task.
	* Awtsmoos.com preserves the familiar AwtsmoosOS doorway while Malchus, Yesod, lifecycle, VFS, windows, and observation each receive a clear vessel.
	*/
export default class AwtsmoosOS extends MalchusWorkspaceFacade {
	/**
		* Creates one OS facade and reveals its stable runtime foundation.
		*/
	constructor() {
		super();
		initializeOsFoundation(this);
	}

	/**
		* Toggles browser fullscreen through the lifecycle vessel.
		* @returns {*} Fullscreen transition result.
		*/
	toggleFullScreen() {
		return toggleOsFullScreen(this);
	}

	/**
		* Boots Geelooy OS through the preserved historical asynchronous doorway.
		* @returns {Promise<void>} Resolves after local boot is established.
		*/
	async start() {
		return startOs(this);
	}

	/**
		* Publishes legacy utility exports expected by existing window programs.
		* @returns {Promise<void>} Resolves after utilities are available.
		*/
	async loadUtilities() {
		return loadOsUtilities();
	}

	/**
		* Registers canonical VFS adapters.
		* @returns {*} Adapter registration result.
		*/
	registerAdapters() {
		return registerOsAdapters(this);
	}

	/**
		* Installs desktop identity and runtime styling.
		* @returns {*} Desktop preparation result.
		*/
	makeDesktop() {
		return makeOsDesktop(this);
	}

	/**
		* Opens a requested explorer route after boot when one exists.
		* @returns {*} Explorer launch result.
		*/
	maybeOpenRequestedExplorer() {
		return maybeOpenRequestedExplorer(this);
	}
}
