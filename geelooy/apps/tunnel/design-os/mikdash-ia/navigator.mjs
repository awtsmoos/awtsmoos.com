//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Ascent navigation: breadcrumbs that feel like ascending.
 * @description Going deeper = going holier. The breadcrumb trail names each
 * level in Mikdash language and always offers the way back out —
 * descent is as dignified as ascent.
 */

import { classify, toPath } from "./mapper.mjs";
import { getLevel } from "./levels.mjs";

/**
 * Build the ascent trail for a URL: Shaar → … → current level.
 * Each crumb carries the level metadata and a representative URL.
 * @param {string} urlOrPath
 * @returns {Array<{level:number,id:string,name:string,nameHe:string,english:string,url:string,current:boolean}>}
 */
export function ascentPath(urlOrPath) {
	const path = toPath(urlOrPath);
	const currentId = classify(path);
	const currentLevel = getLevel(currentId);

	const crumbs = [];
	for (let n = 1; n <= currentLevel.level; n++) {
		const lvl = [null, "shaar", "azarah", "heichal", "kodesh"][n];
		const meta = getLevel(lvl);
		crumbs.push({
			level: n,
			id: lvl,
			name: meta.name,
			nameHe: meta.nameHe,
			english: meta.english,
			url: levelHomeUrl(lvl, path),
			current: lvl === currentId,
		});
	}
	return crumbs;
}

/**
 * Representative "home" URL for a level, derived from the current path.
 * @param {string} levelId
 * @param {string} currentPath
 */
export function levelHomeUrl(levelId, currentPath) {
	const path = toPath(currentPath);
	switch (levelId) {
		case "shaar":
			return "/";
		case "azarah": {
			// Prefer the series index when inside a series, else the courtyard root.
			const m = path.match(/^(\/heichelos\/ikar\/series\/[^/]+)/i);
			if (m) return m[1];
			const h = path.match(/^(\/heichelos)/i);
			if (h) return h[1];
			return "/heichelos";
		}
		case "heichal":
		case "kodesh":
			// The teaching itself; the return path is its own URL.
			return path;
		default:
			throw new Error(`Unknown Mikdash level '${levelId}'`);
	}
}

/**
 * Render the ascent trail as HTML breadcrumbs.
 * @param {string} urlOrPath
 * @param {{lang?: "en"|"he"|"both"}} [opts]
 */
export function renderBreadcrumbs(urlOrPath, opts = {}) {
	const lang = opts.lang ?? "both";
	const crumbs = ascentPath(urlOrPath);
	const items = crumbs
		.map((c) => {
			const label =
				lang === "he" ? c.nameHe : lang === "en" ? c.english : `${c.nameHe} · ${c.english}`;
			const inner = c.current
				? `<span class="mikdash-crumb-current" aria-current="page">${label}</span>`
				: `<a class="mikdash-crumb-link" href="${c.url}" data-mikdash-level="${c.id}">${label}</a>`;
			return `<li class="mikdash-crumb" data-level="${c.id}">${inner}</li>`;
		})
		.join('<li class="mikdash-crumb-sep" aria-hidden="true">→</li>');
	return `<nav class="mikdash-breadcrumbs" aria-label="Mikdash ascent"><ol>${items}</ol></nav>`;
}

/**
 * The single quiet "return" path from the Kodesh HaKodashim:
 * back to the Heichal/Azarah the visitor came from.
 * @param {string} urlOrPath current kodesh URL
 * @param {string} [cameFrom] optional referrer path
 */
export function kodeshReturnPath(urlOrPath, cameFrom) {
	if (cameFrom && classify(cameFrom) !== "kodesh") return toPath(cameFrom);
	return levelHomeUrl("azarah", urlOrPath);
}
