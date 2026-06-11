// B"H
/**
 * Chapter 206: request batch fetches root plus all rendered verse coordinates.
 */
import assert from "node:assert/strict";

globalThis.document = {
  querySelectorAll(selector) {
    assert.equal(selector.includes("data-verse-section"), true);
    return [
      { dataset: { awtsmoosIdx: "0" } },
      { dataset: { idx: "1" } },
      { dataset: { verseSection: "7" } },
      { dataset: { awtsmoosIdx: "0" } }
    ];
  }
};

globalThis.location = { search: "?idx=4&sub=2" };

const { getPhysicalVerseIndices, getRequestVerseScope } = await import("../requestBatch.js");

assert.deepEqual(getPhysicalVerseIndices(), ["root", "0", "1", "7"]);
assert.deepEqual(getRequestVerseScope(), ["root", "0", "1", "7"]);
console.log("B\"H requestBatch.test passed");
