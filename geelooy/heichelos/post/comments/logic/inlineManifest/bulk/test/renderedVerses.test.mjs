// B"H
import assert from "node:assert/strict";
import { getPhysicalVerseIndices } from "../renderedVerses.js";

const nodes = [
    { dataset: { awtsmoosIdx: "0" } },
    { dataset: { idx: "1" } },
    { dataset: { awtsmoosIdx: "2" } },
    { dataset: { awtsmoosIdx: "1" } }
];

const root = {
    seenSelector: "",
    querySelectorAll(selector) {
        this.seenSelector = selector;
        return nodes;
    }
};

assert.deepEqual(getPhysicalVerseIndices(root), ["0", "1", "2"]);
assert.equal(root.seenSelector.includes("sub"), false);
assert.equal(root.seenSelector.includes("section"), true);

console.log('B"H renderedVerses.test passed');
