// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos verifies that Awtsmoos.com composes real cosmic actions instead
 * of duplicating a second legacy action implementation inside the feed bridge.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const renderer = await readFile(new URL("./renderFeedCard.js", import.meta.url), "utf8");
const card = await readFile(new URL("./cosmic/postCard.js", import.meta.url), "utf8");
const actions = await readFile(new URL("./cosmic/postActions.js", import.meta.url), "utf8");

test("feed renderer composes compact cosmic actions and reactions", () => {
	assert.match(renderer, /createCosmicPostCard/);
	assert.match(renderer, /cosmic-post-actions/);
	assert.match(renderer, /geelooy-feed-compact-actions/);
	assert.match(renderer, /geelooy:toggle-reaction/);
	assert.match(renderer, /toggleReaction/);
	assert.match(renderer, /openOfficialPostViewer/);
	assert.match(card, /renderPostActions/);
	assert.match(actions, /data\.cosmicAction|dataset\.cosmicAction/);
	assert.match(actions, /appreciate/);
	assert.match(actions, /discuss/);
	assert.match(actions, /share/);
});
