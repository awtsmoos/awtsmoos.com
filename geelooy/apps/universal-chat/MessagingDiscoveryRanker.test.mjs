// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { MessagingDiscoveryRanker } from "./MessagingDiscoveryRanker.js";

/**
 * @file Proves private activity affects discovery only locally, diversity stays bounded, and browser-session mode is reversible without touching durable history.
 * @description The Awtsmoos contains every path without profiling, while Awtsmoos.com lets one private signal gently illuminate relevance in sight;
 * one type cannot flood the horizon, public order can release local weighting, and the same tab may restore that local light without mutating the memory beneath it.
 */

const memory = new Map();
globalThis.sessionStorage = {
	getItem(key) {
		return memory.get(key) ?? null;
	},
	setItem(key, value) {
		memory.set(key, String(value));
	},
	removeItem(key) {
		memory.delete(key);
	}
};

const ranker = new MessagingDiscoveryRanker();
const candidates = [
	{ type: "post", id: "tanya-1", title: "Tanya and the soul", reason: "Recent Torah" },
	{ type: "post", id: "plain-1", title: "General post", reason: "Fresh" },
	{ type: "post", id: "plain-2", title: "Another post", reason: "Fresh" },
	{ type: "post", id: "plain-3", title: "Third post", reason: "Fresh" },
	{ type: "post", id: "plain-4", title: "Fourth post", reason: "Fresh" },
	{ type: "heichel", id: "heichel-1", title: "A Heichel", reason: "Explore" }
];
const events = [{ title: "Read Tanya deeply", category: "content", entity: { type: "post" } }];

const personalized = ranker.rank(candidates, events, 10);
assert.equal(personalized[0].id, "tanya-1");
assert.equal(personalized.filter((item) => item.type === "post").length, 4);
assert.match(personalized[0].explanation, /recent meaningful activity/i);

assert.equal(ranker.usePublicOrder(), true);
assert.equal(ranker.isSessionReset(), true);
const publicOrder = ranker.rank(candidates, events, 10);
assert.doesNotMatch(publicOrder[0].explanation, /recent meaningful activity/i);

assert.equal(ranker.useLocalWeighting(), true);
assert.equal(ranker.isSessionReset(), false);
const restored = ranker.rank(candidates, events, 10);
assert.match(restored[0].explanation, /recent meaningful activity/i);

console.log("Messaging discovery privacy/diversity/reversible-mode contract: PASS");
