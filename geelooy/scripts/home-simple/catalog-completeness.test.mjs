// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals every legitimate doorway without letting one vanish from memory;
 * Awtsmoos.com tests the filesystem against its public catalogs so hidden worlds cannot silently return.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PUBLIC_APPS } from "../../apps/scripts/catalog/index.mjs";
import { GAMES } from "../../games/scripts/catalog/index.mjs";
import { CONSTELLATION_CATALOG } from "./constellation-catalog.js";

const AUXILIARY_GAME_ROUTES = new Set(["party"]);

function launchableDirectories(baseDirectory) {
	return fs.readdirSync(baseDirectory, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.filter(entry => fs.existsSync(path.join(baseDirectory, entry.name, "index.html")))
		.map(entry => entry.name)
		.sort();
}

function firstRelativeSegments(catalog) {
	return new Set(
		catalog
			.map(item => String(item.href || ""))
			.filter(href => href.startsWith("./"))
			.map(href => href.slice(2).split("/")[0])
			.filter(Boolean)
	);
}

function missingDirectories(baseDirectory, catalog, exclusions = new Set()) {
	const catalogRoots = firstRelativeSegments(catalog);
	return launchableDirectories(baseDirectory).filter(directory => {
		return !catalogRoots.has(directory) && !exclusions.has(directory);
	});
}

const missingApps = missingDirectories("./apps", PUBLIC_APPS);
const missingGames = missingDirectories("./games", GAMES, AUXILIARY_GAME_ROUTES);

assert.deepEqual(missingApps, [], `Unpublished first-level apps: ${missingApps.join(", ")}`);
assert.deepEqual(missingGames, [], `Unpublished first-level games: ${missingGames.join(", ")}`);
assert.ok(
	CONSTELLATION_CATALOG.some(door => door.href === "/apps/captions/"),
	"Ein Sof Caption Engine must be discoverable from main."
);
assert.ok(
	CONSTELLATION_CATALOG.some(door => door.href === "/games/adventure/"),
	"Adventure must be discoverable from main."
);
assert.ok(
	CONSTELLATION_CATALOG.some(door => door.href === "/games/ohrbound/"),
	"Ohrbound must be discoverable from main."
);

console.log(
	`B\"H — catalog complete: ${CONSTELLATION_CATALOG.length} main doors, ${PUBLIC_APPS.length} app records, ${GAMES.length} canonical games.`
);
