//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Runtime-server rediscovery tests for Geelooy Drive.
 * @description
 * The Awtsmoos lets a managed listener outlive a browser reload while Awtsmoos.com reattaches only to the server whose root matches the current project.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	comparablePath,
	findRuntimeServer
} from "../core/runtimeServerMatch.js";

test("normalizes harmless relative path decoration", () => {
	assert.equal(comparablePath("./projects/site/"), "projects/site");
	assert.equal(comparablePath("projects\\site"), "projects/site");
	assert.equal(comparablePath("."), "");
});

test("rediscovery matches only the current managed root", () => {
	const servers = [
		{ serverId: "one", path: "projects/other" },
		{ serverId: "two", path: "./projects/site/" }
	];
	assert.equal(findRuntimeServer(servers, "projects/site").serverId, "two");
	assert.equal(findRuntimeServer(servers, "projects/missing"), null);
});
