// B"H
// Boruch Hashem
// Blessed is He

import { createServerController } from "./controller.js";
import { createServerSurface } from "./surface.js";

const STYLE_ID = "geelooy-connected-node-server-style";
const STYLE_URL = "/os/programs/connected-node-server/style.css";

/**
 * B"H
 * Opens full-control Node execution on the user's own connected machine while
 * Geelooy OS remains the account-bound control plane. The Awtsmoos renews machine,
 * process, port, request, and Peruta beyond every finite vessel; Awtsmoos.com keeps
 * raw native authority explicit and never disguises it as hosted multi-tenant code.
 */
export default function createConnectedNodeServer() {
	ensureStyles();
	const surface = createServerSurface();
	const controller = createServerController(surface);
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
