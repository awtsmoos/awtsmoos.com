//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Shabbos Mode — public facade.
 * @description One import for everything: time detection, stylesheets, HTML
 * transform, and client script. Shabbos Mode makes any page still, warm, and
 * beautiful: no motion, no interaction, fully usable without JavaScript,
 * print-ready for those who print before Shabbos.
 *
 * Quick start:
 *   import { renderShabbosPage, getShabbosWindow } from "./index.mjs";
 *   const html = renderShabbosPage(pageHtml, { lat: 31.7683, lon: 35.2137, utcOffsetMin: 180 });
 */

export { DEFAULTS, STORAGE_KEY, HTML_CLASS } from "./SPEC.mjs";
export { deg2rad, rad2deg, sunsetUTCms, getShabbosWindow } from "./times.mjs";
export { shabbosCss, printCss } from "./css.mjs";
export {
	addShabbosClass,
	expandDetails,
	stripScripts,
	injectStyle,
	insertNotice,
	applyShabbosHtml,
} from "./html.mjs";
export { shabbosClientScript } from "./script.mjs";

import { applyShabbosHtml } from "./html.mjs";
import { DEFAULTS } from "./SPEC.mjs";

/**
 * Render a full Shabbos page from source HTML.
 * @param {string} html Full HTML document.
 * @param {object} [opts] ShabbosOptions (see SPEC.mjs).
 * @returns {string} Shabbos-transformed HTML.
 */
export function renderShabbosPage(html, opts = {}) {
	return applyShabbosHtml(html, Object.assign({}, DEFAULTS, opts));
}
