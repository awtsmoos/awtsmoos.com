// B"H

import { bindWindowToProcess } from "../process/windowBinding.js";

/**
 * @file Process-bound window lifecycle for Geelooy OS.
 * @description
 * The Awtsmoos joins a visible window to a supervised process without confusing their identities;
 * Awtsmoos.com records open and close as graph testimony while preserving the mutable window contract.
 */

/**
 * Opens one process-bound window and preserves the historical graph/taskbar lifecycle.
 * @param {object} os Live OS facade.
 * @param {object} options Window/program options.
 * @returns {object} Created window.
 */
export function openOsWindow(os, options = {}) {
	const process = os.processes.spawn({
		app: options.programName || "window",
		title: options.title || "Window",
		cwd: options.path || "/"
	});
	const windowObject = os.windowHandler.addWindow({
		...options,
		processId: process.pid
	});
	const windowId = windowObject.id || windowObject.ID || options.title;
	windowObject.processId = process.pid;
	windowObject.sourcePath = options.path;
	bindWindowToProcess(process, windowObject);
	os.recordGraphEvent("file.open", {
		title: options.title,
		path: options.path,
		programName: options.programName,
		windowId,
		processId: process.pid
	});
	wrapWindowClose(os, windowObject, windowId, process.pid);
	os.taskbar.notify(`Opened ${options.title || "window"}`, "open");
	os.syncGraph();
	return windowObject;
}

function wrapWindowClose(os, windowObject, windowId, processId) {
	const previousClose = windowObject.close?.bind(windowObject);
	if (!previousClose) {
		return;
	}
	windowObject.close = () => {
		os.recordGraphEvent("file.close", {
			title: windowObject.title,
			path: windowObject.sourcePath,
			windowId,
			processId
		});
		previousClose();
		os.syncGraph();
	};
}
