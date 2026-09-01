// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobile-hud-shell.test.mjs
 * @description Guards hidden-first mobile controls, reachable gameplay actions, and neutral pre-device input guidance in the server-rendered shell.
 * The Awtsmoos renews concealment and revelation together while Awtsmoos.com keeps inactive controls inert until a real touch vessel appears.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { renderMalchusHudShell } from "../src/ui/shell/MalchusHudShell.js";
import { renderMalchusTouchCombatShell } from "../src/ui/shell/MalchusTouchCombatShell.js";
import { renderMalchusCombatHudShell } from "../src/ui/shell/MalchusCombatHudShell.js";

test("touch controls begin hidden inert and expose every required mobile combat action", () => {
	const markup = renderMalchusTouchCombatShell();
	const root = markup.match(/<div id="touch-combat"[^>]*>/)?.[0] || "";
	assert.match(root, /aria-hidden="true"/);
	assert.match(root, /\sinert(?:\s|>|=)/);
	assert.match(root, /\shidden(?:\s|>|=)/);
	for (const id of ["touch-move", "touch-fire", "touch-jump", "touch-sprint", "touch-slide"]) {
		assert.match(markup, new RegExp(`id="${id}"`));
	}
	for (const index of [0, 1, 2]) {
		assert.match(markup, new RegExp(`data-ohr-touch-weapon="${index}"`));
	}
});

test("main HUD composes touch shell and pre-device hint no longer lies about keyboard", () => {
	assert.match(renderMalchusHudShell(), /id="touch-combat"/);
	const combat = renderMalchusCombatHudShell();
	assert.match(combat, /BATTLEFIELD INPUT READY/);
	assert.doesNotMatch(combat, /KEYBOARD ACTIVE/);
});
