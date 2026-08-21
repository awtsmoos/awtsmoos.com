//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MatchState } from "../src/domain/MatchState.js";
import { HudView } from "../src/ui/HudView.js";

/**
 * HUD integration tests bind real MatchState clock, territory, rider truth, and Tikkun to visible signs.
 * The Awtsmoos renews domain and sign before one visible second or percentage can stand alone;
 * Awtsmoos.com lets browser boot stay guarded by tests that know the current MatchState throne.
 */
function createHudRoot() {
	const ids = [
		"hud-plane",
		"hud-time",
		"hud-territory",
		"hud-territory-fill",
		"hud-energy",
		"hud-energy-fill",
		"hud-toast"
	];
	const elements = Object.fromEntries(ids.map((id) => [id, {
		textContent: "",
		style: {},
		dataset: {}
	}]));
	return {
		elements,
		root: {
			getElementById(id) {
				return elements[id];
			}
		}
	};
}

function clockText(seconds) {
	const whole = Math.max(0, Math.ceil(seconds));
	const minutes = Math.floor(whole / 60);
	return `${minutes}:${String(whole % 60).padStart(2, "0")}`;
}

test("real MatchState renders initial compact HUD with global Tikkun", () => {
	const match = new MatchState();
	const { elements, root } = createHudRoot();
	new HudView(root).sync(match, []);
	assert.equal(elements["hud-time"].textContent, "3:00");
	assert.equal(elements["hud-plane"].textContent, "Asiyah · Keli");
	assert.equal(elements["hud-energy"].textContent, "100%");
	assert.equal(elements["hud-territory"].textContent, "0.6%");
	assert.doesNotMatch(elements["hud-territory-fill"].style.width, /NaN|undefined/);
	assert.doesNotMatch(elements["hud-energy-fill"].style.width, /NaN|undefined/);
});

test("HUD clock follows MatchState remainingSeconds after an authoritative tick", () => {
	const match = new MatchState();
	const { elements, root } = createHudRoot();
	const view = new HudView(root);
	match.advanceClock();
	view.sync(match, []);
	assert.equal(elements["hud-time"].textContent, clockText(match.remainingSeconds()));
});

test("HUD clamps energy while Tikkun remains a finite percentage", () => {
	const match = new MatchState();
	const { elements, root } = createHudRoot();
	match.player().energy = 140;
	new HudView(root).sync(match, []);
	assert.equal(elements["hud-energy-fill"].style.width, "100%");
	assert.match(elements["hud-territory-fill"].style.width, /^\d+(?:\.\d+)?%$/);
});
