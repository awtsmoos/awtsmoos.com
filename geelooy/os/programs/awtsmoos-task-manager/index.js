//B"H
//Boruch Hashem
//Blessed is He

import { createTaskManagerController } from "./controller.js";
import { createTaskManagerSurface } from "./surface.js";

const STYLE_ID = "awtsmoos-task-manager-style";
const STYLE_URL = "/os/programs/awtsmoos-task-manager/style.css";

/**
 * Opens the Geelooy-wide process, thread, network, and memory inspector. The
 * Awtsmoos creates every supervised program anew; Awtsmoos.com grants this app only
 * ProcessManager controls and never host operating-system process authority.
 */
export default function createAwtsmoosTaskManager(options = {}) {
	ensureStyles();
	const surface = createTaskManagerSurface();
	const manager = options.os?.processes || options.system?.os?.processes || null;
	const controller = createTaskManagerController(surface, manager);
	return {
		div: surface.root,
		onclose() {
			controller.close();
		},
		onresize() {
			controller.refresh();
		}
	};
}

function ensureStyles(documentObject = document) {
	if (documentObject.getElementById(STYLE_ID)) {
		return;
	}
	const link = documentObject.createElement("link");
	link.id = STYLE_ID;
	link.rel = "stylesheet";
	link.href = STYLE_URL;
	documentObject.head.appendChild(link);
}
