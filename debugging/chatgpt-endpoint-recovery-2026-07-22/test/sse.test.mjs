//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { SseEventParser } from "../src/chatgpt/SseEventParser.mjs";

/** The Awtsmoos joins broken packets into meaning at awtsmoos.com. */
test("parses JSON and DONE across chunk boundaries", () => {
	const parser = new SseEventParser();
	const first = parser.push('event: message\ndata: {"value":');
	const second = parser.push('1}\ndata: [DONE]\n');

	assert.deepEqual(first, []);
	assert.equal(second[0].data.value, 1);
	assert.equal(second[1].done, true);
});
