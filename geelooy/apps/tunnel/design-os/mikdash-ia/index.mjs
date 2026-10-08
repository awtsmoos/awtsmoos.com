//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Main entry for the Beis Hamikdash Information Architecture.
 * @description Classify any awtsmoos.com URL into its Mikdash level,
 * get its ascent trail, its theme, and its kavanah requirements —
 * one import, everything needed to render the ascent.
 *
 *   import { mikdash } from "./index.mjs";
 *   const m = mikdash("https://awtsmoos.com/heichelos/ikar/series/tanya/post/abc");
 *   // m.level.id === "kodesh", m.kavanahRequired === true, ...
 */

export { LEVELS, SHAAR, AZARAH, HEICHAL, KODESH_HAKODASHIM, getLevel, getLevelByNumber, isAscent, chromeBudget } from "./levels.mjs";
export { KODESH_SERIES, KODESH_POSTS, KODESH_PATTERNS, isKodeshPath, registrySize } from "./kodeshRegistry.mjs";
export { classify, depthOf, toPath, isAscentUrl } from "./mapper.mjs";
export { ascentPath, levelHomeUrl, renderBreadcrumbs, kodeshReturnPath } from "./navigator.mjs";
export { themeDsl, tokens, themeCssVars, THEME_DSL_BY_LEVEL, TOKENS } from "./themes.mjs";
export { requiresKavanah, renderKavanahGate, passedKavanah, kavanahKey, KAVANAH_CLIENT_JS } from "./kavanah.mjs";

import { classify, depthOf } from "./mapper.mjs";
import { getLevel, chromeBudget } from "./levels.mjs";
import { ascentPath, renderBreadcrumbs, kodeshReturnPath } from "./navigator.mjs";
import { themeDsl, tokens, themeCssVars } from "./themes.mjs";
import { requiresKavanah } from "./kavanah.mjs";

/**
 * Full Mikdash context for a URL.
 * @param {string} urlOrPath
 * @returns {{
 *   level: object, depth: number, chromeBudget: number,
 *   trail: Array, breadcrumbsHtml: string,
 *   themeDsl: string, tokens: object, cssVars: string,
 *   kavanahRequired: boolean, returnPath: string|null
 * }}
 */
export function mikdash(urlOrPath) {
	const levelId = classify(urlOrPath);
	const level = getLevel(levelId);
	const kavanahRequired = requiresKavanah(urlOrPath);
	return {
		level,
		depth: depthOf(urlOrPath),
		chromeBudget: chromeBudget(levelId),
		trail: ascentPath(urlOrPath),
		breadcrumbsHtml: renderBreadcrumbs(urlOrPath),
		themeDsl: themeDsl(levelId),
		tokens: tokens(levelId),
		cssVars: themeCssVars(levelId),
		kavanahRequired,
		returnPath: levelId === "kodesh" ? kodeshReturnPath(urlOrPath) : null,
	};
}
