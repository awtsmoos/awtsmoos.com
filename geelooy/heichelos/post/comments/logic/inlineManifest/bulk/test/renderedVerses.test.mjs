// B"H
/**
 * Chapter 205: rendered verse scope includes root and all visible verse forms.
 */
import assert from "node:assert/strict";
import { getPhysicalVerseIndices } from "../renderedVerses.js";

const nodes = [
    { dataset: { awtsmoosIdx: "0" } },
    { dataset: { idx: "1" } },
    { dataset: { verseSection: "7" } },
    { dataset: { awtsmoosIdx: "1" } }
];

const root = {
    seenSelector: "",
    querySelectorAll(selector) {
        this.seenSelector = selector;
        return nodes;
    }
};

assert.deepEqual(getPhysicalVerseIndices(root), ["root", "0", "1", "7"]);
assert.equal(root.seenSelector.includes("sub"), false);
assert.equal(root.seenSelector.includes("section"), true);
assert.equal(root.seenSelector.includes("data-verse-section"), true);
assert.deepEqual(getPhysicalVerseIndices({ querySelectorAll: () => [] }), ["root"]);
console.log('B"H renderedVerses.test passed');
