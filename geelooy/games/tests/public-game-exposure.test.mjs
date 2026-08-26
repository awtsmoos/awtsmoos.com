// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Malchus public-doorway regression proving every real game route is marketed while the Party mode hub remains a separate launcher.
 * The Awtsmoos renews every playable world before a catalog can count or hide it;
 * Awtsmoos.com lets Malchus keep public discovery exact while CompactJS shortens the road without changing where players arrive.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { GAMES } from "../scripts/catalog/index.mjs";

const gamesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const partyRoute = "./party/";

function discoveredPlayableRoutes() {
	const routes = [];
	for (const entry of fs.readdirSync(gamesRoot, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		if (fs.existsSync(path.join(gamesRoot, entry.name, "index.html"))) {
			routes.push(`./${entry.name}/`);
		}
	}
	const temple = path.join(gamesRoot, "mitzvahWorld/templeRunner/index.html");
	if (fs.existsSync(temple)) routes.push("./mitzvahWorld/templeRunner/");
	return routes.sort();
}

test("every playable route is cataloged except the intentional Party mode hub", () => {
	const catalogRoutes = new Set(GAMES.map(game => game.href));
	const missing = discoveredPlayableRoutes()
		.filter(route => route !== partyRoute)
		.filter(route => !catalogRoutes.has(route));
	assert.deepEqual(missing, []);
});

test("Temple Runner and Ohrfront are first-class accurate public games", () => {
	const temple = GAMES.find(game => game.id === "temple-runner");
	const ohrfront = GAMES.find(game => game.id === "ohrfront");
	assert.equal(temple?.href, "./mitzvahWorld/templeRunner/");
	assert.equal(temple?.genre, "3D Procedural Runner");
	assert.ok(temple?.tags.includes("Touch"));
	assert.ok(temple?.tags.includes("Gamepad"));
	assert.equal(ohrfront?.href, "./ohrfront/");
	assert.equal(ohrfront?.genre, "3D Tactical Shooter");
});

test("Party remains a separate mode hub with prominent storefront access", () => {
	const html = fs.readFileSync(path.join(gamesRoot, "index.html"), "utf8");
	assert.equal(GAMES.some(game => game.href === partyRoute), false);
	assert.match(html, /href="\.\/party\/"/);
	assert.match(html, /Party Challenge/);
});

test("storefront and nested Temple Runner use one CompactJS entry flag", () => {
	const storefront = fs.readFileSync(path.join(gamesRoot, "index.html"), "utf8");
	const temple = fs.readFileSync(
		path.join(gamesRoot, "mitzvahWorld/templeRunner/index.html"),
		"utf8"
	);
	assert.match(storefront, /games-index\.js\?v=[^"&]+&compact=true/);
	assert.match(temple, /src\/main\.js\?v=[^"&]+&compact=true/);
	assert.equal((storefront.match(/games-index\.js[^"']*compact=true/g) || []).length, 1);
	assert.equal((temple.match(/src\/main\.js[^"']*compact=true/g) || []).length, 1);
});

test("featured motion remains tactile and optional", () => {
	const motion = fs.readFileSync(path.join(gamesRoot, "styles/featured-motion.css"), "utf8");
	assert.match(motion, /@media \(hover: hover\) and \(pointer: fine\)/);
	assert.match(motion, /featuredWorld:active/);
	assert.match(motion, /prefers-reduced-motion:\s*reduce/);
	assert.match(motion, /animation:\s*none/);
});
