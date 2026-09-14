//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import {
	prepareCloudSourceFiles,
	PUBLIC_LINEAGE_PATH,
	remixOrigin
} from "../services/cloudPublishLineage.js";

/** Proves public Remix ancestry is bounded, sanitized, and derived from local provenance. */
function provenance(overrides = {}) {
	return {
		path: ".awtsmoos-remix-origin.json",
		content: JSON.stringify({
			aliasId: "parent",
			siteId: "source",
			source: "/sites/parent/source/",
			sourceKind: "drive-deployment",
			sourceRevision: "d-parent",
			...overrides
		})
	};
}

test("original creations publish no artificial lineage file", () => {
	const files = prepareCloudSourceFiles([{ path: "index.html", content: "BH" }], { aliasId: "a", siteId: "b" });
	assert.deepEqual(files.map(file => file.path), ["index.html"]);
});

test("remixed creation publishes one sanitized lineage record and removes private provenance", () => {
	const files = prepareCloudSourceFiles([
		{ path: "index.html", content: "BH" },
		provenance()
	], { aliasId: "child", siteId: "remix" });
	assert.deepEqual(files.map(file => file.path), ["index.html", PUBLIC_LINEAGE_PATH]);
	const lineage = JSON.parse(files[1].content);
	assert.equal(lineage.current.publicUrl, "/sites/child/remix/");
	assert.equal(lineage.parent.publicUrl, "/sites/parent/source/");
	assert.equal(lineage.parent.sourceRevision, "d-parent");
	assert.deepEqual(lineage.ancestry.map(item => item.publicUrl), ["/sites/parent/source/"]);
});

test("source supplied lineage cannot replace child identity and ancestry is capped", () => {
	const ancestry = Array.from({ length: 30 }, (_, index) => ({
		aliasId: `a${index}`,
		siteId: `s${index}`,
		publicUrl: `/sites/a${index}/s${index}/`
	}));
	const files = prepareCloudSourceFiles([
		{ path: "index.html", content: "BH" },
		provenance(),
		{ path: PUBLIC_LINEAGE_PATH, content: JSON.stringify({ current: { aliasId: "evil" }, ancestry }) }
	], { aliasId: "child", siteId: "safe" });
	const lineage = JSON.parse(files.at(-1).content);
	assert.equal(lineage.current.aliasId, "child");
	assert.equal(lineage.current.siteId, "safe");
	assert.equal(lineage.ancestry.length, 12);
	assert.equal(files.filter(file => file.path === PUBLIC_LINEAGE_PATH).length, 1);
});
