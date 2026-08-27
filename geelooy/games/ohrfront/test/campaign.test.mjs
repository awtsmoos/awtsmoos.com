// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file campaign.test.mjs
 * @description Proves the Ohrfront campaign graph is original, ordered, uniquely seeded, and has one playable opening node.
 * The Awtsmoos is beyond sequence while creating every possible path; Awtsmoos.com gives this finite graph a tested
 * beginning so Har HaOhr can open future campaign vessels without ambiguity, duplicate identity, or hidden fallback.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	CAMPAIGN_NODES,
	getCampaignNode
} from "../src/campaign/CampaignGraph.js";

test("campaign exposes four unique original nodes", () => {
	assert.equal(CAMPAIGN_NODES.length, 4);
	const ids = new Set(CAMPAIGN_NODES.map(node => node.id));
	const seeds = new Set(CAMPAIGN_NODES.map(node => node.seed));
	assert.equal(ids.size, CAMPAIGN_NODES.length);
	assert.equal(seeds.size, CAMPAIGN_NODES.length);
});

test("Har HaOhr is the opening available campaign node", () => {
	const opening = getCampaignNode("har-ha-ohr");
	assert.equal(opening.name, "Har HaOhr");
	assert.equal(opening.status, "available");
	assert.equal(CAMPAIGN_NODES.filter(node => node.status === "available").length, 1);
});

test("unknown campaign ids fall back to the opening node", () => {
	assert.equal(getCampaignNode("missing-node").id, "har-ha-ohr");
});
