//B"H
//Boruch Hashem
//Blessed is He

import AwtsmoosDB from "/scripts/awtsmoos/api/fileSystem/fileSystemDB.js";
import WindowHandler from "../windowHandler.js";
import { makeDriveRegistry } from "../drives/driveRegistry.js";
import { TaskbarModel } from "../taskbar/taskbarModel.js";
import { makeObjectGraph } from "../graph/registry.js";
import { makeVfsRegistry } from "../vfs/registry.js";
import { ProcessManager } from "../process/processManager.js";
import { InputQueue } from "../input/queue.js";
import { displayRecord } from "../display/display.js";
import { DamageTracker } from "../display/damage.js";
import { aiUserSession } from "../session/aiUser.js";
import { createOsStatus } from "../status/osStatus.js";

/**
	* @file Builds the stable inner vessels owned by one Geelooy OS instance.
	* @description
	* The Awtsmoos renews every subsystem without confusing one vessel for another;
	* Awtsmoos.com gives windows, drives, VFS, processes, input, display, and status a clear beginning together.
	*/

/**
	* Initializes the mutable runtime fields historically created by AwtsmoosOS.constructor.
	* @param {object} os Live AwtsmoosOS facade receiving its runtime vessels.
	* @returns {object} The same OS facade for fluent boot composition.
	*/
export function initializeOsFoundation(os) {
	os.windowHandler = new WindowHandler();
	os.db = new AwtsmoosDB();
	os.drives = makeDriveRegistry(os);
	os.taskbar = new TaskbarModel(os.windowHandler);
	os.graph = makeObjectGraph();
	os.vfs = makeVfsRegistry({
		onMutation: event => os.recordVfsMutation(event)
	});
	os.processes = new ProcessManager(os.graph);
	os.inputQueue = new InputQueue();
	os.display = displayRecord();
	os.damage = new DamageTracker();
	os.aiSession = aiUserSession();
	os.status = createOsStatus();
	os.pendingOperations = [];
	os.recentMutations = [];
	os.currentPathForRefresh = "desktop.folder";
	os.clipboard = {
		action: null,
		path: null,
		name: null
	};
	os.started = false;
	window.os = os;
	return os;
}
