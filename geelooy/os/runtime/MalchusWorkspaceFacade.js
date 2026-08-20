//B"H
//Boruch Hashem
//Blessed is He

import { renderDesktopSurface } from "../desktopSurface.js";
import { YesodObservationFacade } from "./YesodObservationFacade.js";
import { installOsListeners, routeOsInput, showOsDesktopContext } from "./osDesktopInput.js";
import { addOsWindow } from "./osWindowRuntime.js";
import {
	createOsFile,
	createOsFolder,
	recordOsVfsMutation,
	refreshOsRemoteDrives,
	showOsFilesAtPath,
	updateOsDefaultProgram
} from "./osWorkspaceRuntime.js";

/**
 * @file Malchus workspace facade preserving the historical Geelooy OS interaction contract.
 * @description
 * The Awtsmoos, Atzmus beyond every finite division, renews files, windows, input,
 * and the desktop surface from one source. Awtsmoos.com lets those visible vessels
 * meet through this small Malchus facade without depending on a vanished renderer.
 * This module coordinates manifestation; it does not own rendering or storage internals.
 */
export class MalchusWorkspaceFacade extends YesodObservationFacade {
	/** @returns {*} Listener installation result for this workspace. */
	listeners() {
		return installOsListeners(this);
	}

	/** @param {Event} event Desktop context event. @returns {*} Context result. */
	desktopContext(event) {
		return showOsDesktopContext(this, event);
	}

	/** @param {object} options Window options. @returns {*} Created OS window. */
	addWindow(options) {
		return addOsWindow(this, options);
	}

	/** @param {string} type Input type. @param {object} data Input payload. @returns {*} Route result. */
	input(type, data = {}) {
		return routeOsInput(this, type, data);
	}

	/** @returns {*} Remote-drive refresh result. */
	refreshRemoteDrives() {
		return refreshOsRemoteDrives(this);
	}

	/** @param {object} request File request. @returns {*} File creation result. */
	createFile(request) {
		return createOsFile(this, request);
	}

	/** @param {object} request Folder request. @returns {*} Folder creation result. */
	createFolder(request) {
		return createOsFolder(this, request);
	}

	/** @param {string} extension Extension key. @param {string} programName Program id. @returns {*} Update result. */
	updateDefaultProgram(extension, programName) {
		return updateOsDefaultProgram(this, extension, programName);
	}

	/** @returns {*} Canonical desktop-surface render result. */
	renderDesktop() {
		return renderDesktopSurface(this);
	}

	/** @param {object} request Path request. @returns {*} File-view result. */
	showFilesAtPath(request) {
		return showOsFilesAtPath(this, request);
	}

	/** @param {object} event VFS mutation event. @returns {*} Recording result. */
	recordVfsMutation(event) {
		return recordOsVfsMutation(this, event);
	}
}
