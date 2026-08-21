//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos renews seven teachings while the walkable city becomes their living gate;
 * Awtsmoos.com proves content, routes, catalog truth, builder vessels, and public discovery remain whole as ownership changes state.
 */

import assert from "node:assert/strict";
import { BUILDINGS } from "../js/data/buildings.js";
import { FOUNDATIONS } from "../js/data/foundations.js";
import { MITZVOS } from "../js/data/mitzvos.js";
import { SCENARIOS } from "../js/data/scenarios.js";
import { UNIVERSE_GAMES } from "../js/universe/universe-definitions.js";
import { GAME_REGISTRY } from "../js/universe/universe-registry.js";
import {
	readRepositorySource,
	readSevenSource
} from "./test-source-reader.mjs";

const indexHtml = readSevenSource("index.html");
const appTemplate = readSevenSource("js/app/app-template.js");
const gridView = readSevenSource("js/views/mitzvah-grid.js");
const detailView = readSevenSource("js/views/detail-panel.js");
const gameRegistry = readSevenSource("js/games3d/game-registry.js");
const builderTemplate = readSevenSource("js/ui/builder-template.js");
const gamesDoorway = readRepositorySource("games/scripts/games-list.js");
const gamesCatalog = readRepositorySource("games/scripts/catalog/originals-worlds.mjs");

assert.equal(MITZVOS.length, 7);
assert.equal(FOUNDATIONS.length, 7);
assert.equal(UNIVERSE_GAMES.length, 7);
assert.equal(Object.keys(GAME_REGISTRY).length, 7);
assert.equal(
	(gameRegistry.match(/:\s*[A-Z][A-Za-z]+Game/g) || []).length,
	7
);
assert.ok(SCENARIOS.length >= 21);
assert.ok(BUILDINGS.length >= 14);
assert.deepEqual(
	UNIVERSE_GAMES.map(record => {
		return record.title;
	}),
	MITZVOS.map(record => {
		return record.title;
	})
);
assert.deepEqual(
	FOUNDATIONS.map(record => {
		return record.exact;
	}),
	MITZVOS.map(record => {
		return record.title;
	})
);
for (const mitzvah of MITZVOS) {
	assert.ok(mitzvah.summary.length > 55);
	assert.ok(mitzvah.practice.length > 55);
	const scenarios = SCENARIOS.filter(item => {
		return item.mitzvah === mitzvah.number;
	});
	assert.ok(scenarios.length >= 3);
}
assert.match(indexHtml, /id="sevenMitzvosApp"/);
assert.match(gridView, /definition\.title/);
assert.match(detailView, /definition\.summary/);
assert.match(detailView, /definition\.practice/);
for (const id of [
	"hubLayer", "cityStage", "worldContext", "worldInteract",
	"gameLayer", "stageHost", "gameHud", "gameControls", "gameResult", "realmLayer"
]) {
	assert.ok(
		appTemplate.includes(`id="${id}"`),
		`Missing living-shell element ${id}.`
	);
}
assert.doesNotMatch(appTemplate, /id="mitzvahGrid"/);
for (const id of [
	"builderSection", "builderHud", "builderPalette", "builderGrid",
	"foundationLedger", "advanceDay", "resetCity"
]) {
	assert.ok(
		builderTemplate.includes(`id="${id}"`),
		`Missing preserved builder element ${id}.`
	);
}
assert.match(gamesDoorway, /from "\.\/catalog\/index\.mjs"/);
assert.match(gamesCatalog, /id: "seven-mitzvos"/);
assert.match(gamesCatalog, /title: "Seven Mitzvos"/);
assert.match(gamesCatalog, /href: "\.\/seven-mitzvos\/"/);
assert.match(gamesCatalog, /Seven distinct games plus a preserved scenario world and Covenant City builder/);
assert.match(gamesCatalog, /badge: "Seven Worlds"/);
console.log('B"H · Seven living-city content, catalog truth, and preserved systems verified.');
