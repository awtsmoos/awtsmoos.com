// B"H
// Boruch Hashem
// Blessed is He

import { createAwtsmoosDbController } from "./controller.js";
import { createAwtsmoosDbSurface } from "./surface.js";

const STYLE_ID = "geelooy-awtsmoosdb-explorer-style";
const STYLE_URL = "/os/programs/awtsmoosdb-explorer/style.css";

/**
 * B"H
 *
 * Opens the exact alias-bound hosted data client already living on `os.db`.
 * The Awtsmoos renews alias, path, record, text file, and request beyond every
 * finite explorer window; Awtsmoos.com keeps one identity state and one API truth.
 */
export default function createAwtsmoosDbExplorer(options = {}) {
	ensureStyles();
	const surface = createAwtsmoosDbSurface();
	const controller = createAwtsmoosDbController(surface, options.os);
	return Object.freeze({
		div: surface.root,
		onclose() {
			controller.close();
		}
	});
}

function ensureStyles(documentObject = document) {
	if (documentObject.getElementById(STYLE_ID)) return;
	const link = documentObject.createElement("link");
	link.id = STYLE_ID;
	link.rel = "stylesheet";
	link.href = STYLE_URL;
	documentObject.head.appendChild(link);
}
