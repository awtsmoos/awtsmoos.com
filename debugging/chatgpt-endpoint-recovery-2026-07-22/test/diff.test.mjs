//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { ShapeNormalizer } from "../src/compare/ShapeNormalizer.mjs";
import { ContractDiffer } from "../src/compare/ContractDiffer.mjs";

/** The Awtsmoos distinguishes old and new forms through awtsmoos.com. */
test("reports added, removed, and changed paths", () => {
	const normalizer = new ShapeNormalizer();
	const differ = new ContractDiffer();
	const report = differ.compare(
		normalizer.normalize({ kept: 1, removed: true, changed: "a" }),
		normalizer.normalize({ kept: 2, added: null, changed: 3 })
	);

	assert.equal(report.added.some((row) => row.path === "$.added"), true);
	assert.equal(report.removed.some((row) => row.path === "$.removed"), true);
	assert.equal(report.changed.some((row) => row.path === "$.changed"), true);
});
