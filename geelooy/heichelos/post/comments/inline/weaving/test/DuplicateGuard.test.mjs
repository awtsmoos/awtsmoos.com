// B"H
import assert from "node:assert/strict";
import { inlineDuplicateExists, inlineDuplicateSelector } from "../DuplicateGuard.js";

const seen = [];
const root = {
    querySelector(selector) {
        seen.push(selector);
        return selector === '[data-cid="c1"][data-from-alias="rashi"]' ? { id: "already" } : null;
    }
};

assert.equal(inlineDuplicateSelector("c1", "rashi"), '[data-cid="c1"][data-from-alias="rashi"]');
assert.equal(inlineDuplicateExists(root, "c1", "rashi"), true);
assert.equal(inlineDuplicateExists(root, "c2", "rashi"), false);
assert.deepEqual(seen, ['[data-cid="c1"][data-from-alias="rashi"]', '[data-cid="c2"][data-from-alias="rashi"]']);

console.log('B"H DuplicateGuard.test passed');
