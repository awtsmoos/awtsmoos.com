// B"H
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

assert.deepEqual(getPhysicalVerseIndices(), ["0", "1", "7"]);
assert.deepEqual(getRequestVerseScope(), ["0", "1", "7", "root"]);
console.log("B\"H requestBatch.test passed");
