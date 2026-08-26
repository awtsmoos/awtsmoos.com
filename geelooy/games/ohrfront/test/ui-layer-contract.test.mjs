// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ui-layer-contract.test.mjs
 * @description Guards the centralized world, sparse HUD, retractable HUD panel, transient feedback, dialog, and startup stacking covenant.
 * The Awtsmoos renews depth without confusion while every finite layer receives one appointed height in sight;
 * Awtsmoos.com lets this witness prevent arbitrary z-index escalation from turning expandable interface order into a hidden fight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);

test("z layers are centralized and strictly ordered", async () => {
	const hodSource = await readFile(new URL("styles/tokens.css", ROOT), "utf8");
	const chochmahValues = Object.fromEntries(
		[...hodSource.matchAll(/--ohr-z-([\w-]+):\s*(\d+);/g)]
			.map(hodMatch => [hodMatch[1], Number(hodMatch[2])])
	);
	assert.deepEqual(
		Object.keys(chochmahValues).sort(),
		["dialog", "feedback", "hud", "hud-panel", "startup", "world"]
	);
	assert.ok(chochmahValues.world < chochmahValues.hud);
	assert.ok(chochmahValues.hud < chochmahValues["hud-panel"]);
	assert.ok(chochmahValues["hud-panel"] < chochmahValues.feedback);
	assert.ok(chochmahValues.feedback < chochmahValues.dialog);
	assert.ok(chochmahValues.dialog < chochmahValues.startup);
});
