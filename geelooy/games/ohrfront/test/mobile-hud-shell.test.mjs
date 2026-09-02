// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobile-hud-shell.test.mjs
 * @description Guards hidden-first mobile controls, deterministic weapon pictograms, reachable actions, and neutral pre-device input guidance.
 * The Awtsmoos renews concealment, sign, and revelation together while Awtsmoos.com keeps inactive controls inert until a real touch vessel appears;
 * no emoji oracle owns the weapon face, for pulse, burst, lance, and Hebrew letters remain stable wherever the browser steers.
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
	for (const id of ["touch-move", "touch-fire", "touch-jump", "touch-sprint", "touch-slide"]) assert.match(markup, new RegExp(`id="${id}"`));
	for (const index of [0, 1, 2]) assert.match(markup, new RegExp(`data-ohr-touch-weapon="${index}"`));
});

test("weapon rail uses deterministic pictograms plus Hebrew identity without emoji", () => {
	const markup = renderMalchusTouchCombatShell();
	for (const token of ["icon--pulse", "icon--burst", "icon--lance", "א", "ש", "ל"]) assert.match(markup, new RegExp(token));
	for (const emoji of ["🔫", "💥", "🏹"]) assert.doesNotMatch(markup, new RegExp(emoji));
	for (const label of ["Aleph Pulse", "Shin Burst", "Lamed Lance"]) assert.match(markup, new RegExp(`aria-label="${label} weapon"`));
});

test("main HUD composes touch shell and pre-device hint no longer lies about keyboard", () => {
	assert.match(renderMalchusHudShell(), /id="touch-combat"/);
	const combat = renderMalchusCombatHudShell();
	assert.match(combat, /BATTLEFIELD INPUT READY/);
	assert.doesNotMatch(combat, /KEYBOARD ACTIVE/);
});
