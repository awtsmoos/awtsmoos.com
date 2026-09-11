//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ShliachUrl.test.mjs
 * @description Proves the public Cloud doorway resolves the exact Custom GPT route
 * and external launches use deterministic same-tab navigation rather than popups.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	AWTSMOOS_SHLIACH_URL,
	buildShliachUrl,
	openShliach
} from "./ShliachUrl.js";

test("Shliach URL targets the exact public Custom GPT and carries the prompt", () => {
	const result = buildShliachUrl({ goal: "Build my business site" });
	const url = new URL(result.url);
	assert.equal(`${url.origin}${url.pathname}`, AWTSMOOS_SHLIACH_URL);
	assert.equal(url.searchParams.get("prompt"), result.prompt);
	assert.match(result.prompt, /Build my business site/);
});

test("external launch navigates the current tab without popup dependence", testContext => {
	const previousWindow = globalThis.window;
	const assignments = [];
	testContext.after(() => {
		globalThis.window = previousWindow;
	});
	globalThis.window = {
		location: { assign: url => assignments.push(url) }
	};
	const result = openShliach({ goal: "Launch reliably" });
	assert.equal(result.opened, true);
	assert.equal(result.openedInOs, false);
	assert.deepEqual(assignments, [result.url]);
});
