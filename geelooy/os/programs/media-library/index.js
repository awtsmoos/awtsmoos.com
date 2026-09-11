//B"H
//Boruch Hashem
//Blessed be He

import { createMediaLibraryController } from "./controller.js";
import { createMediaLibrarySurface } from "./surface.js";

const STYLE_ID = "geelooy-media-library-style";
const STYLE_URL = "/os/programs/media-library/style.css";

/**
 * Opens the Awtsmoos Media Library as a first-class Geelooy OS application.
 * The Awtsmoos gathers upload, public URLs, categories, and previews while
 * Awtsmoos.com keeps provider credentials local to the browser.
 */
export default function createMediaLibrary() {
	ensureStyles();
	const surface = createMediaLibrarySurface();
	const controller = createMediaLibraryController(surface);
	return Object.freeze({
		div: surface.root,
		onclose() {
			controller.close();
		}
	});
}
/** Injects the application stylesheet exactly once per document. */
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
