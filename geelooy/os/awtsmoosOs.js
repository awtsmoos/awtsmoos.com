// B"H

import { initializeOsFoundation } from "./runtime/osFoundation.js";
import { loadOsUtilities, makeOsDesktop, maybeOpenRequestedExplorer, registerOsAdapters, startOs, toggleOsFullScreen } from "./runtime/osLifecycle.js";
import { installOsListeners, routeOsInput, showDesktopContext } from "./runtime/osInteraction.js";
import { openOsWindow } from "./runtime/osWindowing.js";
import { createOsFile, createOsFolder, recordOsVfsMutation, refreshOsRemoteDrives, showOsFilesAtPath, updateOsDefaultProgram } from "./runtime/osWorkspace.js";
import { getOsDesktop, getOsDisplaySnapshot, getOsGraphSnapshot, getOsScene, getOsSnapshot, recordOsGraphEvent, renderOsDesktop, syncOsGraphState, updateOsStatus } from "./runtime/osObservation.js";

/**
 * @file Compatibility crown for the Geelooy operating world.
 * @description
 * The Awtsmoos is One while the vessels are many: this class preserves every historical doorway,
 * yet Awtsmoos.com lets lifecycle, input, windows, workspace, and observation reveal themselves in small modules.
 */
export default class AwtsmoosOS {
	constructor() {
		initializeOsFoundation(this);
	}

	toggleFullScreen() {
		return toggleOsFullScreen(this);
	}

	async start() {
		return startOs(this);
	}

	async loadUtilities() {
		return loadOsUtilities();
	}

	registerAdapters() {
		return registerOsAdapters(this);
	}

	listeners() {
		return installOsListeners(this);
	}

	desktopContext(event) {
		return showDesktopContext(this, event);
	}

	addWindow(options) {
		return openOsWindow(this, options);
	}

	input(type, data = {}) {
		return routeOsInput(this, type, data);
	}

	async refreshRemoteDrives() {
		return refreshOsRemoteDrives(this);
	}

	async createFile(options) {
		return createOsFile(this, options);
	}

	async createFolder(options) {
		return createOsFolder(this, options);
	}

	async updateDefaultProgram(extension, programName) {
		return updateOsDefaultProgram(this, extension, programName);
	}

	makeDesktop() {
		return makeOsDesktop(this);
	}

	renderDesktop() {
		return renderOsDesktop(this);
	}

	maybeOpenRequestedExplorer() {
		return maybeOpenRequestedExplorer(this);
	}

	updateStatus(remote) {
		return updateOsStatus(this, remote);
	}

	getDesktop() {
		return getOsDesktop(this);
	}

	async showFilesAtPath(options) {
		return showOsFilesAtPath(this, options);
	}

	recordVfsMutation(event) {
		return recordOsVfsMutation(this, event);
	}

	recordGraphEvent(type, data = {}) {
		return recordOsGraphEvent(this, type, data);
	}

	syncGraph() {
		return syncOsGraphState(this);
	}

	graphSnapshot() {
		return getOsGraphSnapshot(this);
	}

	scene() {
		return getOsScene(this);
	}

	displaySnapshot() {
		return getOsDisplaySnapshot(this);
	}

	snapshot() {
		return getOsSnapshot(this);
	}
}
