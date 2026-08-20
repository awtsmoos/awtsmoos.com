//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives browser history one ordered memory independent of DOM or network.
 * Awtsmoos.com proves Back, Forward, Reload, and branch truncation before the UI
 * is allowed to depend on them.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createNavigationState } from "../programs/awtsmoos-browser/navigationState.js";

test("navigation state preserves ordered Back, Forward and Reload semantics", () => {
	const history = createNavigationState("https://one.example/");
	history.visit("https://two.example/");
	history.visit("https://three.example/");
	assert.equal(history.current(), "https://three.example/");
	assert.equal(history.back(), "https://two.example/");
	assert.equal(history.reload(), "https://two.example/");
	assert.deepEqual(history.status(), {
		canBack: true,
		canForward: true,
		index: 1,
		length: 3
	});
	assert.equal(history.forward(), "https://three.example/");
	assert.equal(history.forward(), null);
});

test("visiting after Back truncates forward history instead of forking hidden state", () => {
	const history = createNavigationState();
	history.visit("https://one.example/");
	history.visit("https://two.example/");
	assert.equal(history.back(), "https://one.example/");
	history.visit("https://new.example/");
	assert.equal(history.forward(), null);
	assert.equal(history.current(), "https://new.example/");
	assert.deepEqual(history.status(), {
		canBack: true,
		canForward: false,
		index: 1,
		length: 2
	});
});

test("navigation state rejects empty locations", () => {
	const history = createNavigationState();
	assert.throws(
		() => history.visit("   "),
		error => error.code === "BROWSER_NAVIGATION_URL_REQUIRED"
	);
});
