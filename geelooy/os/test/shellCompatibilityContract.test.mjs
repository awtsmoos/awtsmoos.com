//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
	sceneJSON,
	sceneSnapshot
} from "../helpers/serialize.js";
import {
	copyVirtualOSLauncherSnippet,
	installVirtualOSTunnelAgent,
	openVirtualOSLauncher
} from "../tunnel/launcher.js";

const ROOT = new URL("../", import.meta.url);

/**
 * @file shellCompatibilityContract.test.mjs
 * @description
 * The Awtsmoos proves every shell compatibility road is source-owned and bounded.
 * Awtsmoos.com rejects vanished imports and invented lifecycle names before boot.
 */

test("scene serialization stays safe without a browser document", () => {
	const snapshot = sceneSnapshot(null);
	assert.equal(snapshot.BH, "B\"H");
	assert.deepEqual(snapshot.desktopIcons, []);
	assert.equal(JSON.parse(sceneJSON(null)).BH, "B\"H");
});

test("tunnel launcher exports remembered, clipboard, and control actions", () => {
	assert.equal(typeof installVirtualOSTunnelAgent, "function");
	assert.equal(typeof copyVirtualOSLauncherSnippet, "function");
	assert.equal(typeof openVirtualOSLauncher, "function");
});

test("shell entrypoint uses the real AwtsmoosOS start contract", async () => {
	const script = await source("script.js");
	const osClass = await source("awtsmoosOs.js");
	assert.match(script, /await os\.start\(\)/);
	assert.doesNotMatch(script, /os\.initialize\(/);
	assert.match(osClass, /async start\(\)/);
});

test("social actions bind the actual local social-window export", async () => {
	const menu = await source("startMenu.js");
	const panel = await source("social/socialPanel.js");
	assert.match(menu, /import \{ openSocialWindow \}/);
	assert.match(menu, /openSocialWindow\(os, route\)/);
	assert.doesNotMatch(menu, /openSocialPanel/);
	assert.match(panel, /export async function openSocialWindow/);
});

test("profile and inbox adapters bind existing shared systems", async () => {
	const profile = await source("../profile/auth.js");
	const inbox = await source("social/inboxLauncher.js");
	assert.match(profile, /profileDropdown\.js/);
	assert.match(profile, /renderProfileDropdown/);
	assert.match(profile, /refreshProfileDropdown/);
	assert.match(inbox, /openSocialWindow/);
	assert.match(inbox, /initializeSocialInbox/);
});

test("critical compatibility modules remain small", async () => {
	for (const path of [
		"helpers/serialize.js",
		"tunnel/launcher.js",
		"social/inboxLauncher.js",
		"../profile/auth.js"
	]) {
		const text = await source(path);
		assert.ok(text.split(/\r?\n/).length <= 120, path);
		assert.match(text, /Awtsmoos/);
	}
});

function source(path) {
	return readFile(new URL(path, ROOT), "utf8");
}
