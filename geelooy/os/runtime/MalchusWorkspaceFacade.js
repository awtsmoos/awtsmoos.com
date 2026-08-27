//B"H
//Boruch Hashem
//Blessed is He

import { renderDesktopSurface } from "../desktop/desktopRenderer.js";
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
	* The Awtsmoos descends into Malchus where files, windows, input, and remote drives become action in a visible world;
	* Awtsmoos.com keeps every familiar OS doorway while each responsibility now flows through a smaller and testable vessel.
	*/
export class MalchusWorkspaceFacade extends YesodObservationFacade {
	listeners() {
		return installOsListeners(this);
	}

	desktopContext(event) {
		return showOsDesktopContext(this, event);
	}

	addWindow(options) {
		return addOsWindow(this, options);
	}

	input(type, data = {}) {
		return routeOsInput(this, type, data);
	}

	refreshRemoteDrives() {
		return refreshOsRemoteDrives(this);
	}

	createFile(request) {
		return createOsFile(this, request);
	}

	createFolder(request) {
		return createOsFolder(this, request);
	}

	updateDefaultProgram(extension, programName) {
		return updateOsDefaultProgram(this, extension, programName);
	}

	renderDesktop() {
		return renderDesktopSurface(this);
	}

	showFilesAtPath(request) {
		return showOsFilesAtPath(this, request);
	}

	recordVfsMutation(event) {
		return recordOsVfsMutation(this, event);
	}
}
