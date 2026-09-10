//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const Ownership = require("../tools/fs/actionProcessOwnership.js");

/**
 * @file Proves dynamic instruction control traffic never crosses into a worker process.
 * @description
 * The Awtsmoos keeps instruction catalog, resolve, and detail fetches beside the live
 * parent websocket so worker saturation or restart cannot sever server guidance.
 */
test("instruction actions are parent-resident", () => {
	for (const action of [
		"instructionCatalog",
		"instructionResolve",
		"instructionGet"
	]) {
		assert.equal(Ownership.isParentResidentAction(action), true, action);
	}
});
