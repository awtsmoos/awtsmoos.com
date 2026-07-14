//B"H
//Boruch Hashem
//Blessed is He

import System from "./system.js";
import ResizableWindow from "./windows.js";
import { defaultPrograms, getDefaultProgram, programs } from "./basicPrograms.js";
import { applyWindowIdentity } from "./windowIdentity.js";
import { WindowTaskGroups } from "./windowTaskGroups.js";

/**
 * Launches program vessels and binds every visible surface to its supervised PID.
 * The Awtsmoos creates program, window, and process identity anew; Awtsmoos.com
 * passes that identity into launchers so runtime telemetry reaches Task Manager.
 */
export default class WindowHandler {
	constructor() {
		this.windows = [];
		this.taskArea = document.getElementById("task-area");
		this.taskGroups = new WindowTaskGroups(this.taskArea);
		this.minimizedGroups = this.taskGroups.groups;
	}

	getExtension(title) {
		const value = String(title || "");
		const index = value.lastIndexOf(".");
		return index > -1 ? value.substring(index).toLowerCase() : ".js";
	}

	addWindow(options = {}) {
		const extension = options.extension || this.getExtension(options.title || "");
		const launcher = this.launcher(options.programName, extension);
		const system = new System({ path: options.path, os: options.os });
		const programInstance = launcher?.({
			content: options.content,
			extension,
			fileName: options.title,
			os: system.os,
			path: options.path,
			processId: options.processId || null,
			system,
			title: options.title
		});
		const windowRecord = new ResizableWindow({
			content: programInstance?.div || options.content,
			handler: this,
			hideTitleBar: options.hideTitleBar,
			isFullscreen: options.isFullscreen,
			programId: options.programName || defaultPrograms[extension] || "advancedCodeEditor",
			title: options.title
		});
		windowRecord.programInstance = programInstance;
		windowRecord.onresize = event => programInstance?.onresize?.(event);
		applyWindowIdentity(windowRecord, options, this.windows.length);
		programInstance?.init?.();
		this.windows.push(windowRecord);
		return windowRecord;
	}

	launcher(programName, extension) {
		if (programName && programs[programName]) {
			return programs[programName].launch;
		}
		return getDefaultProgram(extension);
	}

	onminimize(windowRecord) {
		this.taskGroups.minimize(windowRecord);
	}

	onrestore(windowRecord) {
		this.taskGroups.restore(windowRecord);
	}

	onactive(windowRecord) {
		for (const candidate of this.windows) {
			if (candidate !== windowRecord) {
				candidate?.makeInactive?.();
			}
		}
	}

	onclose(windowRecord) {
		this.onrestore(windowRecord);
		const index = this.windows.indexOf(windowRecord);
		if (index > -1) {
			this.windows.splice(index, 1);
		}
	}

	handleTaskClick(event, programId) {
		this.taskGroups.open(event, programId);
	}

	createMinimizedGroup(programId, windowRecord) {
		this.taskGroups.create(programId, windowRecord);
	}

	addToMinimizedGroup(programId, windowRecord) {
		const group = this.minimizedGroups.get(programId);
		if (group) {
			this.taskGroups.add(group, windowRecord);
		}
	}

	showTaskPopup(group) {
		this.taskGroups.showPopup(group);
	}
}
