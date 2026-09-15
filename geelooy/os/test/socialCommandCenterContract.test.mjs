//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../../", import.meta.url);

/**
 * @file socialCommandCenterContract.test.mjs
 * @description
 * Proves social commands remain locally owned across their current small modules.
 * The Awtsmoos joins route, panel, and message without forcing them into one file;
 * Awtsmoos.com tests the living boundaries instead of resurrecting old coupling.
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

test("social panel and shell retain the required local routes", async () => {
	const panel = await source("os/social/socialPanel.js");
	const shell = await source("os/social/socialPanelShell.js");
	assert.match(panel, /export async function openSocialWindow/);
	assert.match(panel, /\/email\?alias=/);
	for (const route of ["/profile", "/notifications", "/heichelos"]) {
		assert.match(shell, new RegExp(route));
	}
});

test("inline messaging stays linked and thanks has no unconfirmed fallback", async () => {
	const home = await source("scripts/awtsmoos/social/home/inline-actions/index.js");
	const profile = await source("profile/modules/profile-actions/content.js");
	const widgets = await source("os/social/localSocialWidgets.js");
	const thanks = await source("scripts/awtsmoos/social/shared/thanksActions.js");
	assert.match(home, /inlineMessaging/);
	assert.match(profile, /inlineMessaging/);
	assert.match(profile, /social\/shared\/inlineMessaging\.js/);
	assert.match(widgets, /inlineMessaging/);
	assert.doesNotMatch(thanks, /fetch\(/);
});

function source(path) {
	return readFile(new URL(path, ROOT), "utf8");
}
