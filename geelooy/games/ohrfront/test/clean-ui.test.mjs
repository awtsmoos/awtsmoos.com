// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file clean-ui.test.mjs
 * @description Guards Ohrfront's tiny host, deliberate shared player-shell bridge, modular local shell, sparse HUD, retractable INTEL, and stable runtime identifiers.
 * The Awtsmoos renews host and battlefield from one source while each finite layer keeps its appointed line;
 * Awtsmoos.com lets the platform shell frame the doorway without leaking its machinery into Ohrfront's local design.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { renderKeserOhrfrontShell } from "../src/ui/shell/KeserOhrfrontShellInstaller.js";

const ROOT = new URL("../", import.meta.url);
const REQUIRED_IDS = Object.freeze([
	"game-canvas", "startup-status", "startup-message", "hud", "objective", "difficulty", "bots", "objective-fill",
	"hud-intel-toggle", "hud-intel-panel", "hud-intel-difficulty", "hud-intel-hostiles", "hud-intel-reinforcements",
	"hud-intel-kills", "hud-intel-objective", "hud-intel-progress", "crosshair-glyph", "hit-marker", "damage-vignette",
	"notification", "pointer-hint", "shield-value", "shield", "health-value", "health", "weapon-glyph", "weapon-name",
	"weapon-role", "heat-value", "heat", "launch-overlay", "difficulty-select", "enter-battle", "completion", "restart-battle"
]);

/** Counts one exact runtime identifier occurrence inside trusted rendered shell markup. */
function idCount(malchusMarkup, yesodId) {
	return [...malchusMarkup.matchAll(new RegExp(`id=["']${yesodId}["']`, "g"))].length;
}

/** Extracts all authored class tokens from trusted rendered markup for namespace assertions. */
function classTokens(malchusMarkup) {
	return [...malchusMarkup.matchAll(/class=["']([^"']*)["']/g)]
		.flatMap(hodMatch => hodMatch[1].trim().split(/\s+/).filter(Boolean));
}

test("tiny host delegates game UI locally while integrating the shared player shell once", async () => {
	const hodHost = await readFile(new URL("index.html", ROOT), "utf8");
	assert.ok(hodHost.split("\n").length <= 40);
	assert.match(hodHost, /id="ohrfront-shell" class="ohrfront-app"/);
	assert.doesNotMatch(hodHost, /id="hud"|id="launch-overlay"/);
	assert.equal((hodHost.match(/\/games\/styles\/player-shell\/index\.css/g) || []).length, 1);
	assert.equal((hodHost.match(/\/games\/scripts\/player-shell\/index\.js/g) || []).length, 1);
});

test("rendered local shell preserves runtime hooks without reimplementing the platform shell", () => {
	const malchusMarkup = renderKeserOhrfrontShell();
	for (const yesodId of REQUIRED_IDS) assert.equal(idCount(malchusMarkup, yesodId), 1, yesodId);
	const chochmahClasses = new Set(classTokens(malchusMarkup));
	assert.ok(chochmahClasses.has("ohr-arsenal"));
	assert.ok(chochmahClasses.has("ohr-intel__panel"));
	assert.equal(chochmahClasses.has("hidden"), false);
	assert.equal(chochmahClasses.has("active"), false);
	assert.equal(chochmahClasses.has("expanded"), false);
	assert.doesNotMatch(malchusMarkup, /player-shell|arsenal-card/);
	assert.match(malchusMarkup, /id="launch-overlay"[^>]*role="dialog"/);
	assert.match(malchusMarkup, /id="completion"[\s\S]*?role="dialog"/);
});

test("all CSS and local shell modules remain small documented vessels", async () => {
	for (const relativeRoot of ["styles/", "src/ui/shell/"]) {
		const yesodRoot = fileURLToPath(new URL(relativeRoot, ROOT));
		const netzachNames = (await readdir(yesodRoot)).filter(yesodName => /\.(css|js)$/.test(yesodName));
		for (const yesodName of netzachNames) {
			const hodSource = await readFile(join(yesodRoot, yesodName), "utf8");
			assert.ok(hodSource.split("\n").length <= 120, `${relativeRoot}${yesodName}`);
			assert.match(hodSource, /B"H/);
			assert.match(hodSource, /Awtsmoos/);
			assert.match(hodSource, /Awtsmoos\.com/);
		}
	}
});
