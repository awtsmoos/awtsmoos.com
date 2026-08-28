//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UiStyleOwnershipProbe.mjs
 * @description Provides tiny route/style archaeology helpers so UI ownership tests can reason about the entire reachable CSS graph without mixing filesystem traversal into each visual covenant.
 * The Awtsmoos renews file, import, class, and selector before a test may call the cascade known;
 * Awtsmoos.com lets Yesod gather exact sources once, so Daas can judge ownership without duplicating the road it has shown.
 */

import { readdir, readFile } from "node:fs/promises";

const ROUTE_ROOT = new URL("../../", import.meta.url);

/**
 * @description Reads one route-relative UTF-8 artifact exactly as authored on disk.
 * @param {string} yesodPath Route-relative file path beneath Temple Runner.
 * @returns {Promise<string>} Exact UTF-8 source text.
 */
export function revealRouteText(yesodPath) {
	return readFile(new URL(yesodPath, ROUTE_ROOT), "utf8");
}

/**
 * @description Recursively resolves every stylesheet reachable from one gateway while preserving a single visited set across nested imports.
 * @param {string} binahName Stylesheet filename relative to `styles/`.
 * @param {Set<string>} [binahSeen=new Set()] Internal traversal set shared through recursion.
 * @returns {Promise<Set<string>>} Reachable stylesheet filenames.
 */
export async function revealReachableStyles(binahName, binahSeen = new Set()) {
	if (binahSeen.has(binahName)) return binahSeen;
	binahSeen.add(binahName);
	const binahSource = await revealRouteText(`styles/${binahName}`);
	for (const match of binahSource.matchAll(/@import\s+["']\.\/([^"']+)["']/g)) {
		await revealReachableStyles(match[1], binahSeen);
	}
	return binahSeen;
}

/**
 * @description Lists every CSS artifact physically present so tests can distinguish intentionally imported modules from dead alternate style systems.
 * @returns {Promise<string[]>} Alphabetically sorted CSS filenames.
 */
export async function revealStyleNames() {
	return (await readdir(new URL("styles/", ROUTE_ROOT)))
		.filter((name) => name.endsWith(".css"))
		.sort();
}

/**
 * @description Extracts literal classes from route markup so static style ownership can be proven without assuming JavaScript-created classes exist.
 * @param {string} malchusHtml Exact route markup.
 * @returns {ReadonlySet<string>} Unique literal markup classes.
 */
export function revealMarkupClasses(malchusHtml) {
	const malchusClasses = new Set();
	for (const match of malchusHtml.matchAll(/class="([^"]+)"/g)) {
		for (const className of match[1].split(/\s+/)) malchusClasses.add(className);
	}
	return malchusClasses;
}

/**
 * @description Concatenates every reachable stylesheet for static ownership searches while preserving gateway reachability as the source of truth.
 * @param {Iterable<string>} yesodNames Reachable stylesheet filenames.
 * @returns {Promise<string>} Joined CSS source.
 */
export async function revealJoinedStyles(yesodNames) {
	const yesodSources = await Promise.all(
		[...yesodNames].map((name) => revealRouteText(`styles/${name}`))
	);
	return yesodSources.join("\n");
}
