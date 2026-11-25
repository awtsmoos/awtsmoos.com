//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos sets the keys out like a piano: two traditional rows, each
 * one octave — whites along the letter row, blacks on the row above — and
 * the next octave begins again at the far left. The old column layout is
 * kept only as an optional preset and keeps its own geometry law.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { COLUMN_KEYS, PIANO_ROW_KEYS } from "../modules/keyboard/bindingCatalog.js";

test("default mapping is exactly the two-row piano chromatic order", () => {
	assert.deepEqual(PIANO_ROW_KEYS, [
		"q", "2", "w", "3", "e", "r",
		"5", "t", "6", "y", "7", "u",
		"z", "s", "x", "d", "c", "v",
		"g", "b", "h", "n", "j", "m"
	]);
	assert.equal(new Set(PIANO_ROW_KEYS).size, PIANO_ROW_KEYS.length);
});

// Chromatic index within an octave: 0=C, 2=D, 4=E, 5=F, 7=G, 9=A, 11=B.
const whitesOf = (band) => band.filter((_, i) => [0, 2, 4, 5, 7, 9, 11].includes(i % 12));
const blacksOf = (band) => band.filter((_, i) => ![0, 2, 4, 5, 7, 9, 11].includes(i % 12));

test("white notes are seven adjacent keys on one row per octave", () => {
	assert.deepEqual(whitesOf(PIANO_ROW_KEYS.slice(0, 12)), ["q", "w", "e", "r", "t", "y", "u"]);
	assert.deepEqual(whitesOf(PIANO_ROW_KEYS.slice(12)), ["z", "x", "c", "v", "b", "n", "m"]);
	assert.deepEqual(blacksOf(PIANO_ROW_KEYS.slice(0, 12)), ["2", "3", "5", "6", "7"]);
	assert.deepEqual(blacksOf(PIANO_ROW_KEYS.slice(12)), ["s", "d", "g", "h", "j"]);
});

// Approximate physical key centers (units of one key width) per band.
const band1Center = { q: 1, "2": 1.5, w: 2, "3": 2.5, e: 3, r: 4, "5": 4.5, t: 5, "6": 5.5, y: 6, "7": 6.5, u: 7 };
const band2Center = { z: 1, s: 1.5, x: 2, d: 2.5, c: 3, v: 4, g: 4.5, b: 5, h: 5.5, n: 6, j: 6.5, m: 7 };

test("pitch moves physically right inside each octave band", () => {
	for (const [band, centers] of [[PIANO_ROW_KEYS.slice(0, 12), band1Center], [PIANO_ROW_KEYS.slice(12), band2Center]]) {
		for (let i = 1; i < band.length; i++) {
			assert.ok(centers[band[i]] > centers[band[i - 1]], band[i - 1] + " -> " + band[i] + " moved left");
		}
	}
	// The second octave restarts at the far left of its own rows.
	assert.ok(band2Center[PIANO_ROW_KEYS[12]] <= band1Center[PIANO_ROW_KEYS[0]] + 0.5);
});

const columnCenter = {
	q: 2.00, a: 2.25, "2": 2.50, z: 2.75, w: 3.00, s: 3.25, "3": 3.50, x: 3.75,
	e: 4.00, d: 4.25, "4": 4.50, c: 4.75, r: 5.00, f: 5.25, "5": 5.50, v: 5.75,
	t: 6.00, g: 6.25, "6": 6.50, b: 6.75, y: 7.00, h: 7.25, "7": 7.50, n: 7.75
};

test("column preset keeps its never-move-left geometry", () => {
	assert.equal(COLUMN_KEYS[0], "q");
	for (let i = 1; i < COLUMN_KEYS.length; i++) {
		assert.ok(columnCenter[COLUMN_KEYS[i]] >= columnCenter[COLUMN_KEYS[i - 1]]);
	}
});
