//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ShliachOsLaunch.test.mjs
 * @description
 * Proves Shliach prefers the built-in Geelooy Browser when OS window authority
 * exists, without replacing Node's read-only navigator or leaking unsafe state.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { openShliach } from "./ShliachUrl.js";

test("Shliach prefers the built-in Geelooy Browser over an external tab", async testContext => {
	const previousWindow = globalThis.window;
	const launches = [];
	let externalOpens = 0;
	testContext.after(() => {
		globalThis.window = previousWindow;
	});
	globalThis.window = {
		awtsmoosOs: {
			addWindow: options => launches.push(options)
		},
		open: () => {
			externalOpens += 1;
			return {};
		}
	};	const result = openShliach({
		goal: "Create a site here",
		path: "awtsmoos://computer/projects/light"
	});
	await result.copyPromise;
	assert.equal(result.openedInOs, true);
	assert.equal(externalOpens, 0);
	assert.equal(launches.length, 1);
	assert.equal(launches[0].programName, "awtsmoosBrowser");
	assert.equal(launches[0].programOptions.initialUrl, result.url);
	assert.equal(launches[0].programOptions.engineMode, "compatibility");
	assert.match(
		result.url,
		/chatgpt\.com\/g\/g-6a03feea8398819192067ae3dbfa449c/
	);
	assert.match(result.url, /prompt=/);
});
