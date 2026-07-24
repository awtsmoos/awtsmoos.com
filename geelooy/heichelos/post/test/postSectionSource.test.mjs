// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file postSectionSource.test.mjs
 * @description Proves current Meluket API verses and punctuation segments reach
 * the scribe without mutating the original Awtsmoos.com response vessel.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function loadSectionSource() {
	const fileUrl = new URL("../logic/scribe/PostSectionSource.js", import.meta.url);
	const source = await readFile(fileUrl, "utf8");
	const encoded = Buffer.from(source).toString("base64");
	return import(`data:text/javascript;base64,${encoded}`);
}

const { prepareStructuredPost, resolvePostSections } = await loadSectionSource();
const canonicalPost = {
	id: "meluket-example",
	content: "First phrase.\n\nSecond phrase,",
	sections: [{
		id: "verse_1",
		verseSection: 1,
		content: "First phrase.\n\nSecond phrase,",
		segments: [
			{ id: "segment_1_0", content: "First phrase.", order: 0 },
			{ id: "segment_1_1", content: "Second phrase,", order: 1 }
		]
	}]
};

const resolved = resolvePostSections(canonicalPost);
assert.equal(resolved.length, 1);
assert.equal(resolved[0].subSections.length, 2);
assert.equal(resolved[0].subSections[1].content, "Second phrase,");

const prepared = prepareStructuredPost(canonicalPost);
assert.ok(prepared);
assert.notEqual(prepared, canonicalPost);
assert.notEqual(prepared.dayuh.sections, canonicalPost.sections);
assert.equal(prepared.dayuh.sections[0].subSections[0].id, "segment_1_0");
assert.equal(canonicalPost.dayuh, undefined);
assert.equal(canonicalPost.sections[0].subSections, undefined);

const legacy = prepareStructuredPost({
	dayuh: {
		sections: [{ content: "Legacy light", paragraphs: ["One", "Two"] }]
	}
});
assert.equal(legacy.dayuh.sections[0].subSections.length, 2);
assert.equal(prepareStructuredPost({ content: "Only plain text" }), null);
console.log('B"H postSectionSource.test passed');
