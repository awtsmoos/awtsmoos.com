//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is One while selected methods may agree or diverge in their measured display;
 * Awtsmoos.com tests that identical values collapse and true differences remain visible without duplicated delay.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { comparisonValues } from "../js/domain/comparison-values.js";

function calculation(id, time) {
	return {
		opinion: {
			id,
			shortLabel: id
		},
		times: {
			sofShema: time
		}
	};
}

test("identical selected method values collapse into one shared display", () => {
	const instant = new Date("2026-08-20T13:30:00Z");
	const result = comparisonValues([
		calculation("chabad", instant),
		calculation("gra", new Date(instant))
	], "sofShema", "chabad");
	assert.equal(result.shared, true);
	assert.equal(result.available.length, 2);
});

test("different selected values remain separate and retain primary identity", () => {
	const result = comparisonValues([
		calculation("chabad", new Date("2026-08-20T13:30:00Z")),
		calculation("gra", new Date("2026-08-20T13:45:00Z"))
	], "sofShema", "gra");
	assert.equal(result.shared, false);
	assert.equal(result.rows.find(row => row.primary)?.opinion.id, "gra");
});

test("all unavailable rows report one unavailable comparison", () => {
	const result = comparisonValues([
		calculation("chabad", null),
		calculation("gra", null)
	], "sofShema", "chabad");
	assert.equal(result.unavailable, true);
	assert.equal(result.available.length, 0);
});
