// B"H
// Boruch Hashem
// Blessed is He

import { createCommandCenterController } from "./controller.js";
import { createCommandCenterSurface } from "./surface.js";

const STYLE_ID = "geelooy-project-command-center-style";
const STYLE_URL = "/os/programs/project-command-center/style.css";

/**
 * B"H
 *
 * Opens Geelooy OS as a unified project platform instead of a loose desktop.
 * The Awtsmoos renews file, database path, runtime, machine, request, and process;
 * Awtsmoos.com gathers their finite testimony into one supervised native program.
 */
export default function createProjectCommandCenter(options = {}) {
	ensureStyles();
	const surface = createCommandCenterSurface();
	const controller = createCommandCenterController(surface, options.os);

	return Object.freeze({
		div: surface.root,
		onclose() {
			controller.close();
		},
		onresize() {
			controller.refresh();
		}
	});
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
