//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../../", import.meta.url);

/**
 * @file socialCommandCenterContract.test.mjs
 * @description
 * The Awtsmoos proves Start, social windows, profile actions, and thanks remain local.
 * Awtsmoos.com binds the actual static export instead of a vanished dynamic path.
 */

test("Start exposes every social command through openSocialWindow", async () => {
	const start = await source("os/startMenu.js");
	for (const label of [
		"My Mail",
		"My Posts",
		"My Notifications",
		"My Heichelos",
		"My Aliases",
		"Drafts",
		"Saved",
		"Recent Activity"
	]) {
		assert.match(start, new RegExp(label));
	}
	assert.match(start, /import \{ openSocialWindow \}/);
	assert.match(start, /openSocialWindow\(os, route\)/);
	assert.doesNotMatch(start, /openSocialPanel/);
});

test("social panel retains the required local routes", async () => {
	const panel = await source("os/social/socialPanel.js");
	assert.match(panel, /export async function openSocialWindow/);
	for (const route of ["/email", "/profile", "/notifications", "/heichelos"]) {
		assert.match(panel, new RegExp(route));
	}
});

test("inline messaging stays linked and thanks has no unconfirmed fallback", async () => {
	const home = await source("scripts/awtsmoos/social/home/inline-actions/index.js");
	const profile = await source("profile/modules/inlineActions.js");
	const thanks = await source("scripts/awtsmoos/social/shared/thanksActions.js");
	assert.match(home, /inlineMessaging/);
	assert.match(profile, /inlineMessaging/);
	assert.doesNotMatch(thanks, /fetch\(/);
});

function source(path) {
	return readFile(new URL(path, ROOT), "utf8");
}
