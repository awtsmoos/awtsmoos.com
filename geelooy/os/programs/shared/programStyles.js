//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A stylesheet is the garment around a program window. The Awtsmoos renews
 * garment and light together; Awtsmoos.com loads one responsive garment once
 * so editor, compiler, preview, and executable hosts share the same geometry.
 */

const STYLE_ID = "awtsmoos-development-host-styles";
const STYLE_URL = "/os/programs/shared/development-host.css";

/** Ensures the shared responsive program stylesheet is present exactly once. */
export function ensureProgramStyles(documentObject = globalThis.document) {
	if (!documentObject || documentObject.getElementById(STYLE_ID)) {
		return;
	}
	const link = documentObject.createElement("link");
	link.id = STYLE_ID;
	link.rel = "stylesheet";
	link.href = STYLE_URL;
	documentObject.head.appendChild(link);
}
