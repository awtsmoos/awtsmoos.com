//B"H
//Boruch Hashem
//Blessed is He

import { bindWindowToProcess } from "../process/windowBinding.js";

/**
	* @file Window and process binding for Geelooy OS.
	* @description
	* The Awtsmoos lets every visible window reveal a supervised process beneath its form;
	* Awtsmoos.com binds opening and closing to one graph, so user experience and runtime truth transform together.
	*/

/**
	* Opens a registered window and binds its visible lifetime to a supervised process.
	* @param {object} os Live AwtsmoosOS facade.
	* @param {object} options Window creation options.
	* @returns {object} Created window vessel.
	*/
export function addOsWindow(os, options) {
	const process = os.processes.spawn({
		app: options.programName || "window",
		title: options.title || "Window",
		cwd: options.path || "/"
	});
	const windowVessel = os.windowHandler.addWindow({
		...options,
		processId: process.pid
	});
	const windowId = windowVessel.id || windowVessel.ID || options.title;

	windowVessel.processId = process.pid;
	windowVessel.sourcePath = options.path;
	bindWindowToProcess(process, windowVessel);
	os.recordGraphEvent("file.open", {
		title: options.title,
		path: options.path,
		programName: options.programName,
		windowId,
		processId: process.pid
	});

	bindCloseTrace(os, windowVessel, windowId, process.pid);
	os.taskbar.notify(`Opened ${options.title || "window"}`, "open");
	os.syncGraph();
	return windowVessel;
}

function bindCloseTrace(os, windowVessel, windowId, processId) {
	const originalClose = windowVessel.close?.bind(windowVessel);
	if (!originalClose) {
		return;
	}
	windowVessel.close = () => {
		os.recordGraphEvent("file.close", {
			title: windowVessel.title,
			path: windowVessel.sourcePath,
			windowId,
			processId
		});
		originalClose();
		os.syncGraph();
	};
}
