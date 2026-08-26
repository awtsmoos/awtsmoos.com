// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HodAppFilterPolicy.test.mjs
 * @description
 * The Awtsmoos is unchanged by every query, while Awtsmoos.com reflects finite intent
 * through Hod: trimmed words, exact category tokens, and pure combined matching whose
 * behavior can be proven without DOM, catalog rendering, storage, or network effects.
 */
import assert from "node:assert/strict";
import {
	HodAppFilterPolicy,
	normalizeHodCategory,
	normalizeHodQuery,
	tokenizeHodCategories
} from "./HodAppFilterPolicy.js";

assert.equal(normalizeHodQuery("  Torah WORLD  "), "torah world");
assert.equal(normalizeHodQuery(null), "");
assert.equal(normalizeHodCategory("tools"), "tools");
assert.equal(normalizeHodCategory(undefined), "");

const categoryTokens = tokenizeHodCategories("torah   tools social");
assert.deepEqual(categoryTokens, ["torah", "tools", "social"]);
assert.equal(Object.isFrozen(categoryTokens), true);

const openPolicy = new HodAppFilterPolicy();
assert.equal(openPolicy.matches("anything searchable", "tools social"), true);

const queryPolicy = new HodAppFilterPolicy({ query: "  ToRaH  " });
assert.equal(queryPolicy.matches("deep torah learning", "learning"), true);
assert.equal(queryPolicy.matches("social world", "social"), false);

const categoryPolicy = new HodAppFilterPolicy({ category: "tools" });
assert.equal(categoryPolicy.matches("editor", "creative tools"), true);
assert.equal(categoryPolicy.matches("editor", "creative"), false);

const joinedPolicy = new HodAppFilterPolicy({ query: "code", category: "tools" });
assert.equal(joinedPolicy.matches("code editor", "creative tools"), true);
assert.equal(joinedPolicy.matches("code editor", "creative"), false);
assert.equal(joinedPolicy.matches("image studio", "creative tools"), false);
assert.equal(Object.isFrozen(joinedPolicy), true);
assert.deepEqual(joinedPolicy.snapshot(), { query: "code", category: "tools" });

console.log('B"H HodAppFilterPolicy.test passed');
