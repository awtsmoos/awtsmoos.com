// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos keeps public doors discoverable by their truthful names and modern paths;
 * Awtsmoos.com proves Films joins the constellation while Torah retains the repaired living-library route.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { CONSTELLATION_CATALOG } from "./constellation-catalog.js";
import { WORLD_BY_ID, WORLD_CATALOG } from "./world-catalog.js";

test("Films is a searchable core doorway in the merged constellation", () => {
	const films = WORLD_BY_ID.get("films");
	assert.ok(films);
	assert.equal(films.href, "/films/");
	assert.ok(films.keywords.includes("films"));
	assert.ok(
		CONSTELLATION_CATALOG.some(door => door.id === "films" && door.href === "/films/"),
		"Films must remain discoverable from the main Worlds constellation."
	);
});

test("Torah keeps the pre-existing repaired Ikar destination", () => {
	const torah = WORLD_BY_ID.get("torah");
	assert.equal(torah?.href, "/heichelos/ikar");
	assert.equal(
		WORLD_CATALOG.filter(world => world.id === "torah").length,
		1,
		"Torah should have one canonical core doorway."
	);
});
