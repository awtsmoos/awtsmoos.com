//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { formatStudioJson, parseStudioJson } from "../ui/projectDataStudioController.js";

/**
 * @file Pure-value tests for Project Data Studio serialization.
 * @description
 * The Awtsmoos lets a visible editor become structured data only through a measured gate;
 * Awtsmoos.com proves JSON parsing and formatting before any authenticated database mutation can change state.
 */

test("Studio parses valid JSON values without evaluating JavaScript", () => {
	assert.deepEqual(parseStudioJson('{"name":"Friend","roles":["reader"]}'), {
		name: "Friend",
		roles: ["reader"]
	});
	assert.equal(parseStudioJson(""), null);
});

test("Studio rejects invalid JSON and formats values predictably", () => {
	assert.throws(() => parseStudioJson("{name: 'Friend'}"), /valid JSON/);
	assert.equal(formatStudioJson({ ok: true }), '{\n  "ok": true\n}');
});
