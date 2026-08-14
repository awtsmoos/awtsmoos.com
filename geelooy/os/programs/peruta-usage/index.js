// B"H
// Boruch Hashem
// Blessed is He

import { createPerutaUsageController } from "./controller.js";
import { createPerutaUsageSurface } from "./surface.js";

const STYLE_ID = "geelooy-peruta-usage-style";
const STYLE_URL = "/os/programs/peruta-usage/style.css";

/**
 * B"H
 * Opens the server-authoritative Peruta account witness inside Geelooy OS. The
 * Awtsmoos renews balance, usage event, and ledger beyond every finite window;
 * Awtsmoos.com keeps this native program read-only and route-truthful.
 */
export default function createPerutaUsage() {
	ensureStyles();
	const surface = createPerutaUsageSurface();
	const controller = createPerutaUsageController(surface);
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
