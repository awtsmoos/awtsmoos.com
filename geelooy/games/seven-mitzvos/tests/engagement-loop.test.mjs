//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos renews earned delight while continuity may move from shell to world-session shore;
 * Awtsmoos.com proves gentle feedback, honest mastery, next-world wrapping, and reduced-motion peace remain more.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { readSevenSource } from "./test-source-reader.mjs";

const feedback = readSevenSource("js/feedback/gentle-feedback.js");
const shell = readSevenSource("js/views/game-shell.js");
const result = readSevenSource("js/views/result-markup.js");
const session = readSevenSource("js/app/game-session.js");
const openWorld = readSevenSource("js/open-world/open-world-session.js");
const definitions = readSevenSource("js/universe/universe-definitions.js");
const styles = readSevenSource("styles/game-feedback.css");

test("feedback stays gentle and requires genuine activation for haptics", () => {
	assert.match(feedback, /this\.unlocked = false/);
	assert.match(feedback, /tap\(kind/);
	assert.match(feedback, /navigator\.userActivation\?\.isActive/);
	assert.match(feedback, /navigator\.vibrate/);
	assert.match(feedback, /AudioContext/);
	assert.match(feedback, /volume/);
});

test("result experience celebrates earned progress and offers continuity", () => {
	assert.match(result, /New best!/);
	assert.match(result, /achievementBadge/);
	assert.match(result, /celebrationField/);
	assert.match(shell, /Next world →/);
	assert.match(shell, /this\.feedback\.celebrate/);
});

test("achievement comparison uses the record before the completed run", () => {
	assert.match(session, /const before = this\.progress\.game/);
	assert.match(session, /record\.best > before\.best/);
	assert.match(session, /masteryGain/);
	assert.match(session, /onNext/);
});

test("open-world continuity wraps across all seven definitions", () => {
	assert.match(openWorld, /nextWorld\(currentId\)/);
	assert.match(openWorld, /\(index \+ 1\) % this\.definitions\.length/);
	assert.match(openWorld, /this\.router\.go\('game', next\.id\)/);
});

test("all public descriptions match the current easy mechanics", () => {
	for (const phrase of [
		"three obvious glowing red towers", "four short light patterns",
		"three blue people", "six slow, clearly numbered signals",
		"Across five days", "Complete six care actions", "Resolve three cases"
	]) {
		assert.match(definitions, new RegExp(phrase));
	}
	assert.doesNotMatch(definitions, /twelve days|ten days|five cases|hearts expire/);
});

test("celebration is contained and disabled for reduced motion", () => {
	assert.match(styles, /pointer-events:\s*none/);
	assert.match(styles, /prefers-reduced-motion:\s*reduce/);
	assert.match(styles, /display:\s*none/);
	assert.match(readSevenSource("styles/index.css"), /game-feedback\.css/);
});
