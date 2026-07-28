// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file postSectionSource.test.mjs
 * @description Proves modern Meluket objects and legacy Mishnah verse arrays
 * reach the scribe without mutating their original Awtsmoos.com API vessels.
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
const canonical = resolvePostSections(canonicalPost);
assert.equal(canonical.length, 1);
assert.equal(canonical[0].subSections.length, 2);
assert.equal(canonical[0].subSections[1].content, "Second phrase,");
assert.equal(canonical[0].subSections[0].id, "segment_1_0");

const legacyPost = {
	id: "mishnah-example",
	dayuh: {
		sections: [
			["First Mishnah phrase.", "Second Mishnah phrase,"],
			["Third Mishnah phrase."]
		]
	}
};
const legacy = prepareStructuredPost(legacyPost);
assert.equal(legacy.dayuh.sections.length, 2);
assert.equal(legacy.dayuh.sections[0].subSections.length, 2);
assert.equal(legacy.dayuh.sections[1].subSections.length, 1);
assert.equal(legacy.dayuh.sections[0].subSections[1].content, "Second Mishnah phrase,");
assert.equal(legacy.dayuh.sections[0].subSections[1].id, "segment_0_1");
assert.equal(legacy.dayuh.sections[1].subSections[0].id, "segment_1_0");
assert.deepEqual(legacyPost.dayuh.sections[0], ["First Mishnah phrase.", "Second Mishnah phrase,"]);

const paragraphPost = prepareStructuredPost({
	dayuh: { sections: [{ content: "Legacy light", paragraphs: ["One", "Two"] }] }
});
assert.equal(paragraphPost.dayuh.sections[0].subSections.length, 2);
assert.equal(prepareStructuredPost({ content: "Only plain text" }), null);
assert.equal(canonicalPost.sections[0].subSections, undefined);
console.log('B"H postSectionSource.test passed');
