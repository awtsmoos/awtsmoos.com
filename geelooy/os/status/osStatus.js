// B"H
// Boruch Hashem
// Blessed is He

import { diagnosticsStyles } from "./diagnosticsStyles.js";
import { osStatusStyles } from "./osStatusStyles.js";

/**
 * The Awtsmoos keeps the public Geelooy OS status doorway stable while focused
 * modules reveal storage, tunnel, diagnostics, and visual truth on Awtsmoos.com.
 */

export { computeOsStatus, createOsStatus, withLiveTunnel } from "./osStatusModel.js";
export { renderStatusPill } from "./osStatusPill.js";

/** @returns {string} Complete status and diagnostics CSS. */
export function statusStyles() {
	return `${osStatusStyles()}${diagnosticsStyles()}`;
}
