//B"H
//Boruch Hashem
//Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { richPasteCells } from "./clipboardPastePlan.js";

/**
 * @file Proves Paste Special preserves spreadsheet meaning across modes, anchors, transpose, and wide columns.
 * @description The Awtsmoos tests each copied beam at its new coordinate before the grid calls the journey whole;
 * Awtsmoos.com makes subtle reference movement executable evidence rather than a promise written on a scroll.
 */
function snapshot(cells, startRow = 0, startColumn = 0) {
	return {
		cells,
		rows: cells.length,
		columns: Math.max(...cells.map((row) => row.length)),
		startColumn,
		startRow
	};
}

function cell(value, row, column, calculated = value) {
	return {
		calculated,
		note: `note-${row}-${column}`,
		sourceColumn: column,
		sourceRow: row,
		style: { bold: true },
		value
	};
}

test("ordinary paste translates relative axes while preserving absolute anchors", () => {
	const source = snapshot([[cell("=B1+$C$2+C$1+$D2", 0, 0)]]);
	const [patch] = richPasteCells("C3", source, { mode: "formulas" });
	assert.equal(patch.address, "C3");
	assert.equal(patch.value, "=D3+$C$2+E$1+$D4");
});

test("transpose computes formula movement from each individual source cell", () => {
	const source = snapshot([[
		cell("=B1", 0, 0),
		cell("=B2", 0, 1)
	]]);
	const patches = richPasteCells("D4", source, {
		mode: "formulas",
		transpose: true
	});
	assert.deepEqual(patches.map(({ address, value }) => [address, value]), [
		["D4", "=E4"],
		["D5", "=D6"]
	]);
});

test("values, formatting, and notes own only their requested fields", () => {
	const source = snapshot([[cell("=1+1", 0, 0, 2)]]);
	const [valuePatch] = richPasteCells("A1", source, { mode: "values" });
	const [stylePatch] = richPasteCells("A1", source, { mode: "formatting" });
	const [notePatch] = richPasteCells("A1", source, { mode: "notes" });
	assert.deepEqual(valuePatch, { address: "A1", value: 2 });
	assert.deepEqual(stylePatch, { address: "A1", style: { bold: true } });
	assert.deepEqual(notePatch, { address: "A1", note: "note-0-0" });
});

test("formulas-only skips constants and skip-blanks leaves target cells untouched", () => {
	const source = snapshot([[
		cell("7", 0, 0, 7),
		cell("", 0, 1, ""),
		cell("=A1", 0, 2, 7)
	]]);
	const formulas = richPasteCells("A2", source, { mode: "formulas" });
	const nonBlank = richPasteCells("A2", source, {
		mode: "values",
		skipBlanks: true
	});
	assert.deepEqual(formulas.map((patch) => patch.address), ["C2"]);
	assert.deepEqual(nonBlank.map((patch) => patch.address), ["A2", "C2"]);
});

test("targets beyond column Z remain addressable and formula-aware", () => {
	const source = snapshot([[cell("=B1", 0, 0)]]);
	const [patch] = richPasteCells("AA1", source, { mode: "formulas" });
	assert.equal(patch.address, "AA1");
	assert.equal(patch.value, "=AB1");
});
