//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives one living city its form without binding procedural truth to a borrowed renderer by decree;
 * Awtsmoos.com proves walkable discovery, portable core data, delegated encounters, and bounded animation remain free.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { readSevenSource } from "./test-source-reader.mjs";

const activeGames = [
	"false-powers-game",
	"words-creation-game",
	"every-life-game",
	"households-game",
	"honest-market-game",
	"living-sanctuary-game",
	"court-nations-game"
];

test("semantic core parts begin in renderer-neutral procedural geometry", () => {
	const cache = readSevenSource("js/procedural/core-part-geometry-cache.js");
	const factory = readSevenSource("js/procedural/core-part-factory.js");
	assert.match(cache, /generateProceduralGeometry/);
	assert.match(cache, /renderData\(profile\)/);
	assert.doesNotMatch(cache, /createProceduralThreeMesh|three\.module\.js|THREE\./);
	assert.match(factory, /geometryCache\.renderData/);
	assert.doesNotMatch(factory, /createProceduralThreeMesh/);
});

test("semantic library exposes recognizable low-poly world objects", () => {
	const source = readSevenSource("js/procedural/semantic-asset-factory.js");
	for (const method of [
		"person", "animal", "house", "tower", "stall", "court",
		"tree", "rune", "evidence", "hazard", "shelter"
	]) {
		assert.ok(
			source.includes(`\t${method}(options)`),
			`Missing semantic asset: ${method}`
		);
	}
});

test("living hub owns one disposable city with seven districts", () => {
	const stage = readSevenSource("js/city/living-city-stage.js");
	const builder = readSevenSource("js/city/city-district-builder.js");
	assert.match(stage, /new WebglStage/);
	assert.match(stage, /this\.stage\?\.destroy\(\)/);
	assert.match(builder, /definitions\.forEach/);
	assert.match(builder, /semanticType: 'district'/);
	assert.match(builder, /progress\.game/);
});

test("hub exposes walkable guidance, nearby context, and explicit interaction", () => {
	const template = readSevenSource("js/app/app-template.js");
	for (const id of [
		"cityStage", "guideMessage", "dailyMission", "difficultyMode",
		"cityLight", "worldContext", "worldInteract"
	]) {
		assert.match(template, new RegExp(`id=\\"${id}\\"`));
	}
	assert.match(template, /worldTouchControls/);
	assert.doesNotMatch(template, /id="mitzvahGrid"/);
});

test("progress remembers city light, rescued names, and daily variety", () => {
	const source = readSevenSource("js/universe/universe-progress.js");
	assert.match(source, /rescuedNames/);
	assert.match(source, /this\.data\.city\.light/);
	assert.match(source, /this\.data\.daily\.worlds/);
	assert.match(source, /worlds\.length >= 3/);
	assert.match(source, /result\.memories/);
});

test("active game controllers avoid direct renderer primitive dependencies", () => {
	for (const name of activeGames) {
		const source = readSevenSource(`js/games3d/${name}.js`);
		assert.match(source, /export class [A-Za-z]+Game extends /);
		assert.match(source, /setup\(\)/);
		assert.doesNotMatch(source, /three\.module\.js|\bTHREE\./);
	}
});

test("city animation remains bounded to transforms and cached portable geometry", () => {
	const parts = readSevenSource("js/procedural/core-part-geometry-cache.js");
	const city = readSevenSource("js/city/city-district-builder.js");
	assert.match(parts, /renderDataByProfile\.get/);
	assert.match(city, /position\.y =/);
	assert.doesNotMatch(city, /new WebglStage/);
	assert.doesNotMatch(city, /requestAnimationFrame/);
});
