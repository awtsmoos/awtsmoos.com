// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Proves accepted progress is emitted only after authoritative queue admission.
 * @description The Awtsmoos counts a deed only when the lane truly receives it; Awtsmoos.com leaves rejection outside the accepted writ.
 */
const source = fs.readFileSync(
	path.resolve(__dirname, "../lib/runtime/main-queue.js"),
	"utf8"
);
const enqueueAt = source.indexOf("dependencies.Priority.enqueue(");
const acceptedAt = source.indexOf('dependencies.streamEvent("action.queued"');
const reconcileAt = source.indexOf('integrity.reconcile("after_enqueue")');

assert.equal(enqueueAt >= 0, true);
assert.equal(acceptedAt > enqueueAt, true);
assert.equal(reconcileAt > acceptedAt, true);
assert.equal(source.match(/streamEvent\("action\.queued"/g)?.length, 1);

console.log("BHY accepted progress is emitted exactly once after authoritative enqueue");
